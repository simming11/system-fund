import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; // Replace with your API base URL

class ApiApplicationExternalService {
  // Get all external applications
  static async getAllApplications() {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/applications-external`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Store a new external application
  static async storeApplication(data: any) {
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/applications-external`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Show a single external application by ID
  static async getApplication(id: any) {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/applications-external/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Update an external application by ID
  static async updateApplication(id: any, data: any) {
    const token = localStorage.getItem('token');
    return axios.put(`${API_URL}/applications-external/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Delete an external application by ID
  static async deleteApplication(id: any) {
    const token = localStorage.getItem('token');
    return axios.delete(`${API_URL}/applications-external/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Download a file
  static async downloadFile(id: any, fileName: any) {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/applications-external/${id}/download/${fileName}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob', // Important for file download
    });
  }
}

export default ApiApplicationExternalService;
