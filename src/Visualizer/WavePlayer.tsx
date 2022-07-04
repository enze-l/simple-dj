import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import MarkersPlugin, { MarkerParams } from 'wavesurfer.js/src/plugin/markers';
import detect, { getIntervals, getPeaks } from './BPMDetective';
import PlayingState from '../PlayingState';

export interface ToggleParams{
  toggle: number,
  time: number | undefined
}

interface WaveformProps{
  audioContext: AudioContext;
  file: File | undefined;
  audioNodes: AudioNode[] | undefined;
  handleSongEnd: any;
  play: any;
  setBpm: any;
  toggle: ToggleParams;
  toggleRetrieve: number;
  toggleOtherPlayer: any;
  close: number;
  color: string;
  isTop: boolean;
  playbackSpeed: number;
}

function WavePlayer({
  audioNodes, setBpm, isTop, toggle, toggleRetrieve, close, audioContext,
  play, file, handleSongEnd, color, playbackSpeed, toggleOtherPlayer,
}: WaveformProps) {
  const waveformRef = useRef<any>();
  const wavesurfer = useRef<WaveSurfer>();
  const positions = useRef<Array<number>>();
  const destroyed = useRef(true);

  useEffect(() => {
    if (!destroyed.current && wavesurfer.current
        && positions.current && wavesurfer.current.isPlaying()) {
      const currentTime = wavesurfer.current.getCurrentTime();
      let closestTime = Infinity;
      positions.current.forEach((position) => {
        const distance = currentTime - position;
        if ((Math.abs(distance) < closestTime) && distance >= 0) closestTime = distance;
      });
      const timeDistance = closestTime / wavesurfer.current.getPlaybackRate();
      toggleOtherPlayer({ toggle: Math.random(), time: timeDistance });
    } else {
      toggleOtherPlayer({ toggle: Math.random(), time: undefined });
    }
  }, [toggleRetrieve]);

  useEffect(() => {
    if (wavesurfer.current && positions.current
        && toggle.time && !wavesurfer.current.isPlaying()) {
      const currentTime = wavesurfer.current.getCurrentTime();
      let closestBeat = 0;
      let smallestDistance = Infinity;
      positions.current.forEach((position) => {
        const distance = currentTime - position;
        if (Math.abs(distance) < Math.abs(smallestDistance)) {
          closestBeat = position;
          smallestDistance = distance;
        }
      });
      const playTime = closestBeat + (toggle.time * wavesurfer.current.getPlaybackRate());
      wavesurfer.current.setCurrentTime(playTime);
    }
    wavesurfer.current?.playPause();
  }, [toggle]);

  useEffect(() => {
    wavesurfer.current?.setPlaybackRate(playbackSpeed);
  }, [playbackSpeed]);

  useEffect(() => {
    play(false);
    wavesurfer.current?.destroy();
    setBpm(undefined);
    destroyed.current = true;
  }, [close]);

  useEffect(() => {
    if (file) {
      if (waveformRef.current) {
        const fileURL = URL.createObjectURL(file);

        fetch(fileURL).then(async (response) => {
          const buffer = await response.arrayBuffer();
          const data: AudioBuffer = await new Promise((resolve, reject) => {
            audioContext.decodeAudioData(buffer, resolve, reject);
          });

          const currentBpm = detect(data);
          setBpm(currentBpm);

          const peaks = getPeaks([data.getChannelData(0), data.getChannelData(1)]);
          const intervals = getIntervals(peaks);
          const top = intervals.sort((intA, intB) => intB.count - intA.count).splice(0, 5);

          const firstPos = top[0].firstPos / data.sampleRate;

          const BeatInterval = 60 / currentBpm;

          const markerPositions = isTop ? 'bottom' : 'top';

          const markers: MarkerParams[] = [];
          positions.current = [];
          for (let position = firstPos; position < data.duration; position += BeatInterval) {
            positions.current.push(position);
          }
          for (let position = firstPos - BeatInterval; position > 0; position -= BeatInterval) {
            positions.current.push(position);
          }
          positions.current.forEach((position) => {
            markers.push({
              time: position,
              color: 'rgba(31,40,55,0.9)',
              position: markerPositions,
            });
          });

          const markersPlugin = MarkersPlugin.create({ markers });

          wavesurfer.current = WaveSurfer.create({
            container: waveformRef.current,
            audioContext,
            cursorColor: 'rgba(255,255,255,0)',
            progressColor: 'rgb(39,46,54)',
            waveColor: 'rgb(255,255,255)',
            normalize: true,
            responsive: true,
            scrollParent: true,
            minPxPerSec: 100,
            barWidth: 2,
            height: 158,
            plugins: [
              markersPlugin,
            ],
          });
          if (wavesurfer.current) {
            wavesurfer.current?.setBackgroundColor(color);

            const audioElement = new Audio(fileURL);

            wavesurfer.current.load(audioElement);
            if (audioNodes) {
              wavesurfer.current.backend.setFilters(audioNodes);
            }
            wavesurfer.current.on('play', () => {
              play(PlayingState.PLAYING);
              wavesurfer.current?.toggleInteraction();
            });
            wavesurfer.current.on('pause', () => {
              play(PlayingState.PAUSED);
              wavesurfer.current?.toggleInteraction();
            });
            wavesurfer.current.on('finish', () => {
              handleSongEnd();
              destroyed.current = true;
            });
            wavesurfer.current.on('ready', () => {
              play(PlayingState.PAUSED);
            });
            play(PlayingState.LOADING);
            destroyed.current = false;
          }
        });
      }
    }
  }, [audioNodes]);

  return (
    <div>
      <div ref={waveformRef} className="w-full" />
    </div>
  );
}

export default WavePlayer;
