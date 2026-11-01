import React from 'react';
import ReactECharts from 'echarts-for-react';
import {
  formatChartDate,
  getSparseInterval,
  richChartTooltip,
  richChartSplitLine,
  richChartAxisLine,
  richChartAxisLabel,
} from '@/utils/chartTheme';

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
  const formattedTimes = times.map(formatChartDate);

  const option = {
    backgroundColor: 'transparent',
    tooltip: richChartTooltip,
    legend: {
      data: ['عدد اسیدی (AN)', 'میزان ریفلاکس'],
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: '#e2e8f0', fontFamily: 'BYekan', fontSize: 9 },
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
      data: formattedTimes,
      axisLine: richChartAxisLine,
      axisTick: { show: false },
      axisLabel: {
        ...richChartAxisLabel,
        fontSize: 8,
        rotate: 0,
        interval: getSparseInterval(formattedTimes.length, 5),
      },
    },
    yAxis: [
      {
        type: 'value',
        name: 'عدد اسیدی',
        nameTextStyle: { color: '#cbd5e1', fontSize: 8, fontFamily: 'BYekan' },
        max: 1,
        min: 0,
        axisLine: richChartAxisLine,
        splitLine: richChartSplitLine,
        axisLabel: { ...richChartAxisLabel, fontSize: 8 },
      },
      {
        type: 'value',
        name: 'ریفلاکس',
        nameTextStyle: { color: '#cbd5e1', fontSize: 8, fontFamily: 'BYekan' },
        max: 2,
        min: 0,
        axisLine: richChartAxisLine,
        splitLine: { show: false },
        axisLabel: { ...richChartAxisLabel, fontSize: 8 },
      },
    ],
    series: [
      {
        name: 'عدد اسیدی (AN)',
        type: 'line',
        data: acidNumber,
        itemStyle: { color: '#fb7185' },
        lineStyle: { width: 2, color: '#fb7185' },
        symbol: 'none',
        smooth: true,
      },
      {
        name: 'میزان ریفلاکس',
        type: 'line',
        yAxisIndex: 1,
        data: refluxRatio,
        itemStyle: { color: '#38bdf8' },
        lineStyle: { width: 2, color: '#38bdf8' },
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
