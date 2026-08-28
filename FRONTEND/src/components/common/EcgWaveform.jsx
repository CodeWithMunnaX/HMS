import React, { useEffect, useRef, useState } from 'react';
import { Activity, Heart, Zap } from 'lucide-react';

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

    // Clear canvas
    ctx.fillStyle = '#060d1f';
    ctx.fillRect(0, 0, width, height);

    // Draw background grid lines
    const drawGrid = () => {
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
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
      ctx.fillStyle = '#060d1f';
      ctx.fillRect(x, 0, 12, height);

      // Re-draw subtle grid for cleared slice
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.lineWidth = 1;
      for (let gy = 0; gy < height; gy += 16) {
        ctx.beginPath();
        ctx.moveTo(x, gy);
        ctx.lineTo(x + 12, gy);
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

      // Glowing Neon Cyan Wave line
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.moveTo(x === 0 ? width - 2 : x - 2, midY);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow

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
    <div
      style={{
        background: 'linear-gradient(180deg, #070d1e 0%, #030712 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        padding: '1.15rem 1.35rem',
        color: '#ffffff',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(6, 182, 212, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
        marginBottom: '1.75rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#22d3ee',
          }}
        >
          <Activity size={22} className="animate-pulse" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 8px #10b981',
              }}
            />
            <span style={{ fontSize: '0.7rem', color: '#67e8f9', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Live Clinical Telemetry
            </span>
          </div>
          <div style={{ fontWeight: '800', fontSize: '1rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
            {patientName}
          </div>
        </div>
      </div>

      {/* Real-Time Canvas Waveform */}
      <div
        style={{
          flex: '1 1 240px',
          height: '60px',
          position: 'relative',
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <canvas ref={canvasRef} width={340} height={60} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>

      {/* Live Numerical Readouts */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Heart Rate</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#22d3ee', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Heart size={14} color="#ef4444" fill="#ef4444" className="animate-bounce" /> {currentBpm} <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600' }}>bpm</span>
          </div>
        </div>

        <div style={{ height: '30px', width: '1px', backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>SpO2 Pulse</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#10b981' }}>
            {spO2}%
          </div>
        </div>

        <div style={{ height: '30px', width: '1px', backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Blood Pressure</div>
          <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff' }}>
            {bp}
          </div>
        </div>
      </div>
    </div>
  );
};
