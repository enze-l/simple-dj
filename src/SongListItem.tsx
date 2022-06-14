import React from 'react';
import formate from './Visualizer/FileNameFormater';

export interface AudioPlayerProps {
    file: File | undefined;
}

function SongListItem({ file }: AudioPlayerProps) {
  const name = formate(file?.name);

  return (
    file ? <li className="text-gray-300 p-3">{file ? name : undefined}</li> : <div />
  );
}

export default SongListItem;
