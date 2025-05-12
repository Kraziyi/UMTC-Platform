// api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api'; 

export const diffusion = (d, r, ns, temp_influenced, defaultFolderId, name) => {
  return axios.post(`${API_BASE_URL}/calculation/diffusion`, { 
    d, 
    r, 
    ns, 
    temp_influenced,
    default_folder_id: defaultFolderId,
    name 
  }, { withCredentials: true });
}

export const batchDiffusion = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return axios.post(`${API_BASE_URL}/calculation/diffusion/batch`, formData, {
    headers: { 'Content-Type': 'multipart/form-data'},
    withCredentials: true
  });
};

export const diffusion2D = (params) => {
  return axios.post(`${API_BASE_URL}/calculation/diffusion_2d`, params, {
    withCredentials: true,
    responseType: 'arraybuffer'
  }).then(response => {
    return response;
  }).catch(error => {
    console.error('[API] Request error:', {
      error: error.message,
      config: error.config,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data 
      } : undefined
    });
    throw error;
  });
};

export const ecm = async (params, folderId) => {
  const response = await axios.post(`${API_BASE_URL}/calculation/ecm`, {
    ...params,
    folder_id: folderId
  }, { withCredentials: true });
  return response;
};