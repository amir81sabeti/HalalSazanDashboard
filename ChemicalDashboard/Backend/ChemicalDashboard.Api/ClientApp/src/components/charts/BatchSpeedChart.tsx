import React from 'react';
import ReactECharts from 'echarts-for-react';

interface BatchSpeedChartProps {
  data: {
    batchName: string;
    speed: number;
  }[];
}

export const BatchSpeedChart: React.FC<BatchSpeedChartProps> = ({ data }) => {
  const reversed = [...data].reverse();

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(15, 28, 52, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      textStyle: { color: '#f8fafc', fontFamily: 'BYekan', fontSize: 11 },
      formatter: (params: Array<{ name: string; value: number }>) => {
        const p = params[0];
        return `${p.name}: ${p.value.toLocaleString('fa-IR')} لیتر/ساعت`;
      },
    },
    grid: {
      top: 15,
      right: 55,
      bottom: 25,
      left: 45,
    },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#334155' } },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
      axisLabel: {
        color: '#94a3b8',
        fontFamily: 'BYekan',
        fontSize: 8,
        formatter: (val: number) => `${val / 1000}K`,
      },
    },
    yAxis: {
      type: 'category',
      data: reversed.map((d) => d.batchName),
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8', fontFamily: 'BYekan', fontSize: 9 },
    },
    series: [
      {
        name: 'سرعت تولید',
        type: 'bar',
        data: reversed.map((d) => d.speed),
        itemStyle: { color: '#38bdf8', borderRadius: [0, 4, 4, 0] },
        label: {
          show: true,
          position: 'right',
          color: '#94a3b8',
          fontSize: 9,
          fontFamily: 'BYekan',
          formatter: (params: { value: number }) => params.value.toLocaleString('fa-IR'),
        },
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
