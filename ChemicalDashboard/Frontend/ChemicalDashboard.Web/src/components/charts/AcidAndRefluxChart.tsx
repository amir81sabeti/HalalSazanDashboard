import React from 'react';
import ReactECharts from 'echarts-for-react';

interface AcidAndRefluxChartProps {
  times: string[];
  acidNumber: number[];
  refluxRatio: number[];
}

export const AcidAndRefluxChart: React.FC<AcidAndRefluxChartProps> = ({
  times,
  acidNumber,
  refluxRatio,
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
      data: ['عدد اسیدی (AN)', 'میزان ریفلاکس'],
      textStyle: { color: '#94a3b8', fontFamily: 'BYekan', fontSize: 9 },
      top: 0,
      left: 'center',
    },
    grid: {
      top: 32,
      right: 35,
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
    yAxis: [
      {
        type: 'value',
        name: 'عدد اسیدی',
        nameTextStyle: { color: '#94a3b8', fontSize: 8, fontFamily: 'BYekan' },
        max: 1,
        min: 0,
        axisLine: { lineStyle: { color: '#334155' } },
        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
        axisLabel: { color: '#94a3b8', fontFamily: 'BYekan', fontSize: 8 },
      },
      {
        type: 'value',
        name: 'ریفلاکس',
        nameTextStyle: { color: '#94a3b8', fontSize: 8, fontFamily: 'BYekan' },
        max: 2,
        min: 0,
        axisLine: { lineStyle: { color: '#334155' } },
        splitLine: { show: false },
        axisLabel: { color: '#94a3b8', fontFamily: 'BYekan', fontSize: 8 },
      },
    ],
    series: [
      {
        name: 'عدد اسیدی (AN)',
        type: 'line',
        data: acidNumber,
        itemStyle: { color: '#ef4444' },
        lineStyle: { width: 1.5, color: '#ef4444' },
        symbol: 'none',
        smooth: true,
      },
      {
        name: 'میزان ریفلاکس',
        type: 'line',
        yAxisIndex: 1,
        data: refluxRatio,
        itemStyle: { color: '#0284c7' },
        lineStyle: { width: 1.5, color: '#0284c7' },
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
