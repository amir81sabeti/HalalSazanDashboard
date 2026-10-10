import React from 'react';
import ReactECharts from 'echarts-for-react';

interface ProductDistributionChartProps {
  data: {
    name: string;
    value: number;
    percentage: number;
    color: string;
  }[];
}

export const ProductDistributionChart: React.FC<ProductDistributionChartProps> = ({ data }) => {
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 28, 52, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      textStyle: { color: '#f8fafc', fontFamily: 'BYekan', fontSize: 11 },
      formatter: '{b}: {c} لیتر ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: '#94a3b8', fontFamily: 'BYekan', fontSize: 10 },
      itemWidth: 10,
      itemHeight: 10,
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
          text: '28,460',
          textAlign: 'center',
          fill: '#f8fafc',
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
        radius: ['52%', '75%'],
        center: ['38%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: 'outside',
          formatter: '{d}%',
          color: '#94a3b8',
          fontSize: 9,
          fontFamily: 'BYekan',
        },
        labelLine: {
          show: true,
          length: 6,
          length2: 8,
          lineStyle: { color: '#475569' },
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
