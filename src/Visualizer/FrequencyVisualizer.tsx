import React, { createRef } from 'react';

interface BackgroundProps{
  analyserNode: AnalyserNode | undefined
  children: any
}

function FrequencyVisualizer({ analyserNode, children }: BackgroundProps) {
  const canvas = createRef<HTMLCanvasElement>();

  const drawCircle = (
    context: CanvasRenderingContext2D,
    colorInner:string,
    colorOuter:string,
    x:number,
    y:number,
    size:number,
  ) => {
    const radgrad = context.createRadialGradient(x, y, 0, x, y, size * 2);
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

    if (canvas.current) {
      const context = canvas.current.getContext('2d');

      canvas.current.style.width = '100%';
      canvas.current.style.height = '100%';
      canvas.current.width = canvas.current.offsetWidth;
      canvas.current.height = canvas.current.offsetHeight;

      if (context) {
        context.globalCompositeOperation = 'lighten';
        context.clearRect(0, 0, canvas.current.width, canvas.current.height);

        if (analyserNode) {
          const frequencyArray = new Uint8Array(analyserNode.frequencyBinCount);
          analyserNode?.getByteTimeDomainData(frequencyArray);

          lowFrequencies = getAverage(frequencyArray.slice(0, 50));
          midFrequencies = getAverage(frequencyArray.slice(50, 100));
          highFrequencies = getAverage(frequencyArray.slice(900, 1000));
        }

        const centerY = canvas.current.height / 2;
        const centerX = canvas.current.width / 2;

        drawCircle(context, 'rgb(255, 0, 0)', 'rgba(255,0,0,0)', centerX + 30, centerY + 10, highFrequencies);
        drawCircle(context, 'rgb(0,255,0)', 'rgba(0,255,0,0)', centerX - 30, centerY + 10, midFrequencies);
        drawCircle(context, 'rgb(0, 0, 255)', 'rgba(0,0,255,0)', centerX, centerY - 20, lowFrequencies);
      }
    }
  };

  const tick = () => {
    animationLooper();
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);

  return (
    <div className="flex justify-center items-center h-full shadow-inner shadow-gray-800">
      <div className="absolute">
        {children}
      </div>
      <canvas ref={canvas} />
    </div>
  );
}

export default FrequencyVisualizer;
