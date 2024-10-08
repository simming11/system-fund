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
    IsActive: boolean;
}

interface QualificationData {
    ScholarshipID: number;
    qualifications: string[];
    otherQualificationText: string;
    IsActive: boolean;
}

interface ScholarshipFileData {
    ScholarshipID:number
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
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json', 
            },
        });
    }

    static async updateAnnouncementFile(scholarshipId: string, file: File) {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('AnnouncementFile', file);

        return axios.post(`${API_URL}/scholarships/${scholarshipId}/announcement-file`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'multipart/form-data', 
            },
        });
    }

    static async updateCourse(id: number, data: CourseData) {
        const token = localStorage.getItem('token');
        return axios.put(`${API_URL}/scholarship-courses/${id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json', 
            },
        });
    }

    static async updateDocument(id: number, data: DocumentData) {
        const token = localStorage.getItem('token');
        return axios.put(`${API_URL}/scholarship-documents/${id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json', 
            },
        });
    }

    static async updateQualification(id: number, data: QualificationData) {
        const token = localStorage.getItem('token');
        return axios.put(`${API_URL}/scholarship-qualifications/${id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json', 
            },
        });
    }

    static async updateImage(scholarshipID: number, imageFile: File | string | null) {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        
        // Append image if imageFile is a File object
        if (imageFile instanceof File) {
          formData.append("ImagePath", imageFile);
        } else if (typeof imageFile === "string" && imageFile !== "") {
          // If imageFile is a string (existing image path), send it to the API
          formData.append("ImagePath", imageFile);
        } else {
          // Handle the case where no image is provided
          formData.append("ImagePath", ""); // You can modify this as needed
        }
      
        return axios.post(`${API_URL}/scholarship-images/${scholarshipID}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true',
            'Content-Type': 'multipart/form-data', 
          },
        });
      }
      

    static async updateFiles(ScholarshipID: number, filesData: ScholarshipFileData[], id: number) {
        const token = localStorage.getItem('token');
        const formData = new FormData();
    
        // Append each file and its metadata to FormData
        filesData.forEach((fileData, index) => {
            formData.append(`FileTypes[${index}]`, fileData.FileType);
            formData.append(`FilePaths[${index}]`, fileData.FilePath); // Ensure this is a File object
            if (fileData.Description) {
                formData.append(`Descriptions[${index}]`, fileData.Description);
            }
        });
    
        // Send POST request to update scholarship files
        return axios.post(`${API_URL}/scholarship-files/${id}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data', 
            },
        });
    }
    
    
}

export default ApiUpdateServiceScholarships;
