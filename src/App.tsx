import React, {useState, useEffect} from 'react';
import logo from './logo.svg';

function App() {
    const [file, setFile] = useState();

    const audioContext = new AudioContext;
    var audioElement: HTMLAudioElement;
    var track;

    useEffect(() => {
        if (file) {
            audioElement = new Audio(URL.createObjectURL(file));
            track = audioContext.createMediaElementSource(audioElement);
            track.connect(audioContext.destination);
            audioContext.resume();
            audioElement.play();
        }
    }, [file])

    const handleFile = (e: any) => {
        if(audioElement){
            audioElement.pause();
        }
        setFile(e.target.files[0]);
    }

    const handlePlayPause = () => {
        if(audioElement) {
            if (audioElement.paused) {
                audioElement.play();
            } else {
                audioElement.pause();
            }
        }
    }

    return (
        <div className="grid place-items-center h-screen">
            <div className="grid grid-cols-1">
                <button onClick={handlePlayPause}>Play/Pause</button>
                <input onChange={handleFile} id="audio" type="file" accept="audio/*"/>
            </div>
        </div>
    );
}

export default App;
