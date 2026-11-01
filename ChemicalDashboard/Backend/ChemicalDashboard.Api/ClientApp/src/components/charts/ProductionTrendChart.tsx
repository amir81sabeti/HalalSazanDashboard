import React from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import {
  formatChartDate,
  getSparseInterval,
  richChartTooltip,
  richChartSplitLine,
  richChartAxisLine,
  richChartAxisLabel,
} from '@/utils/chartTheme';

interface ProductionTrendChartProps {
  dates: string[];
  azgRates: number[];
  agRates: number[];
  azgCumulative: number[];
  agCumulative: number[];
}

export const ProductionTrendChart: React.FC<ProductionTrendChartProps> = ({
  dates,
  azgRates,
  agRates,
  azgCumulative,
  agCumulative,
}) => {
  const formattedDates = dates.map(formatChartDate);

  const option = {
    backgroundColor: 'transparent',
    tooltip: richChartTooltip,
    legend: {
      data: [
        'سرعت تولید (AZG)',
        'سرعت آبگیری (AG)',
        'مقدار کل محصول (AZG)',
        'مقدار کل آبگیری (AG)',
      ],
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: '#e2e8f0', fontFamily: 'BYekan', fontSize: 10 },
      top: 0,
      left: 'center',
    },
    grid: {
      top: 36,
      right: 50,
      bottom: 28,
      left: 55,
    },
    xAxis: [
      {
        type: 'category',
        data: formattedDates,
        axisLine: richChartAxisLine,
        axisTick: { show: false },
        axisLabel: {
          ...richChartAxisLabel,
          rotate: 0,
          interval: getSparseInterval(formattedDates.length, 7),
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: 'سرعت (لیتر/ساعت)',
        nameTextStyle: { color: '#cbd5e1', fontSize: 9, fontFamily: 'BYekan' },
        axisLine: richChartAxisLine,
        splitLine: richChartSplitLine,
        axisLabel: {
          ...richChartAxisLabel,
          fontSize: 9,
          formatter: (val: number) => `${Math.round(val / 1000)}K`,
        },
      },
      {
        type: 'value',
        name: 'مقدار کل (لیتر)',
        nameTextStyle: { color: '#cbd5e1', fontSize: 9, fontFamily: 'BYekan' },
        axisLine: richChartAxisLine,
        splitLine: { show: false },
        axisLabel: {
          ...richChartAxisLabel,
          fontSize: 9,
          formatter: (val: number) => `${Math.round(val / 1000)}K`,
        },
      },
    ],
    series: [
      {
        name: 'سرعت تولید (AZG)',
        type: 'bar',
        data: azgRates,
        barMaxWidth: 18,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#38bdf8' },
            { offset: 1, color: '#0284c7' },
          ]),
          borderRadius: [4, 4, 0, 0],
        },
      },
      {
        name: 'سرعت آبگیری (AG)',
        type: 'bar',
        data: agRates,
        barMaxWidth: 18,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#fbbf24' },
            { offset: 1, color: '#d97706' },
          ]),
          borderRadius: [4, 4, 0, 0],
        },
      },
      {
        name: 'مقدار کل محصول (AZG)',
        type: 'line',
        yAxisIndex: 1,
        data: azgCumulative,
        itemStyle: { color: '#38bdf8' },
        lineStyle: { width: 2.5, color: '#38bdf8' },
        symbol: 'circle',
        symbolSize: 4,
        smooth: true,
      },
      {
        name: 'مقدار کل آبگیری (AG)',
        type: 'line',
        yAxisIndex: 1,
        data: agCumulative,
        itemStyle: { color: '#f59e0b' },
        lineStyle: { width: 2.5, color: '#f59e0b' },
        symbol: 'circle',
        symbolSize: 4,
        smooth: true,
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
