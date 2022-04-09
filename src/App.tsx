import React, {useState, useEffect, useRef} from 'react';

function App() {
    const [file, setFile] = useState();
    const [buttonText, setButtonText] = useState("Play")

    const PLAY = "Play";
    const PAUSE = "Pause";

    const audioElement = useRef<HTMLAudioElement>(new Audio());

    useEffect(() => {
        if (file) {
            const audioContext = new AudioContext();
            audioElement.current = new Audio(URL.createObjectURL(file));
            const track = audioContext.createMediaElementSource(audioElement.current);
            track.connect(audioContext.destination);
            audioContext.resume();
            audioElement.current.play();
        }
    }, [file])

    const handleFileUpload = (e: any) => {
        if(e.target.files[0]) {
            audioElement.current.pause();
            setButtonText(PAUSE)
            setFile(e.target.files[0]);
        }
    }

    const handlePlayPause = () => {
        if (audioElement.current.paused){
            audioElement.current.play();
            setButtonText(PAUSE);
        } else {
            audioElement.current.pause();
            setButtonText(PLAY);
        }
    }

    return (
        <div className="grid place-items-center h-screen">
            <div className="grid grid-cols-1">
                <button onClick={handlePlayPause}>{buttonText}</button>
                <input onChange={handleFileUpload} id="audio" type="file" accept="audio/*"/>
            </div>
        </div>
    );
}

export default App;
