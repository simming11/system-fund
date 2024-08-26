import axios from 'axios';

const API_URL = `http://127.0.0.1:8000/api`;

class ApiAuthService {
  static async loginStudent(StudentID: string, Password: string) {
    return axios.post(`${API_URL}/login/student`, { StudentID, Password });
  }
  
  static async loginAcademic(AcademicID: string, Password: string) {
    return axios.post(`${API_URL}/login/academic`, { AcademicID, Password });
  }

  static async registerStudent(
    StudentID: string,
    Password: string,
    FirstName: string,
    LastName: string,
    Email: string,
    PrefixName: string,
    Phone: string,
    Year_Entry: number,
    Course: string,
    DOB: string,
    GPA: number,
    Religion: string,
  ) {
    
    return axios.post(`${API_URL}/register/student`, {
      StudentID,
      Password,
      FirstName,
      LastName,
      Email,
      PrefixName,
      Phone,
      Year_Entry,
      Course,
      DOB,
      GPA,
      Religion,
    });
  }

  static async registerAcademic(
    AcademicID: string,
    FirstName: string,
    LastName: string,
    Position: string | null,
    Email: string,
    Phone: string | null,
    Password: string
  ) {
    return axios.post(`${API_URL}/register/academic`, {
      AcademicID,
      FirstName,
      LastName,
      Position,
      Email,
      Phone,
      Password,
    });
  }

  static async logout() {
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/logout`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export default ApiAuthService;
