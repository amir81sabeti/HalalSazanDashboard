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
      backgroundColor: '#ffffff',
      borderColor: '#e2e8f0',
      textStyle: { color: '#0f172a', fontFamily: 'BYekan', fontSize: 11 },
      extraCssText: 'box-shadow: 0 4px 16px rgba(0,0,0,0.1); border-radius: 8px;',
    },
    legend: {
      data: ['فشار راکتور', 'فشار بالای ستون', 'فشار ورودی کندانسور'],
      textStyle: { color: '#475569', fontFamily: 'BYekan', fontSize: 9 },
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
      axisLine: { lineStyle: { color: '#cbd5e1' } },
      axisLabel: {
        color: '#64748b',
        fontFamily: 'BYekan',
        fontSize: 8,
        rotate: 35,
      },
    },
    yAxis: {
      type: 'value',
      name: '(bar) فشار',
      nameTextStyle: { color: '#64748b', fontSize: 8, fontFamily: 'BYekan' },
      max: 2.5,
      min: 0,
      axisLine: { lineStyle: { color: '#cbd5e1' } },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
      axisLabel: { color: '#64748b', fontFamily: 'BYekan', fontSize: 8 },
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
