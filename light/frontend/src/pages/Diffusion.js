import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { TextField, CircularProgress, Typography, Box, 
        Slider, Button, Breadcrumbs, Link } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload'; 
import { diffusion, batchDiffusion } from '../services/api';
import Layout from '../components/Layout';
import CustomButton from '../components/CustomButton';
import { CategoryScale, LinearScale, LineElement, 
        PointElement, LineController, Chart } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

Chart.register(CategoryScale, LinearScale, LineElement,PointElement, LineController, zoomPlugin);

const Diffusion = () => {
  const navigate = useNavigate();
  const [inputValues, setInputValues] = useState({ 
    d: '', 
    r: '', 
    ns: '100', 
    temp_influenced: false,
  });
  const [lastRunValues, setLastRunValues] = useState({});
  const [sliderValues, setSliderValues] = useState({});
  const [xDecimalPlaces, setXDecimalPlaces] = useState(2);
  const [yDecimalPlaces, setYDecimalPlaces] = useState(2);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState({ 
    labels: [], 
    datasets: [] 
  });
  const [lossValues, setLossValues] = useState([]);
  const [error, setError] = useState(null);


  const parseScientific = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const sanitizeDecimalPlaces = (value) => {
    let num = parseInt(value, 10);
    return isNaN(num) ? 2 : Math.max(0, Math.min(num, 10));
  };

  const handleInputChange = (key) => (event) => {
    setInputValues((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSliderChange = (key) => (event, newValue) => {
    setSliderValues((prev) => ({ ...prev, [key]: newValue }));
    setInputValues((prev) => ({ ...prev, [key]: newValue.toExponential() }));
  };

  const toggleTempInfluenced = () => {
    setInputValues((prev) => ({ 
      ...prev, 
      temp_influenced: !prev.temp_influenced 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dValue = parseScientific(inputValues.d);
      const rValue = parseScientific(inputValues.r);
      const nsValue = parseScientific(inputValues.ns);
      const tempInfluenced = inputValues.temp_influenced;

      const response = await diffusion(
        dValue, 
        rValue, 
        nsValue, 
        tempInfluenced,
      );
      
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
      setLastRunValues({ d: dValue, r: rValue });
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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    setLoading(true);
    setError(null);
  
    try {
      const response = await batchDiffusion(file);
      const { results } = response.data;
  
      const baseLabels = results[0]?.rp_disc || [];
  
      const newDatasets = results.map((result, index) => {
        const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        return {
          label: `Batch ${chartData.datasets.length + index + 1}`,
          data: baseLabels.map((xValue, i) => ({
            x: xValue,
            y: result.cs_iter[i] || 0
          })),
          fill: false,
          backgroundColor: color,
          borderColor: color,
        };
      });
  
      setChartData(prev => ({
        labels: prev.labels.length > 0 ? prev.labels : baseLabels,
        datasets: [...prev.datasets, ...newDatasets]
      }));
  
      const newLossValues = results.map(result => result.loss_value);
      setLossValues(prev => [...prev, ...newLossValues]);
  
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear',
        title: {
          display: true,
          text: 'Radial Position'
        },
        ticks: {
          callback: (value) => Number(value).toExponential(xDecimalPlaces),
        }
      },
      y: {
        type: 'linear',
        title: {
          display: true,
          text: 'Concentration'
        },
        ticks: {
          callback: (value) => Number(value).toExponential(yDecimalPlaces),
        }
      }
    },
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: 'xy',
          modifierKey: 'shift'
        },
        zoom: {
          wheel: {
            enabled: true,
            modifierKey: 'ctrl'
          },
          pinch: {
            enabled: true
          },
          mode: 'xy',
          drag: {
            enabled: true,
            backgroundColor: 'rgba(0,0,0,0.1)'
          }
        }
      }
    }
  };

  return (
    <Layout title="Calculation" subTitle="Diffusion">
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2,
        px: 2,
        py: 1.5,
        backgroundColor: '#f8f9fa',
        borderRadius: 1,
        border: '1px solid #e0e0e0'
      }}>
        
        
        <Button
          variant="outlined"
          onClick={() => navigate('/history')}
          sx={{ 
            minWidth: '200px',
            marginLeft: '20px',
            borderWidth: '1.5px',
            '&:hover': {
              borderWidth: '1.5px',
              backgroundColor: 'action.hover'
            }
          }}
          startIcon={
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          }
        >
          Browse Save Locations
        </Button>
      </Box>
  
      <Box component="form" onSubmit={handleSubmit}>
        {[{ key: "d", label: "Diffusion Coefficient (d)" }, { key: "r", label: "Radius (r)" }].map(({ key, label }) => (
          <Box 
            key={key}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              width: '100%', 
              marginBottom: '10px' 
            }}
          >
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
  
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          width: '100%', 
          marginBottom: '10px' 
        }}>
          <TextField
            label="Number of Steps (ns)"
            value={inputValues.ns}
            onChange={handleInputChange("ns")}
            fullWidth
            required
            type="text"
          />
        </Box>
  
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          width: '100%', 
          marginBottom: '10px' 
        }}>
          <Button
            variant="contained"
            color={inputValues.temp_influenced ? "primary" : "secondary"}
            onClick={toggleTempInfluenced}
            sx={{ 
              flexShrink: 0,
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'scale(1.05)' }
              }}
            >
              {inputValues.temp_influenced 
                ? "Disable Temp Influence" 
                : "Enable Temp Influence"}
          </Button>
        </Box>
  
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 2, 
          marginTop: '20px' 
        }}>
          <CustomButton 
            type="submit" 
            color="primary" 
            disabled={loading}
            sx={{ 
              width: 180,
              height: 48,
              fontSize: '1.1rem'
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Run Simulation'}
          </CustomButton>
  
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            disabled={loading}
            sx={{
              width: 180,
              height: 48,
              fontSize: '1.1rem',
              textTransform: 'none'
            }}
          >
            Upload CSV
            <input 
              type="file" 
              hidden 
              accept=".csv" 
              onChange={handleFileUpload}
              key={Date.now()}
            />
          </Button>
  
          <CustomButton 
            color="secondary" 
            onClick={handleClearChart}
            sx={{
              width: 140,
              height: 48,
              fontSize: '1.1rem'
            }}
          >
            Clear Chart
          </CustomButton>
        </Box>
      </Box>
  
      {error && (
        <Typography color="error" sx={{ 
          marginTop: '10px', 
          textAlign: 'center',
          fontSize: '1.1rem',
          fontWeight: 500
        }}>
          ⚠️ {error}
        </Typography>
      )}
  
      {chartData.datasets.length > 0 && (
        <Box sx={{ 
          margin: '40px auto', 
          width: '900px', 
          height: '600px', 
          textAlign: 'center',
          position: 'relative'
        }}>
          <Typography variant="h6" sx={{ 
            marginBottom: '20px',
            fontSize: '1.3rem',
            fontWeight: 600
          }}>
            Loss Values: {lossValues.map(value => 
              value.toExponential(yDecimalPlaces)).join(', ')}
          </Typography>
  
          <Box sx={{ 
            height: '500px', 
            position: 'relative',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: 3,
            border: '1px solid #e0e0e0'
          }}>
            <Line data={chartData} options={chartOptions} />
          </Box>
  
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 4,
            marginTop: '30px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: 2,
            boxShadow: 1
          }}>
            <TextField
              label="X-axis Precision"
              value={xDecimalPlaces}
              onChange={(e) => setXDecimalPlaces(sanitizeDecimalPlaces(e.target.value))}
              type="number"
              size="small"
              sx={{ 
                width: 160,
                '& .MuiInputBase-input': { textAlign: 'center' }
              }}
              inputProps={{ min: 0, max: 10, step: 1 }}
              variant="outlined"
            />
            <TextField
              label="Y-axis Precision"
              value={yDecimalPlaces}
              onChange={(e) => setYDecimalPlaces(sanitizeDecimalPlaces(e.target.value))}
              type="number"
              size="small"
              sx={{ 
                width: 160,
                '& .MuiInputBase-input': { textAlign: 'center' }
              }}
              inputProps={{ min: 0, max: 10, step: 1 }}
              variant="outlined"
            />
          </Box>
        </Box>
      )}
    </Layout>
  );
};

export default Diffusion;