import { Slider } from '@mui/material';
import React, { useState } from 'react';
import SoundControl from './SoundControl';
import SongListItem from './SongListItem';
import Waveform from './Visualizer/Waveform';

function App() {
  const [files, setFiles] = useState<Array<File | undefined>>([undefined]);
  const [audioNodesOne, setAudioNodesOne] = useState<AudioNode[] | undefined>();
  const [audioNodesTwo, setAudioNodesTwo] = useState<AudioNode[] | undefined>();
  const [playerFileOne, setPlayerFileOne] = useState<File>();
  const [playerFileTwo, setPlayerFileTwo] = useState<File>();
  const [volume, setVolume] = useState(1);
  const [audioContext] = useState(new AudioContext());
  const [onePlaying, setOnePlaying] = useState(false);
  const [twoPlaying, setTwoPlaying] = useState(false);
  const [togglePlayerOne, setTogglePlayerOne] = useState(0);
  const [togglePlayerTwo, setTogglePlayerTwo] = useState(0);
  const [togglePLayerOneClose, setTogglePlayerOneClose] = useState(0);
  const [togglePLayerTwoClose, setTogglePlayerTwoClose] = useState(0);

  function handlePlayerOneSongEnd() {
    setTogglePlayerOneClose(togglePLayerOneClose + 1);
    setPlayerFileOne(undefined);
  }
  function handlePlayerTwoSongEnd() {
    setPlayerFileTwo(undefined);
    setTogglePlayerTwoClose(togglePLayerTwoClose + 1);
  }

  const handleFileUpload = (e: any) => {
    if (e.target.files[0]) {
      const newArray = [...files];
      newArray.push(e.target.files[0]);
      setFiles(newArray);
    }
  };

  const handleSongItemClicked = (index: number) => {
    const file = files[index];
    if (file) {
      if (!playerFileOne) {
        setPlayerFileOne(file);
      } else if (!playerFileTwo) {
        setPlayerFileTwo(file);
      }
    }
  };

  return (
    <div className="flex bg-gray-600">
      <div className="grow h-screen flex flex-col">
        <div className="grow grid grid-cols-2 items-center">
          <SoundControl
            audioContext={audioContext}
            setAudioNodes={(node: AudioNode[]) => setAudioNodesOne(node)}
            volume={2 - volume}
            playing={onePlaying}
            file={playerFileOne}
            togglePlay={() => setTogglePlayerOne(togglePlayerOne + 1)}
            handlePlayerClose={() => handlePlayerOneSongEnd()}
          />
          <SoundControl
            audioContext={audioContext}
            setAudioNodes={(node: AudioNode[]) => setAudioNodesTwo(node)}
            volume={volume}
            playing={twoPlaying}
            file={playerFileTwo}
            togglePlay={() => setTogglePlayerTwo(togglePlayerTwo + 1)}
            handlePlayerClose={() => handlePlayerTwoSongEnd()}
          />
        </div>
        <div className="h-24 w-2/3 self-center">
          <Slider
            value={volume}
            min={0}
            max={2}
            step={0.01}
            marks={[{ value: 1 }]}
            track={false}
            onChange={(e, value) => {
              if (typeof value === 'number') {
                setVolume(value);
              }
            }}
          />
        </div>
        <div className="h-40">
          <Waveform
            toggle={togglePlayerOne}
            audioContext={audioContext}
            audioNodes={audioNodesOne}
            play={(state: boolean) => setOnePlaying(state)}
            handleSongEnd={() => handlePlayerOneSongEnd()}
            file={playerFileOne}
            close={togglePLayerOneClose}
          />
        </div>
        <div className="h-40">
          <Waveform
            toggle={togglePlayerTwo}
            audioContext={audioContext}
            audioNodes={audioNodesTwo}
            play={(state: boolean) => setTwoPlaying(state)}
            handleSongEnd={() => handlePlayerTwoSongEnd()}
            file={playerFileTwo}
            close={togglePLayerTwoClose}
          />
        </div>
      </div>
      <div className="flex-none w-96 bg-gray-700 shadow-xl shadow-gray-800">
        <input onChange={handleFileUpload} id="audio" type="file" accept="audio/*" />
        <ul>
          {files.map((file, index) => (
            <div onKeyDown={() => handleSongItemClicked(index)} role="button" tabIndex={index} onClick={() => handleSongItemClicked(index)}>
              <SongListItem file={file} />
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
