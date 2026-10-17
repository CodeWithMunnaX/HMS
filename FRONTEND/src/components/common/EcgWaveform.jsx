import React, { useEffect, useRef, useState } from 'react';
import { Activity, Heart } from 'lucide-react';

// Light-theme palette for the canvas trace
const CANVAS_BG = '#ffffff';
const GRID_COLOR = 'rgba(8, 145, 178, 0.10)';
const TRACE_COLOR = '#0891b2';

export const EcgWaveform = ({ bpm = 75, spO2 = 99, bp = '120/80', patientName = 'Live ICU Telemetry' }) => {
  const canvasRef = useRef(null);
  const [currentBpm, setCurrentBpm] = useState(bpm);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let x = 0;
    const height = canvas.height;
    const width = canvas.width;
    const midY = height / 2;
    let prevY = midY;

    // Clear canvas
    ctx.fillStyle = CANVAS_BG;
    ctx.fillRect(0, 0, width, height);

    // Draw background grid lines
    const drawGrid = () => {
      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth = 1;
      const gridSize = 16;
      for (let gx = 0; gx < width; gx += gridSize) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
        ctx.stroke();
      }
      for (let gy = 0; gy < height; gy += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }
    };

    drawGrid();

    let step = 0;

    const render = () => {
      // Clear a small vertical slice ahead of the scan line
      ctx.fillStyle = CANVAS_BG;
      ctx.fillRect(x, 0, 12, height);

      // Re-draw subtle grid for cleared slice
      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth = 1;
      for (let gy = 0; gy < height; gy += 16) {
        ctx.beginPath();
        ctx.moveTo(x, gy);
        ctx.lineTo(x + 12, gy);
        ctx.stroke();
      }
      for (let gx = Math.ceil(x / 16) * 16; gx < x + 12; gx += 16) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
        ctx.stroke();
      }

      // Compute P-Q-R-S-T Cardiac Sinus Wave
      let y = midY;
      const cycle = step % 80;

      if (cycle >= 18 && cycle <= 24) {
        // P-wave
        y = midY - Math.sin(((cycle - 18) / 6) * Math.PI) * 7;
      } else if (cycle === 32) {
        // Q-wave
        y = midY + 6;
      } else if (cycle === 34) {
        // R-peak
        y = midY - 38;
      } else if (cycle === 36) {
        // S-wave
        y = midY + 14;
      } else if (cycle >= 46 && cycle <= 56) {
        // T-wave
        y = midY - Math.sin(((cycle - 46) / 10) * Math.PI) * 12;
      } else {
        // Isoelectric baseline with tiny micro-variation
        y = midY + (Math.random() - 0.5) * 1.5;
      }

      // Teal trace on a light grid
      ctx.strokeStyle = TRACE_COLOR;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(x === 0 ? 0 : x - 2, x === 0 ? y : prevY);
      ctx.lineTo(x, y);
      ctx.stroke();
      prevY = y;

      x += 2;
      step += 1;
      if (x >= width) {
        x = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Slight dynamic BPM pulse simulation
    const interval = setInterval(() => {
      setCurrentBpm((prev) => Math.max(68, Math.min(84, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 3000);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="portal-ecg">
      <div className="portal-ecg-title">
        <div className="portal-ecg-icon">
          <Activity size={20} />
        </div>
        <div>
          <div className="portal-ecg-live">
            <span className="portal-live-dot" />
            Live clinical telemetry
          </div>
          <div className="portal-ecg-name">{patientName}</div>
        </div>
      </div>

      {/* Real-Time Canvas Waveform */}
      <div className="portal-ecg-canvas">
        <canvas ref={canvasRef} width={340} height={60} />
      </div>

      {/* Live Numerical Readouts */}
      <div className="portal-ecg-readouts">
        <div className="portal-ecg-readout">
          <div className="portal-ecg-label">Heart rate</div>
          <div className="portal-ecg-value" style={{ color: 'var(--primary-700)' }}>
            <Heart size={14} color="#ef4444" fill="#ef4444" /> {currentBpm} <span className="portal-ecg-unit">bpm</span>
          </div>
        </div>

        <div className="portal-ecg-divider" />

        <div className="portal-ecg-readout">
          <div className="portal-ecg-label">SpO2</div>
          <div className="portal-ecg-value" style={{ color: 'var(--success-600)' }}>
            {spO2}%
          </div>
        </div>

        <div className="portal-ecg-divider" />

        <div className="portal-ecg-readout">
          <div className="portal-ecg-label">Blood pressure</div>
          <div className="portal-ecg-value" style={{ color: 'var(--slate-900)', fontSize: '1.05rem' }}>
            {bp}
          </div>
        </div>
      </div>
    </div>
  );
};
