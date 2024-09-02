import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API_Backend}/api`;

class ApiCreateApplicationExternalServices {

    // สร้าง application external ใหม่
    static async createApplication(applicationData: any) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${API_URL}/applications-external`, applicationData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating application:', error);
            throw error;
        }
    }

        // สร้าง application file ใหม่
        static async createApplicationFile(fileData: FormData) {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.post(`${API_URL}/application-files/external`, fileData, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
                });
                return response.data;
            } catch (error) {
                console.error('Error creating application file:', error);
                throw error;
            }
        }

}

export default ApiCreateApplicationExternalServices;
