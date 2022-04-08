import React, {useState, useEffect} from 'react';
import logo from './logo.svg';

function App() {
    const [file, setFile] = useState();

    let audioContext: AudioContext;
    let audioElement: HTMLAudioElement | null;

    useEffect(() => {
        if (!audioContext) {
            audioContext = new window.AudioContext;
            console.log(file)
        }
        if (file) {
            audioElement = new Audio(URL.createObjectURL(file));
            if (audioElement) {
                const track = audioContext.createMediaElementSource(audioElement);
                track.connect(audioContext.destination);
                audioContext.resume();
                audioElement.play();
            }
        }
    }, [file])

    const handeFile = (e: any) => {
        setFile(e.target.files[0]);
    }

    return (
        <div className="App">
            <header className="grid place-items-center h-screen">
                <input onChange={handeFile} id="audio" type="file" accept="audio/*"/>
            </header>
        </div>
    );
}

export default App;
