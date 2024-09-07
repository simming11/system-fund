"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import ApiAuthService from "@/app/services/auth/ApiAuth";
import HeaderHome from "@/app/components/headerHome/headerHome";
import Header from "@/app/components/header/Header";

export default function RegisterPage() {
  const [StudentID, setStudentID] = useState<string>("");
  const [FirstName, setFirstName] = useState<string>("");
  const [LastName, setLastName] = useState<string>("");
  const [Email, setEmail] = useState<string>("");
  const [Password, setPassword] = useState<string>("");
  const [Year_Entry, setYear_Entry] = useState<string>(""); // Store as string initially
  const [Religion, setReligion] = useState<string>("");
  const [PrefixName, setPrefixName] = useState<string>("");
  const [Phone, setPhone] = useState<string>("");
  const [DOB, setDOB] = useState<string>("");
  const [Course, setCourse] = useState<string>("");
  const [GPA, setGPA] = useState<string>("");
  const [errors, setErrors] = useState({
    StudentID: "",
    Password: "",
    FirstName: "",
    LastName: "",
    Email: "",
    GPA: "",
    Year_Entry: "",
    PrefixName: "",
    Phone: "",
    DOB: "",
    Course: "",
    Religion: "",
    form: ""
  });

  useEffect(() => {
    // Check if UserID exists in localStorage
    if (localStorage.getItem('UserID')) {
      // Redirect to another page if the user is logged in
      router.push('/'); // Redirect to homepage or any other page
    }
  }, []);


  const router = useRouter();

  const handleRegister = async () => {
    let validationErrors = { ...errors };
    let hasErrors = false;
  
    // Reset all previous errors
    validationErrors = {
      StudentID: "",
      Password: "",
      FirstName: "",
      LastName: "",
      Email: "",
      GPA: "",
      Year_Entry: "",
      PrefixName: "",
      Phone: "",
      DOB: "",
      Course: "",
      Religion: "",
      form: ""
    };


    
  
    // Validate each field before attempting to register
    if (!StudentID || StudentID.length < 7) {
      validationErrors.StudentID = "Student ID must be at least 7 characters";
      hasErrors = true;
    }
    
    if (!PrefixName) {
      validationErrors.PrefixName = "PrefixName is required";
      hasErrors = true;
    }
    if (!FirstName || !/^[A-Za-zก-๙]+$/.test(FirstName)) {
      validationErrors.FirstName = "First Name must contain only letters";
      hasErrors = true;
    }
    if (!LastName || !/^[A-Za-zก-๙]+$/.test(LastName)) {
      validationErrors.LastName = "Last Name must contain only letters";
      hasErrors = true;
    }
    
    if (!Email || !/^[^\s@]+@(gmail|email|tsu)\.[a-z]{2,}$/.test(Email)) {
      validationErrors.Email = "กรุณากรอกอีเมลที่ลงท้ายด้วย Gmail, Email หรือ TSU เท่านั้น";
      hasErrors = true;
    }
    
    
    if (!Phone || !/^\d{10}$/.test(Phone)) {
      validationErrors.Phone = "Phone number must be a valid 10-digit number";
      hasErrors = true;
    }
    if (Password.length < 6 || /[^\x00-\x7F]/.test(Password)) {
      validationErrors.Password = "Password must be at least 6 characters and contain only English characters";
      hasErrors = true;
    }
    if (!Year_Entry) {
      validationErrors.Year_Entry = "Year Entry is required";
      hasErrors = true;
    }
    if (!Course) {
      validationErrors.Course = "Major is required";
      hasErrors = true;
    }
    if (!GPA || isNaN(Number(GPA)) || Number(GPA) < 1.00 || Number(GPA) > 4.00) {
      validationErrors.GPA = "Valid GPA between 1.00 and 4.00 is required";
      hasErrors = true;
    }
  
    // Validate Religion and DOB
  if (!Religion) {
    validationErrors.Religion = "Religion is required";
    hasErrors = true;
  }
  if (!DOB) {
    validationErrors.DOB = "Date of Birth is required";
    hasErrors = true;
  }


    // Update state with validation errors
    setErrors(validationErrors);
  
    // If there are any validation errors, prevent form submission
    if (hasErrors) {
      setErrors({ ...validationErrors, form: "Please correct the errors above and try again." });
      return;
    }
  
    // Convert Year_Entry to a number before sending it to the API
    const yearEntryNumber = parseInt(Year_Entry, 10);
    const gpaNumber = parseFloat(GPA);
  
    try {
      const response = await ApiAuthService.registerStudent(
        StudentID,
        Password,
        FirstName,
        LastName,
        Email,
        PrefixName,
        Phone,
        yearEntryNumber,
        Course,
        DOB,
        gpaNumber,
        Religion
      );
  
      console.log("Registration successful", response.data);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('UserRole', 'student');
      localStorage.setItem('UserID', user.StudentID?.toString() || '');
      localStorage.setItem("StudentID", StudentID);
      localStorage.setItem("FirstName", FirstName);
      localStorage.setItem("LastName", LastName);
      localStorage.setItem("Email", Email);
  
      // Redirect to the login page
      router.push("/page/scholarships");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrors({ ...errors, form: (error.response?.data.message || error.message) });
      } else {
        setErrors({ ...errors, form: "An unknown error occurred during registration" });
      }
      console.error("Registration failed", error);
    }
  };
  

  const handleStudentIDChange = (e: { target: { value: any; }; }) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setStudentID(value);
      setErrors({ ...errors, StudentID: "" });
    } else {
      setErrors({ ...errors, StudentID: "Student ID must be a number" });
    }
  };

  const handleGPAChange = (e: { target: { value: any } }) => {
    const value = e.target.value;
    if (value === "" || (!isNaN(value) && value >= 1.0 && value <= 4.0)) {
      setGPA(value);
      setErrors({ ...errors, GPA: "" });
    } else {
      setErrors({ ...errors, GPA: "GPA must be a valid number between 1.00 and 4.00" });
    }
  };

  const handlePhoneChange = (e: { target: { value: any } }) => {
    const value = e.target.value;
    if (/^\d{0,15}$/.test(value)) { // Updated to allow up to 15 digits
      setPhone(value);
      setErrors({ ...errors, Phone: "" });
    } else {
      setErrors({ ...errors, Phone: "Phone number must be a valid number with no more than 15 digits" });
    }
  };



  return (
<div className="bg-white min-h-screen flex flex-col">
  <HeaderHome />
  <Header />
  <div className="flex flex-grow flex-col lg:flex-row items-center justify-center">
    <div className="w-full lg:w-1/2 p-4 flex justify-center">
      <img src="/images/imageRegiter.png" alt="Scholarship" className="rounded-lg w-2/3 lg:w-1/2" />
    </div>
    <div className="w-full bg-white lg:w-1/2 p-4 flex justify-center">
      <div className="">
        <h2 className="text-center text-3xl font-bold mb-6 text-blue-800">ลงทะเบียน</h2>

        {/* Student ID, Year Entry, and First Name */}
        <div className="mb-4 grid grid-cols-2 gap-5">
          <div className="w-full lg:pr-2">
            <label className="block text-gray-700 mb-1">รหัสนิสิต</label>
            <input
              type="text"
              placeholder="รหัสนิสิต"
              value={StudentID}
              onChange={handleStudentIDChange}
              className={`w-full p-3 mb-1 border ${errors.StudentID ? 'border-red-500' : 'border-gray-300'} rounded`}
            />
            <div className="min-h-[1.25rem]">
              {errors.StudentID && <p className="text-red-500 text-sm">{errors.StudentID}</p>}
            </div>
          </div>
          <div className="w-full lg:pl-2">
            <label className="block text-gray-700 mb-1">ปีการศึกษาที่เข้ามา</label>
            <select
              value={Year_Entry}
              onChange={(e) => setYear_Entry(e.target.value)} 
              className={`w-full p-3 mb-1 border ${errors.Year_Entry ? 'border-red-500' : 'border-gray-300'} rounded`}
            >
              <option value="" disabled>ปีการศึกษาที่เข้ามา</option>
              <option value="2019">2019</option>
              <option value="2020">2020</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
            </select>
            <div className="min-h-[1.25rem]">
              {errors.Year_Entry && <p className="text-red-500 text-sm">{errors.Year_Entry}</p>}
            </div>
          </div>
        </div>

        {/* PrefixName, Last Name, and Religion */}
        <div className="mb-4 grid grid-cols-3 gap-5">
          <div className="w-full lg:pr-2">
            <label className="block text-gray-700 mb-1">คำนำหน้า</label>
            <select
              value={PrefixName}
              onChange={(e) => setPrefixName(e.target.value)}
              className={`w-full p-3 mb-1 border ${errors.PrefixName ? 'border-red-500' : 'border-gray-300'} rounded`}
            >
              <option value="" disabled>คำนำหน้า</option>
              <option value="นาย">นาย</option>
              <option value="นาง">นาง</option>
              <option value="นางสาว">นางสาว</option>
            </select>
            <div className="min-h-[1.25rem]">
              {errors.PrefixName && <p className="text-red-500 text-sm">{errors.PrefixName}</p>}
            </div>
          </div>
          <div className="w-full lg:pl-2">
            <label className="block text-gray-700 mb-1">ชื่อ</label>
            <input
              type="text"
              placeholder="ชื่อ"
              value={FirstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`w-full p-3 mb-1 border ${errors.FirstName ? 'border-red-500' : 'border-gray-300'} rounded`}
            />
            <div className="min-h-[1.25rem]">
              {errors.FirstName && <p className="text-red-500 text-sm">{errors.FirstName}</p>}
            </div>
          </div>
        
          <div className="w-full lg:pl-2">
            <label className="block text-gray-700 mb-1">นามสกุล</label>
            <input
              type="text"
              placeholder="นามสกุล"
              value={LastName}
              onChange={(e) => setLastName(e.target.value)}
              className={`w-full p-3 mb-1 border ${errors.LastName ? 'border-red-500' : 'border-gray-300'} rounded`}
            />
            <div className="min-h-[1.25rem]">
              {errors.LastName && <p className="text-red-500 text-sm">{errors.LastName}</p>}
            </div>
          </div>
        </div>

        {/* Email, Phone, and DOB */}
        <div className="mb-4 grid grid-cols-3 gap-5">
          <div className="w-full lg:pl-2">
            <label className="block text-gray-700 mb-1">ศาสนา</label>
            <select
              value={Religion}
              onChange={(e) => setReligion(e.target.value)}
              className={`w-full p-3 mb-1 border ${errors.Religion ? 'border-red-500' : 'border-gray-300'} rounded`}
            >
              <option value="" disabled>ศาสนา</option>
              <option value="พุทธ">พุทธ</option>
              <option value="คริส">คริส</option>
              <option value="อิสลาม">อิสลาม</option>
              <option value="ไม่ระบุ">ไม่ระบุ</option>
            </select>
            <div className="min-h-[1.25rem]">
              {errors.Religion && <p className="text-red-500 text-sm">{errors.Religion}</p>}
            </div>
          </div>
          <div className="w-full lg:pl-2">
            <label className="block text-gray-700 mb-1">วันเกิด</label>
            <input
              type="date"
              value={DOB}
              onChange={(e) => setDOB(e.target.value)}
              className={`w-full p-3 mb-1 border ${errors.DOB ? 'border-red-500' : 'border-gray-300'} rounded`}
            />
            <div className="min-h-[1.25rem]">
              {errors.DOB && <p className="text-red-500 text-sm">{errors.DOB}</p>}
            </div>
          </div>
          
          <div className="w-full lg:pl-2">
            <label className="block text-gray-700 mb-1">เบอร์โทรศัพท์</label>
            <input
              type="text"
              placeholder="เบอร์โทรศัพท์"
              value={Phone}
              onChange={handlePhoneChange}
              className={`w-full p-3 mb-1 border ${errors.Phone ? 'border-red-500' : 'border-gray-300'} rounded`}
            />
            <div className="min-h-[1.25rem]">
              {errors.Phone && <p className="text-red-500 text-sm">{errors.Phone}</p>}
            </div>
          </div>
        </div>

        {/* Course and GPA */}
        <div className="mb-4 grid grid-cols-2 gap-5">
          <div className="w-full lg:pr-2">
            <label className="block text-gray-700 mb-1">เลือกสาขา</label>
            <select
              value={Course}
              onChange={(e) => setCourse(e.target.value)}
              className={`w-full p-3 mb-1 border ${errors.Course ? 'border-red-500' : 'border-gray-300'} rounded`}
            >
              <option value="" disabled>เลือกสาขา</option>
              <option value="วิทยาการคอมพิวเตอร์">วิทยาการคอมพิวเตอร์</option>
              <option value="เทคโนโลยีสารสนเทศ">เทคโนโลยีสารสนเทศ</option>
              <option value="วิศวกรรมซอฟต์แวร์">วิศวกรรมซอฟต์แวร์</option>
            </select>
            <div className="min-h-[1.25rem]">
              {errors.Course && <p className="text-red-500 text-sm">{errors.Course}</p>}
            </div>
          </div>
          <div className="w-full lg:pl-2">
            <label className="block text-gray-700 mb-1">เกรดเฉลี่ย</label>
            <input
              type="number"
              step="0.01"
              min="1.00"
              max="4.00"
              placeholder="เกรดเฉลี่ย"
              value={GPA}
              onChange={handleGPAChange}
              className={`w-full p-3 mb-1 border ${errors.GPA ? 'border-red-500' : 'border-gray-300'} rounded`}
            />
            <div className="min-h-[1.25rem]">
              {errors.GPA && <p className="text-red-500 text-sm">{errors.GPA}</p>}
            </div>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-5">
          <div className="w-full lg:pr-2">
            <label className="block text-gray-700 mb-1">อีเมล</label>
            <input
              type="email"
              placeholder="อีเมล"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-3 mb-1 border ${errors.Email ? 'border-red-500' : 'border-gray-300'} rounded`}
            />
            <div className="min-h-[1.25rem]">
              {errors.Email && <p className="text-red-500 text-sm">{errors.Email}</p>}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">รหัสผ่าน</label>
            <input
              type="password"
              placeholder="รหัสผ่าน"
              value={Password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-3 mb-1 border ${errors.Password ? 'border-red-500' : 'border-gray-300'} rounded`}
            />
            <div className="min-h-[1.25rem]">
              {errors.Password && <p className="text-red-500 text-sm">{errors.Password}</p>}
            </div>
          </div>
        </div>

        <button
          onClick={handleRegister}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          SIGN UP
        </button>
      </div>
    </div>
  </div>
</div>




  );
}
