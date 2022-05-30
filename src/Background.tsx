import React, { createRef, ReactNode } from 'react';

interface BackgroundProps{
  analyserNode: AnalyserNode | undefined
  children: ReactNode
}

function Background(props: BackgroundProps) {
  const { analyserNode, children } = props;
  const canvas = createRef();
  let frequencyArray: Uint8Array;
  let rafId;

  const animationLooper = (canvas) => {

  };

  const tick = () => {
    animationLooper(canvas.current);
    analyserNode?.getByteTimeDomainData(frequencyArray);
    requestAnimationFrame(tick);
  };

  if (analyserNode) {
    frequencyArray = new Uint8Array(analyserNode.frequencyBinCount);
    console.log(frequencyArray);
  }

  return (
    <div>
      {canvas}
      {children}
    </div>
  );
}

export default Background;
