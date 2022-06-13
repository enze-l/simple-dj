import React from 'react';

export interface AudioPlayerProps {
    file: File | undefined;
}

function SongListItem({ file }: AudioPlayerProps) {
  const maxLength = 44;
  let name;
  if (file) {
    name = file.name.slice(0, file.name.length - 4);
    if (file && name.length > maxLength + 4) {
      name = name.slice(0, maxLength);
      name = `${name}...`;
    } else {
      name = name.slice(0, maxLength + 4);
    }
  }
  return (
    file ? <li className="text-gray-300 p-3">{file ? name : undefined}</li> : <div />
  );
}

export default SongListItem;
