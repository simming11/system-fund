'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/app/components/header/Header';
import Footer from '@/app/components/footer/footer';
import ApiStudentServices from '@/app/services/students/ApiStudent';
import ApiServiceLocations from '@/app/services/location/apiLocations';

interface FormData {
  StudentID: string;
  TypeID: string;
  ScholarshipID: string;
  ApplicationDate: string;
  Status: string;
  Attachment: string;
  Major: string;
  GPA: number | string;
  DOB: string;
  CurrentVillage: string;
  CurrentProvince: string;
  CurrentDistrict: string;
  CurrentSubdistrict: string;
  CurrentPostalCode: string;
  HometownVillage: string;
  HometownProvince: string;
  HometownDistrict: string;
  HometownSubdistrict: string;
  HometownPostalCode: string;
  CurrentAddress: string;
  HometownAddress: string;
  PhoneNumber: string;
  Email: string;
  Religion: string;
  MonthlyIncome: number | string;
  MonthlyExpenses: number | string;
  ProfilePicture: string;
  FatherName: string;
  FatherAge: number | string;
  FatherStatus: string;
  FatherAddress: string;
  FatherOccupation: string;
  FatherIncome: number | string;
  MotherName: string;
  MotherAge: number | string;
  MotherStatus: string;
  MotherAddress: string;
  MotherOccupation: string;
  MotherIncome: number | string;
  GuardianName: string;
  GuardianAge: number | string;
  GuardianRelationship: string;
  GuardianAddress: string;
  GuardianOccupation: string;
  GuardianIncome: number | string;
  FamilyStatus: string;
  SiblingsCount: number | string;
  SiblingsNames: string;
  PrimaryEducationHistory: string;
  PrimaryGPA: number | string;
  SecondaryEducationHistory: string;
  ScholarshipHistory: string;
  WorkHistory: string;
  updated_at: string;
  created_at: string;
  ApplicationID: number | string;
  FirstName: string;
  LastName: string;
  YearLevel: string;
  PrefixName:string;
}

export default function CreateApplicationInternalPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('scholarshipId');
  const idStudent = localStorage.getItem('UserID');
  const token = localStorage.getItem('token');
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    StudentID: idStudent || '',
    ScholarshipID: id || '',
    TypeID: '',
    ApplicationDate: '',
    Status: 'รออนุมัติ',
    Attachment: '',
    Major: '',
    GPA: '',
    DOB: '',
    PrefixName: '',
    CurrentAddress: '',
    HometownAddress: '',
    CurrentVillage: '',
    CurrentProvince: '',
    CurrentDistrict: '',
    CurrentSubdistrict: '',
    CurrentPostalCode: '',
    HometownVillage: '',
    HometownProvince: '',
    HometownDistrict: '',
    HometownSubdistrict: '',
    HometownPostalCode: '',
    PhoneNumber: '',
    Email: '',
    Religion: '',
    MonthlyIncome: '',
    MonthlyExpenses: '',
    ProfilePicture: '',
    FatherName: '',
    FatherAge: '',
    FatherStatus: '',
    FatherAddress: '',
    FatherOccupation: '',
    FatherIncome: '',
    MotherName: '',
    MotherAge: '',
    MotherStatus: '',
    MotherAddress: '',
    MotherOccupation: '',
    MotherIncome: '',
    GuardianName: '',
    GuardianAge: '',
    GuardianRelationship: '',
    GuardianAddress: '',
    GuardianOccupation: '',
    GuardianIncome: '',
    FamilyStatus: '',
    SiblingsCount: '',
    SiblingsNames: '',
    PrimaryEducationHistory: '',
    PrimaryGPA: '',
    SecondaryEducationHistory: '',
    ScholarshipHistory: '',
    WorkHistory: '',
    updated_at: '',
    created_at: '',
    ApplicationID: '',
    FirstName: '',
    LastName: '',
    YearLevel: ''
  });

  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState<any>(null); // State to store fetched student data
  const [provinces, setProvinces] = useState<string[]>([]);
  const [districts, setDistricts] = useState<{ id: number, name: string }[]>([]);
  const [Subdistricts, setSubdistricts] = useState<{ id: number, name: string }[]>([]);

  useEffect(() => {
    if (!token) {
      router.push('/page/login');
    }

    if (idStudent) {
      const fetchStudentData = async () => {
        try {
          const studentResponse = await ApiStudentServices.getStudent(Number(idStudent));
          setUserData(studentResponse.data);
          setFormData({
            ...formData,
            StudentID: studentResponse.data.id,
            FirstName: studentResponse.data.FirstName,
            LastName: studentResponse.data.LastName,
            Major: studentResponse.data.Major,
            PhoneNumber: studentResponse.data.phoneNumber,
            DOB: studentResponse.data.dob,
            CurrentAddress: studentResponse.data.currentAddress,
            HometownAddress: studentResponse.data.hometownAddress,
            Email: studentResponse.data.email,
            Religion: studentResponse.data.religion,
            YearLevel: studentResponse.data.YearLevel
          });
        } catch (error) {
          console.error('Error fetching student data:', error);
        }
      };
      fetchStudentData();
    }
  }, [token, idStudent, router]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await ApiServiceLocations.getSouthernLocations();
        const provinceNames = response.data.map((province: any) => province.name);
        setProvinces(provinceNames);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    };

    fetchProvinces();
  }, []);

  useEffect(() => {
    if (formData.CurrentProvince) {
      const fetchDistricts = async () => {
        try {
          const response = await ApiServiceLocations.getDistricts(formData.CurrentProvince);

          // ตรวจสอบว่า response มีข้อมูลที่ถูกต้อง
          if (response.data && Array.isArray(response.data)) {
            const districtNames = response.data.map((district: { id: number, name: string }) => ({
              id: district.id,
              name: district.name
            }));
            setDistricts(districtNames);
          } else {
            setDistricts([]);  // หากไม่มีข้อมูลให้ตั้งค่า state ว่างเปล่า
          }

          console.log(response.data, "sd");
        } catch (error) {
          console.error('Error fetching districts:', error);
          setDistricts([]);  // ในกรณีที่เกิดข้อผิดพลาด ให้ตั้งค่า state ว่างเปล่า
        }
      };

      fetchDistricts();
    } else {
      setDistricts([]);  // หากไม่มี province ที่ถูกเลือก ให้ตั้งค่า state ว่างเปล่า
    }
  }, [formData.CurrentProvince]);
  useEffect(() => {
    if (formData.CurrentDistrict) {
      const fetchSubdistricts = async () => {
        try {
          const response = await ApiServiceLocations.getSubdistricts(formData.CurrentDistrict);
          const subdistrictNames = response.data.map((subdistrict: { id: number, name: string }) => ({
            id: subdistrict.id,
            name: subdistrict.name,
          }));
          setSubdistricts(subdistrictNames);
          console.log(response.data, "subdistricts");
        } catch (error) {
          console.error('Error fetching subdistricts:', error);
        }
      };

      fetchSubdistricts();
    }
  }, [formData.CurrentDistrict]);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    console.log(value);

  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // await ApiApplicationWithAttachmentService.createApplication(formData);
      router.push('/page/application');
    } catch (error) {
      setError('Error creating application. Please check the form fields and try again.');
      console.error('Error creating application:', error);
    }
  };

  const searchZipcode = async (zipcode: string) => {
    try {
      const response = await fetch(`https://app.zipcodebase.com/api/v1/search?codes=${zipcode}&country=th&apikey=8fbb1a70-4ef0-11ef-92d7-590d9a107028`);
      const data = await response.json();
      if (data.results && data.results[zipcode]) {
        const addressDetails = data.results[zipcode][0];
        setFormData({
          ...formData,
          CurrentAddress: addressDetails.city + ', ' + addressDetails.state
        });
      } else {
        setError('Zipcode not found.');
      }
    } catch (error) {
      console.error('Error fetching zipcode:', error);
      setError('Error fetching zipcode. Please try again.');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="FirstName" className="block text-gray-700 mb-2">ชื่อ</label>
                <input
                  type="text"
                  id="FirstName"
                  name="FirstName"
                  value={formData.FirstName}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label htmlFor="LastName" className="block text-gray-700 mb-2">นามสกุล</label>
                <input
                  type="text"
                  id="LastName"
                  name="LastName"
                  value={formData.LastName}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label htmlFor="StudentID" className="block text-gray-700 mb-2">รหัสนิสิต</label>
                <input
                  type="text"
                  id="StudentID"
                  name="StudentID"
                  value={formData.StudentID}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label htmlFor="Major" className="block text-gray-700 mb-2">สาขาวิชา</label>
                <input
                  type="text"
                  id="Major"
                  name="Major"
                  value={formData.Major}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label htmlFor="YearLevel" className="block text-gray-700 mb-2">ชั้นปี</label>
                <input
                  type="number"
                  id="YearLevel"
                  name="YearLevel"
                  value={formData.YearLevel}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label htmlFor="PhoneNumber" className="block text-gray-700 mb-2">เบอร์โทร</label>
                <input
                  type="text"
                  id="PhoneNumber"
                  name="PhoneNumber"
                  value={formData.PhoneNumber}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label htmlFor="DOB" className="block text-gray-700 mb-2">วันเดือนปีเกิด</label>
                <input
                  type="date"
                  id="DOB"
                  name="DOB"
                  value={formData.DOB}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label htmlFor="Religion" className="block text-gray-700 mb-2">ศาสนา</label>
                <input
                  type="text"
                  id="Religion"
                  name="Religion"
                  value={formData.Religion}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label htmlFor="CurrentVillage" className="block text-gray-700 mb-2">หมู่บ้านปัจจุบัน</label>
                <input
                  type="text"
                  id="CurrentVillage"
                  name="CurrentVillage"
                  value={formData.CurrentVillage}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label htmlFor="CurrentProvince" className="block text-gray-700 mb-2">จังหวัดปัจจุบัน</label>
                <select
                  id="CurrentProvince"
                  name="CurrentProvince"
                  value={formData.CurrentProvince}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded"
                >
                  <option value="">เลือกจังหวัด</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="CurrentDistrict" className="block text-gray-700 mb-2">อำเภอปัจจุบัน</label>
                <select
                  id="CurrentDistrict"
                  name="CurrentDistrict"
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded"
                >
                  <option value="">เลือกอำเภอ</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.name}>
                      {district.name}
                    </option>
                  ))}
                </select>

              </div>
              <div>
                <label htmlFor="CurrentSubdistrict" className="block text-gray-700 mb-2">ตำบลปัจจุบัน</label>
                <select
                  id="CurrentSubdistrict"
                  name="CurrentSubdistrict"
                  value={formData.CurrentSubdistrict}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded"
                >
                  <option value="">เลือกตำบล</option>
                  {Subdistricts.map((subdistrict) => (
                    <option key={subdistrict.id} value={subdistrict.name}>
                      {subdistrict.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="CurrentPostalCode" className="block text-gray-700 mb-2">รหัสไปรษณีย์ปัจจุบัน</label>
                <input
                  type="text"
                  id="CurrentPostalCode"
                  name="CurrentPostalCode"
                  value={formData.CurrentPostalCode}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <div className="mb-4">
              <label htmlFor="FatherName" className="block text-gray-700 mb-2">ชื่อพ่อ</label>
              <input
                type="text"
                id="FatherName"
                name="FatherName"
                value={formData.FatherName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="FatherAge" className="block text-gray-700 mb-2">อายุพ่อ</label>
              <input
                type="number"
                id="FatherAge"
                name="FatherAge"
                value={formData.FatherAge}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="FatherStatus" className="block text-gray-700 mb-2">สถานะพ่อ</label>
              <input
                type="text"
                id="FatherStatus"
                name="FatherStatus"
                value={formData.FatherStatus}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <div className="mb-4">
              <label htmlFor="GPA" className="block text-gray-700 mb-2">เกรดเฉลี่ย</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                id="GPA"
                name="GPA"
                value={formData.GPA}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="PrimaryEducationHistory" className="block text-gray-700 mb-2">ประวัติการศึกษาระดับประถม</label>
              <input
                type="text"
                id="PrimaryEducationHistory"
                name="PrimaryEducationHistory"
                value={formData.PrimaryEducationHistory}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="PrimaryGPA" className="block text-gray-700 mb-2">เกรดเฉลี่ยระดับประถม</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                id="PrimaryGPA"
                name="PrimaryGPA"
                value={formData.PrimaryGPA}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded"
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <div className="mb-4">
              <label htmlFor="ScholarshipHistory" className="block text-gray-700 mb-2">ประวัติทุนการศึกษา</label>
              <textarea
                id="ScholarshipHistory"
                name="ScholarshipHistory"
                value={formData.ScholarshipHistory}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="WorkHistory" className="block text-gray-700 mb-2">ประวัติการทำงาน</label>
              <textarea
                id="WorkHistory"
                name="WorkHistory"
                value={formData.WorkHistory}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded"
              />
            </div>
          </div>
        );
      case 5:
        return (
          <div>
            <div className="mb-4">
              <label htmlFor="Attachment" className="block text-gray-700 mb-2">ไฟล์แนบ</label>
              <input
                type="file"
                id="Attachment"
                name="Attachment"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFormData({ ...formData, Attachment: file.name });
                  }
                }}
                className="w-full p-3 border border-gray-300 rounded"
              />
            </div>
          </div>
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-center mb-6">
            <div className={`flex items-center ${step === 1 ? 'text-blue-600' : 'text-gray-500'}`}>
              <span className={`rounded-full w-10 h-10 flex items-center justify-center border ${step === 1 ? 'border-blue-600' : 'border-gray-500'}`}>1</span>
              <span className="ml-2 hidden sm:inline">ประวัติส่วนตัว</span>
            </div>
            <div className={`flex items-center ml-4 sm:ml-8 ${step === 2 ? 'text-blue-600' : 'text-gray-500'}`}>
              <span className={`rounded-full w-10 h-10 flex items-center justify-center border ${step === 2 ? 'border-blue-600' : 'border-gray-500'}`}>2</span>
              <span className="ml-2 hidden sm:inline">ประวัติครอบครัว</span>
            </div>
            <div className={`flex items-center ml-4 sm:ml-8 ${step === 3 ? 'text-blue-600' : 'text-gray-500'}`}>
              <span className={`rounded-full w-10 h-10 flex items-center justify-center border ${step === 3 ? 'border-blue-600' : 'border-gray-500'}`}>3</span>
              <span className="ml-2 hidden sm:inline">ประวัติการศึกษา</span>
            </div>
            <div className={`flex items-center ml-4 sm:ml-8 ${step === 4 ? 'text-blue-600' : 'text-gray-500'}`}>
              <span className={`rounded-full w-10 h-10 flex items-center justify-center border ${step === 4 ? 'border-blue-600' : 'border-gray-500'}`}>4</span>
              <span className="ml-2 hidden sm:inline">ประวัติการรับทุนศึกษา</span>
            </div>
            <div className={`flex items-center ml-4 sm:ml-8 ${step === 5 ? 'text-blue-600' : 'text-gray-500'}`}>
              <span className={`rounded-full w-10 h-10 flex items-center justify-center border ${step === 5 ? 'border-blue-600' : 'border-gray-500'}`}>5</span>
              <span className="ml-2 hidden sm:inline">อัพโหลดเอกสาร</span>
            </div>
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            {renderStep()}
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => setStep(step > 1 ? step - 1 : step)}
                className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${step === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={step === 1}  // ปิดการใช้งานปุ่ม "Next" เมื่อถึงขั้นตอนที่ 5
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setStep(step < 5 ? step + 1 : step)}
                className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${step === 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={step === 5}  // ปิดการใช้งานปุ่ม "Next" เมื่อถึงขั้นตอนที่ 5
              >
                Next
              </button>
            </div>
            {step === 5 && (
              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Submit
                </button>
              </div>
            )}
          </form>

        </div>
      </div>
      <Footer />
    </div>
  );
}
