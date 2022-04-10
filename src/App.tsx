import React, {useState, useEffect, useRef} from 'react';
import IconButton from "@mui/material/IconButton";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

function App() {
    const [file, setFile] = useState();
    const [playButton, setPlayButton] = useState(<PlayArrowIcon/>);

    const audioElement = useRef<HTMLAudioElement>();

    useEffect(() => {
        if (file) {
            const audioContext = new AudioContext();
            audioElement.current = new Audio(URL.createObjectURL(file));
            const track = audioContext.createMediaElementSource(audioElement.current);
            track.connect(audioContext.destination);
            audioContext.resume();
            playSong();
        }
    }, [file])

    const handleFileUpload = (e: any) => {
        if (e.target.files[0]) {
            pauseSong();
            setFile(e.target.files[0]);
        }
    }

    const playSong = () => {
        if (audioElement.current) {
            audioElement.current.play();
            setPlayButton(<PauseIcon/>);
        }
    }

    const pauseSong = () => {
        if (audioElement.current) {
            audioElement.current.pause();
            setPlayButton(<PlayArrowIcon/>)
        }
    }

    const handlePlayPause = () => {
        if (audioElement.current) {
            audioElement.current.paused ? playSong() : pauseSong()
        }
    }

    return (
        <div className="grid place-items-center h-screen">
            <div>
                <input onChange={handleFileUpload} id="audio" type="file" accept="audio/*"/>
                <IconButton onClick={handlePlayPause}>{file !== undefined && playButton}</IconButton>
            </div>
        </div>
    );
}

export default App;
