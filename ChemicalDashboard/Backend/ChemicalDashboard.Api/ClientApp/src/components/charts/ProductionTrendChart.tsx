import React from 'react';
import ReactECharts from 'echarts-for-react';

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
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 28, 52, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      textStyle: { color: '#f8fafc', fontFamily: 'BYekan', fontSize: 11 },
      axisPointer: { type: 'cross', label: { backgroundColor: '#1e3256' } },
    },
    legend: {
      data: [
        'سرعت تولید (AZG)',
        'سرعت آبگیری (AG)',
        'مقدار کل محصول (AZG)',
        'مقدار کل آبگیری (AG)',
      ],
      textStyle: { color: '#94a3b8', fontFamily: 'BYekan', fontSize: 10 },
      top: 0,
      left: 'center',
    },
    grid: {
      top: 36,
      right: 50,
      bottom: 30,
      left: 55,
    },
    xAxis: [
      {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: {
          color: '#94a3b8',
          fontFamily: 'BYekan',
          fontSize: 9,
          rotate: 30,
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: 'سرعت (لیتر/ساعت)',
        nameTextStyle: { color: '#94a3b8', fontSize: 9, fontFamily: 'BYekan' },
        axisLine: { lineStyle: { color: '#334155' } },
        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
        axisLabel: {
          color: '#94a3b8',
          fontFamily: 'BYekan',
          fontSize: 9,
          formatter: (val: number) => `${val / 1000}K`,
        },
      },
      {
        type: 'value',
        name: 'مقدار کل (لیتر)',
        nameTextStyle: { color: '#94a3b8', fontSize: 9, fontFamily: 'BYekan' },
        axisLine: { lineStyle: { color: '#334155' } },
        splitLine: { show: false },
        axisLabel: {
          color: '#94a3b8',
          fontFamily: 'BYekan',
          fontSize: 9,
          formatter: (val: number) => `${val / 1000}K`,
        },
      },
    ],
    series: [
      {
        name: 'سرعت تولید (AZG)',
        type: 'bar',
        data: azgRates,
        itemStyle: { color: '#3b82f6', borderRadius: [3, 3, 0, 0] },
      },
      {
        name: 'سرعت آبگیری (AG)',
        type: 'bar',
        data: agRates,
        itemStyle: { color: '#f59e0b', borderRadius: [3, 3, 0, 0] },
      },
      {
        name: 'مقدار کل محصول (AZG)',
        type: 'line',
        yAxisIndex: 1,
        data: azgCumulative,
        itemStyle: { color: '#38bdf8' },
        lineStyle: { width: 2, color: '#0284c7' },
        symbol: 'none',
        smooth: true,
      },
      {
        name: 'مقدار کل آبگیری (AG)',
        type: 'line',
        yAxisIndex: 1,
        data: agCumulative,
        itemStyle: { color: '#d97706' },
        lineStyle: { width: 2, color: '#d97706' },
        symbol: 'none',
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
