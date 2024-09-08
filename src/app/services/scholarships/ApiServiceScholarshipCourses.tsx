import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API_Backend}/api`;

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

interface CourseData {
    ScholarshipID: number;
    CourseName: string[];
}

class ApiServiceScholarshipCourses {
    static async getAllCourses(page = 1) {
        const token = localStorage.getItem('token');
        return axios.get(`${API_URL}/scholarship-courses?page=${page}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
            },
        });
    }

    static async getCourse(id: number) {
        const token = localStorage.getItem('token');
        return axios.get(`${API_URL}/scholarship-courses/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
            },
        });
    }

    static async updateCourse(id: number, data: CourseData) {
        const token = localStorage.getItem('token');
        return axios.put(`${API_URL}/scholarship-courses/${id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json',
            },
        });
    }

    static async deleteCourse(id: number) {
        const token = localStorage.getItem('token');
        return axios.delete(`${API_URL}/scholarship-courses/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
            },
        });
    }
}

export default ApiServiceScholarshipCourses;
