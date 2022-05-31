import { Slider } from '@mui/material';
import React, { useState } from 'react';
import EqNode from './EqNode';

export interface EQSliderProps{
    eqNode: EqNode | undefined;
}

function EQSlider({ eqNode }:EQSliderProps) {
  const [lowerBandThreshold, setLowerBandThreshold] = useState(0);
  return (
    <Slider
      value={lowerBandThreshold}
      onChange={(e, value) => {
        if (typeof value === 'number') {
          setLowerBandThreshold(value);
          eqNode?.setGain(value);
        }
      }}
      min={-10}
      max={10}
      marks={[{ value: 0 }]}
      orientation="vertical"
    />
  );
}

export default EQSlider;
