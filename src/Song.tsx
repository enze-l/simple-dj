import React from 'react';

export interface AudioPlayerProps {
    file: File | undefined;
}

function Song(props: AudioPlayerProps) {
  const { file } = props;

  return (
    <li>{file?.name}</li>
  );
}

export default Song;
