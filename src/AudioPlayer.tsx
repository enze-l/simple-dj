import IconButton from '@mui/material/IconButton';
import React, { useEffect, useRef, useState } from 'react';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { DoNotTouch } from '@mui/icons-material';

export interface AudioPlayerProps {
    audioContext: AudioContext;
    file: File | undefined;
}

function AudioPlayer(props: AudioPlayerProps) {
  const [playButton, setPlayButton] = useState(<DoNotTouch />);
  const { file, audioContext } = props;
  const audioElement = useRef<HTMLAudioElement>();

  const playSong = () => {
    if (audioElement.current) {
      audioElement.current.play();
      setPlayButton(<PauseIcon />);
    }
  };

  const pauseSong = () => {
    if (audioElement.current) {
      audioElement.current.pause();
      setPlayButton(<PlayArrowIcon />);
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

  useEffect(() => {
    if (file) {
      pauseSong();
      audioElement.current = new Audio(URL.createObjectURL(file));
      const track = audioContext.createMediaElementSource(audioElement.current);
      track.connect(audioContext.destination);
      audioContext.resume().then();
      playSong();
    }
  }, [file]);

  return (
    <div className="flex flex-row items-center">
      <p>{file?.name}</p>
      <IconButton className="" onClick={handlePlayPause}>{audioElement !== undefined && playButton}</IconButton>
    </div>
  );
}

export default AudioPlayer;
