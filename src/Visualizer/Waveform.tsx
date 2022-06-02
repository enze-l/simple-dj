import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

const File = require('./TestSong.mp3');

interface WaveformProps{
  audioContext: AudioContext;
}

function Waveform({ audioContext }: WaveformProps) {
  const waveformRef = useRef<any>();
  const alreadyTriggered = useRef(false);

  useEffect(() => {
    if (waveformRef.current && !alreadyTriggered.current) {
      const wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        audioContext,
        barWidth: 1,
        cursorColor: '#2772cf',
        cursorWidth: 2,
        normalize: true,
        responsive: true,
      });
      wavesurfer.load(File);
      alreadyTriggered.current = true;
    }
  }, []);

  return (
    <div>
      <div ref={waveformRef} className="w-full" />
    </div>
  );
}

export default Waveform;
