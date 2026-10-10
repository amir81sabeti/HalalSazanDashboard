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
      backgroundColor: '#ffffff',
      borderColor: '#e2e8f0',
      textStyle: { color: '#0f172a', fontFamily: 'BYekan', fontSize: 11 },
      extraCssText: 'box-shadow: 0 4px 16px rgba(0,0,0,0.1); border-radius: 8px;',
    },
    legend: {
      data: ['عدد اسیدی (AN)', 'میزان ریفلاکس'],
      textStyle: { color: '#475569', fontFamily: 'BYekan', fontSize: 9 },
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
      axisLine: { lineStyle: { color: '#cbd5e1' } },
      axisLabel: {
        color: '#64748b',
        fontFamily: 'BYekan',
        fontSize: 8,
        rotate: 35,
      },
    },
    yAxis: [
      {
        type: 'value',
        name: 'عدد اسیدی',
        nameTextStyle: { color: '#64748b', fontSize: 8, fontFamily: 'BYekan' },
        max: 1,
        min: 0,
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
        axisLabel: { color: '#64748b', fontFamily: 'BYekan', fontSize: 8 },
      },
      {
        type: 'value',
        name: 'ریفلاکس',
        nameTextStyle: { color: '#64748b', fontSize: 8, fontFamily: 'BYekan' },
        max: 2,
        min: 0,
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        splitLine: { show: false },
        axisLabel: { color: '#64748b', fontFamily: 'BYekan', fontSize: 8 },
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
