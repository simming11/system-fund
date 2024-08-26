'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderHome from "@/app/components/headerHome/headerHome";
import AdminHeader from "@/app/components/headerAdmin/headerAdmin";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import Footer from "@/app/components/footer/footer";
import Swal from "sweetalert2";
import ApiAllcreateServiceScholarships from "@/app/services/scholarships/createScholarship";

export default function CreateExternalScholarshipPage() {
  const router = useRouter();

  const [formData, setFormData] = useState(() => {
    const savedFormData = sessionStorage.getItem(' createExternalScholarshipForm');
    return savedFormData
      ? JSON.parse(savedFormData)
      : {
        ScholarshipName: "",
        Year: "",
        Num_scholarship: "",
        Minimum_GPA: "",
        TypeID: "2",
        YearLevel: "",
        StartDate: "",
        EndDate: "",
        otherQualificationText: "",  // Initialize as an empty string
        otherDocument: "",           // Initialize as an empty string
        CreatedBy: localStorage.getItem('AcademicID') || '',
        Major: [] as string[],  // Initialize as an empty array
        Description: [] as string[],  // Initialize as an empty array
        information: [] as string[],  // Initialize as an empty array
        Files: [] as File[],  // Initialize as an empty array
        Image:[] as File[],  // Initialize Image as null
      };
  });

  const [fileInputs, setFileInputs] = useState([0]);
  const [showDescriptionOtherInput, setShowDescriptionOtherInput] = useState(false);
  const [showinformationOtherInput, setShowinformationOtherInput] = useState(false);
  const [error, setError] = useState("");

  const [showSection, setShowSection] = useState({
    scholarshipInfo: true,
    additionalInfo: true,
    files: true,
  });

  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     const token = localStorage.getItem('token');
  //     const Role = localStorage.getItem('UserRole');

  //     if (!token || Role?.trim().toLowerCase() !== 'admin') {
  //       console.error('Unauthorized access or missing token. Redirecting to login.');
  //       router.push('/page/control');
  //     }
  //   }
  // }, [router]);


  useEffect(() => {
    sessionStorage.setItem('createInternalScholarshipForm', JSON.stringify(formData));
  }, [formData]);

  const handleArrayChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    arrayName: string,
    otherInputSetter?: React.Dispatch<React.SetStateAction<string>>,
    showOtherInputSetter?: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    const { value, checked } = e.target;
    let updatedArray = formData[arrayName as keyof typeof formData] as string[];

    // หากช่องที่ติ๊กคือ "อื่น ๆ"
    if (value === "อื่น ๆ") {
      if (checked) {
        showOtherInputSetter && showOtherInputSetter(true);
        if (!updatedArray.includes(value)) {
          updatedArray.push(value);
        }
      } else {
        showOtherInputSetter && showOtherInputSetter(false);
        otherInputSetter && otherInputSetter(""); // Clear the other description
        updatedArray = updatedArray.filter(item => item !== value);
        console.log(checked, value);
      }
    } else { // กรณีช่องอื่นๆ ที่ไม่ใช่ "อื่น ๆ"
      if (checked) {
        updatedArray.push(value);
      } else {
        updatedArray = updatedArray.filter(item => item !== value);
      }

    }

    setFormData({
      ...formData,
      [arrayName]: updatedArray,
    });
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files) {
      const newFiles = [...formData.Files];
      newFiles[index] = e.target.files[0];
      setFormData({
        ...formData,
        Files: newFiles,
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const imageFile = e.target.files[0];
        setFormData((prevFormData: any) => ({
            ...prevFormData,
            Image: imageFile,  // เก็บไฟล์รูปภาพโดยตรงใน formData ไม่ใช่ในรูปแบบ array
        }));
    }
};




  const handleAddFileInput = () => {
    setFileInputs([...fileInputs, fileInputs.length]);
  };

  const handleRemoveFileInput = (index: number) => {
    const newFileInputs = fileInputs.filter((_, i) => i !== index);
    const newFiles = formData.Files.filter((_: any, i: number) => i !== index);
    setFileInputs(newFileInputs);
    setFormData({
      ...formData,
      Files: newFiles,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // ตรวจสอบฟิลด์ที่จำเป็นต้องกรอกทีละอัน
    if (!formData.ScholarshipName) {
        setError("กรุณากรอกข้อมูลในฟิลด์ ชื่อทุนการศึกษา");
        return;
    }

    if (formData.Major.length === 0) {
        setError("กรุณาเลือกอย่างน้อยหนึ่งสาขาวิชา");
        return;
    }

    if (!formData.Year) {
        setError("กรุณากรอกข้อมูลในฟิลด์ ปีการศึกษา");
        return;
    }

    if (!formData.YearLevel) {
        setError("กรุณากรอกข้อมูลในฟิลด์ ชั้นปี");
        return;
    }

    if (!formData.Num_scholarship) {
        setError("กรุณากรอกข้อมูลในฟิลด์ จำนวนทุน");
        return;
    }

    if (!formData.Minimum_GPA) {
        setError("กรุณากรอกข้อมูลในฟิลด์ เกรดเฉลี่ยขั้นต่ำ");
        return;
    }

    if (formData.Description.length === 0 && !formData.otherQualificationText) {
        setError("กรุณาเพิ่มคุณสมบัติอย่างน้อยหนึ่งรายการ");
        return;
    }

    if (formData.information.length === 0 && !formData.otherDocument) {
        setError("กรุณาเพิ่มเอกสารประกอบการสมัครอย่างน้อยหนึ่งรายการ");
        return;
    }

        // ตรวจสอบการอัปโหลดรูปภาพ
        if (!formData.Image) {
            setError("กรุณาอัปโหลดรูปภาพประกอบการสมัคร");
            return;
        }
    
        // ตรวจสอบการอัปโหลดไฟล์
        if (formData.Files.length === 0) {
            setError("กรุณาอัปโหลดไฟล์ประกอบการสมัครอย่างน้อยหนึ่งไฟล์");
            return;
        }

    if (!formData.StartDate) {
        setError("กรุณากรอกข้อมูลในฟิลด์ วันที่เริ่ม");
        return;
    }

    if (!formData.EndDate) {
        setError("กรุณากรอกข้อมูลในฟิลด์ วันที่สิ้นสุด");
        return;
    }



    // Prepare the form data, ensuring to exclude 'อื่น ๆ' and include otherDocument
    const submitFormData = {
        ...formData,
        information: formData.information.filter((item: string) => item !== "อื่น ๆ"),
        Description: formData.Description.filter((item: string) => item !== "อื่น ๆ"),
    };

    console.log("Form data after processing:", submitFormData);

    try {
        const payload = new FormData();
        for (const [key, value] of Object.entries(submitFormData)) {
            if (Array.isArray(value)) {
                value.forEach((item: string) => {
                    payload.append(`${key}[]`, item);
                    console.log(`Appending array item to payload: key=${key}[], value=${item}`);
                });
            } else {
                payload.append(key, value as string | Blob);
                console.log(`Appending to payload: key=${key}, value=${value}`);
            }
        }

        // Create Scholarship
        console.log("Payload before scholarship creation:", payload);
        const scholarshipID = await ApiAllcreateServiceScholarships.createScholarship(payload);
        console.log("Scholarship created with ID:", scholarshipID);

        // Create Courses
        if (formData.Major.length > 0) {
            console.log("Creating courses for majors:", formData.Major);
            await ApiAllcreateServiceScholarships.createCourses({
                ScholarshipID: scholarshipID,
                CourseName: formData.Major,
            });
            console.log("Courses created successfully.");
        }

        // Create Documents
        if (submitFormData.information.length > 0 || formData.otherDocument) {
            console.log("Creating documents with information:", submitFormData.information);
            await ApiAllcreateServiceScholarships.createDocuments({
                ScholarshipID: scholarshipID,
                documents: submitFormData.information,
                otherDocument: formData.otherDocument
            });
            console.log("Documents created successfully.");
        }

        // Create Qualifications
        if (submitFormData.Description.length > 0) {
            console.log("Creating qualifications with descriptions:", submitFormData.Description);
            await ApiAllcreateServiceScholarships.createQualifications({
                ScholarshipID: scholarshipID,
                qualifications: submitFormData.Description,
                otherQualificationText: submitFormData.otherQualificationText
            });
            console.log("Qualifications created successfully.");
        }

        if (formData.Image) {
            // Upload the image file
            console.log("Uploading image:", formData.Image);
            await ApiAllcreateServiceScholarships.createImage({
                ScholarshipID: scholarshipID,
                ImagePath: formData.Image,
            });
            console.log("Image uploaded successfully:", formData.Image.name);
        }

        // Upload other files
        for (const file of formData.Files) {
            if (file) {
                console.log("Uploading file:", file);
                await ApiAllcreateServiceScholarships.createFile({
                    ScholarshipID: scholarshipID,
                    FileType: "ไฟล์",
                    FilePath: file,
                });
                console.log("File uploaded successfully:", file.name);
            }
        }

        // Success message
        Swal.fire({
            title: "Good job!",
            text: "Scholarship created successfully!",
            icon: "success"
        });

        // Clear session storage and redirect
        console.log("Clearing session storage and redirecting...");
        sessionStorage.clear();
        router.push("/page/scholarships/Manage-external-scholarships");

    } catch (error) {
        // Set error message and log the error for debugging
        setError("Failed to create scholarship. Please try again.");
        console.error("Error creating scholarship:", error);
    }
};




  const toggleSection = (section: keyof typeof showSection) => {
    setShowSection((prevShowSection) => ({
      ...prevShowSection,
      [section]: !prevShowSection[section],
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <HeaderHome />
      <AdminHeader />
      <div className="flex flex-row">
        <div className="bg-white w-1/8 p-4">
          <Sidebar />
        </div>
        <div className="bg-white shadow-md flex-1 w-1/8">
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">สร้างประกาศทุนภายนอก</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2 cursor-pointer" onClick={() => toggleSection("scholarshipInfo")}>
                  ข้อมูลทุนการศึกษา
                  <span>{showSection.scholarshipInfo ? "-" : "+"}</span>
                </h3>
                {showSection.scholarshipInfo && (
                  <>
                    <div className="mb-4">
                      <label htmlFor="ScholarshipName" className="block text-gray-700 mb-2">ชื่อทุนการศึกษา</label>
                      <input
                        type="text"
                        id="ScholarshipName"
                        name="ScholarshipName"
                        value={formData.ScholarshipName}
                        onChange={handleChange}
                        className="w-5/6 p-3 border border-gray-300 rounded"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">สาขาวิชา</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <input
                            type="checkbox"
                            id="math"
                            value="คณิตศาสตร์และการจัดการข้อมูล"
                            checked={formData.Major.includes("คณิตศาสตร์และการจัดการข้อมูล")}
                            onChange={(e) => handleArrayChange(e, "Major")}
                            className="mr-2"
                          />
                          <label htmlFor="math">คณิตศาสตร์และการจัดการข้อมูล</label>
                        </div>

                        <div>
                          <input
                            type="checkbox"
                            id="cs"
                            value="วิทยาการคอมพิวเตอร์และสารสนเทศ"
                            checked={formData.Major.includes("วิทยาการคอมพิวเตอร์และสารสนเทศ")}
                            onChange={(e) => handleArrayChange(e, "Major")}
                            className="mr-2"
                          />
                          <label htmlFor="cs">วิทยาการคอมพิวเตอร์และสารสนเทศ</label>
                        </div>

                        <div>
                          <input
                            type="checkbox"
                            id="env_sci"
                            value="วิทยาศาสตร์สิ่งแวดล้อม"
                            checked={formData.Major.includes("วิทยาศาสตร์สิ่งแวดล้อม")}
                            onChange={(e) => handleArrayChange(e, "Major")}
                            className="mr-2"
                          />
                          <label htmlFor="env_sci">วิทยาศาสตร์สิ่งแวดล้อม</label>
                        </div>

                        <div>
                          <input
                            type="checkbox"
                            id="chem"
                            value="เคมี"
                            checked={formData.Major.includes("เคมี")}
                            onChange={(e) => handleArrayChange(e, "Major")}
                            className="mr-2"
                          />
                          <label htmlFor="chem">เคมี</label>
                        </div>

                        <div>
                          <input
                            type="checkbox"
                            id="fish"
                            value="วิทยาศาสตร์การประมงและทรัพยากรทางน้ำ"
                            checked={formData.Major.includes("วิทยาศาสตร์การประมงและทรัพยากรทางน้ำ")}
                            onChange={(e) => handleArrayChange(e, "Major")}
                            className="mr-2"
                          />
                          <label htmlFor="fish">วิทยาศาสตร์การประมงและทรัพยากรทางน้ำ</label>
                        </div>

                        <div>
                          <input
                            type="checkbox"
                            id="bio"
                            value="ชีววิทยาศาสตร์"
                            checked={formData.Major.includes("ชีววิทยาศาสตร์")}
                            onChange={(e) => handleArrayChange(e, "Major")}
                            className="mr-2"
                          />
                          <label htmlFor="bio">ชีววิทยาศาสตร์</label>
                        </div>

                        <div>
                          <input
                            type="checkbox"
                            id="phy"
                            value="ฟิสิกส์วัสดุและนาโนเทคโนโลยี"
                            checked={formData.Major.includes("ฟิสิกส์วัสดุและนาโนเทคโนโลยี")}
                            onChange={(e) => handleArrayChange(e, "Major")}
                            className="mr-2"
                          />
                          <label htmlFor="phy">ฟิสิกส์วัสดุและนาโนเทคโนโลยี</label>
                        </div>

                      </div>
                    </div>

                    <div className="flex ...">

                      <div className="w-1/2 ...">
                        <div className="mb-4">
                          <label htmlFor="Year" className="block text-gray-700 mb-2">ปีการศึกษา</label>
                          <select
                            id="Year"
                            name="Year"
                            value={formData.Year}
                            onChange={handleChange}
                            className="w-2/5 p-3 border border-gray-300 rounded"
                          >
                            <option value="" disabled>เลือกปีการศึกษา</option>
                            <option value="2563">2563</option>
                            <option value="2564">2564</option>
                            <option value="2565">2565</option>
                            <option value="2566">2566</option>
                            <option value="2567">2567</option>
                            <option value="2568">2568</option>
                            <option value="2569">2569</option>
                            <option value="2570">2570</option>
                            <option value="2571">2571</option>
                            <option value="2572">2572</option>
                            <option value="2573">2573</option>
                            <option value="2574">2574</option>
                            <option value="2575">2575</option>
                            <option value="2576">2576</option>
                            <option value="2577">2577</option>
                            <option value="2578">2578</option>
                            <option value="2579">2579</option>
                            <option value="2580">2580</option>


                          </select>

                        </div>
                      </div>
                      <div className="w-1/2 ...">
                        <div className="mb-4">
                          <label htmlFor="YearLevel" className="block text-gray-700 mb-2">ชั้นปี</label>
                          <select
                            id="YearLevel"
                            name="YearLevel"
                            value={formData.YearLevel}
                            onChange={handleChange}
                            className="w-2/5 p-3 border border-gray-300 rounded"
                          >
                            <option value="" disabled>เลือกชั้นปี</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="1-2">1-2</option>
                            <option value="1-3">1-3</option>
                            <option value="1-4">1-4</option>
                            <option value="2-3">2-3</option>
                            <option value="3-4">3-4</option>
                          </select>

                        </div>
                      </div>
                      <div className="w-1/2 ...">
                        <div className="mb-4">
                          <label htmlFor="Num_scholarship" className="block text-gray-700 mb-2">จำนวนทุน</label>
                          <input
                            type="number"
                            id="Num_scholarship"
                            name="Num_scholarship"
                            value={formData.Num_scholarship}
                            onChange={handleChange}
                            className="w-1/5 p-3 border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                      <div className="w-1/2 ...">
                        <div className="mb-4">
                          <label htmlFor="Minimum_GPA" className="block text-gray-700 mb-2">เกรดเฉลี่ย</label>
                          <input
                            type="number"
                            id="Minimum_GPA"
                            name="Minimum_GPA"
                            value={formData.Minimum_GPA}
                            onChange={handleChange}
                            className="w-1/5 p-3 border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">คุณสมบัติ</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <input
                            type="checkbox"
                            id="undergraduate"
                            value="กำลังศึกษาอยู่ในระดับปริญญาตรี"
                            checked={formData.Description.includes("กำลังศึกษาอยู่ในระดับปริญญาตรี")}
                            onChange={(e) => handleArrayChange(e, "Description", setFormData, setShowDescriptionOtherInput)}
                            className="mr-2"
                          />
                          <label htmlFor="undergraduate">กำลังศึกษาอยู่ในระดับปริญญาตรี</label>
                        </div>

                        <div>
                          <input
                            type="checkbox"
                            id="no_other_scholarships"
                            value="ไม่ได้รับทุนการศึกษาจากหน่วยงานหรือองค์กรอื่นใดยกเว้น  (กยศ.)"
                            checked={formData.Description.includes("ไม่ได้รับทุนการศึกษาจากหน่วยงานหรือองค์กรอื่นใดยกเว้น  (กยศ.)")}
                            onChange={(e) => handleArrayChange(e, "Description", setFormData, setShowDescriptionOtherInput)}
                            className="mr-2"
                          />
                          <label htmlFor="no_other_scholarships">ไม่ได้รับทุนการศึกษาจากหน่วยงานหรือองค์กรอื่นใดยกเว้น  (กยศ.)</label>
                        </div>

                        <div>
                          <input
                            type="checkbox"
                            id="good_behavior"
                            value="มีความประพฤติดี มีความขยันหมั่นเพียร"
                            checked={formData.Description.includes("มีความประพฤติดี มีความขยันหมั่นเพียร")}
                            onChange={(e) => handleArrayChange(e, "Description", setFormData, setShowDescriptionOtherInput)}
                            className="mr-2"
                          />
                          <label htmlFor="good_behavior">มีความประพฤติดี มีความขยันหมั่นเพียร</label>
                        </div>

                        <div>
                          <input
                            type="checkbox"
                            id="disabled"
                            value="เป็นผู้พิการ"
                            checked={formData.Description.includes("เป็นผู้พิการ")}
                            onChange={(e) => handleArrayChange(e, "Description", setFormData, setShowDescriptionOtherInput)}
                            className="mr-2"
                          />
                          <label htmlFor="disabled">เป็นผู้พิการ</label>
                        </div>

                        <div>
                          <input
                            type="checkbox"
                            id="financial_need"
                            value="มีฐานะยากจน หรือขาดแคลนทุนทรัพย์"
                            checked={formData.Description.includes("มีฐานะยากจน หรือขาดแคลนทุนทรัพย์")}
                            onChange={(e) => handleArrayChange(e, "Description", setFormData, setShowDescriptionOtherInput)}
                            className="mr-2"
                          />
                          <label htmlFor="financial_need">มีฐานะยากจน หรือขาดแคลนทุนทรัพย์</label>
                        </div>

                        <div>
                          <input
                            type="checkbox"
                            id="other_QualificationText"
                            value="อื่น ๆ"
                            checked={formData.Description.includes("อื่น ๆ")}
                            onChange={(e) => handleArrayChange(e, "Description", setFormData, setShowDescriptionOtherInput)}
                            className="mr-2"
                          />
                          <label htmlFor="other_QualificationText">อื่น ๆ</label>
                          {showDescriptionOtherInput && (
                            <input
                              type="text"
                              name="otherQualificationText" // เพิ่ม name attribute ให้ตรงกับ formData
                              value={formData.otherQualificationText}
                              onChange={handleChange}
                              className="ml-4 p-2 border border-gray-300 rounded"
                              placeholder="ระบุเอกสารอื่น ๆ"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">เอกสารประกอบการสมัคร</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <input
                            type="checkbox"
                            id="photo"
                            value="รูปถ่ายหน้าตรง"
                            checked={formData.information.includes("รูปถ่ายหน้าตรง")}
                            onChange={(e) => handleArrayChange(e, "information", setFormData, setShowinformationOtherInput)}
                            className="mr-2"
                          />
                          <label htmlFor="photo">รูปถ่ายหน้าตรง</label>
                        </div>

                        <div>
                          <input
                            type="checkbox"
                            id="id_card"
                            value="สำเนาบัตรประชาชนผู้สมัคร"
                            checked={formData.information.includes("สำเนาบัตรประชาชนผู้สมัคร")}
                            onChange={(e) => handleArrayChange(e, "information", setFormData, setShowinformationOtherInput)}
                            className="mr-2"
                          />
                          <label htmlFor="id_card">สำเนาบัตรประชาชนผู้สมัคร</label>
                        </div>

                        <div>
                          <input
                            type="checkbox"
                            id="student_cert"
                            value="หนังสือรับรองสภาพการเป็นนิสิต"
                            checked={formData.information.includes("หนังสือรับรองสภาพการเป็นนิสิต")}
                            onChange={(e) => handleArrayChange(e, "information", setFormData, setShowinformationOtherInput)}
                            className="mr-2"
                          />
                          <label htmlFor="student_cert">หนังสือรับรองสภาพการเป็นนิสิต</label>
                        </div>

                        <div>
                          <input
                            type="checkbox"
                            id="house_photo"
                            value="ภาพถ่ายบ้านที่เห็นตัวบ้านทั้งหมด"
                            checked={formData.information.includes("ภาพถ่ายบ้านที่เห็นตัวบ้านทั้งหมด")}
                            onChange={(e) => handleArrayChange(e, "information", setFormData, setShowinformationOtherInput)}
                            className="mr-2"
                          />
                          <label htmlFor="house_photo">ภาพถ่ายบ้านที่เห็นตัวบ้านทั้งหมด</label>
                        </div>

                        <div>
                          <input
                            type="checkbox"
                            id="transcript"
                            value="ใบสะสมผลการเรียน"
                            checked={formData.information.includes("ใบสะสมผลการเรียน")}
                            onChange={(e) => handleArrayChange(e, "information", setFormData, setShowinformationOtherInput)}
                            className="mr-2"
                          />
                          <label htmlFor="transcript">ใบสะสมผลการเรียน</label>
                        </div>

                        <div>
                          <input
                            type="checkbox"
                            id="other_info"
                            value="อื่น ๆ"
                            checked={formData.information.includes("อื่น ๆ")}
                            onChange={(e) => handleArrayChange(e, "information", setFormData, setShowinformationOtherInput)}
                            className="mr-2"
                          />
                          <label htmlFor="other_info">อื่น ๆ</label>
                          {showinformationOtherInput && (
                            <input
                              type="text"
                              name="otherDocument" // เพิ่ม name attribute ให้ตรงกับ formData
                              value={formData.otherDocument}
                              onChange={handleChange}
                              className="ml-4 p-2 border border-gray-300 rounded"
                              placeholder="ระบุเอกสารอื่น ๆ"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex ...">
                      <div className="w-1/2 ...">
                        <div className="mb-4">
                          {showSection.files && (
                            <>
                              {fileInputs.map((_, index) => (
                                <div className="mb-4" key={index}>
                                  <label htmlFor={`Files-${index}`} className="block text-gray-700 mb-2">อัพโหลดไฟล์</label>
                                  <input
                                    type="file"
                                    id={`Files-${index}`}
                                    name="Files"
                                    onChange={(e) => handleFileChange(e, index)}
                                    className="w-1/3 p-3 border border-gray-300 rounded"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFileInput(index)}
                                    className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                                  >
                                    ลบ
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={handleAddFileInput}
                                className="bg-blue-500 text-white px-2 py-1 text-sm rounded hover:bg-blue-600 mt-2"
                              >
                                เพิ่มอัพโหลดไฟล์
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="w-1/2 ...">
                        <div className="mb-4">
                          <label htmlFor="Image" className="block text-gray-700 mb-2">อัพโหลดรูปภาพ</label>
                          <input
                            type="file"
                            id="Image"
                            name="Image"
                            onChange={handleImageChange}
                            className="w-1/3 p-3 border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex ...">
                      <div className="w-1/2 ...">
                        <div className="mb-4">
                          <label htmlFor="StartDate" className="block text-gray-700 mb-2">วันที่เริ่ม</label>
                          <input
                            type="date"
                            id="StartDate"
                            name="StartDate"
                            value={formData.StartDate}
                            onChange={handleChange}
                            className="w-5/6 p-3 border border-gray-300 rounded"
                          />
                        </div>
                      </div>

                      <div className="w-1/2 ...">
                        <div className="mb-4">
                          <label htmlFor="EndDate" className="block text-gray-700 mb-2">วันที่สิ้นสุด</label>
                          <input
                            type="date"
                            id="EndDate"
                            name="EndDate"
                            value={formData.EndDate}
                            onChange={handleChange}
                            className="w-5/6 p-3 border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex ...">
                <div className="w-5/6 ..."></div>
                <div className="w-1/6 ...">
                  <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-6 mb-8">
                    ประกาศทุนการศึกษาใหม่
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
