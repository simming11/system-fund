import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

class ApiWorkExperienceServices {
    // ดึงข้อมูล work experiences ทั้งหมด
    static async getAllWorkExperiences() {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/work-experiences`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching work experiences:', error);
            throw error;
        }
    }

    // ดึงข้อมูล work experience ตาม ID
    static async getWorkExperienceById(experienceId: number) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/work-experiences/${experienceId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching work experience with ID ${experienceId}:`, error);
            throw error;
        }
    }



    // อัปเดตข้อมูล work experience ตาม ID
    static async updateWorkExperience(experienceId: number, experienceData: any) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(`${API_URL}/work-experiences/${experienceId}`, experienceData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating work experience with ID ${experienceId}:`, error);
            throw error;
        }
    }

    // ลบ work experience ตาม ID
    static async deleteWorkExperience(experienceId: number) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.delete(`${API_URL}/work-experiences/${experienceId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting work experience with ID ${experienceId}:`, error);
            throw error;
        }
    }
}

export default ApiWorkExperienceServices;
