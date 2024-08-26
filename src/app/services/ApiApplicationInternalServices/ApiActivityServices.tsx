import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

class ApiActivityServices {
    // ดึงข้อมูล activities ทั้งหมด
    static async getAllActivities() {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/activities`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching activities:', error);
            throw error;
        }
    }

    // ดึงข้อมูล activity ตาม ID
    static async getActivityById(activityId: number) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/activities/${activityId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching activity with ID ${activityId}:`, error);
            throw error;
        }
    }



    // อัปเดตข้อมูล activity ตาม ID
    static async updateActivity(activityId: number, activityData: any) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(`${API_URL}/activities/${activityId}`, activityData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating activity with ID ${activityId}:`, error);
            throw error;
        }
    }

    // ลบ activity ตาม ID
    static async deleteActivity(activityId: number) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.delete(`${API_URL}/activities/${activityId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting activity with ID ${activityId}:`, error);
            throw error;
        }
    }
}

export default ApiActivityServices;
