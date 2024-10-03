import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API_Backend}/api`;

interface CourseData {
    ScholarshipID: number;
    CourseName: string[];
}

interface DocumentData {
    ScholarshipID: number;
    documents: string[];
    otherDocument: string;
}

interface QualificationData {
    ScholarshipID: number;
    qualifications: string[];
    otherQualificationText: string;
}

interface ScholarshipFileData {
    ScholarshipID: number;
    FileType: string;
    FilePath: File;
    Description?: string;
}

interface ScholarshipImageData {
    ScholarshipID: number;
    ImagePath: File;
}

class ApiAllcreateServiceScholarships {
    static async createScholarship(data: FormData) {
        const token = localStorage.getItem('token');
        const scholarshipResponse = await axios.post(`${API_URL}/scholarships`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            },
        });

        const scholarshipID = scholarshipResponse.data.ScholarshipID;
        return scholarshipID;
    }

    static async createCourses(data: CourseData) {
        const token = localStorage.getItem('token');
        return axios.post(`${API_URL}/scholarship-courses`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json',
            },
        });
    }

    static async createDocuments(data: DocumentData) {
        const token = localStorage.getItem('token');
        return axios.post(`${API_URL}/scholarship-documents`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json',
            },
        });
    }

    static async createQualifications(data: QualificationData) {
        const token = localStorage.getItem('token');
        return axios.post(`${API_URL}/scholarship-qualifications`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json',
            },
        });
    }

    // ฟังก์ชันในการสร้างภาพใหม่
    static async createImage(data: ScholarshipImageData) {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('ScholarshipID', data.ScholarshipID.toString());
        formData.append('ImagePath', data.ImagePath);

        return axios.post(`${API_URL}/scholarship-images`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    static async createFile(data: ScholarshipFileData) {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('ScholarshipID', data.ScholarshipID.toString());
        formData.append('FileType', data.FileType);
        formData.append('FilePath', data.FilePath);
        if (data.Description) {
            formData.append('Description', data.Description);
        }

        return axios.post(`${API_URL}/scholarship-files`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'multipart/form-data',
            },
        });
    }
}

export default ApiAllcreateServiceScholarships;
