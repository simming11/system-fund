import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API_Backend}/api`;


  

class ApiApplicationInternalServices {
    // ดึงข้อมูล application internals ทั้งหมด
    static async getAllApplications() {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/application-internals`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching applications:', error);
            throw error;
        }
    }

    // ดึงข้อมูล application internals ตาม StudentID
    static async showByStudentId(studentId: string) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/application-internals/student/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching application for StudentID ${studentId}:`, error);
            throw error;
        }
    }

    // ดึงข้อมูล application internal ตาม ID
    static async getApplicationById(applicationId: number) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/application-internals/${applicationId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching application with ID ${applicationId}:`, error);
            throw error;
        }
    }


    // ลบ application internal ตาม ID
    static async deleteApplication(applicationId: number) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.delete(`${API_URL}/application-internals/${applicationId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting application with ID ${applicationId}:`, error);
            throw error;
        }
    }
}

export default ApiApplicationInternalServices;
