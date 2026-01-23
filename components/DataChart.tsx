"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useEffect, useRef } from "react";

export default function DataChart() {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Chart config
    const padding = { top: 40, right: 40, bottom: 50, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Data points (24 hours)
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const tempData = [22, 21.8, 21.5, 21.2, 21, 20.8, 21.5, 23, 24.5, 26, 27.5, 28.8, 29.5, 30, 29.8, 29.2, 28.5, 27, 25.5, 24.2, 23.5, 23, 22.5, 22.2];
    const humidityData = [65, 66, 67, 68, 69, 70, 68, 65, 62, 58, 55, 52, 50, 48, 49, 51, 54, 57, 60, 62, 63, 64, 64.5, 65];
    const lightData = [0, 0, 0, 0, 0, 5, 15, 35, 55, 75, 85, 90, 95, 92, 88, 80, 65, 45, 25, 10, 2, 0, 0, 0];

    // Scale functions
    const xScale = (i: number) => padding.left + (i / 23) * chartWidth;
    const yScaleTemp = (val: number) => padding.top + chartHeight - ((val - 20) / 15) * chartHeight;
    const yScaleHumidity = (val: number) => padding.top + chartHeight - ((val - 40) / 40) * chartHeight;
    const yScaleLight = (val: number) => padding.top + chartHeight - (val / 100) * chartHeight;

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();

    // Draw lines with gradient
    const drawLine = (data: number[], color: string, scaleFunc: (val: number) => number) => {
      // Create gradient
      const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color.replace('1)', '0.3)'));

      // Draw area
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(xScale(0), height - padding.bottom);
      data.forEach((val, i) => {
        ctx.lineTo(xScale(i), scaleFunc(val));
      });
      ctx.lineTo(xScale(data.length - 1), height - padding.bottom);
      ctx.closePath();
      ctx.fill();

      // Draw line
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      data.forEach((val, i) => {
        if (i === 0) {
          ctx.moveTo(xScale(i), scaleFunc(val));
        } else {
          ctx.lineTo(xScale(i), scaleFunc(val));
        }
      });
      ctx.stroke();

      // Draw points
      data.forEach((val, i) => {
        if (i % 3 === 0) {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(xScale(i), scaleFunc(val), 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    };

    // Draw temperature line
    drawLine(tempData, 'rgba(34, 197, 94, 1)', yScaleTemp);
    
    // Draw humidity line
    drawLine(humidityData, 'rgba(59, 130, 246, 1)', yScaleHumidity);
    
    // Draw light line
    drawLine(lightData, 'rgba(234, 179, 8, 1)', yScaleLight);

    // Draw X-axis labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    hours.forEach((hour, i) => {
      if (i % 4 === 0) {
        ctx.fillText(`${hour}:00`, xScale(i), height - padding.bottom + 25);
      }
    });

    // Draw Y-axis labels (temperature)
    ctx.textAlign = 'right';
    [20, 25, 30, 35].forEach(val => {
      ctx.fillText(`${val}°C`, padding.left - 10, yScaleTemp(val) + 4);
    });

    // Draw title
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t.monitor.title, width / 2, 25);

  }, [t]);

  return (
    <div className="relative w-full" style={{ height: '500px' }}>
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* Legend */}
      <div className="absolute top-12 left-4 flex flex-col gap-2 bg-black/70 p-4 rounded-lg backdrop-blur border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span className="text-sm text-white">{t.monitor.temp}</span>
          <span className="text-sm text-gold font-semibold">28.5°C</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span className="text-sm text-white">{t.monitor.humidity}</span>
          <span className="text-sm text-gold font-semibold">52%</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
          <span className="text-sm text-white">{t.monitor.light}</span>
          <span className="text-sm text-gold font-semibold">92 lux</span>
        </div>
      </div>

      {/* Status indicator */}
      <div className="absolute top-12 right-4 bg-black/70 p-4 rounded-lg backdrop-blur border border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm text-white">实时更新中</span>
        </div>
        <div className="text-xs text-text-secondary mt-2">
          最后更新: {new Date().toLocaleTimeString('zh-CN')}
        </div>
      </div>
    </div>
  );
}
