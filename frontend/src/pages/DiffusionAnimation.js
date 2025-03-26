// DiffusionAnimation.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TextField, 
  CircularProgress, 
  Typography, 
  Box, 
  Slider, 
  Button,
  Breadcrumbs, 
  Link,
  LinearProgress
} from '@mui/material';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled';
import ReplayIcon from '@mui/icons-material/Replay';
import pako from 'pako';
import { diffusion2D } from '../services/api';
import Layout from '../components/Layout';
import CustomButton from '../components/CustomButton';
import Heatmap from '../components/Heatmap';

const DiffusionAnimation = () => {
  const navigate = useNavigate();
  const [params, setParams] = useState({
    nx: 50,
    ny: 50,
    dt: 0.0005,
    d: 1.0,
    t_max: 0.1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const progressRef = useRef(null);
  const [animationData, setAnimationData] = useState({
    frames: [],
    metadata: null,
    currentFrame: 0,
    isPlaying: false,
    playbackSpeed: 1
  });
  
  const animationRef = useRef();
  const frameRef = useRef(0);
  const lastTimeRef = useRef(0);

  const animate = (timestamp) => {
    if (!animationData.frames.length) return;
    
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const delta = timestamp - lastTimeRef.current;
    
    if (delta > 1000 / (30 * animationData.playbackSpeed)) {
      setAnimationData(prev => ({
        ...prev,
        currentFrame: (prev.currentFrame + 1) % prev.frames.length
      }));
      lastTimeRef.current = timestamp;
    }
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (animationData.isPlaying && animationData.frames.length) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animationRef.current);
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [animationData.isPlaying, animationData.playbackSpeed, animationData.frames.length]);

  const handleParamChange = (key) => (event) => {
    const value = parseFloat(event.target.value);
    setParams(prev => ({ ...prev, [key]: isNaN(value) ? 0 : value }));
  };

  const handlePlayPause = () => {
    if (!animationData.frames.length) return;
    setAnimationData(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleReset = () => {
    cancelAnimationFrame(animationRef.current);
    setAnimationData(prev => ({
      ...prev,
      currentFrame: 0,
      isPlaying: false
    }));
  };

  // Calculate estimated time based on grid size and time step
  const calculateEstimatedTime = () => {
    const { nx, ny, dt, t_max } = params;
    const totalSteps = Math.ceil(t_max / dt);
    const gridSize = nx * ny;
    // Rough estimation: each step takes longer with larger grid
    const timePerStep = gridSize * 0.0001; // milliseconds
    return totalSteps * timePerStep;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setProgress(0);
    
    // Calculate and set estimated time
    const estimatedTimeMs = calculateEstimatedTime();
    setEstimatedTime(estimatedTimeMs);
    
    // Start progress animation
    const startTime = Date.now();
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / estimatedTimeMs) * 100, 99);
      setProgress(newProgress);
      if (elapsed < estimatedTimeMs) {
        progressRef.current = requestAnimationFrame(updateProgress);
      }
    };
    progressRef.current = requestAnimationFrame(updateProgress);

    try {
      console.log("Starting request");
      const response = await diffusion2D(params);
      
      // Cancel progress animation
      if (progressRef.current) {
        cancelAnimationFrame(progressRef.current);
      }
      setProgress(100);
      
      console.log('Response:', response);
      if (!(response.data instanceof ArrayBuffer)) {
        throw new Error('Invalid response data');
      }
      
      const compressed = new Uint8Array(response.data);
      
      try {
        const decompressed = pako.ungzip(compressed, { to: 'string' });
        const { metadata, frames } = JSON.parse(decompressed);
        
        console.log("Metadata:", metadata);
        console.log("First frame data:", frames[0]);
        console.log("Min:", Math.min(...frames[0].flat()), "Max:", Math.max(...frames[0].flat()));

        if (!Array.isArray(frames) || 
            frames[0]?.length !== metadata.nx || 
            frames[0][0]?.length !== metadata.ny
        ) {
          throw new Error('Invalid data format');
        }
        
        setAnimationData({
          frames,
          metadata,
          currentFrame: 0,
          isPlaying: true,
          playbackSpeed: 1
        });
        
      } catch (decompressError) {
        console.error('Decompression error:', decompressError);
        throw new Error(`Error decompressing data: ${decompressError.message}`);
      }
  
    } catch (err) {
      // Cancel progress animation
      if (progressRef.current) {
        cancelAnimationFrame(progressRef.current);
      }
      
      console.error('Error:', {
        error: err,
        response: err.response
      });
      
      let errorMessage = 'Failed to fetch data';
      if (err.message.includes('Error decompressing data')) {
        errorMessage = 'Error decompressing data, please try again';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Cleanup progress animation on unmount
  useEffect(() => {
    return () => {
      if (progressRef.current) {
        cancelAnimationFrame(progressRef.current);
      }
    };
  }, []);

  return (
    <Layout title="Calculation" subTitle="Diffusion Animation">
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 3,
          mb: 4
        }}>
          {[
            { label: 'Grid Size X (nx)', key: 'nx', min: 10, max: 200 },
            { label: 'Grid Size Y (ny)', key: 'ny', min: 10, max: 200 },
            { label: 'Time Step (dt)', key: 'dt', step: 0.0001 },
            { label: 'Diffusion Coeff (D)', key: 'd', step: 0.1 },
            { label: 'Max Time (t_max)', key: 't_max', step: 0.1 }
          ].map(({ label, key, min, max, step }) => (
            <TextField
              key={key}
              label={label}
              type="number"
              value={params[key]}
              onChange={handleParamChange(key)}
              required
              fullWidth
              inputProps={{ 
                min,
                max,
                step: step || 1,
                style: { textAlign: 'center' }
              }}
              variant="outlined"
              size="small"
            />
          ))}
        </Box>

        <Box sx={{ 
          display: 'flex',
          justifyContent: 'center',
          gap: 3,
          mt: 4
        }}>
          <CustomButton
            type="submit"
            color="primary"
            disabled={loading}
            sx={{ width: 180, height: 48 }}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : animationData.frames.length ? (
              'Restart Simulation'
            ) : (
              'Start Simulation'
            )}
          </CustomButton>

          <CustomButton
            color="secondary"
            onClick={handlePlayPause}
            disabled={!animationData.frames.length}
            sx={{ width: 140, height: 48 }}
          >
            {animationData.isPlaying ? (
              <PauseCircleFilledIcon fontSize="large" />
            ) : (
              <PlayCircleFilledWhiteIcon fontSize="large" />
            )}
          </CustomButton>

          <CustomButton
            color="secondary"
            onClick={handleReset}
            disabled={!animationData.frames.length}
            sx={{ width: 140, height: 48 }}
          >
            <ReplayIcon fontSize="large" />
          </CustomButton>
        </Box>

        {loading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                }
              }}
            />
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mt: 1, 
                textAlign: 'center',
                fontWeight: 500
              }}
            >
              {progress < 100 
                ? `Processing... ${Math.round(progress)}% (Estimated time: ${Math.round(estimatedTime/1000)}s)`
                : 'Processing complete!'}
            </Typography>
          </Box>
        )}
      </Box>

      {error && (
        <Typography color="error" sx={{ 
          textAlign: 'center',
          fontSize: '1.1rem',
          fontWeight: 500,
          mb: 4
        }}>
          ⚠️ {error}
        </Typography>
      )}

      {animationData.frames.length > 0 && (
        <Box sx={{ 
          width: '100%',
          height: '70vh',
          position: 'relative',
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 3
        }}>
          {console.log('Current frame data:', animationData.frames[animationData.currentFrame])}
          {console.log('Frame dimensions:', {
            rows: animationData.frames[animationData.currentFrame]?.length,
            cols: animationData.frames[animationData.currentFrame]?.[0]?.length
          })}
          {console.log('Frame min/max:', {
            min: Math.min(...animationData.frames[animationData.currentFrame].flat()),
            max: Math.max(...animationData.frames[animationData.currentFrame].flat())
          })}
          <Heatmap
            data={animationData.frames[animationData.currentFrame]}
            metadata={animationData.metadata}
            config={{
              colorscale: [
                [0, 'rgb(0,0,255)'],
                [0.5, 'rgb(255,255,255)'],
                [1, 'rgb(255,0,0)']
              ],
              zmin: -1,
              zmax: 1,
              origin: 'lower'
            }}
          />
          
          <Box sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: 'rgba(0, 0, 0, 0.7)',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Slider
              value={animationData.currentFrame}
              min={0}
              max={Math.max(0, animationData.frames.length - 1)}
              onChange={(_, val) => setAnimationData(prev => ({
                ...prev,
                currentFrame: val
              }))}
              sx={{ flex: 1 }}
            />
            
            <Typography variant="body2" color="white">
              {`Frames: ${animationData.currentFrame + 1}/${animationData.frames.length}`}
            </Typography>
            
            <TextField
              label="Speed"
              type="number"
              value={animationData.playbackSpeed}
              onChange={(e) => setAnimationData(prev => ({
                ...prev,
                playbackSpeed: Math.max(0.1, Math.min(10, e.target.value))
              }))}
              inputProps={{ min: 0.1, max: 10, step: 0.1 }}
              size="small"
              sx={{ width: 120, '& .MuiInputBase-root': { color: 'white' } }}
            />
          </Box>
        </Box>
      )}
    </Layout>
  );
};

export default DiffusionAnimation;