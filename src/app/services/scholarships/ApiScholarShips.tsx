import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API_Backend}/api`;

class ApiServiceScholarships {
    static async getAllScholarships() {
        const token = localStorage.getItem('token');
        return axios.get(`${API_URL}/scholarships`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
            },
        });
    }

    static async downloadAnnouncementFile(scholarshipId: string) {
        const token = localStorage.getItem('token');

        // This assumes that you will have an endpoint for downloading files, similar to `/download-announcement`
        return axios.get(`${API_URL}/scholarships/${scholarshipId}/download-announcement`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
            },
            responseType: 'blob', // Important for downloading files
        });
    }

    static async getScholarship(id: number) {
        const token = localStorage.getItem('token');
        return axios.get(`${API_URL}/scholarships/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
            },
        });
    }

    static async updateScholarship(id: string, data: FormData) {
        const token = localStorage.getItem('token');
        return axios.put(`${API_URL}/scholarships/${id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
            },
        });
    }

    static async deleteScholarship(id: number) {
        const token = localStorage.getItem('token');
        return axios.delete(`${API_URL}/scholarships/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
            },
        });
    }
}

export default ApiServiceScholarships;
