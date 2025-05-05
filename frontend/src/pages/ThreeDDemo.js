import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Layout from '../components/Layout';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  styled,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

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

const ThreeDDemo = () => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const pointsRef = useRef(null);
  const controlsRef = useRef(null);

  const [points, setPoints] = useState([{ x: 0, y: 0, z: 0 }]);
  const [showVisualization, setShowVisualization] = useState(false);
  const [error, setError] = useState(null);

  const handlePointChange = (index, axis, value) => {
    const newPoints = [...points];
    newPoints[index][axis] = parseFloat(value) || 0;
    setPoints(newPoints);
  };

  const addPoint = () => {
    setPoints([...points, { x: 0, y: 0, z: 0 }]);
  };

  const renderScene = () => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (pointsRef.current) {
      scene.remove(pointsRef.current);
      pointsRef.current.geometry.dispose();
      pointsRef.current.material.dispose();
    }

    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];

    points.forEach(({ x, y, z }) => {
      vertices.push(x, y, z);
      colors.push(Math.random(), Math.random(), Math.random());
    });

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({ size: 0.2, vertexColors: true });
    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);
    pointsRef.current = pointCloud;
  };

  const handleVisualize = () => {
    setShowVisualization(true);
    setTimeout(() => {
      renderScene();
    }, 100); // 等容器渲染完成
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
              // Filter out empty rows and ensure we have at least 3 columns
              const validData = results.data
                .filter(row => row.length >= 3 && row[0] !== '' && row[1] !== '' && row[2] !== '')
                .map(row => ({
                  x: parseFloat(row[0]),
                  y: parseFloat(row[1]),
                  z: parseFloat(row[2])
                }))
                .filter(item => !isNaN(item.x) && !isNaN(item.y) && !isNaN(item.z));
              
              if (validData.length === 0) {
                setError('No valid data found in the CSV file. Please ensure the file contains numeric values in the first three columns.');
                return;
              }
              
              setPoints(validData);
            }
          });
        } else if (file.name.endsWith('.xlsx')) {
          const workbook = XLSX.read(e.target.result, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          // Filter out empty rows and ensure we have at least 3 columns
          const validData = jsonData
            .filter(row => row.length >= 3 && row[0] !== undefined && row[1] !== undefined && row[2] !== undefined)
            .map(row => ({
              x: parseFloat(row[0]),
              y: parseFloat(row[1]),
              z: parseFloat(row[2])
            }))
            .filter(item => !isNaN(item.x) && !isNaN(item.y) && !isNaN(item.z));
          
          if (validData.length === 0) {
            setError('No valid data found in the Excel file. Please ensure the file contains numeric values in the first three columns.');
            return;
          }
          
          setPoints(validData);
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        setError('Error parsing file. Please ensure it has the correct format with numeric values in the first three columns.');
      }
    };
    
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else if (file.name.endsWith('.xlsx')) {
      reader.readAsArrayBuffer(file);
    }
  };

  useEffect(() => {
    if (!showVisualization) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff); // 白色背景
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    const axesHelper = new THREE.AxesHelper(5); // 添加坐标轴
    scene.add(axesHelper);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [showVisualization]);

  return (
    <Layout title="3D Point Cloud Visualization" subTitle="Input and visualize 3D points">
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Point Coordinates
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              component="label"
              startIcon={<UploadFileIcon />}
              sx={{ mb: 2 }}
            >
              Upload 3D Points Data
              <VisuallyHiddenInput type="file" accept=".csv,.xlsx" onChange={handleFileUpload} />
            </Button>
          </Box>
          <Grid container spacing={2}>
            {points.map((point, index) => (
              <Grid item xs={12} key={index}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="subtitle1">Point {index + 1}:</Typography>
                  <TextField
                    type="number"
                    label="X"
                    value={point.x}
                    onChange={(e) => handlePointChange(index, 'x', e.target.value)}
                    size="small"
                  />
                  <TextField
                    type="number"
                    label="Y"
                    value={point.y}
                    onChange={(e) => handlePointChange(index, 'y', e.target.value)}
                    size="small"
                  />
                  <TextField
                    type="number"
                    label="Z"
                    value={point.z}
                    onChange={(e) => handlePointChange(index, 'z', e.target.value)}
                    size="small"
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addPoint}
              sx={{ bgcolor: '#00274C', '&:hover': { bgcolor: '#1a4d7c' } }}
            >
              Add Point
            </Button>
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={handleVisualize}
              sx={{ bgcolor: '#00274C', '&:hover': { bgcolor: '#1a4d7c' } }}
            >
              Visualize
            </Button>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {showVisualization && (
          <Paper elevation={3} sx={{ p: 2 }}>
            <div
              ref={containerRef}
              style={{
                width: '100%',
                height: '500px',
              }}
            />
          </Paper>
        )}
      </Box>
    </Layout>
  );
};

export default ThreeDDemo;
