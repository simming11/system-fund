import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API_Backend}/api`;

interface ApplicationInternalData {
    scholarship_histories:any[]
    work_experiences:any[]
    siblings:[]
    application_files:[]
    activities: any[];
    Activities: any[];
    guardians:any[];
    addresses: any;
    StudentID: string;
    ScholarshipID: string;
    ApplicationDate: string;
    Status: string;
    MonthlyIncome: number;
    MonthlyExpenses: number;
    NumberOfSiblings: number;
    NumberOfSisters: number;
    NumberOfBrothers: number;
    GPAYear1: number;
    GPAYear2: number;
    GPAYear3: number;
    AdvisorName: string;
}

interface AddressesData {
    ApplicationID: string;
    AddressLine: string;
    Subdistrict: string;
    province: string;
    District: string;
    PostalCode: string;
    Type: string;
}

interface GuardiansData {
    ApplicationID: string;
    FirstName: string;
    PrefixName: string;
    LastName: string;
    Type: string;
    Occupation: string;
    Income: number;
    Age: number;
    Status: string;
    Workplace: string;
    Phone: string;
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



interface ActivitiesData {
    AcademicYear: string;
    ActivityName: string;
    Position: string;
    ApplicationID: string;
}



interface ScholarshipHistoryData {
    ApplicationID: string;     
    ScholarshipName: string;   
    AmountReceived: number;    
    AcademicYear: string;      
}

interface WorkExperiencesData {
    ApplicationID: string;
    Name: string;
    JobType: string;
    Duration: string;
    Earnings: number;
}

interface ApplicationFileData {
    ApplicationID: string;
    DocumentName: string;
    DocumentType: string;
    FilePath: File; // Update to use File object
}

class ApiApplicationUpdateInternalServices {

    // Fetch Application Internal by ID
    static async getApplicationById(applicationId: string) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get<ApplicationInternalData>(`${API_URL}/application-internals/${applicationId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching application with ID ${applicationId}:`, error);
            throw error;
        }
    }

    static async updateApplication(applicationId: string, ApplicationInternalData: any) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(`${API_URL}/application-internals/${applicationId}`, ApplicationInternalData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json', // Send JSON data
                },
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating application with ID ${applicationId}:`, error);
            throw error;
        }
    }
    
    static async updateAddressesByApplicationID(
        applicationID: string,
        primaryAddressData: AddressesData[],
        currentAddressData: AddressesData[]
    ): Promise<AddressesData[]> {
        const token = localStorage.getItem('token');
    
        if (!token) {
            throw new Error('User is not authenticated. Token is missing.');
        }
    
        try {
            // Combine the two address sets into one array
            const combinedAddressesData = [...primaryAddressData, ...currentAddressData];
    
            // Send the combined data to the server
            const response = await axios.put<AddressesData[]>(
                `${API_URL}/addresses/${applicationID}`, 
                { addresses: combinedAddressesData }, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
    
            console.log('API response:', response.data); // Log API response for debugging
            return response.data;
    
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`Error updating addresses with ApplicationID ${applicationID}:`, error.response?.data);
                throw new Error(`Failed to update addresses: ${error.response?.data?.message || 'Unknown error occurred'}`);
            } else {
                console.error(`Unexpected error updating addresses with ApplicationID ${applicationID}:`, error);
                throw new Error('An unexpected error occurred while updating addresses.');
            }
        }
    }
    
    
    

// Update Guardians by ApplicationID
static async updateGuardiansByApplicationID(applicationID: string, guardiansData: GuardiansData[]): Promise<GuardiansData[]> {
    const token = localStorage.getItem('token');
    
    if (!token) {
        throw new Error('User is not authenticated. Token is missing.');
    }
    
    try {
        const response = await axios.put<GuardiansData[]>(
            `${API_URL}/guardians/${applicationID}`, 
            { guardians: guardiansData },  // Sending the guardians array
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        
        console.log('API response:', response.data); // Log API response for debugging
        return response.data;
    
    } catch (error) {
        console.error(`Error updating guardians with ApplicationID ${applicationID}:`, error);
        throw error;
    }
}


// Update Siblings by ApplicationID
static async updateSiblingsByApplicationID(applicationID: string, siblingsData: SiblingsData[]): Promise<SiblingsData[]> {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.put<SiblingsData[]>(`${API_URL}/siblings/${applicationID}`, siblingsData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating siblings with ApplicationID ${applicationID}:`, error);
        throw error;
    }
}


 // Update Activity by ApplicationID
static async updateActivitiesByApplicationID(applicationID: string, activitiesData: ActivitiesData[]): Promise<ActivitiesData[]> {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.put<ActivitiesData[]>(`${API_URL}/activities/${applicationID}`, activitiesData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating activities for ApplicationID ${applicationID}:`, error);
        throw error;
    }
}


// Update Scholarship History by ApplicationID
static async updateScholarshipHistory(applicationID: string, historyData: ScholarshipHistoryData[]): Promise<ScholarshipHistoryData[]> {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.put<ScholarshipHistoryData[]>(`${API_URL}/scholarship-histories/${applicationID}`, historyData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating scholarship history with ApplicationID ${applicationID}:`, error);
        throw error;
    }
}

 






// Update Work Experience by ID
static async updateWorkExperience(applicationID: string, workExperiencesData: WorkExperiencesData[]): Promise<WorkExperiencesData[]> {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.put<WorkExperiencesData[]>(`${API_URL}/work-experiences/${applicationID}`, workExperiencesData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating work experiences for Application ID ${applicationID}:`, error);
        throw error;
    }
}


    // Update Application Files
    static async updateApplicationFiles(applicationID: string, filesData: ApplicationFileData[], id: number): Promise<void> {
        const token = localStorage.getItem('token');
        const formData = new FormData();

        // Append each file to the FormData object
        filesData.forEach((fileData, index) => {
            formData.append(`DocumentType[${index}]`, fileData.DocumentType);
            formData.append(`FilePaths[${index}]`, fileData.FilePath); // Assuming FilePath is a File object
            if (fileData.DocumentName) {
                formData.append(`DocumentNames[${index}]`, fileData.DocumentName);
            }
        });

        // Send the POST request with the FormData object
        await axios.post(`${API_URL}/application-files/${id}`, formData, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
    }
}

export default ApiApplicationUpdateInternalServices;
