import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API_Backend}/api`;

class ApiSiblingServices {
    // ดึงข้อมูล siblings ทั้งหมด
    static async getAllSiblings() {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/siblings`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching siblings:', error);
            throw error;
        }
    }

    // ดึงข้อมูล sibling ตาม ID
    static async getSiblingById(siblingId: number) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/siblings/${siblingId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching sibling with ID ${siblingId}:`, error);
            throw error;
        }
    }

    // สร้าง sibling ใหม่
    static async createSibling(siblingData: any) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${API_URL}/siblings`, siblingData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating sibling:', error);
            throw error;
        }
    }

    // อัปเดตข้อมูล sibling ตาม ID
    static async updateSibling(siblingId: number, siblingData: any) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(`${API_URL}/siblings/${siblingId}`, siblingData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating sibling with ID ${siblingId}:`, error);
            throw error;
        }
    }

    // ลบ sibling ตาม ID
    static async deleteSibling(siblingId: number) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.delete(`${API_URL}/siblings/${siblingId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting sibling with ID ${siblingId}:`, error);
            throw error;
        }
    }
}

export default ApiSiblingServices;
