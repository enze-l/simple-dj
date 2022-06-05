import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface WaveformProps{
  audioContext: AudioContext;
  file: File | undefined;
  playing: boolean;
  handleSongEnd: any;
}

function Waveform({
  audioContext, file, playing, handleSongEnd,
}: WaveformProps) {
  const waveformRef = useRef<any>();
  const wavesurfer = useRef<WaveSurfer>();

  useEffect(() => {
    if (playing) {
      wavesurfer.current?.play();
    } else {
      wavesurfer.current?.pause();
    }
  }, [playing]);

  useEffect(() => {
    if (file) {
      if (waveformRef.current) {
        wavesurfer.current = WaveSurfer.create({
          container: waveformRef.current,
          audioContext,
          cursorColor: '#2772cf',
          cursorWidth: 2,
          normalize: true,
          responsive: true,
          scrollParent: true,
          minPxPerSec: 100,
          barWidth: 1,
        });
        const audioElement = new Audio(URL.createObjectURL(file));
        wavesurfer.current.load(audioElement);
        wavesurfer.current.on('finish', () => {
          handleSongEnd();
          wavesurfer.current?.destroy();
        });
      }
    }
  }, [file]);

  return (
    <div>
      <div ref={waveformRef} className="w-full" />
    </div>
  );
}

export default Waveform;
