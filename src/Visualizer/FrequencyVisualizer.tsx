import React, { createRef } from 'react';

const tinyColor = require('tinycolor2');

interface BackgroundProps{
  analyserNode: AnalyserNode | undefined
  children: any
  color: string
}

function FrequencyVisualizer({ analyserNode, children, color }: BackgroundProps) {
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

        const primaryColor = tinyColor(color).setAlpha(0);

        const spinAmount = 60;

        const color2 = primaryColor.toRgbString();
        const color3 = primaryColor.spin(spinAmount).toRgbString();
        const color4 = primaryColor.spin(-spinAmount).toRgbString();

        drawCircle(context, color, color2, centerX + 40, centerY + 10, highFrequencies);
        drawCircle(context, color, color3, centerX - 40, centerY + 10, midFrequencies);
        drawCircle(context, color, color4, centerX, centerY - 30, lowFrequencies);
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
