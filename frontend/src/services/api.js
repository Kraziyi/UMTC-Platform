// api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api'; 

export const login = (username, password, rememberMe) => {
  return axios.post(`${API_BASE_URL}/user/login`, { username, password, remember_me: rememberMe }, { withCredentials: true });
};

export const register = (username, email, password) => {
  return axios.post(`${API_BASE_URL}/user/register`, { username, email, password }, { withCredentials: true });
};

export const logout = () => {
  return axios.post(`${API_BASE_URL}/user/logout`, {}, { withCredentials: true });
};

export const getCurrentUsername = () => {
  return axios.get(`${API_BASE_URL}/user/info/current/username`, { withCredentials: true });
};

export const getUserInfo = () => {
  return axios.get(`${API_BASE_URL}/user/info/current`, { withCredentials: true });
};

export const subscribe = (subscriptionPeriod, autoRenew) => {
  return axios.post(`${API_BASE_URL}/user/subscription`, { subscription_period: subscriptionPeriod, auto_renew: autoRenew }, { withCredentials: true });
};

export const forgotPassword = (email) => {
  return axios.post(`${API_BASE_URL}/user/forgot_password`, { email }, { withCredentials: true });
}

export const resetPassword = (token, newPassword) => {
  return axios.post(`${API_BASE_URL}/user/reset_password/${token}`, { new_password: newPassword }, { withCredentials: true });
};

export const viewHistory = () => {
  return axios.get(`${API_BASE_URL}/history`, { withCredentials: true });
};

export const diffusion = (d, r, ns) => {
  return axios.post(`${API_BASE_URL}/calculation/diffusion`, { d, r, ns }, { withCredentials: true });
}

export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post(`${API_BASE_URL}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    withCredentials: true,
  });
};

export const getUploadedFunctions = async () => {
  return await axios.get(`${API_BASE_URL}/calculation/uploaded`, { withCredentials: true });
};

export const invokeFunction = async (functionName, data) => {
  return await axios.post(`${API_BASE_URL}/calculation/${functionName}`, data);
};

export const describeFunction = async (functionName) => {
  return await axios.get(`${API_BASE_URL}/calculation/describe/${functionName}`);
}