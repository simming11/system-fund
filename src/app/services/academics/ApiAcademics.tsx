import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

class ApiAcademics {
  static async getAllAcademics() {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/academics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  static async getAcademic(id: number) {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/academics/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  static async updateAcademic(id: number, data: any) {
    const token = localStorage.getItem('token');
    return axios.put(`${API_URL}/academics/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  static async deleteAcademic(id: number) {
    const token = localStorage.getItem('token');
    return axios.delete(`${API_URL}/academics/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}

export default ApiAcademics;
