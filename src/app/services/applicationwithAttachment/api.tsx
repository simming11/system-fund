import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

class ApiApplicationWithAttachmentService {
  // Get all applications
  static async getAllApplications() {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/applications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get a specific application by ID
  static async getApplication(id: number) {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/applications/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Create a new application
  static async createApplication(data: any) {
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/applications`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Update an existing application by ID
  static async updateApplication(id: number, data: any) {
    const token = localStorage.getItem('token');
    return axios.put(`${API_URL}/applications/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Delete an application by ID
  static async deleteApplication(id: number) {
    const token = localStorage.getItem('token');
    return axios.delete(`${API_URL}/applications/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get all attachments for a specific application
  static async getApplicationAttachments(applicationId: number) {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/applications/${applicationId}/attachments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Upload attachments for a specific application
  static async uploadAttachments(applicationId: number, files: FormData) {
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/applications/${applicationId}/attachments`, files, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
    });
  }

  // Get a specific attachment by application ID and attachment ID
  static async getAttachment(applicationId: number, attachmentId: number) {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/applications/${applicationId}/attachments/${attachmentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Delete a specific attachment by application ID and attachment ID
  static async deleteAttachment(applicationId: number, attachmentId: number) {
    const token = localStorage.getItem('token');
    return axios.delete(`${API_URL}/applications/${applicationId}/attachments/${attachmentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Download a specific attachment by application ID and attachment ID
  static async downloadAttachment(applicationId: number, attachmentId: number) {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/applications/${applicationId}/attachments/${attachmentId}/download`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob', // Ensure the response is treated as a blob for file download
    });
  }
}

export default ApiApplicationWithAttachmentService;
