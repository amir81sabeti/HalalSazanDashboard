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
  const formattedTimes = times.map(formatChartDate);

  const option = {
    backgroundColor: 'transparent',
    tooltip: richChartTooltip,
    legend: {
      data: ['فشار راکتور', 'فشار بالای ستون', 'فشار ورودی کندانسور'],
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: '#e2e8f0', fontFamily: 'BYekan', fontSize: 9 },
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
    yAxis: {
      type: 'value',
      name: '(bar) فشار',
      nameTextStyle: { color: '#cbd5e1', fontSize: 8, fontFamily: 'BYekan' },
      max: 2.5,
      min: 0,
      axisLine: richChartAxisLine,
      splitLine: richChartSplitLine,
      axisLabel: { ...richChartAxisLabel, fontSize: 8 },
    },
    series: [
      {
        name: 'فشار راکتور',
        type: 'line',
        data: reactorPressure,
        itemStyle: { color: '#c084fc' },
        lineStyle: { width: 2, color: '#c084fc' },
        symbol: 'none',
        smooth: true,
      },
      {
        name: 'فشار بالای ستون',
        type: 'line',
        data: columnTopPressure,
        itemStyle: { color: '#38bdf8' },
        lineStyle: { width: 2, color: '#38bdf8' },
        symbol: 'none',
        smooth: true,
      },
      {
        name: 'فشار ورودی کندانسور',
        type: 'line',
        data: condenserPressure,
        itemStyle: { color: '#34d399' },
        lineStyle: { width: 2, color: '#34d399' },
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
