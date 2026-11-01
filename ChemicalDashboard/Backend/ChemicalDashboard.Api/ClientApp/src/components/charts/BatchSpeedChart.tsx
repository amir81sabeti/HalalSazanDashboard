import React from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import {
  richChartTooltip,
  richChartSplitLine,
  richChartAxisLine,
  richChartAxisLabel,
} from '@/utils/chartTheme';

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
      ...richChartTooltip,
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
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
      axisLine: richChartAxisLine,
      splitLine: richChartSplitLine,
      axisLabel: {
        ...richChartAxisLabel,
        fontSize: 8,
        formatter: (val: number) => `${Math.round(val / 1000)}K`,
      },
    },
    yAxis: {
      type: 'category',
      data: reversed.map((d) => d.batchName),
      axisLine: richChartAxisLine,
      axisTick: { show: false },
      axisLabel: { ...richChartAxisLabel, fontSize: 9 },
    },
    series: [
      {
        name: 'سرعت تولید',
        type: 'bar',
        barMaxWidth: 16,
        data: reversed.map((d) => d.speed),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
            { offset: 0, color: '#38bdf8' },
            { offset: 1, color: '#0369a1' },
          ]),
          borderRadius: [0, 4, 4, 0],
        },
        label: {
          show: true,
          position: 'right',
          color: '#cbd5e1',
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
