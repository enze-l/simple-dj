import IconButton from '@mui/material/IconButton';
import React, { useEffect, useRef, useState } from 'react';
import { Pause, PlayArrow } from '@mui/icons-material/';

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
    audioElement.current = undefined;
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

      track.connect(gainNode.current).connect(audioContext.destination);
      audioContext.resume().then();
      playSong();
    }
  }, [file]);

  return (
    <div className="flex flex-col items-center">
      <p>{file?.name}</p>
      <IconButton onClick={handlePlayPause}>{file && playButton}</IconButton>
    </div>
  );
}

export default AudioPlayer;
