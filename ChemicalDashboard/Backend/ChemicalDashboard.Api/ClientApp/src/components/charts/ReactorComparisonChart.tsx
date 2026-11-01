import React from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import {
  richChartTooltip,
  richChartSplitLine,
  richChartAxisLine,
  richChartAxisLabel,
} from '@/utils/chartTheme';

interface ReactorComparisonChartProps {
  reactors: string[];
  azgTotal: number[];
  agTotal: number[];
}

export const ReactorComparisonChart: React.FC<ReactorComparisonChartProps> = ({
  reactors,
  azgTotal,
  agTotal,
}) => {
  const option = {
    backgroundColor: 'transparent',
    tooltip: richChartTooltip,
    legend: {
      data: ['مقدار کل محصول (AZG)', 'مقدار کل آبگیری (AG)'],
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: '#e2e8f0', fontFamily: 'BYekan', fontSize: 10 },
      top: 0,
      left: 'center',
    },
    grid: {
      top: 36,
      right: 25,
      bottom: 25,
      left: 50,
    },
    xAxis: {
      type: 'category',
      data: reactors,
      axisLine: richChartAxisLine,
      axisTick: { show: false },
      axisLabel: { ...richChartAxisLabel, fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      axisLine: richChartAxisLine,
      splitLine: richChartSplitLine,
      axisLabel: {
        ...richChartAxisLabel,
        fontSize: 9,
        formatter: (val: number) => `${Math.round(val / 1000)}K`,
      },
    },
    series: [
      {
        name: 'مقدار کل محصول (AZG)',
        type: 'bar',
        data: azgTotal,
        barMaxWidth: 36,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#38bdf8' },
            { offset: 1, color: '#0369a1' },
          ]),
          borderRadius: [6, 6, 0, 0],
        },
        label: {
          show: true,
          position: 'top',
          color: '#ffffff',
          fontSize: 10,
          fontWeight: 'bold',
          fontFamily: 'BYekan',
          formatter: (params: { value: number }) => `${Math.round(params.value / 1000)}K`,
        },
      },
      {
        name: 'مقدار کل آبگیری (AG)',
        type: 'bar',
        data: agTotal,
        barMaxWidth: 36,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#fbbf24' },
            { offset: 1, color: '#b45309' },
          ]),
          borderRadius: [6, 6, 0, 0],
        },
        label: {
          show: true,
          position: 'top',
          color: '#fbbf24',
          fontSize: 10,
          fontWeight: 'bold',
          fontFamily: 'BYekan',
          formatter: (params: { value: number }) => `${Math.round(params.value / 1000)}K`,
        },
      },
    ],
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: '100%', minHeight: '260px', width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  );
};
