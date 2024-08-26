import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

class ApiAddressServices {
    // ดึงข้อมูล addresses ทั้งหมด
    static async getAllAddresses() {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/addresses`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching addresses:', error);
            throw error;
        }
    }

    // ดึงข้อมูล address ตาม ID
    static async getAddressById(addressId: number) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/addresses/${addressId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching address with ID ${addressId}:`, error);
            throw error;
        }
    }



    // อัปเดตข้อมูล address ตาม ID
    static async updateAddress(addressId: number, addressData: any) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(`${API_URL}/addresses/${addressId}`, addressData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating address with ID ${addressId}:`, error);
            throw error;
        }
    }

    // ลบ address ตาม ID
    static async deleteAddress(addressId: number) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.delete(`${API_URL}/addresses/${addressId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting address with ID ${addressId}:`, error);
            throw error;
        }
    }
}

export default ApiAddressServices;
