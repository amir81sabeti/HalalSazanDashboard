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
  const formattedTimes = times.map(formatChartDate);

  const option = {
    backgroundColor: 'transparent',
    tooltip: richChartTooltip,
    legend: {
      data: ['دمای راکتور', 'دمای بالای ستون', 'دمای سیال ریفلاکس'],
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
      name: '(°C) دما',
      nameTextStyle: { color: '#cbd5e1', fontSize: 8, fontFamily: 'BYekan' },
      max: 120,
      min: 0,
      interval: 20,
      axisLine: richChartAxisLine,
      splitLine: richChartSplitLine,
      axisLabel: { ...richChartAxisLabel, fontSize: 8 },
    },
    series: [
      {
        name: 'دمای راکتور',
        type: 'line',
        data: reactorTemp,
        itemStyle: { color: '#fb7185' },
        lineStyle: { width: 2, color: '#fb7185' },
        symbol: 'none',
        smooth: true,
      },
      {
        name: 'دمای بالای ستون',
        type: 'line',
        data: columnTopTemp,
        itemStyle: { color: '#38bdf8' },
        lineStyle: { width: 2, color: '#38bdf8' },
        symbol: 'none',
        smooth: true,
      },
      {
        name: 'دمای سیال ریفلاکس',
        type: 'line',
        data: refluxTemp,
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
