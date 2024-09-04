import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API_Backend}/api`;

class ApiStudentServices {
    // ดึงข้อมูลนักศึกษาทั้งหมด
    static async getAllStudents() {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/students`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching students:', error);
            throw error;
        }
    }

    // ดึงข้อมูลนักศึกษาตาม ID
    static async getStudent(studentId: string) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/students/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response;
        } catch (error) {
            console.error(`Error fetching student with ID ${studentId}:`, error);
            throw error;
        }
    }

    // สร้างนักศึกษาใหม่
    static async createStudent(studentData: any) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${API_URL}/students`, studentData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating student:', error);
            throw error;
        }
    }

    // อัปเดตข้อมูลนักศึกษา
    static async updateStudent(studentId: string, studentData: any) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(`${API_URL}/students/${studentId}`, studentData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating student with ID ${studentId}:`, error);
            throw error;
        }
    }

    // ลบนักศึกษา
    static async deleteStudent(studentId: string) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.delete(`${API_URL}/students/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting student with ID ${studentId}:`, error);
            throw error;
        }
    }
}

export default ApiStudentServices;
