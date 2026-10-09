import React from 'react';
import ReactECharts from 'echarts-for-react';

interface ProcessPressureChartProps {
  times: string[];
  reactorPressure: number[];
  columnTopPressure: number[];
  condenserPressure: number[];
}

export const ProcessPressureChart: React.FC<ProcessPressureChartProps> = ({
  times,
  reactorPressure,
  columnTopPressure,
  condenserPressure,
}) => {
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 28, 52, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      textStyle: { color: '#f8fafc', fontFamily: 'BYekan', fontSize: 11 },
    },
    legend: {
      data: ['فشار راکتور', 'فشار بالای ستون', 'فشار ورودی کندانسور'],
      textStyle: { color: '#94a3b8', fontFamily: 'BYekan', fontSize: 9 },
      top: 0,
      left: 'center',
    },
    grid: {
      top: 32,
      right: 15,
      bottom: 25,
      left: 35,
    },
    xAxis: {
      type: 'category',
      data: times,
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: {
        color: '#94a3b8',
        fontFamily: 'BYekan',
        fontSize: 8,
        rotate: 35,
      },
    },
    yAxis: {
      type: 'value',
      name: '(bar) فشار',
      nameTextStyle: { color: '#94a3b8', fontSize: 8, fontFamily: 'BYekan' },
      max: 2.5,
      min: 0,
      axisLine: { lineStyle: { color: '#334155' } },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
      axisLabel: { color: '#94a3b8', fontFamily: 'BYekan', fontSize: 8 },
    },
    series: [
      {
        name: 'فشار راکتور',
        type: 'line',
        data: reactorPressure,
        itemStyle: { color: '#a855f7' },
        lineStyle: { width: 1.5, color: '#a855f7' },
        symbol: 'none',
        smooth: true,
      },
      {
        name: 'فشار بالای ستون',
        type: 'line',
        data: columnTopPressure,
        itemStyle: { color: '#0284c7' },
        lineStyle: { width: 1.5, color: '#0284c7' },
        symbol: 'none',
        smooth: true,
      },
      {
        name: 'فشار ورودی کندانسور',
        type: 'line',
        data: condenserPressure,
        itemStyle: { color: '#10b981' },
        lineStyle: { width: 1.5, color: '#10b981' },
        symbol: 'none',
        smooth: true,
      },
    ],
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: '100%', minHeight: '190px', width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  );
};
