import IconButton from '@mui/material/IconButton';
import React, { useEffect, useRef, useState } from 'react';
import { Pause, PlayArrow } from '@mui/icons-material/';
import EqNode from './Equalizer/EqNode';
import FrequencyVisualizer from './Visualizer/FrequencyVisualizer';
import EQSlider from './Equalizer/EQSlider';

export interface AudioPlayerProps {
    audioContext: AudioContext | undefined;
    setAudioNodes: any;
    file: File | undefined;
    volume: number;
    play: any;
    playing: boolean;
}

function SoundControl({
  setAudioNodes, file, audioContext, volume, play, playing,
}: AudioPlayerProps) {
  const [playButton, setPlayButton] = useState(<PlayArrow />);

  const gainNode = useRef<GainNode>();
  const lowNode = useRef<EqNode>();
  const midNode = useRef<EqNode>();
  const highNode = useRef<EqNode>();
  const analyserNode = useRef<AnalyserNode>();

  const playSong = () => {
    setPlayButton(<Pause />);
    play(true);
  };

  const pauseSong = () => {
    setPlayButton(<PlayArrow />);
    play(false);
  };

  const handlePlayPause = () => {
    if (playing) {
      pauseSong();
    } else {
      playSong();
    }
  };

  const setVolume = (value: number) => {
    if (gainNode.current) {
      gainNode.current.gain.value = Math.min(value, 1);
    }
  };

  useEffect(() => {
    setVolume(volume);
  }, [volume]);

  useEffect(() => {
    if (file && audioContext) {
      pauseSong();

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
        <div className="flex flex-col items-center">
          <p>{file?.name}</p>
          <IconButton onClick={handlePlayPause}>{file && playButton}</IconButton>
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
