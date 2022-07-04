import IconButton from '@mui/material/IconButton';
import React, { useEffect, useRef, useState } from 'react';
import {
  Close, Pause, PlayArrow, HourglassEmpty,
} from '@mui/icons-material/';
import EqNode from './Equalizer/EqNode';
import FrequencyVisualizer from './Visualizer/FrequencyVisualizer';
import EQSlider from './Equalizer/EQSlider';
import formate from './Visualizer/FileNameFormater';
import PlayingState from './PlayingState';

export interface AudioPlayerProps {
    audioContext: AudioContext | undefined;
    setAudioNodes: any;
    file: File | undefined;
    volume: number;
    playing: PlayingState;
    togglePlay: any;
    handlePlayerClose: any;
    color: string,
}

/**
 * Represents on of the two decks displaying the
 * title and offering control over the EQ and play/pause
 * @param setAudioNodes callback function to set the necessary EQ- and Volume nodes
 * @param file the file played back by this instance
 * @param togglePlay callback function to trigger play/pause of the audio file
 * @param handlePlayerClose callback function triggered by pressing "close" on this player
 * @param audioContext the audio context needed to play back audio
 * @param volume the volume level at which this player should output sound
 * @param playing the state of the playback (Playing, PAUSED, LOADING)
 * @param color the primary color of the background-visualization
 */
function AudioPlayer({
  setAudioNodes, file, togglePlay, handlePlayerClose, audioContext, volume, playing, color,
}: AudioPlayerProps) {
  const [playButton, setPlayButton] = useState(<PlayArrow />);

  const gainNode = useRef<GainNode>();
  const lowNode = useRef<EqNode>();
  const midNode = useRef<EqNode>();
  const highNode = useRef<EqNode>();
  const analyserNode = useRef<AnalyserNode>();

  const setVolume = (value: number) => {
    if (gainNode.current) {
      gainNode.current.gain.value = Math.min(value, 0.8);
    }
  };

  const closePlayer = () => {
    handlePlayerClose();
  };

  useEffect(() => {
    if (playing === PlayingState.PLAYING) {
      setPlayButton(<Pause />);
    } else if (playing === PlayingState.PAUSED) {
      setPlayButton(<PlayArrow />);
    } else {
      setPlayButton(<HourglassEmpty />);
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
    <div className={file ? 'visible h-full' : 'invisible'}>
      <FrequencyVisualizer analyserNode={analyserNode.current} color={color}>
        <div className="w-96 h-96 bg-gray-300 shadow-lg shadow-gray-900">
          <div className="flex flex-col items-end">
            <IconButton onClick={closePlayer} className="items-end"><Close /></IconButton>
          </div>
          <div className="flex flex-col items-center pt-6">
            <p>{formate(file?.name)}</p>
            <div className="pt-2 pb-3">
              <IconButton onClick={togglePlay}>{file && playButton}</IconButton>
            </div>
          </div>
          <div className="flex justify-center h-40">
            <EQSlider eqNode={lowNode.current} />
            <EQSlider eqNode={midNode.current} />
            <EQSlider eqNode={highNode.current} />
          </div>
        </div>
      </FrequencyVisualizer>
    </div>
  );
}

export default AudioPlayer;
