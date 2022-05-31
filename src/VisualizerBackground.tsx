import React, { createRef } from 'react';

interface BackgroundProps{
  analyserNode: AnalyserNode | undefined
  children: any[]
}

function VisualizerBackground(props: BackgroundProps) {
  const { analyserNode, children } = props;
  const canvas = createRef<HTMLCanvasElement>();

  const drawCircle = (
    context: CanvasRenderingContext2D,
    colorInner:string,
    colorOuter:string,
    x:number,
    y:number,
    size:number,
  ) => {
    // const array = frequencyArray.slice(0, 160);
    // const average = array.reduce((a, b) => a + b, 0) / array.length;
    const radgrad = context
      .createRadialGradient(x, y, 0, x, y, size);
    radgrad.addColorStop(0, colorInner);
    radgrad.addColorStop(1, colorOuter);
    context.fillStyle = radgrad;
    if (canvas.current) {
      context.fillRect(0, 0, canvas.current.width, canvas.current.height);
    }
  };

  const getAverage = (array: Uint8Array) => array.reduce((a, b) => a + b, 0) / array.length;

  const animationLooper = () => {
    let lowFrequencies = 128;
    let midFrequencies = 128;
    let highFrequencies = 128;

    const canvasSquareSize = 500;

    if (canvas.current) {
      const context = canvas.current.getContext('2d');

      canvas.current.width = canvasSquareSize;
      canvas.current.height = canvasSquareSize;

      if (context) {
        context.globalCompositeOperation = 'lighten';
        context.clearRect(0, 0, canvas.current.width, canvas.current.height);

        if (analyserNode) {
          const frequencyArray = new Uint8Array(analyserNode.frequencyBinCount);
          analyserNode?.getByteTimeDomainData(frequencyArray);

          lowFrequencies = getAverage(frequencyArray.slice(0, 100));
          midFrequencies = getAverage(frequencyArray.slice(100, 300));
          highFrequencies = getAverage(frequencyArray.slice(300, 1024));
        }

        const halfPosition = canvasSquareSize / 2;
        const thirdPosition = canvasSquareSize / 3;

        drawCircle(context, 'rgb(255, 0, 0)', 'rgba(255,0,0,0)', thirdPosition, thirdPosition * 2, highFrequencies);
        drawCircle(context, 'rgb(0,255,0)', 'rgba(0,255,0,0)', halfPosition, thirdPosition, midFrequencies);
        drawCircle(context, 'rgb(0, 0, 255)', 'rgba(0,0,255,0)', thirdPosition * 2, thirdPosition * 2, lowFrequencies);
      }
    }
  };

  const tick = () => {
    animationLooper();
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);

  return (
    <div className="flex justify-center items-center">
      <div className="absolute">
        {children}
      </div>
      <canvas ref={canvas} />
    </div>
  );
}

export default VisualizerBackground;
