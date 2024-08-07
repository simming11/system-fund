import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/students';

class ApiStudentServices {
  static getAuthHeaders() {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  }

  static async getAllStudents() {
    try {
      return await axios.get(API_URL, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Error fetching all students', error);
      throw error;
    }
  }

  static async getStudent(id: number) {
    try {
      return await axios.get(`${API_URL}/${id}`, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error(`Error fetching student with ID ${id}`, error);
      throw error;
    }
  }

  static async updateStudent(id: number, data: any) {
    try {
      return await axios.put(`${API_URL}/${id}`, data, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error(`Error updating student with ID ${id}`, error);
      throw error;
    }
  }

  static async deleteStudent(id: number) {
    try {
      return await axios.delete(`${API_URL}/${id}`, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error(`Error deleting student with ID ${id}`, error);
      throw error;
    }
  }
}

export default ApiStudentServices;
