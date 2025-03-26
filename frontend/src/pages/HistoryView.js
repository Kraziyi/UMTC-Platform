import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { getHistory } from '../services/api';
import Layout from '../components/Layout';
import { 
  CategoryScale, 
  LinearScale, 
  LineElement, 
  PointElement, 
  LineController, 
  Chart 
} from 'chart.js';
import DownloadIcon from '@mui/icons-material/Download';

Chart.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  LineController
);

const HistoryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chartData, setChartData] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [decimalPlaces, setDecimalPlaces] = useState({ x: 2, y: 2 });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getHistory(id);
        const { input, output } = response.data;
        
        // 解析批量数据
        const isBatch = Array.isArray(input);
        const inputs = isBatch ? input.map(i => JSON.parse(i)) : [JSON.parse(input)];
        const outputs = isBatch ? output.map(o => JSON.parse(o)) : [JSON.parse(output)];

        // 生成图表数据
        const labels = outputs[0]?.rp_disc || [];
        const datasets = outputs.map((outputData, index) => {
          const color = `hsl(${(index * 360) / outputs.length}, 70%, 50%)`;
          return {
            label: `Calculation ${index + 1}`,
            data: labels.map((x, i) => ({ x, y: outputData.cs_iter[i] })),
            fill: false,
            backgroundColor: color,
            borderColor: color,
            tension: 0.1
          };
        });

        setChartData({
          labels,
          datasets
        });

        setHistoryData({
          inputs,
          outputs,
          timestamp: response.data.timestamp,
          isBatch
        });

      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load history record');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [id]);

  const handleDownload = () => {
    if (!historyData) return;

    const dataStr = JSON.stringify({
      inputs: historyData.inputs,
      outputs: historyData.outputs,
      timestamp: historyData.timestamp
    }, null, 2);
    
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `diffusion_history_${id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear',
        title: { display: true, text: 'Radius (r)' },
        ticks: { callback: v => Number(v).toExponential(decimalPlaces.x) }
      },
      y: {
        type: 'linear',
        title: { display: true, text: 'Concentration (c)' },
        ticks: { callback: v => Number(v).toExponential(decimalPlaces.y) }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: { boxWidth: 20 }
      }
    }
  };

  if (loading) {
    return (
      <Layout title="Loading History...">
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 10 
        }}>
          <CircularProgress size={60} />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Error">
        <Box sx={{ 
          textAlign: 'center', 
          mt: 10,
          p: 3,
          backgroundColor: '#ffecec',
          borderRadius: 2,
          maxWidth: 600,
          mx: 'auto'
        }}>
          <Typography variant="h6" color="error" gutterBottom>
            ⚠️ Error Loading History
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate(-1)}
            sx={{ mt: 2 }}
          >
            Back to Previous Page
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Historical Calculation">
      <Box sx={{ 
        maxWidth: 1200, 
        mx: 'auto', 
        p: 3 
      }}>
        {/* Header Section */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Calculation Record #{id}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Saved at: {new Date(historyData.timestamp).toLocaleString()}
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            sx={{
              height: 48,
              px: 3,
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#115293'
              }
            }}
          >
            Download Data
          </Button>
        </Box>

        {/* Parameters Summary */}
        <Box sx={{ 
          mb: 6,
          p: 3,
          backgroundColor: '#f8f9fa',
          borderRadius: 2,
          boxShadow: 1
        }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            {historyData.isBatch ? 'Batch Parameters' : 'Calculation Parameters'}
          </Typography>
          
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#e3f2fd' }}>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>d (Diffusion)</TableCell>
                  <TableCell>r (Radius)</TableCell>
                  <TableCell>Steps</TableCell>
                  <TableCell>Temp Adjusted</TableCell>
                  <TableCell>Loss Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historyData.inputs.map((input, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{input.d.toExponential(3)}</TableCell>
                    <TableCell>{input.r.toExponential(3)}</TableCell>
                    <TableCell>{input.ns}</TableCell>
                    <TableCell>{input.temp_influenced ? 'Yes' : 'No'}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {historyData.outputs[index].loss_value.toExponential(3)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Chart Display */}
        <Box sx={{ 
          mb: 6,
          p: 3,
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: 3
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 4
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Diffusion Profile
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="X Precision"
                value={decimalPlaces.x}
                onChange={(e) => 
                  setDecimalPlaces(prev => ({
                    ...prev, 
                    x: Math.min(10, Math.max(0, parseInt(e.target.value) || 2))
                  }))
                }
                size="small"
                sx={{ width: 120 }}
                type="number"
                inputProps={{ min: 0, max: 10 }}
              />
              <TextField
                label="Y Precision"
                value={decimalPlaces.y}
                onChange={(e) => 
                  setDecimalPlaces(prev => ({
                    ...prev, 
                    y: Math.min(10, Math.max(0, parseInt(e.target.value) || 2))
                  }))
                }
                size="small"
                sx={{ width: 120 }}
                type="number"
                inputProps={{ min: 0, max: 10 }}
              />
            </Box>
          </Box>

          <Box sx={{ 
            height: '600px', 
            position: 'relative',
            borderRadius: 2,
            overflow: 'hidden'
          }}>
            {chartData && (
              <Line data={chartData} options={chartOptions} />
            )}
          </Box>
        </Box>

        {/* Batch Statistics */}
        {historyData.isBatch && (
          <Box sx={{ 
            mt: 4,
            p: 3,
            backgroundColor: '#f8f9fa',
            borderRadius: 2
          }}>
            <Typography variant="h6" gutterBottom>
              Batch Statistics
            </Typography>
            <Box sx={{ display: 'flex', gap: 4 }}>
              <div>
                <Typography>Total Calculations: {historyData.inputs.length}</Typography>
                <Typography>
                  Average Loss: {
                    (historyData.outputs.reduce((sum, o) => sum + o.loss_value, 0) /
                     historyData.outputs.length).toExponential(3)
                  }
                </Typography>
              </div>
              <div>
                <Typography>
                  Min Loss: {
                    Math.min(...historyData.outputs.map(o => o.loss_value)).toExponential(3)
                  }
                </Typography>
                <Typography>
                  Max Loss: {
                    Math.max(...historyData.outputs.map(o => o.loss_value)).toExponential(3)
                  }
                </Typography>
              </div>
            </Box>
          </Box>
        )}
      </Box>
    </Layout>
  );
};

export default HistoryView;