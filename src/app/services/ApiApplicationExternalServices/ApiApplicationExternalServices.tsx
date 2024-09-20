import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API_Backend}/api`;

class ApiApplicationExternalServices {
    // ดึงข้อมูล application externals ทั้งหมด
    static async getAllApplications() {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/applications-external`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching applications:', error);
            throw error;
        }
    }

    // ดึงข้อมูล application external ตาม ID
    static async getApplicationById(applicationId: string) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/applications-external/${applicationId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching application with ID ${applicationId}:`, error);
            throw error;
        }
    }
    
    static async getStudentsByScholarshipId(scholarshipId: string) {
        try {
            const apiUrl = `${API_URL}/applications-external/scholarship/${scholarshipId}/students`;
            
            // Log before making the request
            console.log(`Making API request to: ${apiUrl}`);
    
            const response = await axios.get(apiUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
    
            // Log the response status and data
            console.log('API Response Status:', response.status);
            console.log('API Response Data:', response.data);
    
            if (response.status === 200) {
                return response.data; // Return the array of applications
            } else {
                console.log(`Error: ${response.statusText}`); // Log if not 200
                throw new Error(`Failed to fetch students: ${response.statusText}`);
            }
        } catch (error: any) {
            console.error(`Error fetching students by ScholarshipID: ${error.message || error}`);
            throw error;
        }
    }

     // ดึงข้อมูลนักเรียนตาม ScholarshipID และ StudentID
 static async getStudentByScholarshipIdAndStudentId(scholarshipId: string, studentId: string) {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`${API_URL}/applications-external/scholarship/${scholarshipId}/student/${studentId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching student by ScholarshipID and StudentID:', error);
        throw error;
    }
}
    


    static async showByStudent(StudentID: string) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/applications-external/student/${StudentID}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching application by StudentID:', error);
            throw error;
        }
    }



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

    // อัปเดตข้อมูล application external ตาม ID
    static async updateApplication(applicationId: string, applicationData: any) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(`${API_URL}/applications-external/${applicationId}`, applicationData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating application with ID ${applicationId}:`, error);
            throw error;
        }
    }

    // ลบ application external ตาม ID
    static async deleteApplication(applicationId: number) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.delete(`${API_URL}/applications-external/${applicationId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting application with ID ${applicationId}:`, error);
            throw error;
        }
    }
}

export default ApiApplicationExternalServices;
