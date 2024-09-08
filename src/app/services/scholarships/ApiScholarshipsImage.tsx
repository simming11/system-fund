import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API_Backend}/api`;

class ApiScholarshipsAllImage {
    // ฟังก์ชันในการดึงข้อมูลภาพจาก Scholarship ID
    static async getImageByScholarshipID(scholarshipID: number) {
        const token = localStorage.getItem('token');
        return axios.get(`${API_URL}/scholarship-images/${scholarshipID}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
            },
        });
    }

    // ฟังก์ชันในการลบภาพ
    static async deleteImage(imageID: number) {
        const token = localStorage.getItem('token');
        return axios.delete(`${API_URL}/scholarship-images/${imageID}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
            },
        });
    }

    // ฟังก์ชันในการดึงข้อมูลภาพทั้งหมด
    static async getAllImages() {
        const token = localStorage.getItem('token');
        return axios.get(`${API_URL}/scholarship-images`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
            },
        });
    }
}

export default ApiScholarshipsAllImage;
