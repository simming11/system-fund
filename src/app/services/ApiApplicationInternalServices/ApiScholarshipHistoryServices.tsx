import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

class ApiScholarshipHistoryServices {
    // ดึงข้อมูล scholarship histories ทั้งหมด
    static async getAllScholarshipHistories() {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/scholarship-histories`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching scholarship histories:', error);
            throw error;
        }
    }

    // ดึงข้อมูล scholarship history ตาม ID
    static async getScholarshipHistoryById(historyId: number) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/scholarship-histories/${historyId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching scholarship history with ID ${historyId}:`, error);
            throw error;
        }
    }



    // อัปเดตข้อมูล scholarship history ตาม ID
    static async updateScholarshipHistory(historyId: number, historyData: any) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(`${API_URL}/scholarship-histories/${historyId}`, historyData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating scholarship history with ID ${historyId}:`, error);
            throw error;
        }
    }

    // ลบ scholarship history ตาม ID
    static async deleteScholarshipHistory(historyId: number) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.delete(`${API_URL}/scholarship-histories/${historyId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting scholarship history with ID ${historyId}:`, error);
            throw error;
        }
    }
}

export default ApiScholarshipHistoryServices;
