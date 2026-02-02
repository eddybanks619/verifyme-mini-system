import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

export const verifyIdentity = async (type, id) => {
  try {
    const response = await axios.post(`${API_URL}/verify`, { type, id });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network Error');
  }
};