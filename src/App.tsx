import { Slider } from '@mui/material';
import React, { useState } from 'react';
import AudioPlayer from './AudioPlayer';
import Song from './Song';
import Waveform from './Visualizer/Waveform';

function App() {
  const [files, setFiles] = useState<Array<File | undefined>>([undefined]);
  const [playerFileOne, setPlayerFileOne] = useState<File>();
  const [playerFileTwo, setPlayerFileTwo] = useState<File>();
  const [volume, setVolume] = useState(1);
  const [audioContext] = useState(new AudioContext());
  function handlePlayerOneSongEnd() { setPlayerFileOne(undefined); }
  function handlePlayerTwoSongEnd() { setPlayerFileTwo(undefined); }

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
    <div className="grid grid-cols-5">
      <div className="col-span-4 grid min-h-screen">
        <div className="grid grid-cols-2 items-center">
          <AudioPlayer
            audioContext={audioContext}
            file={playerFileOne}
            handleSongEnd={() => handlePlayerOneSongEnd()}
            volume={2 - volume}
          />
          <AudioPlayer
            audioContext={audioContext}
            file={playerFileTwo}
            handleSongEnd={() => handlePlayerTwoSongEnd()}
            volume={volume}
          />
        </div>
        <Slider
          value={volume}
          min={0}
          max={2}
          step={0.01}
          marks={[{ value: 1 }]}
          track={false}
          className="col-span-2"
          onChange={(e, value) => {
            if (typeof value === 'number') {
              setVolume(value);
            }
          }}
        />
        <div className="col-span-2">
          <Waveform audioContext={audioContext} file={playerFileOne} />
        </div>
        <div className="col-span-2">
          <Waveform audioContext={audioContext} file={playerFileTwo} />
        </div>
      </div>
      <div>
        <input onChange={handleFileUpload} id="audio" type="file" accept="audio/*" />
        <ul>
          {files.map((file, index) => (
            <div onKeyDown={() => handleSongItemClicked(index)} role="button" tabIndex={index} onClick={() => handleSongItemClicked(index)}>
              <Song file={file} />
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
