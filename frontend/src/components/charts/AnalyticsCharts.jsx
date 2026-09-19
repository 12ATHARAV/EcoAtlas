import React from 'react';
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
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

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

export const CarbonStockChart = ({ analytics = [] }) => {
  const sorted = [...analytics].sort(
    (a, b) => new Date(a.recorded_date) - new Date(b.recorded_date)
  );
  const labels = sorted.map((d) => d.recorded_date);
  const carbonValues = sorted.map((d) => d.carbon_stock_tonnes);

  const data = {
    labels,
    datasets: [
      {
        label: 'Carbon Stock (tCO2e)',
        data: carbonValues,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#10b981',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#34d399',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: { color: '#94a3b8', font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: { color: '#94a3b8', font: { size: 11 } },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Line data={data} options={options} />
    </div>
  );
};

export const NDVIChart = ({ analytics = [] }) => {
  const sorted = [...analytics].sort(
    (a, b) => new Date(a.recorded_date) - new Date(b.recorded_date)
  );
  const labels = sorted.map((d) => d.recorded_date);
  const ndviValues = sorted.map((d) => d.ndvi);

  const data = {
    labels,
    datasets: [
      {
        label: 'Vegetation Index (NDVI)',
        data: ndviValues,
        borderColor: '#c9a84c', // Champagne gold
        backgroundColor: 'rgba(201, 168, 76, 0.12)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#c9a84c',
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0b110e',
        titleColor: '#f9fafb',
        bodyColor: '#c9a84c',
        borderColor: '#1e2f27',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(30, 47, 39, 0.4)' },
        ticks: { color: '#9ca3af', font: { size: 11 } },
      },
      y: {
        min: 0.4,
        max: 1.0,
        grid: { color: 'rgba(30, 47, 39, 0.4)' },
        ticks: { color: '#9ca3af', font: { size: 11 } },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Line data={data} options={options} />
    </div>
  );
};

export const BiodiversityChart = ({ analytics = [] }) => {
  const sorted = [...analytics].sort(
    (a, b) => new Date(a.recorded_date) - new Date(b.recorded_date)
  );
  const labels = sorted.map((d) => d.recorded_date);
  const bioValues = sorted.map((d) => d.biodiversity_index);

  const data = {
    labels,
    datasets: [
      {
        label: 'Biodiversity Score (0-10)',
        data: bioValues,
        backgroundColor: 'rgba(245, 158, 11, 0.7)',
        borderColor: '#f59e0b',
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 11 } },
      },
      y: {
        min: 0,
        max: 10,
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: { color: '#94a3b8', font: { size: 11 } },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Bar data={data} options={options} />
    </div>
  );
};
