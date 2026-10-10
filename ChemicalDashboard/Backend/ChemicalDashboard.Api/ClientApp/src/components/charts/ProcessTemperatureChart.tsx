import React from 'react';
import ReactECharts from 'echarts-for-react';

interface ProcessTemperatureChartProps {
  times: string[];
  reactorTemp: number[];
  columnTopTemp: number[];
  refluxTemp: number[];
}

export const ProcessTemperatureChart: React.FC<ProcessTemperatureChartProps> = ({
  times,
  reactorTemp,
  columnTopTemp,
  refluxTemp,
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
      data: ['دمای راکتور', 'دمای بالای ستون', 'دمای سیال ریفلاکس'],
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
      name: '(°C) دما',
      nameTextStyle: { color: '#94a3b8', fontSize: 8, fontFamily: 'BYekan' },
      max: 120,
      min: 0,
      interval: 20,
      axisLine: { lineStyle: { color: '#334155' } },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
      axisLabel: { color: '#94a3b8', fontFamily: 'BYekan', fontSize: 8 },
    },
    series: [
      {
        name: 'دمای راکتور',
        type: 'line',
        data: reactorTemp,
        itemStyle: { color: '#ef4444' },
        lineStyle: { width: 1.5, color: '#ef4444' },
        symbol: 'none',
        smooth: true,
      },
      {
        name: 'دمای بالای ستون',
        type: 'line',
        data: columnTopTemp,
        itemStyle: { color: '#3b82f6' },
        lineStyle: { width: 1.5, color: '#3b82f6' },
        symbol: 'none',
        smooth: true,
      },
      {
        name: 'دمای سیال ریفلاکس',
        type: 'line',
        data: refluxTemp,
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
