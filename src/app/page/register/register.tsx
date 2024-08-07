"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import ApiAuthService from "@/app/services/auth/ApiAuth";
import HeaderHome from "@/app/components/headerHome/headerHome";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import Header from "@/app/components/header/Header";

export default function RegisterPage() {
  const [StudentID, setStudentID] = useState("");
  const [FirstName, setFirstName] = useState("");
  const [LastName, setLastName] = useState("");
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [YearLevel, setYearLevel] = useState(""); // New field for YearLevel
  const [Major, setMajor] = useState(""); // New field for Major
  const [GPA, setGPA] = useState(""); // New field for GPA
  const [errors, setErrors] = useState({
    StudentID: "",
    FirstName: "",
    LastName: "",
    Email: "",
    Password: "",
    YearLevel: "",
    Major: "",
    GPA: "",
    form: ""
  });

  const router = useRouter();

  const handleRegister = async () => {
    let validationErrors = { ...errors };
    let hasErrors = false;

    // Validate each field before attempting to register
    if (!StudentID) {
      validationErrors.StudentID = "Student ID is required";
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
    if (!Email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email)) {
      validationErrors.Email = "Valid email address is required";
      hasErrors = true;
    }
    if (Password.length < 6) {
      validationErrors.Password = "Password must be at least 6 characters";
      hasErrors = true;
    }
    if (!YearLevel) {
      validationErrors.YearLevel = "Year Level is required";
      hasErrors = true;
    }
    if (!Major) {
      validationErrors.Major = "Major is required";
      hasErrors = true;
    }
    if (!GPA || isNaN(Number(GPA)) || Number(GPA) < 1.00 || Number(GPA) > 4.00) {
      validationErrors.GPA = "Valid GPA between 1.00 and 4.00 is required";
      hasErrors = true;
    }

    setErrors(validationErrors);

    if (hasErrors) {
      setErrors({ ...validationErrors, form: "Please correct the errors above and try again." });
      return;
    }

    try {
      const response = await ApiAuthService.registerStudent(
        StudentID,
        Password,
        FirstName,
        LastName,
        Email,
        YearLevel,
        Major,
        GPA
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
        setErrors({ ...errors, form: "Registration failed: " + (error.response?.data.message || error.message) });
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

  const handleGPAChange = (e: { target: { value: any; }; }) => {
    const value = e.target.value;
    if (value === "" || (value >= 1.00 && value <= 4.00)) {
      setGPA(value);
      setErrors({ ...errors, GPA: "" });
    } else {
      setErrors({ ...errors, GPA: "GPA must be between 1.00 and 4.00" });
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
        <div className="w-full lg:w-1/2 p-4 flex justify-center">
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
                  value={YearLevel}
                  onChange={(e) => setYearLevel(e.target.value)}
                  className="w-full p-3 mb-2 border border-gray-300 rounded"
                >
                  <option value="" disabled>ชั้นปี</option>
                  <option value="1">ปี 1</option>
                  <option value="2">ปี 2</option>
                  <option value="3">ปี 3</option>
                  <option value="4">ปี 4</option>
                </select>
                {errors.YearLevel && <p className="text-red-500 mb-4">{errors.YearLevel}</p>}
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
            <input
              type="email"
              placeholder="อีเมล"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mb-2 border border-gray-300 rounded"
            />
            {errors.Email && <p className="text-red-500 mb-4">{errors.Email}</p>}
            <div className="flex flex-col lg:flex-row justify-between mb-4">
              <div className="w-full lg:w-2/3 lg:pr-2">
                <select
                  value={Major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full p-3 mb-2 border border-gray-300 rounded"
                >
                  <option value="" disabled>เลือกสาขา</option>
                  <option value="Computer Science">วิทยาการคอมพิวเตอร์</option>
                  <option value="Information Technology">เทคโนโลยีสารสนเทศ</option>
                  <option value="Software Engineering">วิศวกรรมซอฟต์แวร์</option>
                  {/* Add more options as needed */}
                </select>
                {errors.Major && <p className="text-red-500 mb-4">{errors.Major}</p>}
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
