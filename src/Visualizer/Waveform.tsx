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
  color: string
}

function Waveform({
  audioNodes, toggle, close, audioContext, play, file, handleSongEnd, color,
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
          height: 158,
          hideScrollbar: true,
        });

        wavesurfer.current?.setBackgroundColor(color);

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
