import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API_Backend}/api`;

class ApiApplicationInternalServices {
    // ดึงข้อมูล application internals ทั้งหมด
    static async getAllApplications() {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/application-internals`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching applications:', error);
            throw error;
        }
    }

      // ฟังก์ชันเพื่อดึงข้อมูลนักเรียนที่สมัครทุนการศึกษาตาม ScholarshipID
    static async getStudentsByScholarshipId(scholarshipId: string) {
        try {
            // เรียกข้อมูลจาก API โดยใช้ axios
            const response = await axios.get(`${API_URL}/application-internals/scholarship/${scholarshipId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`, // ส่ง token ถ้ามีการใช้ authentication
                },
            });

            // ตรวจสอบผลลัพธ์และส่งคืนข้อมูล
            if (response.status === 200) {
                if (response.data.length > 0) {
                    return response.data; // ส่งข้อมูลกลับถ้ามีผลลัพธ์
                } else {
                    console.warn(`No students found for ScholarshipID ${scholarshipId}`);
                    return []; // ส่ง array เปล่าถ้าไม่มีข้อมูล
                }
            } else {
                throw new Error(`Error: ${response.statusText}`);
            }
        } catch (error) {
            console.error(`Error fetching students by ScholarshipID: ${error}`);
            throw error; // ส่งข้อผิดพลาดกลับไปให้ handle ต่อใน code ส่วนอื่น
        }
    }


 // ดึงข้อมูลนักเรียนตาม ScholarshipID และ StudentID
 static async getStudentByScholarshipIdAndStudentId(scholarshipId: string, studentId: string) {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`${API_URL}/application-internals/scholarship/${scholarshipId}/student/${studentId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching student by ScholarshipID and StudentID:', error);
        throw error;
    }
}


static async generateApplicationPdf(applicationId: string) {
    try {
        const response = await axios.get(`${API_URL}/generate-pdf/${applicationId}`, {
            responseType: 'blob', // important to download the file as binary
        });
        // Create a blob URL for the file
        const fileURL = window.URL.createObjectURL(new Blob([response.data]));
        const fileLink = document.createElement('a');
        fileLink.href = fileURL;
        fileLink.setAttribute('download', 'application_report.pdf'); // File name
        document.body.appendChild(fileLink);
        fileLink.click();
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}


    // ดึงข้อมูล application internals ตาม StudentID
    static async showByStudentId(studentId: string) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/application-internals/student/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching application for StudentID ${studentId}:`, error);
            throw error;
        }
    }

    // ดึงข้อมูล application internals ตาม StudentID
    static async showByScholarships(scholarshipId: string) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/application-internals/scholarship/${scholarshipId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching application for StudentID ${scholarshipId}:`, error);
            throw error;
        }
    }




    // ดึงข้อมูล application internal ตาม ID
    static async getApplicationById(applicationId: number) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/application-internals/${applicationId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching application with ID ${applicationId}:`, error);
            throw error;
        }
    }


    // ลบ application internal ตาม ID
    static async deleteApplication(applicationId: number) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.delete(`${API_URL}/application-internals/${applicationId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting application with ID ${applicationId}:`, error);
            throw error;
        }
    }
}

export default ApiApplicationInternalServices;
