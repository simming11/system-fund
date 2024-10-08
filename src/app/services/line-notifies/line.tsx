import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API_Backend}/api`;

class ApiLineNotifyServices {
    // ดึงข้อมูล LineNotify ทั้งหมด
    static async getAllLineNotifies() {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/line-notifies`, {
                headers: {
                    Authorization: `Bearer ${token}`
                   
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching line notifies:', error);
            throw error;
        }
    }

    // Method to get the LINE Notify token
  static async getToken(code: string, notify_client_id: string, client_secret: string) {
    try {
      const response = await axios.post( `${API_URL}/line-notify-token`, {
        code, 
        notify_client_id,
        client_secret,
      });

      // Check if response was successful and return the data
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Error fetching token: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Error fetching token:', error);
      throw error;
    }
  }

    // ดึงข้อมูล LineNotify ตาม AcademicID
    static async getLineNotifiesByAcademicID(academicID: string) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/line-notifies/academic/${academicID}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                
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
                    Authorization: `Bearer ${token}`
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
                    Authorization: `Bearer ${token}`
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

// เพิ่มฟังก์ชัน sendLineNotify
static async sendLineNotify(message: string, token: string) {
    try {
        const response = await fetch(`${API_URL}/line-notify`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,  // ใช้ Bearer Token ที่ถูกต้องใน Headers
                'Content-Type': 'application/x-www-form-urlencoded',  // เปลี่ยนเป็นแบบ x-www-form-urlencoded
            },
            body: new URLSearchParams({
                message: message,  // ส่งข้อความที่ต้องการแจ้งเตือนไปยัง LINE Notify API
            }),
        });

        const data = await response.json();
        if (data.success) {
        
        } else {
            console.error('Error sending LINE Notify:', data.error);
        }
    } catch (error) {
        console.error('Error sending LINE Notify:', error);
    }
}


}

export default ApiLineNotifyServices;
