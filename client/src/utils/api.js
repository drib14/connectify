import axios from 'axios';
import { Platform } from 'react-native';

// For local testing on android emulator: http://10.0.2.2:5000
// For local testing on iOS simulator: http://localhost:5000
// For web: http://localhost:5000
const getApiUrl = () => {
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:5000/api';
    }
    return 'http://localhost:5000/api';
}

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;