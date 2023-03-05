import axios from 'axios';

if (!process.env.REACT_APP_API_BASE_URL) {
  throw new Error('REACT_APP_API_BASE_URL environment variable is not defined.')
}

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL
});

export default apiClient;
