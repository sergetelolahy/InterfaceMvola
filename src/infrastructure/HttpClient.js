import axios from 'axios';

class HttpClient {
  async get(url) {
    const response = await axios.get(url);
    return response;
  }

  async post(url, data) {
    const response = await axios.post(url, data);
    return response;
  }

  async put(url, data) {
    const response = await axios.put(url, data);
    return response;
  }

  async delete(url) {
    const response = await axios.delete(url);
    return response;
  }
}

export default HttpClient;