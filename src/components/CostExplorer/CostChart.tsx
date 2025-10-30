import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { CostExplorerData, CostFilter } from '../../types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CostChartProps {
  data: CostExplorerData;
  filters: CostFilter;
}

const CostChart: React.FC<CostChartProps> = ({ data, filters }) => {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'stacked'>('bar');

  // Prepare chart data
  const labels = data.timeSeries.map(item => {
    const date = new Date(item.date);
    if (filters.granularity === 'MONTHLY') {
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } else if (filters.granularity === 'DAILY') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
  });

  // Get unique services from breakdown
  const servicesSet = new Set<string>();
  data.timeSeries.forEach(item => {
    Object.keys(item.breakdown).forEach(service => servicesSet.add(service));
  });
  const services = Array.from(servicesSet).slice(0, 10); // Top 10 services

  // Color palette
  const colors = [
    'rgb(255, 153, 0)',   // AWS Orange
    'rgb(86, 154, 49)',   // Green
    'rgb(204, 34, 100)',  // Pink
    'rgb(148, 93, 242)',  // Purple
    'rgb(59, 72, 204)',   // Blue
    'rgb(221, 52, 76)',   // Red
    'rgb(0, 153, 255)',   // Light Blue
    'rgb(255, 204, 0)',   // Yellow
    'rgb(102, 102, 102)', // Gray
    'rgb(51, 204, 153)'   // Teal
  ];

  // Create datasets
  const datasets = services.map((service, index) => ({
    label: service,
    data: data.timeSeries.map(item => item.breakdown[service] || 0),
    backgroundColor: colors[index % colors.length].replace('rgb', 'rgba').replace(')', ', 0.8)'),
    borderColor: colors[index % colors.length],
    borderWidth: 2,
    fill: chartType === 'stacked',
    tension: 0.4
  }));

  const chartData = {
    labels,
    datasets
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11
          }
        }
      },
      title: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(context.parsed.y);
            }
            return label;
          },
          footer: function(tooltipItems: any) {
            const total = tooltipItems.reduce((sum: number, item: any) => sum + (item.parsed.y || 0), 0);
            return 'Total: ' + new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(total);
          }
        }
      }
    },
    scales: {
      x: {
        stacked: chartType === 'stacked',
        grid: {
          display: false
        }
      },
      y: {
        stacked: chartType === 'stacked',
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };

  const downloadChart = () => {
    const canvas = document.getElementById('cost-chart') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'aws-cost-chart.png';
      link.href = url;
      link.click();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Cost Trend</h2>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                chartType === 'bar' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600'
              }`}
            >
              Bar
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                chartType === 'line' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('stacked')}
              className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                chartType === 'stacked' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600'
              }`}
            >
              Stacked
            </button>
          </div>
          <button
            onClick={downloadChart}
            className="p-2 hover:bg-slate-100 rounded-lg transition-all"
            title="Download chart"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>

      <div style={{ height: '400px' }}>
        {chartType === 'line' || chartType === 'stacked' ? (
          <Line id="cost-chart" data={chartData} options={options} />
        ) : (
          <Bar id="cost-chart" data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};

export default CostChart;
