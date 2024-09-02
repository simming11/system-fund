"use client";

import { useState } from "react";
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
    if (!StudentID) {
      validationErrors.StudentID = "Student ID is required";
      hasErrors = true;
    }
    if (!PrefixName) {
      validationErrors.PrefixName = "PrefixName is required";
      hasErrors = true;
    }
    if (!FirstName) {
      validationErrors.FirstName = "First Name is required";
      hasErrors = true;
    }
    if (!LastName) {
      validationErrors.LastName = "Last Name is required";
      hasErrors = true;
    }
    if (!Email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email) || /[^\x00-\x7F]/.test(Email)) {
      validationErrors.Email = "กรุณากรอกอีเมลที่ถูกต้องและเป็นภาษาอังกฤษเท่านั้น";
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
          <div className="bg-white p-8 rounded shadow-md w-full max-w-md mt-10">
            <h2 className="text-center text-3xl font-bold mb-6 text-blue-800">ลงทะเบียน</h2>
            {errors.form && <p className="text-red-500 mb-4">{errors.form}</p>}
            <div className="flex flex-col lg:flex-row justify-between mb-4">
              <div className="w-full lg:w-2/3 lg:pr-2">
                <input
                  type="text"
                  placeholder="รหัสนิสิต"
                  value={StudentID}
                  onChange={handleStudentIDChange}
                  className="w-full p-3 mb-2 border border-gray-300 rounded"
                />
                {errors.StudentID && <p className="text-red-500 mb-4">{errors.StudentID}</p>}
              </div>
              <div className="w-full lg:w-1/3 lg:pl-2">
                <select
                  value={Year_Entry}
                  onChange={(e) => setYear_Entry(e.target.value)} // Keep it as a string
                  className="w-full p-3 mb-2 border border-gray-300 rounded"
                >
                  <option value="" disabled>ปีการศึกษาที่เข้ามา</option>
                  <option value="2019">2019</option>
                  <option value="2020">2020</option>
                  <option value="2023">2023</option>
                  <option value="2024">2024</option>
                </select>
                {errors.Year_Entry && <p className="text-red-500 mb-4">{errors.Year_Entry}</p>}
              </div>

              <div className="w-full lg:w-1/3 lg:pl-2">
                <select
                  value={PrefixName}
                  onChange={(e) => setPrefixName(e.target.value)}
                  className="w-full p-3 mb-2 border border-gray-300 rounded"
                >
                  <option value="" disabled>คำนำหน้า</option>
                  <option value="นาย">นาย</option>
                  <option value="นาง">นาง</option>
                  <option value="นางสาว">นางสาว</option>
                </select>
                {errors.PrefixName && <p className="text-red-500 mb-4">{errors.PrefixName}</p>}
              </div>
            </div>
            <input
              type="text"
              placeholder="ชื่อ"
              value={FirstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full p-3 mb-2 border border-gray-300 rounded"
            />
            {errors.FirstName && <p className="text-red-500 mb-4">{errors.FirstName}</p>}
            <input
              type="text"
              placeholder="นามสกุล"
              value={LastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full p-3 mb-2 border border-gray-300 rounded"
            />
            {errors.LastName && <p className="text-red-500 mb-4">{errors.LastName}</p>}

            <select
              value={Religion}
              onChange={(e) => setReligion(e.target.value)}
              className="w-full p-3 mb-2 border border-gray-300 rounded"
            >
              <option value="" disabled>ศาสนา</option>
              <option value="พุทธ">พุทธ</option>
              <option value="คริส">คริส</option>
              <option value="อิสลาม">อิสลาม</option>
              <option value="ไม่ระบุ">ไม่ระบุ</option>
            </select>
            {errors.Religion && <p className="text-red-500 mb-4">{errors.Religion}</p>}
            <input
        type="email"
        placeholder="อีเมล"
        value={Email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 mb-2 border border-gray-300 rounded"
      />
      {errors.Email && <p className="text-red-500 mb-4">{errors.Email}</p>}

            <input
              type="text"
              placeholder="เบอร์โทรศัพท์"
              value={Phone}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d{0,10}$/.test(value)) { // Allow only numbers with a maximum of 10 digits
                  setPhone(value);
                  setErrors({ ...errors, Phone: "" });
                } else {
                  setErrors({ ...errors, Phone: "Phone number must be a valid 10-digit number" });
                }
              }}
              className="w-full p-3 mb-2 border border-gray-300 rounded"
            />
            {errors.Phone && <p className="text-red-500 mb-4">{errors.Phone}</p>}

            <input
              type="date"
              placeholder="วันเกิด"
              value={DOB}
              onChange={(e) => setDOB(e.target.value)}
              className="w-full p-3 mb-2 border border-gray-300 rounded"
            />
            {errors.DOB && <p className="text-red-500 mb-4">{errors.DOB}</p>}

            <div className="flex flex-col lg:flex-row justify-between mb-4">
              <div className="w-full lg:w-2/3 lg:pr-2">
                <select
                  value={Course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full p-3 mb-2 border border-gray-300 rounded"
                >
                  <option value="" disabled>เลือกสาขา</option>
                  <option value="วิทยาการคอมพิวเตอร์">วิทยาการคอมพิวเตอร์</option>
                  <option value="เทคโนโลยีสารสนเทศ">เทคโนโลยีสารสนเทศ</option>
                  <option value="วิศวกรรมซอฟต์แวร์">วิศวกรรมซอฟต์แวร์</option>
                  {/* Add more options as needed */}
                </select>
                {errors.Course && <p className="text-red-500 mb-4">{errors.Course}</p>}
              </div>
              <div className="w-full lg:w-1/3 lg:pl-2">
                <input
                  type="number"
                  step="0.01"
                  min="1.00"
                  max="4.00"
                  placeholder="เกรดเฉลี่ย"
                  value={GPA}
                  onChange={handleGPAChange}
                  className="w-full p-3 mb-2 border border-gray-300 rounded"
                />
                {errors.GPA && <p className="text-red-500 mb-4">{errors.GPA}</p>}
              </div>
            </div>
            <input
              type="password"
              placeholder="รหัสผ่าน"
              value={Password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mb-2 border border-gray-300 rounded"
            />
            {errors.Password && <p className="text-red-500 mb-4">{errors.Password}</p>}
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
