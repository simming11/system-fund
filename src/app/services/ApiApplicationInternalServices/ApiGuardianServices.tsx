import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

class ApiGuardianServices {
    // ดึงข้อมูล guardians ทั้งหมด
    static async getAllGuardians() {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/guardians`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching guardians:', error);
            throw error;
        }
    }

    // ดึงข้อมูล guardian ตาม ID
    static async getGuardianById(guardianId: number) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/guardians/${guardianId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching guardian with ID ${guardianId}:`, error);
            throw error;
        }
    }

    // สร้าง guardian ใหม่


    // อัปเดตข้อมูล guardian ตาม ID
    static async updateGuardian(guardianId: number, guardianData: any) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(`${API_URL}/guardians/${guardianId}`, guardianData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating guardian with ID ${guardianId}:`, error);
            throw error;
        }
    }

    // ลบ guardian ตาม ID
    static async deleteGuardian(guardianId: number) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.delete(`${API_URL}/guardians/${guardianId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting guardian with ID ${guardianId}:`, error);
            throw error;
        }
    }
}

export default ApiGuardianServices;
