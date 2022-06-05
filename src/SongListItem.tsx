import React from 'react';

export interface AudioPlayerProps {
    file: File | undefined;
}

function SongListItem({ file }: AudioPlayerProps) {
  return (
    <li>{file?.name}</li>
  );
}

export default SongListItem;
