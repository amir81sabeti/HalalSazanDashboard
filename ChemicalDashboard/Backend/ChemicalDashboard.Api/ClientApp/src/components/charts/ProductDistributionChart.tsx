import React from 'react';
import ReactECharts from 'echarts-for-react';
import { richChartTooltip } from '@/utils/chartTheme';

interface ProductDistributionChartProps {
  data: {
    name: string;
    value: number;
    percentage: number;
    color: string;
  }[];
}

export const ProductDistributionChart: React.FC<ProductDistributionChartProps> = ({ data }) => {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      ...richChartTooltip,
      trigger: 'item',
      formatter: '{b}: {c} لیتر ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: '#e2e8f0', fontFamily: 'BYekan', fontSize: 10 },
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      formatter: (name: string) => {
        const item = data.find((d) => d.name === name);
        return `${name}  ${item?.percentage ?? 0}%`;
      },
    },
    graphic: [
      {
        type: 'text',
        left: '32%',
        top: '42%',
        style: {
          text: totalValue > 0 ? totalValue.toLocaleString('fa-IR') : '۲۸,۴۶۰',
          textAlign: 'center',
          fill: '#ffffff',
          fontSize: 14,
          fontWeight: 'bold',
          fontFamily: 'BYekan',
        },
      },
      {
        type: 'text',
        left: '34%',
        top: '55%',
        style: {
          text: 'لیتر',
          textAlign: 'center',
          fill: '#94a3b8',
          fontSize: 10,
          fontFamily: 'BYekan',
        },
      },
    ],
    series: [
      {
        name: 'توزیع محصول',
        type: 'pie',
        radius: ['52%', '76%'],
        center: ['38%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: 'outside',
          formatter: '{d}%',
          color: '#cbd5e1',
          fontSize: 9,
          fontFamily: 'BYekan',
        },
        labelLine: {
          show: true,
          length: 6,
          length2: 8,
          lineStyle: { color: 'rgba(255, 255, 255, 0.3)' },
        },
        data: data.map((item) => ({
          name: item.name,
          value: item.value,
          itemStyle: { color: item.color },
        })),
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
