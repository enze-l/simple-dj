import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface WaveformProps{
  audioContext: AudioContext;
  file: File | undefined;
  audioNodes: AudioNode[] | undefined;
  handleSongEnd: any;
  play: any;
  toggle: number;
  close: number;
}

function Waveform({
  audioNodes, toggle, close, audioContext, play, file, handleSongEnd,
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
  }, [close]);

  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i += 1) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  useEffect(() => {
    if (file) {
      if (waveformRef.current) {
        wavesurfer.current = WaveSurfer.create({
          container: waveformRef.current,
          audioContext,
          cursorColor: 'rgba(255,255,255,0)',
          progressColor: 'rgb(74,83,97)',
          waveColor: 'rgb(154,154,154)',
          cursorWidth: 2,
          normalize: true,
          responsive: true,
          scrollParent: true,
          minPxPerSec: 100,
          barWidth: 1,
          height: 160,
          hideScrollbar: true,
        });

        wavesurfer.current?.setBackgroundColor(getRandomColor());

        const audioElement = new Audio(URL.createObjectURL(file));
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
