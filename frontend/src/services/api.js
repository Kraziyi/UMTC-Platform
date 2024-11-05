// api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api'; 

export const login = (username, password, rememberMe) => {
  return axios.post(`${API_BASE_URL}/user/login`, { username, password, remember_me: rememberMe }, { withCredentials: true });
};

export const register = (username, email, password) => {
  return axios.post(`${API_BASE_URL}/user/register`, { username, email, password });
};

export const logout = () => {
  return axios.post(`${API_BASE_URL}/user/logout`);
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

export const viewHistory = () => {
  return axios.get(`${API_BASE_URL}/history`, { withCredentials: true });
};

export const diffusion = (d, r, ns) => {
  return axios.post(`${API_BASE_URL}/calculation/diffusion`, { d, r, ns }, { withCredentials: true });
}