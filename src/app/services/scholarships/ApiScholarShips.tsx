import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

class ApiServiceScholarships {
  static async getAllScholarships() {
    return axios.get(`${API_URL}/scholarships`);
  }

  static async createScholarship(data: FormData) {
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/scholarships`, data, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
    });
  }

  static async getScholarship(id: number) {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/scholarships/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  static async updateScholarship(id: any, data: any) {
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/scholarships/${id}`, data, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
    });
  }

  static async deleteScholarship(id: any) {
    const token = localStorage.getItem('token');
    return axios.delete(`${API_URL}/scholarships/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  static async downloadFile(id: number, fileName: string) {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/scholarships/${id}/download/${fileName}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob', // Ensure the response is treated as a blob
    });
  }

  static async getImage(id: number) {
    return axios.get(`${API_URL}/scholarships/${id}/image`);
  }
}

export default ApiServiceScholarships;
