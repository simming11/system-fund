import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API_Backend}/api`;

class ApiLineNotifyServices {
    // ดึงข้อมูล LineNotify ทั้งหมด
    static async getAllLineNotifies() {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/line-notifies`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching line notifies:', error);
            throw error;
        }
    }

    // ดึงข้อมูล LineNotify ตาม AcademicID
    static async getLineNotifiesByAcademicID(academicID: string) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/line-notifies/academic/${academicID}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching line notifies by AcademicID:', error);
            throw error;
        }
    }

    // สร้าง LineNotify ใหม่
    static async createLineNotify(lineNotifyData: any) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${API_URL}/line-notifies`, lineNotifyData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating line notify:', error);
            throw error;
        }
    }

// อัพเดต LineNotify ตาม AcademicID
static async updateLineNotify(academicID: string, lineNotifyData: any) {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.put(`${API_URL}/line-notifies/academic/${academicID}`, lineNotifyData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error updating line notify:', error);
        throw error;
    }
}


    // ลบ LineNotify
    static async deleteLineNotify(id: string) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.delete(`${API_URL}/line-notifies/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting line notify:', error);
            throw error;
        }
    }
}

export default ApiLineNotifyServices;
