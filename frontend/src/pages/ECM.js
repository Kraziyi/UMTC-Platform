import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { 
  TextField, CircularProgress, Typography, Box, 
  Button, Stepper, Step, StepLabel,
  Paper, IconButton, Grid, Card, CardContent,
  Alert, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow,
  Divider, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ecm, getDefaultFolder } from '../services/api';
import Layout from '../components/Layout';
import { CategoryScale, LinearScale, LineElement, 
        PointElement, LineController, Chart } from 'chart.js';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import zoomPlugin from 'chartjs-plugin-zoom';
Chart.register(zoomPlugin);

Chart.register(CategoryScale, LinearScale, LineElement, PointElement, LineController, zoomPlugin);

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const InputContainer = styled(Box)(({ theme }) => ({
  width: '300px',
  marginRight: theme.spacing(4),
}));

const DescriptionContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.shape.borderRadius,
}));

const steps = [
  {
    label: 'Total Time',
    description: 'Set the total simulation time and time step',
    fields: ['t_tot', 'dt']
  },
  {
    label: 'Capacity',
    description: 'Set the battery capacity',
    fields: ['Cn']
  },
  {
    label: 'Initial SOC',
    description: 'Set the initial state of charge',
    fields: ['SOC_0']
  },
  {
    label: 'Applied Current',
    description: 'Set the applied current',
    fields: ['i_app']
  },
  {
    label: 'OCV Data',
    description: 'Upload or manually enter OCV data',
    fields: ['ocv_data']
  },
  {
    label: 'Overview',
    description: 'Review all parameters before running simulation',
    fields: ['all']
  }
];

const ECM = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [calculationChain, setCalculationChain] = useState(0);
  const [inputValues, setInputValues] = useState({
    t_tot: '200',
    dt: '0.1',
    Cn: '130',
    SOC_0: '0.1',
    i_app: '0.3',
    name: '',
    ocv_data: [],
    ocv_preview: null,
    intepolation_choice: ''
  });
  const [ocvRows, setOcvRows] = useState([{ x: '', y: '' }]);
  const [ocvRowCount, setOcvRowCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const [defaultFolderId, setDefaultFolderId] = useState(null);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [xDecimalPlaces, setXDecimalPlaces] = useState(2);
  const [yDecimalPlaces, setYDecimalPlaces] = useState(2);
  const [interpolationMethod, setInterpolationMethod] = useState('');

  useEffect(() => {
    const fetchDefaultFolder = async () => {
      try {
        const response = await getDefaultFolder();
        const { path, default_folder_id } = response.data;
        setFolderPath(path);
        setDefaultFolderId(default_folder_id);
      } catch (err) {
        console.error('Error fetching default folder:', err);
        setError('Failed to load folder information');
      }
    };
    fetchDefaultFolder();
  }, []);

  // Check if all required fields are filled
  const isStepComplete = (stepIndex) => {
    const step = steps[stepIndex];
    
    if (stepIndex === steps.length - 1) {
      // For overview step, check if all previous steps are complete
      return steps.slice(0, -1).every((s, idx) => isStepComplete(idx));
    }
    
    if (step.fields.includes('all')) return true;
    
    return step.fields.every(field => {
      if (field === 'ocv_data') {
        return inputValues.ocv_data && inputValues.ocv_data.length > 0;
      }
      return inputValues[field] !== undefined && inputValues[field] !== '';
    });
  };

  const handleNext = () => {
    if (activeStep === steps.length - 2) {
      // If moving to the last step (Overview), check if all previous steps are complete
      if (steps.slice(0, -1).every((s, idx) => isStepComplete(idx))) {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      } else {
        setError('Please complete all previous steps before proceeding to Overview');
      }
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepClick = (step) => {
    // Only allow clicking on completed steps or the current step
    if (step <= activeStep || isStepComplete(step)) {
      setActiveStep(step);
    } else {
      setError('Please complete previous steps first');
    }
  };

  const handleInputChange = (key) => (event) => {
    setInputValues((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleOcvRowChange = (index, field, value) => {
    const newRows = [...ocvRows];
    newRows[index][field] = value;
    setOcvRows(newRows);
    
    // Update ocv_data and preview
    const validData = newRows.filter(row => row.x !== '' && row.y !== '');
    if (validData.length > 0) {
      // Convert to array of [x, y] pairs
      const data = validData.map(row => [
        parseFloat(row.x),
        parseFloat(row.y)
      ]);
      
      setInputValues(prev => ({
        ...prev,
        ocv_data: data,
        ocv_preview: {
          labels: data.map(d => d[0]),
          datasets: [{
            label: 'OCV Data',
            data: data.map(d => d[1]),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        }
      }));
    } else {
      setInputValues(prev => ({
        ...prev,
        ocv_data: [],
        ocv_preview: null
      }));
    }
  };

  const handleAddOcvRow = () => {
    setOcvRows([...ocvRows, { x: '', y: '' }]);
    setOcvRowCount(ocvRowCount + 1);
  };

  const handleRemoveOcvRow = (index) => {
    const newRows = ocvRows.filter((_, i) => i !== index);
    setOcvRows(newRows);
    setOcvRowCount(ocvRowCount - 1);
    
    // Update ocv_data and preview
    const validData = newRows.filter(row => row.x !== '' && row.y !== '');
    if (validData.length > 0) {
      const data = validData.map(row => [
        parseFloat(row.x),
        parseFloat(row.y)
      ]);
      
      setInputValues(prev => ({
        ...prev,
        ocv_data: data,
        ocv_preview: {
          labels: data.map(d => d[0]),
          datasets: [{
            label: 'OCV Data',
            data: data.map(d => d[1]),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        }
      }));
    } else {
      setInputValues(prev => ({
        ...prev,
        ocv_data: [],
        ocv_preview: null
      }));
    }
  };

  const handleOcvRowCountChange = (event) => {
    const count = parseInt(event.target.value) || 1;
    setOcvRowCount(count);
    
    if (count > ocvRows.length) {
      // Add rows
      const newRows = [...ocvRows];
      for (let i = ocvRows.length; i < count; i++) {
        newRows.push({ x: '', y: '' });
      }
      setOcvRows(newRows);
    } else if (count < ocvRows.length) {
      // Remove rows
      setOcvRows(ocvRows.slice(0, count));
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (file.name.endsWith('.csv')) {
          Papa.parse(e.target.result, {
            complete: (results) => {
              // Filter out empty rows and ensure we have at least 2 columns
              const validData = results.data
                .filter(row => row.length >= 2 && row[0] !== '' && row[1] !== '')
                .map(row => [
                  parseFloat(row[0]),
                  parseFloat(row[1])
                ])
                .filter(item => !isNaN(item[0]) && !isNaN(item[1])); // Filter out non-numeric values
              
              if (validData.length === 0) {
                setError('No valid data found in the CSV file. Please ensure the file contains numeric values in the first two columns.');
                return;
              }
              
              // Update ocv rows
              const newRows = validData.map(item => ({
                x: item[0].toString(),
                y: item[1].toString()
              }));
              setOcvRows(newRows);
              setOcvRowCount(newRows.length);
              
              setInputValues(prev => ({
                ...prev,
                ocv_data: validData,
                ocv_preview: {
                  labels: validData.map(d => d[0]),
                  datasets: [{
                    label: 'OCV Data',
                    data: validData.map(d => d[1]),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                  }]
                }
              }));
            }
          });
        } else if (file.name.endsWith('.xlsx')) {
          const workbook = XLSX.read(e.target.result, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          // Filter out empty rows and ensure we have at least 2 columns
          const validData = jsonData
            .filter(row => row.length >= 2 && row[0] !== undefined && row[1] !== undefined)
            .map(row => [
              parseFloat(row[0]),
              parseFloat(row[1])
            ])
            .filter(item => !isNaN(item[0]) && !isNaN(item[1])); // Filter out non-numeric values
          
          if (validData.length === 0) {
            setError('No valid data found in the Excel file. Please ensure the file contains numeric values in the first two columns.');
            return;
          }
          
          // Update ocv rows
          const newRows = validData.map(item => ({
            x: item[0].toString(),
            y: item[1].toString()
          }));
          setOcvRows(newRows);
          setOcvRowCount(newRows.length);
          
          setInputValues(prev => ({
            ...prev,
            ocv_data: validData,
            ocv_preview: {
              labels: validData.map(d => d[0]),
              datasets: [{
                label: 'OCV Data',
                data: validData.map(d => d[1]),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
              }]
            }
          }));
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        setError('Error parsing file. Please ensure it has the correct format with numeric values in the first two columns.');
      }
    };
    
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else if (file.name.endsWith('.xlsx')) {
      reader.readAsArrayBuffer(file);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        t_tot: parseFloat(inputValues.t_tot),
        dt: parseFloat(inputValues.dt),
        Cn: parseFloat(inputValues.Cn),
        SOC_0: parseFloat(inputValues.SOC_0),
        i_app: parseFloat(inputValues.i_app),
        name: inputValues.name.trim(),
        ocv_data: inputValues.ocv_data,
        intepolation_choice: interpolationMethod
      };

      const response = await ecm(params, defaultFolderId);
      setResults(response.data);
      setShowResults(true);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const sanitizeDecimalPlaces = (value) => {
    let num = parseInt(value, 10);
    return isNaN(num) ? 2 : Math.max(0, Math.min(num, 10));
  };

  const handleContinueCalculation = () => {
    if (!results) return;

    // Calculate the next current direction based on chain count
    const nextCurrentDirection = calculationChain % 2 === 0 ? -1 : 1;
    const nextCurrent = Math.abs(parseFloat(inputValues.i_app)) * nextCurrentDirection;

    // Set new input values based on previous results
    setInputValues(prev => ({
      ...prev,
      t_tot: prev.t_tot,
      dt: prev.dt,
      Cn: prev.Cn,
      SOC_0: results.SOC_store[results.SOC_store.length - 1].toString(),
      i_app: nextCurrent.toString(),
      ocv_data: prev.ocv_data,
      ocv_preview: prev.ocv_preview,
      intepolation_choice: prev.intepolation_choice
    }));

    // Increment chain counter
    setCalculationChain(prev => prev + 1);
    
    // Reset to overview step
    setShowResults(false);
    setActiveStep(5);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <InputContainer>
              <TextField
                label="Total Time (s)"
                value={inputValues.t_tot}
                onChange={handleInputChange('t_tot')}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
              />
              <TextField
                label="Time Step (s)"
                value={inputValues.dt}
                onChange={handleInputChange('dt')}
                fullWidth
                size="small"
              />
            </InputContainer>
            <DescriptionContainer>
              <Typography variant="body1" paragraph>
                {steps[0].description}
              </Typography>
              <Box
                component="img"
                src="/images/description1.jpg"
                alt="Step 1 Description"
                sx={{ maxWidth: '100%', height: 'auto', borderRadius: 1 }}
              />
            </DescriptionContainer>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <InputContainer>
              <TextField
                label="Capacity (Ah)"
                value={inputValues.Cn}
                onChange={handleInputChange('Cn')}
                fullWidth
                size="small"
              />
            </InputContainer>
            <DescriptionContainer>
              <Typography variant="body1" paragraph>
                {steps[1].description}
              </Typography>
              <Box
                component="img"
                src="/images/description2.jpg"
                alt="Step 2 Description"
                sx={{ maxWidth: '100%', height: 'auto', borderRadius: 1 }}
              />
            </DescriptionContainer>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <InputContainer>
              <TextField
                label="Initial SOC"
                value={inputValues.SOC_0}
                onChange={handleInputChange('SOC_0')}
                fullWidth
                size="small"
              />
            </InputContainer>
            <DescriptionContainer>
              <Typography variant="body1">
                {steps[2].description}
              </Typography>
            </DescriptionContainer>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <InputContainer>
              <TextField
                label="Applied Current (A)"
                value={inputValues.i_app}
                onChange={handleInputChange('i_app')}
                fullWidth
                size="small"
              />
            </InputContainer>
            <DescriptionContainer>
              <Typography variant="body1">
                {steps[3].description}
              </Typography>
            </DescriptionContainer>
          </Box>
        );
      case 4:
        return (
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <InputContainer>
              <Button
                variant="contained"
                component="label"
                startIcon={<UploadFileIcon />}
                sx={{ mb: 2 }}
              >
                Upload OCV Data
                <VisuallyHiddenInput type="file" accept=".csv,.xlsx" onChange={handleFileUpload} />
              </Button>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Interpolation Method</InputLabel>
                <Select
                  value={interpolationMethod}
                  onChange={(e) => setInterpolationMethod(e.target.value)}
                  label="Interpolation Method"
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="linear">Linear</MenuItem>
                  <MenuItem value="cubic">Cubic</MenuItem>
                  <MenuItem value="nearest">Nearest</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Number of OCV Points"
                type="number"
                value={ocvRowCount}
                onChange={handleOcvRowCountChange}
                fullWidth
                size="small"
                InputProps={{
                  inputProps: { min: 1 }
                }}
                sx={{ mb: 2 }}
              />

              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>X (SOC)</TableCell>
                      <TableCell>Y (Voltage)</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ocvRows.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <TextField
                            size="small"
                            value={row.x}
                            onChange={(e) => handleOcvRowChange(index, 'x', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={row.y}
                            onChange={(e) => handleOcvRowChange(index, 'y', e.target.value)}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveOcvRow(index)}
                            disabled={ocvRows.length === 1}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddOcvRow}
                sx={{ mt: 2 }}
              >
                Add Row
              </Button>
            </InputContainer>
            <DescriptionContainer>
              <Typography variant="body1">
                {steps[4].description}
              </Typography>
              {inputValues.ocv_preview && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    OCV Data Preview
                  </Typography>
                  <Line data={inputValues.ocv_preview} />
                </Box>
              )}
            </DescriptionContainer>
          </Box>
        );
      case 5:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <InputContainer>
              <TextField
                label="Calculation Name"
                value={inputValues.name}
                onChange={handleInputChange('name')}
                fullWidth
                size="small"
                sx={{ mb: 3 }}
              />
            </InputContainer>

            <Grid container spacing={3}>
              {/* Time Parameters */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Time Parameters
                    </Typography>
                    <Typography variant="body2">
                      Total Time: {inputValues.t_tot} s
                    </Typography>
                    <Typography variant="body2">
                      Time Step: {inputValues.dt} s
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => setActiveStep(0)}
                      sx={{ mt: 1 }}
                    >
                      Modify
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {/* Battery Parameters */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Battery Parameters
                    </Typography>
                    <Typography variant="body2">
                      Capacity: {inputValues.Cn} Ah
                    </Typography>
                    <Typography variant="body2">
                      Initial SOC: {inputValues.SOC_0}
                    </Typography>
                    <Typography variant="body2">
                      Applied Current: {inputValues.i_app} A
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => setActiveStep(1)}
                      sx={{ mt: 1 }}
                    >
                      Modify
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {/* OCV Data */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      OCV Data
                    </Typography>
                    {inputValues.ocv_data.length > 0 ? (
                      <>
                        <Typography variant="body2" gutterBottom>
                          Number of Points: {inputValues.ocv_data.length}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          Interpolation Method: {interpolationMethod || 'None'}
                        </Typography>
                        <Box sx={{ height: 200, mt: 2 }}>
                          <Line data={inputValues.ocv_preview} />
                        </Box>
                      </>
                    ) : (
                      <Typography variant="body2" color="error">
                        No OCV data provided
                      </Typography>
                    )}
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => setActiveStep(4)}
                      sx={{ mt: 1 }}
                    >
                      Modify
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <DescriptionContainer>
              <Typography variant="body1">
                {steps[5].description}
              </Typography>
              <Alert severity="info" sx={{ mt: 2 }}>
                Please review all parameters before running the simulation. You can modify any parameter by clicking the "Modify" button in each section.
              </Alert>
            </DescriptionContainer>
          </Box>
        );
      default:
        return null;
    }
  };

  const renderResults = () => {
    if (!results || !showResults) return null;

    const formatNumber = (value, decimals) => {
      return Number(value).toExponential(decimals);
    };

    const voltageData = {
      labels: results.t_table.map(t => formatNumber(t, xDecimalPlaces)),
      datasets: [
        {
          label: 'Vt',
          data: results.Vt.map(v => formatNumber(v, yDecimalPlaces)),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        },
        {
          label: 'OCV',
          data: results.OCV_store.map(v => formatNumber(v * 0.95, yDecimalPlaces)),
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1
        }
      ]
    };

    const socData = {
      labels: results.t_table.map(t => formatNumber(t, xDecimalPlaces)),
      datasets: [
        {
          label: 'SOC',
          data: results.SOC_store.map(v => formatNumber(v, yDecimalPlaces)),
          borderColor: 'rgb(54, 162, 235)',
          tension: 0.1
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Time (s)'
          },
          ticks: {
            callback: (value) => formatNumber(value, xDecimalPlaces)
          }
        },
        y: {
          title: {
            display: true,
            text: 'Value'
          },
          ticks: {
            callback: (value) => formatNumber(value, yDecimalPlaces)
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
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Calculation Results
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Voltage vs Time
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line data={voltageData} options={chartOptions} />
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                State of Charge vs Time
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line data={socData} options={chartOptions} />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 4,
              marginTop: '10px',
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
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button 
            variant="contained" 
            onClick={() => setShowResults(false)}
          >
            Back to Overview
          </Button>
          <Button 
            variant="contained"
            color="secondary"
            onClick={handleContinueCalculation}
          >
            Continue Calculation
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => {
              setShowResults(false);
              setActiveStep(0);
              setCalculationChain(0);
              setInputValues({
                t_tot: '200',
                dt: '0.1',
                Cn: '130',
                SOC_0: '0.1',
                i_app: '0.3',
                name: '',
                ocv_data: [],
                ocv_preview: null,
                intepolation_choice: ''
              });
              setOcvRows([{ x: '', y: '' }]);
              setOcvRowCount(1);
            }}
          >
            New Calculation
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <Layout title="ECM Calculation" subTitle="Step by Step Configuration">
      <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 4 }}>
        {!showResults ? (
          <>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((step, index) => (
                <Step 
                  key={step.label} 
                  completed={isStepComplete(index)}
                  onClick={() => handleStepClick(index)}
                  sx={{ cursor: 'pointer' }}
                >
                  <StepLabel>{step.label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            <Box sx={{ mt: 4, p: 3, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              {renderStepContent(activeStep)}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  startIcon={<ArrowBackIcon />}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                  endIcon={activeStep === steps.length - 1 ? null : <ArrowForwardIcon />}
                  disabled={loading || (activeStep < steps.length - 1 && !isStepComplete(activeStep))}
                >
                  {activeStep === steps.length - 1 ? 'Run Simulation' : 'Next'}
                </Button>
              </Box>
            </Box>
          </>
        ) : (
          renderResults()
        )}
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress />
          </Box>
        )}
      </Box>
    </Layout>
  );
};

export default ECM; 