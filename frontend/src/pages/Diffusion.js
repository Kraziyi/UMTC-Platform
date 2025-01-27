import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { TextField, CircularProgress, Typography, Box, Slider } from '@mui/material';
import { diffusion } from '../services/api';
import Layout from '../components/Layout';
import CustomButton from '../components/CustomButton';
import { CategoryScale, LinearScale, LineElement, PointElement, LineController, Chart } from 'chart.js';

Chart.register(CategoryScale, LinearScale, LineElement, PointElement, LineController);

const Diffusion = () => {
  const [inputValues, setInputValues] = useState({
    d: '',
    r: '',
    ns: '100',
  });

  const [lastRunValues, setLastRunValues] = useState({});
  const [sliderValues, setSliderValues] = useState({});
  const [decimalPlaces, setDecimalPlaces] = useState(2);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [lossValues, setLossValues] = useState([]);
  const [error, setError] = useState(null);

  function parseScientific(value) {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }

  function sanitizeDecimalPlaces(value) {
    let num = parseInt(value, 10);
    return isNaN(num) ? 2 : Math.max(0, Math.min(num, 100));
  }

  const handleInputChange = (key) => (event) => {
    const value = event.target.value;
    setInputValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSliderChange = (key) => (event, newValue) => {
    setSliderValues((prev) => ({ ...prev, [key]: newValue }));
    setInputValues((prev) => ({ ...prev, [key]: newValue.toExponential() }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dValue = parseScientific(inputValues.d);
      const rValue = parseScientific(inputValues.r);
      const nsValue = parseScientific(inputValues.ns);

      const response = await diffusion(dValue, rValue, nsValue);
      const { rp_disc, cs_iter, loss_value } = response.data;
      const color = `hsl(${Math.random() * 360}, 100%, 50%)`;

      setChartData((prevData) => ({
        labels: rp_disc,
        datasets: [
          ...prevData.datasets,
          {
            label: `Curve ${prevData.datasets.length + 1}`,
            data: cs_iter,
            fill: false,
            backgroundColor: color,
            borderColor: color,
          },
        ],
      }));

      setLossValues((prev) => [...prev, loss_value]);

      // 更新上次 `Run Simulation` 的输入值
      setLastRunValues({ d: dValue, r: rValue });

      // 初始化滑动条为上次输入值
      setSliderValues({ d: dValue, r: rValue });
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClearChart = () => {
    setChartData({ labels: [], datasets: [] });
    setLossValues([]);
  };

  return (
    <Layout title="Calculation" subTitle="Diffusion">
      <form onSubmit={handleSubmit}>
        {[
          { key: "d", label: "Diffusion Coefficient (d)" },
          { key: "r", label: "Radius (r)" },
        ].map(({ key, label }) => (
          <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', marginBottom: '10px' }}>
            <TextField
              label={label}
              value={inputValues[key]}
              onChange={handleInputChange(key)}
              fullWidth
              required
              type="text"
            />
            {lastRunValues[key] !== undefined && (
              <Slider
                value={sliderValues[key]}
                min={Math.max(lastRunValues[key] * 0.1, 1e-12)}
                max={lastRunValues[key] * 10}
                step={lastRunValues[key] / 100}
                onChange={handleSliderChange(key)}
                sx={{ width: 200 }}
              />
            )}
          </Box>
        ))}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', marginBottom: '10px' }}>
          <TextField
            label="Number of Steps (ns)"
            value={inputValues.ns}
            onChange={handleInputChange("ns")}
            fullWidth
            required
            type="text"
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', marginBottom: '10px' }}>
          <TextField
            label="Decimal Places (Axis)"
            value={decimalPlaces}
            onChange={(e) => setDecimalPlaces(sanitizeDecimalPlaces(e.target.value))}
            fullWidth
            required
            type="number"
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: '20px' }}>
          <CustomButton type="submit" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Run Simulation'}
          </CustomButton>
          <CustomButton color="secondary" onClick={handleClearChart}>
            Clear Chart
          </CustomButton>
        </Box>
      </form>

      {error && (
        <Typography color="error" sx={{ marginTop: '10px', textAlign: 'center' }}>
          {error}
        </Typography>
      )}

      {chartData.datasets.length > 0 && (
        <Box sx={{ margin: '40px auto', width: '900px', height: '600px', textAlign: 'center' }}>
          <Typography variant="h6" sx={{ marginBottom: '20px' }}>
            Loss Values: {lossValues.map(value => value.toExponential(decimalPlaces)).join(', ')}
          </Typography>
          <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </Box>
      )}
    </Layout>
  );
};

export default Diffusion;
