import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

class ApiApplicationExternalServices {
    // ดึงข้อมูล application externals ทั้งหมด
    static async getAllApplications() {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/applications-external`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching applications:', error);
            throw error;
        }
    }

    // ดึงข้อมูล application external ตาม ID
    static async getApplicationById(applicationId: number) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/applications-external/${applicationId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching application with ID ${applicationId}:`, error);
            throw error;
        }
    }

    // สร้าง application external ใหม่
    static async createApplication(applicationData: any) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${API_URL}/applications-external`, applicationData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating application:', error);
            throw error;
        }
    }

    // อัปเดตข้อมูล application external ตาม ID
    static async updateApplication(applicationId: number, applicationData: any) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(`${API_URL}/applications-external/${applicationId}`, applicationData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating application with ID ${applicationId}:`, error);
            throw error;
        }
    }

    // ลบ application external ตาม ID
    static async deleteApplication(applicationId: number) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.delete(`${API_URL}/applications-external/${applicationId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting application with ID ${applicationId}:`, error);
            throw error;
        }
    }
}

export default ApiApplicationExternalServices;
