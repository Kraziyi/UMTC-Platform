// api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api'; 

export const login = (username, password, rememberMe) => {
  return axios.post(`${API_BASE_URL}/user/login`, { username, password, remember_me: rememberMe }, { withCredentials: true });
};

export const isAdministrator = (username) => {
  return axios.post(`${API_BASE_URL}/user/is_admin`, { username }, { withCredentials: true });
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

export const checkIfUserIsAdmin = () => {
  return axios.get(`${API_BASE_URL}/user/info/current/admin`, { withCredentials: true });
}

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

export const getAvailableFunctions = () => {
  return axios.get(`${API_BASE_URL}/calculation/uploaded/available`, { withCredentials: true });
};

export const updateFunctionVisibility = (name, visible) => {
  return axios.put(
    `${API_BASE_URL}/calculation/uploaded/visibility`,
    { name, visible },
    { withCredentials: true }
  );
};

export const invokeFunction = async (functionName, data) => {
  return await axios.post(`${API_BASE_URL}/calculation/${functionName}`, data, { withCredentials: true });
};

export const describeFunction = async (functionName) => {
  return await axios.get(`${API_BASE_URL}/calculation/describe/${functionName}`, { withCredentials: true });
}

const normalizeId = (id) => {
  if (id === 'root' || id === null || typeof id === 'undefined') return null;
  if (Number.isInteger(id)) return id;
  const parsed = parseInt(id, 10);
  return isNaN(parsed) ? null : parsed;
};

export const getFolders = (parentId) => {
  return axios.get(`${API_BASE_URL}/history/folders`, {
    params: { parent_id: normalizeId(parentId) },
    withCredentials: true
  });
};

export const createFolder = ({ folderName, parentId }) => {
  return axios.post(
    `${API_BASE_URL}/history/folders`,
    {
      folder_name: folderName,
      parent_id: normalizeId(parentId)
    },
    { withCredentials: true }
  );
};

export const deleteFolder = (folderId) => {
  return axios.delete(`${API_BASE_URL}/history/folders/${normalizeId(folderId)}`, {
    withCredentials: true
  });
};

export const moveItem = (itemId, newParentId, itemType) => {
  return axios.put(
    `${API_BASE_URL}/history/items/${normalizeId(itemId)}/move`,
    {
      parent_id: normalizeId(newParentId),
      type: itemType
    },
    { withCredentials: true }
  );
};

export const getHistories = (folderId) => {
  return axios.get(
    `${API_BASE_URL}/history/folders/${normalizeId(folderId)}/histories`,
    { withCredentials: true }
  );
};

export const getHistoriesByName = (name) => {
  return axios.get(`${API_BASE_URL}/history/name`, {
    params: { name },
    withCredentials: true
  });
}

export const getStorageInfo = () => {
  return axios.get(`${API_BASE_URL}/history/storage`, { withCredentials: true });
};

export const recalculateStorage = () => {
  return axios.post(`${API_BASE_URL}/history/storage/recalculate`, {}, { withCredentials: true });
};

export const renameFolder = (folderId, newName) => {
  return axios.put(
    `${API_BASE_URL}/history/folders/${normalizeId(folderId)}`,
    { new_name: newName },
    { withCredentials: true }
  );
};

export const renameHistory = (historyId, newName) => {
  return axios.put(
    `${API_BASE_URL}/history/name/${normalizeId(historyId)}`,
    { new_name: newName },
    { withCredentials: true }
  );
};
export const setDefaultFolder = (folderId) => {
  return axios.put(`${API_BASE_URL}/history/user/default_folder`, { folder_id: normalizeId(folderId) }, { withCredentials: true });
};

export const getDefaultFolder = () => {
  return axios.get(`${API_BASE_URL}/history/user/default_folder`, { withCredentials: true });
};

export const getHistory = (historyId) => {
  return axios.get(`${API_BASE_URL}/history`, {
    params: { history_id: normalizeId(historyId) },
    withCredentials: true
  });
};

export const deleteHistory = (historyId) => {
  return axios.delete(`${API_BASE_URL}/history/${normalizeId(historyId)}`, { withCredentials: true });
};