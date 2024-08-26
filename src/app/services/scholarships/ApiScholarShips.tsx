import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API_Backend}/api`;

class ApiServiceScholarships {
    static async getAllScholarships() {
        const token = localStorage.getItem('token');
        return axios.get(`${API_URL}/scholarships`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    }


    static async getScholarship(id: number) {
        const token = localStorage.getItem('token');
        return axios.get(`${API_URL}/scholarships/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    static async updateScholarship(id: string, data: FormData) {
        const token = localStorage.getItem('token');
        return axios.put(`${API_URL}/scholarships/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    static async deleteScholarship(id: number) {
        const token = localStorage.getItem('token');
        return axios.delete(`${API_URL}/scholarships/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    }
}

export default ApiServiceScholarships;
