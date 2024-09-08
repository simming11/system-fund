import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API_Backend}/api`;

interface DocumentData {
    ScholarshipID: number;
    documents: string[];
    otherDocument?: string;
    IsActive?: boolean;
}

class ApiServiceScholarshipDocuments {
    // ฟังก์ชันในการดึงข้อมูลเอกสารทั้งหมด
    static async getAllDocuments() {
        const token = localStorage.getItem('token');
        return axios.get(`${API_URL}/scholarship-documents`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
            },
        });
    }

    // ฟังก์ชันในการดึงข้อมูลเอกสารตาม ID
    static async getDocument(id: number) {
        const token = localStorage.getItem('token');
        return axios.get(`${API_URL}/scholarship-documents/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
            },
        });
    }

    // ฟังก์ชันในการอัปเดตเอกสาร
    static async updateDocument(id: number, data: DocumentData) {
        const token = localStorage.getItem('token');
        return axios.put(`${API_URL}/scholarship-documents/${id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json',
            },
        });
    }

    // ฟังก์ชันในการลบเอกสาร
    static async deleteDocument(id: number) {
        const token = localStorage.getItem('token');
        return axios.delete(`${API_URL}/scholarship-documents/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
            },
        });
    }
}

export default ApiServiceScholarshipDocuments;
