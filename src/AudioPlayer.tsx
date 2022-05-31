import IconButton from '@mui/material/IconButton';
import React, { useEffect, useRef, useState } from 'react';
import { Pause, PlayArrow } from '@mui/icons-material/';
import { Slider } from '@mui/material';
import EqNode from './EqNode';
import VisualizerBackground from './VisualizerBackground';

export interface AudioPlayerProps {
    audioContext: AudioContext;
    file: File | undefined;
    handleSongEnd: any;
    volume: number;
}

function AudioPlayer(props: AudioPlayerProps) {
  const [playButton, setPlayButton] = useState(<PlayArrow />);
  const {
    file, audioContext, handleSongEnd, volume,
  } = props;
  const audioElement = useRef<HTMLAudioElement>();
  const gainNode = useRef<GainNode>();

  const lowNode = useRef<EqNode>();
  const midNode = useRef<EqNode>();
  const highNode = useRef<EqNode>();

  const analyserNode = useRef<AnalyserNode>();

  const [lowNodeGain, setLowNodeGain] = useState(0);
  const [midNodeGain, setMidNodeGain] = useState(0);
  const [highNodeGain, setHighNodeGain] = useState(0);

  const playSong = () => {
    if (audioElement.current) {
      audioElement.current.play();
      setPlayButton(<Pause />);
    }
  };

  const pauseSong = () => {
    if (audioElement.current) {
      audioElement.current.pause();
      setPlayButton(<PlayArrow />);
    }
  };

  const handlePlayPause = () => {
    if (audioElement.current) {
      if (audioElement.current.paused) {
        playSong();
      } else {
        pauseSong();
      }
    }
  };

  const stopSong = () => {
    pauseSong();
    setHighNodeGain(0);
    setMidNodeGain(0);
    setLowNodeGain(0);
    handleSongEnd();
  };

  useEffect(() => {
    if (gainNode.current) {
      gainNode.current.gain.value = Math.min(volume, 1);
    }
  }, [volume]);

  useEffect(() => {
    if (file) {
      pauseSong();
      audioElement.current = new Audio(URL.createObjectURL(file));
      if (audioElement.current) {
        audioElement.current.onended = () => {
          stopSong();
        };
      }
      const track = audioContext.createMediaElementSource(audioElement.current);
      gainNode.current = audioContext.createGain();

      lowNode.current = new EqNode(audioContext, 'lowshelf', 320);
      midNode.current = new EqNode(audioContext, 'peaking', 1000);
      highNode.current = new EqNode(audioContext, 'highshelf', 3200);

      analyserNode.current = new AnalyserNode(audioContext);

      track.connect(gainNode.current)
        .connect(lowNode.current.getNode())
        .connect(midNode.current.getNode())
        .connect(highNode.current.getNode())
        .connect(analyserNode.current)
        .connect(audioContext.destination);
      audioContext.resume().then();
    }
  }, [file]);

  if (file) {
    return (
      <div>
        <VisualizerBackground analyserNode={analyserNode.current}>
          <div className="flex flex-col items-center">
            <p>{file?.name}</p>
            <IconButton onClick={handlePlayPause}>{file && playButton}</IconButton>
          </div>
          <div className="flex justify-center h-40">
            <Slider
              value={lowNodeGain}
              onChange={(e, value) => {
                if (typeof value === 'number') {
                  setLowNodeGain(value);
                  lowNode.current?.setGain(value);
                }
              }}
              min={-10}
              max={10}
              marks={[{ value: 0 }]}
              orientation="vertical"
            />
            <Slider
              value={midNodeGain}
              onChange={(e, value) => {
                if (typeof value === 'number') {
                  setMidNodeGain(value);
                  midNode.current?.setGain(value);
                }
              }}
              min={-10}
              max={10}
              marks={[{ value: 0 }]}
              orientation="vertical"
            />
            <Slider
              value={highNodeGain}
              onChange={(e, value) => {
                if (typeof value === 'number') {
                  setHighNodeGain(value);
                  highNode.current?.setGain(value);
                }
              }}
              min={-10}
              max={10}
              marks={[{ value: 0 }]}
              orientation="vertical"
            />
          </div>
        </VisualizerBackground>
      </div>
    );
  }

  return <div />;
}

export default AudioPlayer;
