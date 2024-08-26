import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

class ApiEducationHistoryServices {
    // ดึงข้อมูล education histories ทั้งหมด
    static async getAllEducationHistories() {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/education-histories`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching education histories:', error);
            throw error;
        }
    }

    // ดึงข้อมูล education history ตาม ID
    static async getEducationHistoryById(historyId: number) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/education-histories/${historyId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching education history with ID ${historyId}:`, error);
            throw error;
        }
    }



    // อัปเดตข้อมูล education history ตาม ID
    static async updateEducationHistory(historyId: number, historyData: any) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(`${API_URL}/education-histories/${historyId}`, historyData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating education history with ID ${historyId}:`, error);
            throw error;
        }
    }

    // ลบ education history ตาม ID
    static async deleteEducationHistory(historyId: number) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.delete(`${API_URL}/education-histories/${historyId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting education history with ID ${historyId}:`, error);
            throw error;
        }
    }
}

export default ApiEducationHistoryServices;
