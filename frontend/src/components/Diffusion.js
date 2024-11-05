import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { TextField, Button, CircularProgress, Typography, Grid } from '@mui/material';
import { diffusion } from '../services/api';
import Layout from './Layout';
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
      // Convert input values to float before sending to the API
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
    <Layout title="Diffusion Simulation">
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Diffusion Coefficient (d)"
              value={d}
              onChange={(e) => setD(e.target.value)}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Radius (r)"
              value={r}
              onChange={(e) => setR(e.target.value)}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Number of Steps (ns)"
              value={ns}
              onChange={(e) => setNs(e.target.value)}
              fullWidth
              required
            />
          </Grid>
        </Grid>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          style={{ marginTop: '20px' }}
        >
          {loading ? <CircularProgress size={24} /> : 'Run Simulation'}
        </Button>
      </form>

      {error && <Typography color="error" style={{ marginTop: '10px' }}>{error}</Typography>}

      {chartData && (
        <div style={{ margin: '80px', width: '900px', height: '600px' }}>
          <Typography variant="h6">Simulation Results</Typography>
          <Line 
            data={chartData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
            }} 
          />
          <Typography variant="body1" style={{ marginTop: '10px' }}>
            Loss Value: {lossValue}
          </Typography>
        </div>
      )}
    </Layout>
  );
};

export default Diffusion;
