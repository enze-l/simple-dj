import {
  createTheme, IconButton, Slider, ThemeProvider,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { grey } from '@mui/material/colors';
import { Close } from '@mui/icons-material';
import AudioPlayer from './AudioPlayer';
import SongListItem from './SongListItem';
import WavePlayer, { ToggleParams } from './Visualizer/WavePlayer';
import getRandomColor from './Visualizer/RandomColor';
import PlayingState from './PlayingState';

/**
 * Color Definitions used for styling MUI-Sliders
 */
const theme = createTheme({
  palette: {
    primary: {
      main: grey[900],
    },
    secondary: {
      main: grey[300],
    },
    warning: {
      main: 'rgba(155,162,174,0.24)',
    },
  },
});

/**
 *  Primary entrypoint for the Application
 */
function App() {
  // AudioNodes (EQ, Volume) for the audio players
  const [audioNodesOne, setAudioNodesOne] = useState<AudioNode[] | undefined>();
  const [audioNodesTwo, setAudioNodesTwo] = useState<AudioNode[] | undefined>();
  // Primary BPM used for the playback-speed
  const [primaryBpm, setPrimaryBpm] = useState<number>(136);
  // BPM for each of the audio-players
  const [bpmOne, setBpmOne] = useState<undefined | number>(undefined);
  const [bpmTwo, setBpmTwo] = useState<undefined | number>(undefined);
  // List of uploaded files
  const [files, setFiles] = useState<Array<File | undefined>>([]);
  // Files loaded in both audio-players
  const [playerFileOne, setPlayerFileOne] = useState<File>();
  const [playerFileTwo, setPlayerFileTwo] = useState<File>();
  // Color code of both players used for the background color and timeline
  const [colorPlayerOne, setColorPlayerOne] = useState<string>(getRandomColor());
  const [colorPlayerTwo, setColorPlayerTwo] = useState<string>(getRandomColor());
  // Volume of the cross-fader
  const [volume, setVolume] = useState(1);
  // AudioContext of the application
  const [audioContext] = useState(new AudioContext());
  // Current playback-state of both audio-players
  const [onePlaying, setOnePlaying] = useState(PlayingState.LOADING);
  const [twoPlaying, setTwoPlaying] = useState(PlayingState.LOADING);
  // Toggle Object for the playback of both players.
  // The toggle value changes randomly while the time signals the offset to the closest beat
  const [togglePlayerOne, setTogglePlayerOne] = useState<ToggleParams>(
    { toggle: 0, time: undefined },
  );
  const [togglePlayerTwo, setTogglePlayerTwo] = useState<ToggleParams>(
    { toggle: 0, time: undefined },
  );
  // Used to signal the players that they should send their current time-offset to the closest beat
  const [toggleRetrievePlayerOne, setToggleRetrievePlayerOne] = useState(0);
  const [toggleRetrievePlayerTwo, setToggleRetrievePlayerTwo] = useState(0);
  // Used to signal the players that they should close themselves
  const [togglePLayerOneClose, setTogglePlayerOneClose] = useState(0);
  const [togglePLayerTwoClose, setTogglePlayerTwoClose] = useState(0);
  // The playback-speed of both players
  const [playbackSpeedOne, setPlaybackSpeedOne] = useState(1);
  const [playbackSpeedTwo, setPlaybackSpeedTwo] = useState(1);

  // Resets the players if a song ends
  function handlePlayerOneSongEnd() {
    setTogglePlayerOneClose(togglePLayerOneClose + 1);
    setPlayerFileOne(undefined);
    setColorPlayerOne(getRandomColor());
  }
  function handlePlayerTwoSongEnd() {
    setPlayerFileTwo(undefined);
    setTogglePlayerTwoClose(togglePLayerTwoClose + 1);
    setColorPlayerTwo(getRandomColor());
  }

  // Adds new Songs to the list of uploaded ones
  const handleFileUpload = (e: any) => {
    const filesList = e.target.files;
    const array = [...files];
    for (let i = 0; i < filesList.length; i += 1) {
      array.push(e.target.files[i]);
    }
    setFiles(array);
  };

  // load song into an available player if possible
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

  // deletes Song from the list
  const handleSongItemClosed = (index: number) => {
    const array = [...files];
    array.splice(index, 1);
    setFiles(array);
  };

  // Sets new primary Bpm
  const refreshPrimaryBpm = (bpm: number | undefined) => {
    if (bpm) {
      if (!primaryBpm) {
        setPrimaryBpm(bpm);
      }
    }
  };

  // returns dividende between two bpm
  const getRelativePlaybackSpeed = (
    referenceBpm: number,
    adjustableBpm: number,
  ) => referenceBpm / adjustableBpm;

  // Triggers a reevaluation of the primary bpm if the bpm of one of the songs changes
  useEffect(() => {
    if ((onePlaying !== PlayingState.PLAYING && twoPlaying !== PlayingState.PLAYING)
        && (!bpmOne !== !bpmTwo)) {
      if (bpmOne) {
        setPrimaryBpm(bpmOne);
        setPlaybackSpeedOne(1);
      } else if (bpmTwo) {
        setPrimaryBpm(bpmTwo);
        setPlaybackSpeedTwo(1);
      }
    }
    if (primaryBpm) {
      if (bpmOne) {
        setPlaybackSpeedOne(getRelativePlaybackSpeed(primaryBpm, bpmOne));
      }
      if (bpmTwo) {
        setPlaybackSpeedTwo(getRelativePlaybackSpeed(primaryBpm, bpmTwo));
      }
    }
  }, [primaryBpm, bpmOne, bpmTwo]);

  return (
    <ThemeProvider theme={theme}>
      <div className="flex bg-gray-800 divide-x divide-gray-600">
        <div className="grow h-screen flex flex-col divide-y divide-gray-600">
          <div className="grow grid grid-cols-2 items-center">
            <AudioPlayer
              audioContext={audioContext}
              setAudioNodes={(node: AudioNode[]) => setAudioNodesOne(node)}
              volume={2 - volume}
              playing={onePlaying}
              file={playerFileOne}
              togglePlay={() => setToggleRetrievePlayerTwo(toggleRetrievePlayerTwo + 1)}
              handlePlayerClose={() => handlePlayerOneSongEnd()}
              color={colorPlayerOne}
            />
            <AudioPlayer
              audioContext={audioContext}
              setAudioNodes={(node: AudioNode[]) => setAudioNodesTwo(node)}
              volume={volume}
              playing={twoPlaying}
              file={playerFileTwo}
              togglePlay={() => setToggleRetrievePlayerOne(toggleRetrievePlayerOne + 1)}
              handlePlayerClose={() => handlePlayerTwoSongEnd()}
              color={colorPlayerTwo}
            />
          </div>
          <div className="w-full flex place-content-center">
            <p className="absolute text-gray-500">Volume</p>
            <div className="pt-4 pb-3 w-2/3">
              <Slider
                color="secondary"
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
          </div>
          <div className="flex text-gray-500 place-content-center">
            <p className="absolute text-gray-500">BPM</p>
            <div className="grid grid-cols-5 w-2/3 pb-3 pt-4">
              <p className="pt-1">{bpmOne && `Bpm: ${bpmOne}`}</p>
              <div className="flex flex-row col-span-3">
                <p className="pt-1 px-3">90</p>
                <div className="grow">
                  <Slider
                    color="secondary"
                    value={primaryBpm}
                    min={90}
                    max={180}
                    valueLabelDisplay="auto"
                    step={1}
                    onChange={(e, value) => {
                      if (typeof value === 'number') {
                        setPrimaryBpm(value);
                      }
                    }}
                  />
                </div>
                <p className="pt-1 px-3">180</p>
              </div>
              <p className="pt-1 justify-self-end">{bpmTwo && `Bpm: ${bpmTwo}`}</p>
            </div>
          </div>
          <div className="h-40 bg-gray-900">
            <WavePlayer
              audioContext={audioContext}
              audioNodes={audioNodesOne}
              play={(state: PlayingState) => setOnePlaying(state)}
              handleSongEnd={() => handlePlayerOneSongEnd()}
              file={playerFileOne}
              close={togglePLayerOneClose}
              color={colorPlayerOne}
              setBpm={(bpm: number|undefined) => {
                refreshPrimaryBpm(bpm);
                setBpmOne(bpm);
              }}
              isTop
              playbackSpeed={playbackSpeedOne}
              toggleRetrieve={toggleRetrievePlayerOne}
              toggleOtherPlayer={(toggle: ToggleParams) => {
                setTogglePlayerTwo(toggle);
              }}
              toggle={togglePlayerOne}
            />
          </div>
          <div className="h-40 bg-gray-900">
            <WavePlayer
              audioContext={audioContext}
              audioNodes={audioNodesTwo}
              play={(state: PlayingState) => setTwoPlaying(state)}
              handleSongEnd={() => handlePlayerTwoSongEnd()}
              file={playerFileTwo}
              close={togglePLayerTwoClose}
              color={colorPlayerTwo}
              setBpm={(bpm: number|undefined) => {
                refreshPrimaryBpm(bpm);
                setBpmTwo(bpm);
              }}
              isTop={false}
              playbackSpeed={playbackSpeedTwo}
              toggleRetrieve={toggleRetrievePlayerTwo}
              toggleOtherPlayer={(toggle: ToggleParams) => {
                setTogglePlayerOne(toggle);
              }}
              toggle={togglePlayerTwo}
            />
          </div>
        </div>
        <div className="flex-none w-96 overflow-auto max-h-screen scrollbar-hide">
          <div className="grid content-center z-10 hover:bg-gray-300 h-28 bg-gray-400 center-items">
            <p className="justify-self-center text-xl text-gray-800">Drop files or click for Upload</p>
            <input type="file" className="opacity-0 h-28 absolute" onChange={handleFileUpload} multiple id="audio" accept="audio/*" />
          </div>
          <ul>
            {files.map((file, index) => (
              <div className="flex hover:bg-gray-700">
                <div className="grow" role="button" tabIndex={index} onKeyDown={() => handleSongItemClicked(index)} onClick={() => handleSongItemClicked(index)}>
                  <SongListItem file={file} />
                </div>
                <IconButton onClick={() => handleSongItemClosed(index)}>
                  <Close color="warning" />
                </IconButton>
              </div>
            ))}
          </ul>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
