import IconButton from "@mui/material/IconButton";
import React, {useEffect, useRef, useState} from "react";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {DoNotTouch} from "@mui/icons-material";

type AudioPlayerProps = {
    audioContext: AudioContext;
    file?: File;
}

function AudioPlayer(props: AudioPlayerProps) {
    const [playButton, setPlayButton] = useState(<DoNotTouch/>);
    const file = props.file;
    let audioElement = useRef<HTMLAudioElement>();

    useEffect(() => {
        console.log(file)
        if (file) {
            pauseSong();
            audioElement.current = new Audio(URL.createObjectURL(file));
            const track = props.audioContext.createMediaElementSource(audioElement.current);
            track.connect(props.audioContext.destination);
            props.audioContext.resume().then();
            playSong();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file])

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
        <div className="flex flex-row items-center">
            <p>{file?.name}</p>
            <IconButton className="" onClick={handlePlayPause}>{audioElement !== undefined && playButton}</IconButton>
        </div>
    );
}

export default AudioPlayer;