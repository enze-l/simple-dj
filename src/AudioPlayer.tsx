import IconButton from '@mui/material/IconButton';
import React, { useEffect, useRef, useState } from 'react';
import { Pause, PlayArrow, DoNotTouch } from '@mui/icons-material/';

export interface AudioPlayerProps {
    audioContext: AudioContext;
    file: File | undefined;
    handleSongEnd: any;
}

function AudioPlayer(props: AudioPlayerProps) {
  const [playButton, setPlayButton] = useState(<DoNotTouch />);
  const {
    file, audioContext, handleSongEnd,
  } = props;
  const audioElement = useRef<HTMLAudioElement>();

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
    setPlayButton(<DoNotTouch />);
    audioElement.current = undefined;
    handleSongEnd();
  };

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
      track.connect(audioContext.destination);
      audioContext.resume().then();
      playSong();
    }
  }, [file]);

  return (
    <div className="flex flex-col items-center">
      <p>{file?.name}</p>
      <IconButton className="" onClick={handlePlayPause}>{audioElement !== undefined && playButton}</IconButton>
    </div>
  );
}

export default AudioPlayer;
