import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface WaveformProps{
  audioContext: AudioContext;
  file: File | undefined;
  audioNodes: AudioNode[] | undefined;
  playing: boolean;
  handleSongEnd: any;
}

function Waveform({
  audioNodes, audioContext, file, playing, handleSongEnd,
}: WaveformProps) {
  const waveformRef = useRef<any>();
  const wavesurfer = useRef<WaveSurfer>();
  const reset = useRef(false);

  useEffect(() => {
    if (playing) {
      wavesurfer.current?.play();
    } else {
      if (!reset) {
        wavesurfer.current?.pause();
      }
      reset.current = false;
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
        if (audioNodes) {
          wavesurfer.current?.backend.setFilters(audioNodes);
        }
        wavesurfer.current.on('finish', () => {
          handleSongEnd();
          wavesurfer.current?.destroy();
        });
        reset.current = true;
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
