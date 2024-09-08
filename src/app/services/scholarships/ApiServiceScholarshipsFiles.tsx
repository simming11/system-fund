import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API_Backend}/api`;

interface ScholarshipFileData {
    ScholarshipID: number;
    FileType: string;
    FilePath: File;
    Description?: string;
}

class ApiGetALLfilesServiceScholarships {
    static async getAllFiles() {
        const token = localStorage.getItem('token');
        return axios.get(`${API_URL}/scholarship-files`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
            },
        });
    }

    static async getFile(id: number) {
        const token = localStorage.getItem('token');
        return axios.get(`${API_URL}/scholarship-files/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
            },
        });
    }

    // Get files of type 'documents' for a specific scholarship by ID
    static async getScholarshipDocuments(scholarshipId: number) {
        const token = localStorage.getItem('token');
        return axios.get(`${API_URL}/scholarships/${scholarshipId}/files/documents`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
            },
        });
    }

    // Get files of type 'images' for a specific scholarship by ID
    static async getScholarshipImages(scholarshipId: number) {
        const token = localStorage.getItem('token');
        return axios.get(`${API_URL}/scholarships/${scholarshipId}/files/images`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
            },
        });
    }

    static async updateFile(id: number, data: ScholarshipFileData) {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        if (data.ScholarshipID) formData.append('ScholarshipID', data.ScholarshipID.toString());
        if (data.FileType) formData.append('FileType', data.FileType);
        if (data.FilePath) formData.append('FilePath', data.FilePath);
        if (data.Description) formData.append('Description', data.Description);

        return axios.post(`${API_URL}/scholarship-files/${id}?_method=PUT`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    static async deleteFile(id: number) {
        const token = localStorage.getItem('token');
        return axios.delete(`${API_URL}/scholarship-files/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
            },
        });
    }

    static async downloadFile(id: number, fileName: string) {
        const token = localStorage.getItem('token');
        return axios.get(`${API_URL}/scholarship-files/${id}/download`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
            },
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
}

export default ApiGetALLfilesServiceScholarships;
