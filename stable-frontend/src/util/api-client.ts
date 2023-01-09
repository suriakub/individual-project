import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8082'
});

export default apiClient;
