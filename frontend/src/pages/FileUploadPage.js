import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, LinearProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { uploadFile, checkIfUserIsAdmin } from '../services/api';

const FileUploadPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const response = await checkIfUserIsAdmin();
        if (!response.data.is_admin) {
          setError('You need admin privileges to access this page.');
          setTimeout(() => navigate('/'), 2000);
          return;
        }
        setIsAdmin(true);
      } catch (err) {
        setError('Failed to verify admin privileges.');
      } finally {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, [navigate]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadStatus('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Please select a file first.');
      return;
    }

    try {
      setProgress(0);
      setUploadStatus('Uploading...');

      const response = await uploadFile(selectedFile);

      setUploadStatus(
        `Upload successful! Registered routes: ${response.data.routes.join(', ')}`
      );
      setSelectedFile(null);
    } catch (error) {
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Upload failed: You need admin privileges to perform this action.';
        } else if (error.response.data?.message) {
          errorMessage = `Upload failed: ${error.response.data.message}`;
        }
      }

      setUploadStatus(errorMessage);
    }
  };

  if (loading) {
    return (
      <Layout title="File Upload">
        <Typography>Loading...</Typography>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout title="Access Denied">
        <Typography color="error">{error}</Typography>
      </Layout>
    );
  }

  return (
    <Layout title="File Upload" subTitle="Upload Python Files">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: '100%' }}>
        <Typography variant="h6" sx={{ color: '#00274C' }}>
          Upload a Python file to register dynamic API routes
        </Typography>

        <input
          type="file"
          accept=".py"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="file-input"
        />
        <label htmlFor="file-input">
          <Button variant="outlined" component="span" sx={{ textTransform: 'none' }}>
            Choose File
          </Button>
        </label>

        {selectedFile && (
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Selected File: {selectedFile.name}
          </Typography>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          sx={{ textTransform: 'none', backgroundColor: '#FFCB05', color: '#00274C' }}
        >
          Upload
        </Button>

        {uploadStatus && (
          <Typography
            variant="body2"
            sx={{
              marginTop: '10px',
              color: uploadStatus.includes('successful') ? 'green' : 'red',
              fontWeight: '600',
            }}
          >
            {uploadStatus}
          </Typography>
        )}

        {progress > 0 && progress < 100 && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="caption" sx={{ color: '#00274C' }}>
              {progress}%
            </Typography>
          </Box>
        )}
      </Box>
    </Layout>
  );
};

export default FileUploadPage;
