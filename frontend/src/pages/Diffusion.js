import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { TextField, CircularProgress, Typography, Box } from '@mui/material';
import { diffusion } from '../services/api';
import Layout from '../components/Layout';
import CustomButton from '../components/CustomButton';
import { CategoryScale, LinearScale, LineElement, PointElement, LineController, Chart } from 'chart.js';

Chart.register(CategoryScale, LinearScale, LineElement, PointElement, LineController);

const Diffusion = () => {
  const [d, setD] = useState('');
  const [r, setR] = useState('');
  const [ns, setNs] = useState('');
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [lossValue, setLossValue] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setChartData(null);

    try {
      const dValue = parseFloat(d);
      const rValue = parseFloat(r);
      const nsValue = parseFloat(ns);

      if (isNaN(dValue) || isNaN(rValue) || isNaN(nsValue)) {
        setError("Please enter valid numbers for all fields.");
        setLoading(false);
        return;
      }

      const response = await diffusion(dValue, rValue, nsValue);
      const { rp_disc, cs_iter, loss_value } = response.data;

      setChartData({
        labels: rp_disc,
        datasets: [
          {
            label: 'Concentration',
            data: cs_iter,
            fill: false,
            backgroundColor: 'blue',
            borderColor: 'blue',
          },
        ],
      });
      setLossValue(loss_value);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title={`Calculation`} subTitle={`Diffusion`}>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', marginBottom: '20px' }}>
          <TextField
            label="Diffusion Coefficient (d)"
            value={d}
            onChange={(e) => setD(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Radius (r)"
            value={r}
            onChange={(e) => setR(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Number of Steps (ns)"
            value={ns}
            onChange={(e) => setNs(e.target.value)}
            fullWidth
            required
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <CustomButton type="submit" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Run Simulation'}
          </CustomButton>
        </Box>
      </form>

      {error && (
        <Typography color="error" sx={{ marginTop: '10px', textAlign: 'center' }}>
          {error}
        </Typography>
      )}

      {chartData && (
        <Box sx={{ margin: '80px auto', width: '900px', height: '600px', textAlign: 'center' }}>
          <Typography variant="h6" sx={{ marginBottom: '20px' }}>
            Loss Value: {lossValue}
          </Typography>
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </Box>
      )}
    </Layout>
  );
};

export default Diffusion;
