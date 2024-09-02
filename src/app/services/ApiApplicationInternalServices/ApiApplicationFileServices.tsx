import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API_Backend}/api`;

class ApiApplicationFileServices {
    // ดึงข้อมูล application files ทั้งหมด
    static async getAllApplicationFiles() {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/application-files`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching application files:', error);
            throw error;
        }
    }

    // ดึงข้อมูล application file ตาม ID
    static async getApplicationFileById(fileId: number) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/application-files/${fileId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching application file with ID ${fileId}:`, error);
            throw error;
        }
    }

    // สร้าง application file ใหม่
    static async createApplicationFile(fileData: any) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${API_URL}/application-files`, fileData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating application file:', error);
            throw error;
        }
    }

    // อัปเดตข้อมูล application file ตาม ID
    static async updateApplicationFile(fileId: number, fileData: any) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${API_URL}/application-files/${fileId}`, fileData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating application file with ID ${fileId}:`, error);
            throw error;
        }
    }

    // ลบ application file ตาม ID
    static async deleteApplicationFile(fileId: number) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.delete(`${API_URL}/application-files/${fileId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting application file with ID ${fileId}:`, error);
            throw error;
        }
    }
}

export default ApiApplicationFileServices;
