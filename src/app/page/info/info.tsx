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

const calculateAcademicYear = (yearEntry: number | null) => {
  if (yearEntry === null) return 'ไม่ระบุ';
  const currentYear = new Date().getFullYear();
  const entryYear = yearEntry - 543; 
  const yearDifference = currentYear - entryYear;

  if (yearDifference === 0) return '1';
  if (yearDifference === 1) return '2';
  if (yearDifference === 2) return '3';
  if (yearDifference === 3) return '4';
  if (yearDifference === 4) return '5';

  return 'จบการศึกษาแล้ว'; 
};

export default function UserPage() {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); 
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
          setEditedData(studentResponse.data);
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

  const getGender = (prefixName: string) => {
    if (prefixName === "นาย") {
      return "ชาย";
    } else if (prefixName === "นาง" || prefixName === "นางสาว") {
      return "หญิง";
    } else {
      return "ไม่ระบุ";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveChanges = async () => {
    if (userData) {
      try {
        await ApiStudentServices.updateStudent(userData.StudentID, editedData);
        setUserData((prev) => ({
          ...prev!,
          ...editedData,
        }));
        setIsEditing(false);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล:", error);
      }
    }
  };

  const academicYear = calculateAcademicYear(parseInt(userData?.Year_Entry || "0", 10));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-5xl bg-white p-6 md:p-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 text-center">ข้อมูลนักศึกษา</h1>

          {userData ? (
            <div className="text-left">
              <table className="w-full text-base md:text-lg border-collapse">
                <tbody>
                  <tr>
                    <td className="border p-2 md:p-4 font-bold">รหัสนิสิต:</td>
                    <td className="border p-2 md:p-4">{userData.StudentID}</td>
                    <td className="border p-2 md:p-4 font-bold">ชื่อ-สกุล:</td>
                    <td className="border p-2 md:p-4">
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            name="FirstName"
                            value={editedData.FirstName || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              const regex = /^[A-Za-zก-๙\s]*$/;

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
                              const regex = /^[A-Za-zก-๙\s]*$/;

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
                    <td className="border p-2 md:p-4 font-bold">เพศ:</td>
                    <td className="border p-2 md:p-4">{getGender(userData.PrefixName)}</td>
                    <td className="border p-2 md:p-4 font-bold">หลักสูตร:</td>
                    <td className="border p-2 md:p-4">{userData.Course}</td>
                  </tr>
                  <tr>
                    <td className="border p-2 md:p-4 font-bold">GPA:</td>
                    <td className="border p-2 md:p-4">
                      {isEditing ? (
                        <input
                          type="text"
                          name="GPA"
                          value={editedData.GPA || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            const regex = /^\d*\.?\d{0,2}$/;

                            if (regex.test(value) && (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 4))) {
                              setEditedData((prev) => ({
                                ...prev,
                                GPA: value,
                              }));
                            }
                          }}
                          className="border rounded p-1"
                          inputMode="decimal"
                        />
                      ) : (
                        userData.GPA
                      )}
                    </td>
                    <td className="border p-2 md:p-4 font-bold">ชั้นปี:</td>
                    <td className="border p-2 md:p-4">{academicYear}</td>
                  </tr>
                  <tr>
                    <td className="border p-2 md:p-4 font-bold">สถานะนิสิต:</td>
                    <td className="border p-2 md:p-4 text-green-600">กำลังศึกษา</td>
                    <td className="border p-2 md:p-4 font-bold">ผลการเรียน:</td>
                    <td className="border p-2 md:p-4 text-green-600">ปกติ</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-6 flex justify-center md:justify-start">
                {isEditing ? (
                  <>
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                      onClick={saveChanges}
                    >
                      บันทึกการแก้ไข
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded"
                      onClick={() => setIsEditing(false)}
                    >
                      ยกเลิก
                    </button>
                  </>
                ) : (
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => setIsEditing(true)}
                  >
                    แก้ไข
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
