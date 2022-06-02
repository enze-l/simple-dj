import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Button } from '@mui/material';

interface WaveformProps{
  audioContext: AudioContext;
  file: File | undefined;
}

function Waveform({ audioContext, file }: WaveformProps) {
  const waveformRef = useRef<any>();
  const alreadyTriggered = useRef(false);
  let wavesurfer: WaveSurfer;

  const play = () => {
    wavesurfer?.playPause();
  };

  useEffect(() => {
    if (file) {
      if (waveformRef.current && !alreadyTriggered.current) {
        wavesurfer = WaveSurfer.create({
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
        alreadyTriggered.current = true;
      }
      const audioElement = new Audio(URL.createObjectURL(file));
      wavesurfer.load(audioElement);
      wavesurfer.on('finish', () => { wavesurfer.destroy(); });
    }
  }, [file]);

  return (
    <div>
      <Button className="absolute" onClick={play}>Play/Pause</Button>
      <div ref={waveformRef} className="w-full" />
    </div>
  );
}

export default Waveform;
