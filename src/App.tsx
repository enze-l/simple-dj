import React, {useState} from 'react';
import AudioPlayer from "./AudioPlayer";

function App() {
    const [file, setFile] = useState();
    const audioContext = new AudioContext();
    const audioPlayer1 = AudioPlayer({audioContext, file});

    const handleFileUpload = (e: any) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    }

    return (
        <div className="grid place-items-center h-screen">
            <div className="flex-col">
                <input onChange={handleFileUpload} id="audio" type="file" accept="audio/*"/>
                {audioPlayer1}
            </div>
        </div>
    );
}

export default App;
