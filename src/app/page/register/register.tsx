"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import ApiAuthService from "@/app/services/auth/ApiAuth";
import HeaderHome from "@/app/components/headerHome/headerHome";
import Header from "@/app/components/header/Header";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import th from "date-fns/locale/th";
import { format, Locale } from "date-fns";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
// Register Thai locale
registerLocale("th", th as unknown as Locale);

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false); // เพิ่ม state สำหรับแสดง/ซ่อนรหัสผ่าน
  const [StudentID, setStudentID] = useState<string>("");
  const [FirstName, setFirstName] = useState<string>("");
  const [LastName, setLastName] = useState<string>("");
  const [Email, setEmail] = useState<string>("");
  const [Password, setPassword] = useState<string>("");
  const [Year_Entry, setYear_Entry] = useState<string>(""); // Store as string initially
  const [Religion, setReligion] = useState<string>("");
  const [PrefixName, setPrefixName] = useState<string>("");
  const [Phone, setPhone] = useState<string>("");
  const [DOB, setDOB] = useState<Date | null>(null); // DOB is a Date object or null
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


  const showPopup = () => {
    Swal.fire({
      title: "<strong>เข้าร่วมกลุ่มนี้เพื่อรับข่าวสาร</strong>",
      imageUrl: '/images/line.jpg', // Use the relative path to the image in the public folder
      imageWidth: 100, // Set the width of the image
      imageHeight: 100, // Set the height of the image
      html: `
       
      `,
      confirmButtonText: `<i class="fa fa-thumbs-up"></i> ตกลง!`,
    });
  };
  
  const router = useRouter();

  useEffect(() => {
    // Check if UserID exists in localStorage
    if (localStorage.getItem('UserID')) {
      router.push('/'); // Redirect to homepage if already logged in
    }
  }, []);

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

    // ตรวจสอบความถูกต้องของแต่ละฟิลด์ก่อนทำการลงทะเบียน
    if (!StudentID || StudentID.length < 9) {
      validationErrors.StudentID = "กรุณากรอกรหัสนิสิต";
      hasErrors = true;
    }

    if (!PrefixName) {
      validationErrors.PrefixName = "กรุณากรอกคำนำหน้าชื่อ";
      hasErrors = true;
    }

    if (!FirstName || !/^[A-Za-zก-๙]+$/.test(FirstName)) {
      validationErrors.FirstName = "กรุณากรอกชื่อจริง";
      hasErrors = true;
    }

    if (!LastName || !/^[A-Za-zก-๙]+$/.test(LastName)) {
      validationErrors.LastName = "กรุณากรอกนามสกุลจริง";
      hasErrors = true;
    }

    if (!Email || !/^[^\s@]+@(tsu\.ac\.th)$/.test(Email)) {
      validationErrors.Email = "กรุณากรอกอีเมล";
      hasErrors = true;
    }

    if (!Phone || !/^\d{10}$/.test(Phone)) {
      validationErrors.Phone = "กรุณากรอกหมายเลขโทรศัพท์";
      hasErrors = true;
    }

    if (Password.length < 8 || /[^\x00-\x7F]/.test(Password)) {
      validationErrors.Password = "กรุณากรอกรหัสผ่าน";
      hasErrors = true;
    }

    if (!Year_Entry) {
      validationErrors.Year_Entry = "กรุณากรอกปีที่เข้าศึกษา";
      hasErrors = true;
    }

    if (!Course) {
      validationErrors.Course = "กรุณากรอกสาขาวิชา";
      hasErrors = true;
    }

    if (!GPA || isNaN(Number(GPA)) || Number(GPA) < 1.00 || Number(GPA) > 4.00) {
      validationErrors.GPA = "กรุณากรอกเกรดเฉลี่ย";
      hasErrors = true;
    }

    if (!Religion) {
      validationErrors.Religion = "กรุณากรอกศาสนา";
      hasErrors = true;
    }

    if (!DOB) {
      validationErrors.DOB = "กรุณากรอกวันเกิด";
      hasErrors = true;
    }


    // อัปเดตสถานะด้วยข้อผิดพลาดในการตรวจสอบความถูกต้อง
    setErrors(validationErrors);

    // หากมีข้อผิดพลาดในการตรวจสอบความถูกต้อง ให้ป้องกันการส่งฟอร์ม
    if (hasErrors) {
      setErrors({ ...validationErrors, form: "กรุณาแก้ไขข้อผิดพลาดด้านล่างและลองอีกครั้ง" });
      return;
    }

    const yearEntryNumber = parseInt(Year_Entry, 10);
    const gpaNumber = parseFloat(GPA);
    const formattedDOB = DOB ? format(DOB, 'dd/MM/yyyy') : "";

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
        formattedDOB,
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

      // แสดงข้อความแจ้งเตือนว่าการลงทะเบียนสำเร็จ
      Swal.fire({
        icon: "success",
        title: "ลงทะเบียนเรียบร้อยแล้ว",
        showConfirmButton: false,
        timer: 1500
      });

      // Redirect to the login page
      router.push("/page/scholarships/ApplyScholarship");
      showPopup()

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorResponse = error.response?.data.errors;
        let errorMessages = [];

        if (errorResponse?.Email) {
          errorMessages.push("อีเมลถูกใช้งานแล้ว");
        }
        if (errorResponse?.Password) {
          errorMessages.push(`Password: ${errorResponse.Password[0]}`);
        }
        if (errorResponse?.StudentID) {
          errorMessages.push("รหัสนิสิตถูกใช้งานแล้ว");
        }

        const fullErrorMessage = errorMessages.join(', ');
        setErrors({ ...errors, form: fullErrorMessage });

        // แสดงข้อความแจ้งเตือนว่าการลงทะเบียนล้มเหลว
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: "การลงทะเบียนล้มเหลว",
          text: fullErrorMessage,
          showConfirmButton: false,
          timer: 1500
        });

      } else {
        const unknownError = "An unknown error occurred during registration";
        setErrors({ ...errors, form: unknownError });

        // แสดงข้อความแจ้งเตือนว่าการลงทะเบียนล้มเหลว
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: "การลงทะเบียนล้มเหลว",
          text: "เกิดข้อผิดพลาดที่ไม่รู้จัก",
          showConfirmButton: false,
          timer: 1500
        });
      }
      console.error("Registration failed", error);
    }
  };



  // Function to convert the selected date to Buddhist year for display
  const formatToBuddhistYear = (date: Date | null) => {
    if (!date) return "";
    const buddhistYear = date.getFullYear() + 543;
    return format(date, `dd/MM/${buddhistYear}`);
  };

  // Handle date change
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setDOB(date);
      setErrors((prevErrors) => ({ ...prevErrors, DOB: "" }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, DOB: "กรุณาเลือกวันเกิด" }));
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <HeaderHome />
      <Header />
      <div className="flex flex-grow flex-col lg:flex-row items-center justify-center">
        <div className="w-full lg:w-1/2 p-4  md:w-1/2  flex justify-center">
        <Image src="/images/sci.png" alt="Scholarship" className="rounded-lg w-2/3 lg:w-1/2"  />
        </div>
        <div className="w-full bg-white lg:w-1/2 p-4 flex justify-center mr-10">
          <div className="w-full">
            <h2 className="text-center text-3xl font-bold mb-6 text-blue-800">ลงทะเบียน</h2>

            {/* Form starts here */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Student ID */}
              <div className="w-full">
                <label className="block text-gray-700 mb-1">รหัสนิสิต</label>
                <input
                  type="text"
                  placeholder="รหัสนิสิต"
                  value={StudentID}
                  onChange={(e) => {
                    let value = e.target.value;
                    value = value.replace(/\D/g, ''); // Remove all non-numeric characters

                    // Limit the value to 9 characters
                    if (value.length > 9) {
                      value = value.slice(0, 9);
                    }

                    setStudentID(value); // Update the state with the filtered and truncated value

                    if (value.length < 9) {
                      // Set error if input is less than 9 digits
                      setErrors((prevErrors) => ({
                        ...prevErrors,
                        StudentID: 'รหัสนิสิตต้องมีอย่างน้อย 9 ตัวเลข',
                      }));
                    } else {
                      // Clear error if input is valid
                      setErrors((prevErrors) => ({
                        ...prevErrors,
                        StudentID: '',
                      }));
                    }
                  }}
                  className={`w-full p-3 mb-1 border ${errors.StudentID ? 'border-red-500' : 'border-gray-300'} rounded`}
                />
                {errors.StudentID && <p className="text-red-500 text-sm">{errors.StudentID}</p>}
              </div>





              {/* Year Entry */}
              <div className="w-full">
                <label className="block text-gray-700 mb-1">ปีการศึกษาที่เข้ามา</label>
                <select
                  value={Year_Entry}
                  onChange={(e) => setYear_Entry(e.target.value)}
                  className={`w-full p-3 mb-1 border ${errors.Year_Entry ? 'border-red-500' : 'border-gray-300'} rounded`}
                >
                  <option value="" disabled>ปีการศึกษาที่เข้ามา</option>
                  {[...Array(17).keys()].map(i => (
                    <option key={i} value={2564 + i}>{2564 + i}</option>
                  ))}
                </select>
                {errors.Year_Entry && <p className="text-red-500 text-sm">{errors.Year_Entry}</p>}
              </div>

              {/* Course */}
              <div className="w-full">
                <label className="block text-gray-700 mb-1">เลือกสาขา</label>
                <select
                  value={Course}
                  onChange={(e) => setCourse(e.target.value)}
                  className={`w-full p-3 mb-1 border ${errors.Course ? 'border-red-500' : 'border-gray-300'} rounded`}
                >
                  <option value="" disabled>เลือกสาขา</option>
                  <option value="เคมี">เคมี</option>
                  <option value="วิทยาศาสตร์สิ่งแวดล้อม">วิทยาศาสตร์สิ่งแวดล้อม</option>
                  <option value="คณิตศาสตร์และการจัดการข้อมูล">คณิตศาสตร์และการจัดการข้อมูล</option>
                  <option value="คณิตศาสตร์">คณิตศาสตร์</option>
                  <option value="วิทยาการคอมพิวเตอร์และสารสนเทศ">วิทยาการคอมพิวเตอร์และสารสนเทศ</option>
                  <option value="ชีววิทยาศาสตร์">ชีววิทยาศาสตร์</option>
                  <option value="ฟิสิกส์">ฟิสิกส์</option>
                  <option value="วิทยาศาสตร์การประมงและทรัพยากรทางน้ำ">วิทยาศาสตร์การประมงและทรัพยากรทางน้ำ</option>

                </select>
                {errors.Course && <p className="text-red-500 text-sm">{errors.Course}</p>}
              </div>

              {/* PrefixName */}
              <div className="w-full">
                <label className="block text-gray-700 mb-1">คำนำหน้า</label>
                <select
                  value={PrefixName}
                  onChange={(e) => setPrefixName(e.target.value)}
                  className={`w-full p-3 mb-1 border ${errors.PrefixName ? 'border-red-500' : 'border-gray-300'} rounded`}
                >
                  <option value="" disabled>คำนำหน้า</option>
                  <option value="นาย">นาย</option>
                  <option value="นางสาว">นางสาว</option>
                </select>
                {errors.PrefixName && <p className="text-red-500 text-sm">{errors.PrefixName}</p>}
              </div>

              {/* First Name */}
              <div className="w-full">
                <label className="block text-gray-700 mb-1">ชื่อ</label>
                <input
                  type="text"
                  placeholder="ชื่อ"
                  value={FirstName}
                  onChange={(e) => {
                    const value = e.target.value;
                    const regex = /^[ก-๙a-zA-Z\s]*$/;
                    if (regex.test(value)) {
                      setFirstName(value);
                      setErrors((prevErrors) => ({ ...prevErrors, FirstName: "" }));
                    } else {
                      setErrors((prevErrors) => ({ ...prevErrors, FirstName: "กรุณากรอกตัวอักษรเท่านั้น" }));
                    }
                  }}
                  className={`w-full p-3 mb-1 border ${errors.FirstName ? 'border-red-500' : 'border-gray-300'} rounded`}
                />
                {errors.FirstName && <p className="text-red-500 text-sm">{errors.FirstName}</p>}
              </div>

              {/* Last Name */}
              <div className="w-full">
                <label className="block text-gray-700 mb-1">นามสกุล</label>
                <input
                  type="text"
                  placeholder="นามสกุล"
                  value={LastName}
                  onChange={(e) => {
                    const value = e.target.value;
                    const regex = /^[ก-๙a-zA-Z\s]*$/;
                    if (regex.test(value)) {
                      setLastName(value);
                      setErrors((prevErrors) => ({ ...prevErrors, LastName: "" }));
                    } else {
                      setErrors((prevErrors) => ({ ...prevErrors, LastName: "กรุณากรอกตัวอักษรเท่านั้น" }));
                    }
                  }}
                  className={`w-full p-3 mb-1 border ${errors.LastName ? 'border-red-500' : 'border-gray-300'} rounded`}
                />
                {errors.LastName && <p className="text-red-500 text-sm">{errors.LastName}</p>}
              </div>

              {/* Religion */}
              <div className="w-full">
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
                {errors.Religion && <p className="text-red-500 text-sm">{errors.Religion}</p>}
              </div>

             {/* DOB */}
      <div className="w-full">
        <label className="block text-gray-700 mb-1">วันเกิด</label>
        <DatePicker
          selected={DOB}
          onChange={handleDateChange}
          dateFormat="dd/MM/yyyy"
          locale="th"
          placeholderText="วัน/เดือน/ปี"
          showYearDropdown
          yearDropdownItemNumber={100}
          scrollableYearDropdown
          customInput={
            <input
              value={DOB ? formatToBuddhistYear(DOB) : ""}
              className="w-full p-3 mb-1 border border-gray-300 rounded"
            />
          }
          className={`w-full p-3 mb-1 border ${errors.DOB ? 'border-red-500' : 'border-gray-300'} rounded`}
        />
        {errors.DOB && <p className="text-red-500 text-sm">{errors.DOB}</p>}
      </div>

              {/* Phone */}
              <div className="w-full">
                <label className="block text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                <input
                  type="text"
                  placeholder="เบอร์โทรศัพท์"
                  value={Phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value) && value.length <= 10) { // Ensure only digits and max 10 characters
                      setPhone(value); // Always update the phone state
                      if (value.length === 10) {
                        setErrors((prevErrors) => ({
                          ...prevErrors,
                          Phone: "", // Clear the error when valid
                        }));
                      } else {
                        setErrors((prevErrors) => ({
                          ...prevErrors,
                          Phone: "เบอร์โทรศัพท์ต้องมี 10 หลัก", // Show error if not 10 digits
                        }));
                      }
                    } else if (!/^\d*$/.test(value)) {
                      setErrors((prevErrors) => ({
                        ...prevErrors,
                        Phone: "กรุณากรอกเฉพาะตัวเลข", // Show error if non-numeric input
                      }));
                    }
                  }}
                  className={`w-full p-3 mb-1 border ${errors.Phone ? 'border-red-500' : 'border-gray-300'} rounded`}
                  maxLength={10} // This also ensures the input can't exceed 10 digits
                />
                {errors.Phone && <p className="text-red-500 text-sm">{errors.Phone}</p>}
              </div>


              {/* GPA */}
              <div className="w-full">
                <label className="block text-gray-700 mb-1">เกรดเฉลี่ย</label>
                <input
                  type="number"
                  step="0.01"
                  min="1.00"
                  max="4.00"
                  placeholder="เกรดเฉลี่ย"
                  value={GPA}
                  onChange={(e) => {
                    let value = e.target.value;

                    // Ensure value is a number and round to 2 decimal places
                    if (value.includes(".")) {
                      const [integerPart, decimalPart] = value.split(".");
                      if (decimalPart.length > 2) {
                        value = `${integerPart}.${decimalPart.slice(0, 2)}`; // Limit to 2 decimal places
                      }
                    }

                    const gpaValue = parseFloat(value);
                    if (!isNaN(gpaValue) && gpaValue >= 1.00 && gpaValue <= 4.00) {
                      setGPA(value); // Set GPA value with 2 decimals
                      setErrors((prevErrors) => ({
                        ...prevErrors,
                        GPA: "", // Clear error if valid
                      }));
                    } else {
                      setErrors((prevErrors) => ({
                        ...prevErrors,
                        GPA: "กรุณากรอกเกรดเฉลี่ยระหว่าง 1.00 ถึง 4.00", // Show error if invalid
                      }));
                    }
                  }}
                  className={`w-full p-3 mb-1 border ${errors.GPA ? 'border-red-500' : 'border-gray-300'} rounded`}
                />
                {errors.GPA && <p className="text-red-500 text-sm">{errors.GPA}</p>}
              </div>

              {/* Email */}
              <div className="w-full">
                <label className="block text-gray-700 mb-1">อีเมล</label>
                <input
                  type="text"
                  placeholder="อีเมล"
                  value={Email}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEmail(value);
                    if (/[ก-๙]/.test(value)) {
                      setErrors((prevErrors) => ({ ...prevErrors, Email: "ห้ามใช้อักษรภาษาไทยในอีเมล" }));
                    } else if (!/^[^\s@]+@(tsu\.ac\.th|TSU\.AC\.TH)$/.test(value)) {
                      setErrors((prevErrors) => ({ ...prevErrors, Email: "กรุณากรอกอีเมลที่ลงท้ายด้วย @tsu.ac.th เท่านั้น" }));
                    } else {
                      setErrors((prevErrors) => ({ ...prevErrors, Email: "" }));
                    }
                  }}
                  className={`w-full p-3 mb-1 border ${errors.Email ? 'border-red-500' : 'border-gray-300'} rounded`}
                />
                {errors.Email && <p className="text-red-500 text-sm">{errors.Email}</p>}
              </div>

              {/* Password */}
              <div className="w-full">
                <label className="block text-gray-700 mb-1">รหัสผ่าน</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} // เปลี่ยนระหว่าง text และ password
                    placeholder="รหัสผ่าน"
                    value={Password}
                    onChange={(e) => {
                      const value = e.target.value;
                      // ลบอักขระภาษาไทยออก
                      const filteredValue = value.replace(/[\u0E00-\u0E7F]/g, ''); // ตัดตัวอักษรภาษาไทย
                      setPassword(filteredValue); // อัปเดตรหัสผ่านโดยไม่มีตัวอักษรภาษาไทย

                      // Validate password length and set errors if it's less than 8 characters
                      if (filteredValue.length < 8) {
                        setErrors((prevErrors) => ({
                          ...prevErrors,
                          Password: 'รหัสผ่านอย่างน้อย 8 ตัว',
                        }));
                      } else {
                        setErrors((prevErrors) => ({
                          ...prevErrors,
                          Password: '',
                        }));
                      }
                    }}
                    className={`w-full p-3 mb-1 border ${errors.Password ? 'border-red-500' : 'border-gray-300'} rounded`}
                  />

                  {/* ปุ่มเปิด-ปิดการดูรหัสผ่าน - จะปรากฏเฉพาะเมื่อมีการกรอกรหัสผ่าน */}
                  {Password && (
                    <button
                      type="button"
                      onMouseDown={() => setShowPassword(true)}  // กดปุ่มค้างเพื่อแสดงรหัสผ่าน
                      onMouseUp={() => setShowPassword(false)}   // ปล่อยปุ่มเพื่อซ่อนรหัสผ่าน
                      onMouseLeave={() => setShowPassword(false)} // ป้องกันการแสดงรหัสหากเมาส์ออกจากปุ่ม
                      className="absolute right-3 top-3"
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  )}
                </div>
                {errors.Password && <p className="text-red-500 text-sm mt-1">{errors.Password}</p>}
              </div>





            </div>

            {/* Submit Button */}
            <button
              onClick={handleRegister}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 mt-6"
            >
              SIGN UP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
