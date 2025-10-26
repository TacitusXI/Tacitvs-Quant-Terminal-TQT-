import { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';

interface GraphModuleProps {
  data: CandlestickData<Time>[];
  height?: number;
}

export default function GraphModule({ data, height = 300 }: GraphModuleProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: {
        background: { color: '#000000' },
        textColor: '#d0d0d0',
      },
      grid: {
        vertLines: { color: '#101010' },
        horzLines: { color: '#101010' },
      },
      crosshair: {
        mode: 1,
      },
      timeScale: {
        borderColor: '#101010',
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: '#101010',
      },
    });

    const series = chart.addCandlestickSeries({
      upColor: 'var(--accent)',
      downColor: 'var(--accent2)',
      borderVisible: false,
      wickUpColor: 'var(--accent)',
      wickDownColor: 'var(--accent2)',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [height]);

  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      seriesRef.current.setData(data);
    }
  }, [data]);

  return <div ref={chartContainerRef} className="w-full" />;
}

