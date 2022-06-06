import IconButton from '@mui/material/IconButton';
import React, { useEffect, useRef, useState } from 'react';
import { Close, Pause, PlayArrow } from '@mui/icons-material/';
import EqNode from './Equalizer/EqNode';
import FrequencyVisualizer from './Visualizer/FrequencyVisualizer';
import EQSlider from './Equalizer/EQSlider';

export interface AudioPlayerProps {
    audioContext: AudioContext | undefined;
    setAudioNodes: any;
    file: File | undefined;
    volume: number;
    playing: boolean;
    togglePlay: any;
    handlePlayerClose: any;
}

function SoundControl({
  setAudioNodes, file, togglePlay, handlePlayerClose, audioContext, volume, playing,
}: AudioPlayerProps) {
  const [playButton, setPlayButton] = useState(<PlayArrow />);

  const gainNode = useRef<GainNode>();
  const lowNode = useRef<EqNode>();
  const midNode = useRef<EqNode>();
  const highNode = useRef<EqNode>();
  const analyserNode = useRef<AnalyserNode>();

  const setVolume = (value: number) => {
    if (gainNode.current) {
      gainNode.current.gain.value = Math.min(value, 1);
    }
  };

  const closePlayer = () => {
    handlePlayerClose();
  };

  useEffect(() => {
    if (playing) {
      setPlayButton(<Pause />);
    } else {
      setPlayButton(<PlayArrow />);
    }
  }, [playing]);

  useEffect(() => {
    setVolume(volume);
  }, [volume]);

  useEffect(() => {
    if (file && audioContext) {
      gainNode.current = audioContext.createGain();
      lowNode.current = new EqNode(audioContext, 'lowshelf', 320);
      midNode.current = new EqNode(audioContext, 'peaking', 1000);
      highNode.current = new EqNode(audioContext, 'highshelf', 3200);
      analyserNode.current = new AnalyserNode(audioContext);

      setVolume(volume);
      lowNode.current?.setGain(0);
      midNode.current?.setGain(0);
      highNode.current?.setGain(0);

      setAudioNodes([
        gainNode.current,
        lowNode.current?.getNode(),
        midNode.current?.getNode(),
        highNode.current?.getNode(),
        analyserNode.current,
      ]);
    }
  }, [file, audioContext]);

  return (
    <div className={file ? 'visible' : 'invisible'}>
      <FrequencyVisualizer analyserNode={analyserNode.current}>
        <div className="flex flex-col items-end">
          <IconButton onClick={closePlayer} className="items-end"><Close /></IconButton>
        </div>
        <div className="flex flex-col items-center">
          <p>{file?.name}</p>
          <IconButton onClick={togglePlay}>{file && playButton}</IconButton>
        </div>
        <div className="flex justify-center h-40">
          <EQSlider eqNode={lowNode.current} />
          <EQSlider eqNode={midNode.current} />
          <EQSlider eqNode={highNode.current} />
        </div>
      </FrequencyVisualizer>
    </div>
  );
}

export default SoundControl;
