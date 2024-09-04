import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API_Backend}/api`;

class ApiApplicationFileServices {
    // ดึงข้อมูล application files ทั้งหมด
    static async getAllApplicationFiles() {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/application-files`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching application files:', error);
            throw error;
        }
    }

    // ดึงข้อมูล application file ตาม ID
    static async getApplicationFileById(fileId: number) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/application-files/${fileId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching application file with ID ${fileId}:`, error);
            throw error;
        }
    }



    static async downloadFile(id: string, fileName: string) {
        const token = localStorage.getItem('token');
        return axios.get(`${API_URL}/application-files/download/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob', // Ensure the response is treated as a blob
        }).then(response => {
            // Use the provided fileName, but fall back to the one from the content-disposition header if not provided
            if (!fileName) {
                const contentDisposition = response.headers['content-disposition'];
                fileName = 'downloaded-file.pdf'; // Default to 'downloaded-file.pdf'
                
                if (contentDisposition) {
                    const matches = contentDisposition.match(/filename="(.+?)"/);
                    if (matches && matches[1]) {
                        fileName = matches[1];
                    }
                }
            }
        
            // Create a download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
        
            // Cleanup
            window.URL.revokeObjectURL(url);
            link.remove();
        }).catch(error => {
            console.error('Error downloading the file:', error);
        });
    }

    // สร้าง application file ใหม่
    static async createApplicationFile(fileData: any) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${API_URL}/application-files`, fileData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating application file:', error);
            throw error;
        }
    }

    // อัปเดตข้อมูล application file ตาม ID
    static async updateApplicationFile(fileId: number, fileData: any) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${API_URL}/application-files/${fileId}`, fileData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating application file with ID ${fileId}:`, error);
            throw error;
        }
    }

    // ลบ application file ตาม ID
    static async deleteApplicationFile(fileId: number) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.delete(`${API_URL}/application-files/${fileId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting application file with ID ${fileId}:`, error);
            throw error;
        }
    }
}

export default ApiApplicationFileServices;
