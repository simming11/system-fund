import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API_Backend}/api`;

interface QualificationData {
    ScholarshipID: number;
    qualifications: string[];
    otherQualification?: string;
    IsActive?: boolean;
}

class ApiServiceScholarshipQualifications {
    static async getAllQualifications() {
        const token = localStorage.getItem('token');
        return axios.get(`${API_URL}/scholarship-qualifications`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    }


    static async getQualification(id: number) {
        const token = localStorage.getItem('token');
        return axios.get(`${API_URL}/scholarship-qualifications/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    static async updateQualification(id: number, data: QualificationData) {
        const token = localStorage.getItem('token');
        return axios.put(`${API_URL}/scholarship-qualifications/${id}`, data, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
    }

    static async deleteQualification(id: number) {
        const token = localStorage.getItem('token');
        return axios.delete(`${API_URL}/scholarship-qualifications/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    }
}

export default ApiServiceScholarshipQualifications;
