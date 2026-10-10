import React from 'react';
import ReactECharts from 'echarts-for-react';

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
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#ffffff',
      borderColor: '#e2e8f0',
      textStyle: { color: '#0f172a', fontFamily: 'BYekan', fontSize: 11 },
      extraCssText: 'box-shadow: 0 4px 16px rgba(0,0,0,0.1); border-radius: 8px;',
    },
    legend: {
      data: ['مقدار کل محصول (AZG)', 'مقدار کل آبگیری (AG)'],
      textStyle: { color: '#475569', fontFamily: 'BYekan', fontSize: 10 },
      top: 0,
      left: 'center',
    },
    grid: {
      top: 36,
      right: 25,
      bottom: 25,
      left: 45,
    },
    xAxis: {
      type: 'category',
      data: reactors,
      axisLine: { lineStyle: { color: '#cbd5e1' } },
      axisLabel: { color: '#64748b', fontFamily: 'BYekan', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#cbd5e1' } },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
      axisLabel: {
        color: '#64748b',
        fontFamily: 'BYekan',
        fontSize: 9,
        formatter: (val: number) => `${val / 1000}K`,
      },
    },
    series: [
      {
        name: 'مقدار کل محصول (AZG)',
        type: 'bar',
        data: azgTotal,
        itemStyle: { color: '#1e3a5f', borderRadius: [3, 3, 0, 0] },
        label: {
          show: true,
          position: 'top',
          color: '#94a3b8',
          fontSize: 9,
          fontFamily: 'BYekan',
          formatter: (params: { value: number }) => `${Math.round(params.value / 1000)}K`,
        },
      },
      {
        name: 'مقدار کل آبگیری (AG)',
        type: 'bar',
        data: agTotal,
        itemStyle: { color: '#d97706', borderRadius: [3, 3, 0, 0] },
        label: {
          show: true,
          position: 'top',
          color: '#f59e0b',
          fontSize: 9,
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
