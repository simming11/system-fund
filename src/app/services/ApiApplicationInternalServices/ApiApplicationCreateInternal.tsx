import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

interface ApplicationInternaldata {
    StudentID: string;
    ScholarshipID: string;
    ApplicationDate: string;
    Status: string;
    MonthlyIncome: number;
    MonthlyExpenses: number;
    NumberOfSiblings: number;
    NumberOfSisters: number;
    NumberOfBrothers: number;
}
interface GuardiansData {
    ApplicationID: string;
    FirstName: string;
    LastName: string;
    Type: string;
    Occupation: string;
    Income: number;
    Age: number;
    Status: string;
    Workplace: string;
}
interface ApplicationFilesData {
    ApplicationID: string;
    DocumentName: string;
    DocumentType: string;
    FilePath: string;
}
interface WorkExperiencesData {
    ApplicationID: string;
    Name: string;
    JobType: string;
    Duration: string;
    Earnings: number;
}
interface EducationHistoriesData {
    ApplicationID: string;
    EducationLevel: string;
    AcademicYear: number;
    GPA: number;
    AdvisorName: string;
    CourseName: string;
}
interface SiblingsData {
    ApplicationID: string;
    PrefixName: string;
    Fname: string;
    Lname: string;
    Occupation: string;
    EducationLevel: string;
    Income: number;
    Status: string;
}
interface AddressesData {
    ApplicationID: string;
    AddressLine: string;
    Subdistrict: string;
    District: string;
    PostalCode: string;
    Type: string;
}
interface ActivitiesData {
    AcademicYear: string;
    ActivityName: string;
    Position: string;
    ApplicationID: string;
}

class ApiApplicationCreateInternalServices {

    // สร้าง application internal ใหม่
    static async createApplication(applicationData: ApplicationInternaldata) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${API_URL}/application-internal`, applicationData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating application:', error);
            throw error;
        }
    }

    // สร้าง address ใหม่
    static async createAddress(addressData: AddressesData) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${API_URL}/addresses`, addressData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating address:', error);
            throw error;
        }
    }

    // สร้าง application file ใหม่
    static async createApplicationFile(fileData: ApplicationFilesData) {
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

    // สร้าง sibling ใหม่
    static async createSibling(siblingData: SiblingsData) {  // Update the type to SiblingsData
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${API_URL}/siblings`, siblingData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating sibling:', error);
            throw error;
        }
    }

    // สร้าง guardian ใหม่
    static async createGuardian(guardianData: GuardiansData) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${API_URL}/guardians`, guardianData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating guardian:', error);
            throw error;
        }
    }

    // สร้าง education history ใหม่
    static async createEducationHistory(historyData: EducationHistoriesData) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${API_URL}/education-histories`, historyData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating education history:', error);
            throw error;
        }
    }

    // สร้าง activity ใหม่
    static async createActivity(activityData: ActivitiesData) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${API_URL}/activities`, activityData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating activity:', error);
            throw error;
        }
    }

    // สร้าง scholarship history ใหม่
    static async createScholarshipHistory(historyData: any) {  // If you have a specific interface, use it
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${API_URL}/scholarship-histories`, historyData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating scholarship history:', error);
            throw error;
        }
    }

    // สร้าง work experience ใหม่
    static async createWorkExperience(experienceData: WorkExperiencesData) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${API_URL}/work-experiences`, experienceData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating work experience:', error);
            throw error;
        }
    }
}

export default ApiApplicationCreateInternalServices;
