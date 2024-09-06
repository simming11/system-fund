import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API_Backend}/api`;

interface CourseData {
    ScholarshipID: number;
    CourseName: string[];
}

interface DocumentData {
    ScholarshipID: number;
    documents: string[]; // or any[] depending on your structure
    otherDocument: string; // This property is requireds
    IsActive: boolean
}


interface QualificationData {
    ScholarshipID: number;
    qualifications: string[];
    otherQualificationText: string;
    IsActive: boolean
}

interface ScholarshipFileData {
    FileType: string;
    FilePath: File;
    Description?: string;
}

interface ScholarshipImageData {
    ScholarshipID: number;
    ImagePath: File;
}

class ApiUpdateServiceScholarships {
    static async updateScholarship(id: string, data: any) {
        const token = localStorage.getItem('token');
        return axios.put(`${API_URL}/scholarships/${id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json' // Ensure JSON content type
            },
        });
    }


    // Specific method to update the announcement file
    static async updateAnnouncementFile(scholarshipId: string, file: File) {
        const token = localStorage.getItem('token');

        // Create a FormData object for the file upload
        const formData = new FormData();
        formData.append('AnnouncementFile', file);

        return axios.post(`${API_URL}/scholarships/${scholarshipId}/announcement-file`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data' // Set content type for file upload
            },
        });
    }

    static async updateCourse(id: number, data: CourseData) {
        const token = localStorage.getItem('token');
        return axios.put(`${API_URL}/scholarship-courses/${id}`, data, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
    }

    static async updateDocument(id: number, data: DocumentData) {
        const token = localStorage.getItem('token');
        return axios.put(`${API_URL}/scholarship-documents/${id}`, data, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
    }

    static async updateQualification(id: number, data: QualificationData) {
        const token = localStorage.getItem('token');
        return axios.put(`${API_URL}/scholarship-qualifications/${id}`, data, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
    }

    static async updateImage(scholarshipID: number, imageFile: File) {
        const token = localStorage.getItem('token');

        // สร้าง FormData และเพิ่มไฟล์ภาพเข้าไปใน FormData
        const formData = new FormData();
        formData.append("ImagePath", imageFile); // เพิ่มไฟล์ภาพเข้าไปใน FormData

        return axios.post(`${API_URL}/scholarship-images/${scholarshipID}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            },
        });
    }




    static async updateFiles(scholarshipID: number, filesData: ScholarshipFileData[], id: number) {
        const token = localStorage.getItem('token');
        const formData = new FormData();

        // Append each file to the FormData object
        filesData.forEach((fileData, index) => {
            formData.append(`FileTypes[${index}]`, fileData.FileType);
            formData.append(`FilePaths[${index}]`, fileData.FilePath);
            if (fileData.Description) {
                formData.append(`Descriptions[${index}]`, fileData.Description);
            }
        });

        // Send the POST request with the FormData object
        return axios.post(`${API_URL}/scholarship-files/${id}`, formData, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
    }



}

export default ApiUpdateServiceScholarships;
