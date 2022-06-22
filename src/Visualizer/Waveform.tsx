import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import MarkersPlugin, { MarkerParams } from 'wavesurfer.js/src/plugin/markers';
import detect, { getIntervals, getPeaks } from './BPMDetective';

interface WaveformProps{
  audioContext: AudioContext;
  file: File | undefined;
  audioNodes: AudioNode[] | undefined;
  handleSongEnd: any;
  play: any;
  setBpm: any;
  toggle: number;
  close: number;
  color: string;
  isTop: boolean;
}

function Waveform({
  audioNodes, setBpm, isTop, toggle, close, audioContext, play, file, handleSongEnd, color,
}: WaveformProps) {
  const waveformRef = useRef<any>();
  const wavesurfer = useRef<WaveSurfer>();

  useEffect(() => {
    if (wavesurfer.current) {
      wavesurfer.current?.playPause();
    }
  }, [toggle]);

  useEffect(() => {
    play(false);
    wavesurfer.current?.destroy();
    setBpm(undefined);
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
          const positions: number[] = [];
          for (let position = firstPos; position < data.duration; position += BeatInterval) {
            positions.push(position);
          }
          for (let position = firstPos - BeatInterval; position > 0; position -= BeatInterval) {
            positions.push(position);
          }
          positions.forEach((position) => {
            markers.push({
              time: position,
              color: 'rgba(31,40,55,0.5)',
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
            hideScrollbar: true,
            plugins: [
              markersPlugin,
            ],
          });

          wavesurfer.current?.setBackgroundColor(color);

          const audioElement = new Audio(fileURL);

          wavesurfer.current.load(audioElement);
          if (audioNodes) {
            wavesurfer.current?.backend.setFilters(audioNodes);
          }
          wavesurfer.current?.on('play', () => {
            play(true);
          });
          wavesurfer.current?.on('pause', () => {
            play(false);
          });
          wavesurfer.current.on('finish', () => {
            handleSongEnd();
          });
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

export default Waveform;
