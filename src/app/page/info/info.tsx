"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/app/components/footer/footer';
import Header from '@/app/components/header/Header';
import ApiStudentServices from '@/app/services/students/ApiStudent';

interface User {
  StudentID: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone: string;
  PrefixName: string;
  DOB: string;
  Religion: string;
  Course: string;
  GPA: string;
  Year_Entry: string;
}

// ฟังก์ชันคำนวณชั้นปีจากปีที่เข้าศึกษา
const calculateAcademicYear = (yearEntry: number | null) => {
  if (yearEntry === null) return 'ไม่ระบุ';
  const currentYear = new Date().getFullYear();
  const entryYear = yearEntry - 543; // แปลงจากปีพุทธศักราชเป็นปีคริสตศักราช
  const yearDifference = currentYear - entryYear;

  if (yearDifference === 0) return '1';
  if (yearDifference === 1) return '2';
  if (yearDifference === 2) return '3';
  if (yearDifference === 3) return '4';
  if (yearDifference === 4) return '5';

  return 'จบการศึกษาแล้ว'; // สำหรับปีที่มากกว่า 5 ปี
};

export default function UserPage() {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // สถานะสำหรับการแก้ไข
  const [editedData, setEditedData] = useState<Partial<User>>({});
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/page/login');
        return;
      }

      const StudentID = localStorage.getItem('UserID');

      if (StudentID) {
        try {
          const studentResponse = await ApiStudentServices.getStudent(StudentID);
          setUserData(studentResponse.data);
          setEditedData(studentResponse.data); // ตั้งค่า editedData ด้วยข้อมูลปัจจุบันของ user
        } catch (error) {
          console.error('เกิดข้อผิดพลาดในการดึงข้อมูล', error);
          router.push('/page/login');
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="loader"></div>
        <p className="ml-4 text-lg text-gray-600">กำลังโหลด...</p>
      </div>
    );
  }

  // ฟังก์ชันกำหนดเพศจากคำนำหน้าชื่อ
  const getGender = (prefixName: string) => {
    if (prefixName === "นาย") {
      return "ชาย";
    } else if (prefixName === "นาง" || prefixName === "นางสาว") {
      return "หญิง";
    } else {
      return "ไม่ระบุ"; // หากไม่ตรงกับคำนำหน้าที่รู้จัก
    }
  };

  // ฟังก์ชันจัดการการเปลี่ยนแปลงข้อมูล
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ฟังก์ชันบันทึกการเปลี่ยนแปลง
  const saveChanges = async () => {
    if (userData) {
      try {
        await ApiStudentServices.updateStudent(userData.StudentID, editedData);
        setUserData((prev) => ({
          ...prev!,
          ...editedData,
        }));
        setIsEditing(false); // ปิดโหมดแก้ไขหลังจากบันทึก
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล:", error);
      }
    }
  };

  // คำนวณชั้นปีจาก Year_Entry
  const academicYear = calculateAcademicYear(parseInt(userData?.Year_Entry || "0", 10));

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-7xl bg-white p-10">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-10 text-center">ข้อมูลนักศึกษา</h1>

          {userData ? (
            <div className="text-left">
              <table className="w-full text-lg border-collapse">
                <tbody>
                  <tr>
                    <td className="border p-4 font-bold text-xl">รหัสนิสิต:</td>
                    <td className="border p-4 text-xl">{userData.StudentID}</td>
                    <td className="border p-4 font-bold text-xl">ชื่อ-สกุล:</td>
                    <td className="border p-4 text-xl">
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            name="FirstName"
                            value={editedData.FirstName || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              const regex = /^[A-Za-zก-๙\s]*$/; // อนุญาตเฉพาะตัวอักษรภาษาไทยและอังกฤษและช่องว่าง

                              if (regex.test(value)) {
                                setEditedData((prev) => ({
                                  ...prev,
                                  FirstName: value,
                                }));
                              }
                            }}
                            className="border rounded p-1 mr-2"
                          />

                          <input
                            type="text"
                            name="LastName"
                            value={editedData.LastName || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              const regex = /^[A-Za-zก-๙\s]*$/; // อนุญาตเฉพาะตัวอักษรภาษาไทยและอังกฤษและช่องว่าง

                              if (regex.test(value)) {
                                setEditedData((prev) => ({
                                  ...prev,
                                  LastName: value,
                                }));
                              }
                            }}
                            className="border rounded p-1"
                          />
                        </>
                      ) : (
                        `${userData.PrefixName} ${userData.FirstName} ${userData.LastName}`
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-4 font-bold text-xl">เพศ:</td>
                    <td className="border p-4 text-xl">{getGender(userData.PrefixName)}</td>
                    <td className="border p-4 font-bold text-xl">หลักสูตร:</td>
                    <td className="border p-4 text-xl">{userData.Course}</td>
                  </tr>
                  <tr>
                    <td className="border p-4 font-bold text-xl">GPA:</td>
                    <td className="border p-4 text-xl">
                      {isEditing ? (
                        <input
                          type="text"
                          name="GPA"
                          value={editedData.GPA || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            const regex = /^\d*\.?\d{0,2}$/; // อนุญาตตัวเลขทศนิยมไม่เกิน 2 ตำแหน่ง

                            // ตรวจสอบว่าค่าที่กรอกถูกต้องและอยู่ในช่วง 0.00 - 4.00
                            if (regex.test(value) && (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 4))) {
                              setEditedData((prev) => ({
                                ...prev,
                                GPA: value,
                              }));
                            }
                          }}
                          className="border rounded p-1"
                          inputMode="decimal" // ให้แสดงคีย์บอร์ดตัวเลขในมือถือ
                        />
                      ) : (
                        userData.GPA
                      )}
                    </td>
                    <td className="border p-4 font-bold text-xl">ชั้นปี:</td>
                    <td className="border p-4 text-xl">{academicYear}</td> {/* คำนวณชั้นปี */}
                  </tr>
                  <tr>
                    <td className="border p-4 font-bold text-xl">สถานะนิสิต:</td>
                    <td className="border p-4 text-green-600 text-xl">กำลังศึกษา</td>
                    <td className="border p-4 font-bold text-xl">ผลการเรียน:</td>
                    <td className="border p-4 text-green-600 text-xl">ปกติ</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-6">
                {isEditing ? (
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                    onClick={saveChanges}
                  >
                    บันทึกการแก้ไข
                  </button>
                ) : (
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => setIsEditing(true)}
                  >
                    แก้ไข
                  </button>
                )}
                {isEditing && (
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded"
                    onClick={() => setIsEditing(false)}
                  >
                    ยกเลิก
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xl text-center text-gray-500">ไม่มีข้อมูลนักศึกษา</p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
