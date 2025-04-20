import React, { useEffect, useRef } from 'react';

const Heatmap = ({ data, metadata }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!data || !metadata) {
      console.log('Heatmap: Missing data or metadata', { data, metadata });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { nx, ny } = metadata;

    // Set canvas size and scale
    canvas.width = nx;
    canvas.height = ny;
    
    // Scale canvas to fit container
    const containerWidth = canvas.parentElement.clientWidth;
    const containerHeight = canvas.parentElement.clientHeight;
    const scale = Math.min(containerWidth / nx, containerHeight / ny);
    
    ctx.scale(scale, scale);

    // Create image data
    const imageData = ctx.createImageData(nx, ny);
    const imageDataArray = imageData.data;

    // Convert RGB data to ImageData
    for (let y = 0; y < ny; y++) {
      for (let x = 0; x < nx; x++) {
        const i = (y * nx + x) * 4;
        const rgb = data[y][x];
        
        // Ensure rgb values are within 0-255 range
        imageDataArray[i] = Math.min(255, Math.max(0, rgb[0]));     // R
        imageDataArray[i + 1] = Math.min(255, Math.max(0, rgb[1])); // G
        imageDataArray[i + 2] = Math.min(255, Math.max(0, rgb[2])); // B
        imageDataArray[i + 3] = 255;    // Alpha
      }
    }

    // Draw the image data
    ctx.putImageData(imageData, 0, 0);

    // Create color scale
    const scaleHeight = 20;
    const scaleWidth = 200;
    const scaleY = ny - scaleHeight - 10;
    const scaleX = 10;

    // Draw gradient
    const gradient = ctx.createLinearGradient(scaleX, scaleY, scaleX + scaleWidth, scaleY);
    gradient.addColorStop(0, 'rgb(0,0,255)');   // Blue
    gradient.addColorStop(0.5, 'rgb(255,255,255)'); // White
    gradient.addColorStop(1, 'rgb(255,0,0)');   // Red

    ctx.fillStyle = gradient;
    ctx.fillRect(scaleX, scaleY, scaleWidth, scaleHeight);

    // Add labels
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('-1', scaleX, scaleY - 5);
    ctx.textAlign = 'right';
    ctx.fillText('1', scaleX + scaleWidth, scaleY - 5);

  }, [data, metadata]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain'
      }}
    />
  );
};

export default Heatmap;
