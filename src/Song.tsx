import React from 'react';

export interface AudioPlayerProps {
    file: File | undefined;
}

function Song({ file }: AudioPlayerProps) {
  return (
    <li>{file?.name}</li>
  );
}

export default Song;
