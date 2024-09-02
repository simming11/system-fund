'use client';
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import HeaderHome from "@/app/components/headerHome/headerHome";
import AdminHeader from "@/app/components/headerAdmin/headerAdmin";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import Footer from "@/app/components/footer/footer";
import Swal from "sweetalert2";
import ApiServiceScholarships from "@/app/services/scholarships/ApiScholarShips";
import ApiUpdateServiceScholarships from "@/app/services/scholarships/updateScholarships";

export default function EditInternalScholarshipPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  //   useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     const token = localStorage.getItem('token');
  //     const Role = localStorage.getItem('UserRole');

  //     if (!token || Role?.trim().toLowerCase() !== 'admin') {
  //       console.error('Unauthorized access or missing token. Redirecting to login.');
  //       router.push('/page/control');
  //     }
  //   }
  // }, [router]);



  const [formData, setFormData] = useState(() => {
    const savedFormData = sessionStorage.getItem('editInternalScholarshipForm');
    return savedFormData
      ? JSON.parse(savedFormData)
      : {
        ScholarshipName: "",
        Year: "",
        Num_scholarship: "",
        Minimum_GPA: "",
        TypeID: "1",
        YearLevel: "",
        StartDate: "",
        EndDate: "",
        CreatedBy: localStorage.getItem('AcademicID') || '',
        otherDocument: "",
        otherQualificationText: "",
        documents: [] as { text: string, isActive: boolean }[],
        qualifications: [] as { text: string, isActive: boolean }[],
        Files: [] as { file: File | null, existing: boolean, id?: number }[],
        Image: null as File | null,
        course: [] as string[],
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

  useEffect(() => {
    sessionStorage.setItem('editInternalScholarshipForm', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    const fetchScholarshipData = async () => {
      if (id) {
        try {
          const response = await ApiServiceScholarships.getScholarship(Number(id));
          const data = response.data;

          const knownQualifications = [
            "มีฐานะยากจน หรือขาดแคลนทุนทรัพย์",
            "เป็นผู้พิการ",
            "มีความประพฤติดี มีความขยันหมั่นเพียร",
            "ไม่ได้รับทุนการศึกษาจากหน่วยงานหรือองค์กรอื่นใดยกเว้น  (กยศ.)",
            "กำลังศึกษาอยู่ในระดับปริญญาตรี"
          ];

          const knowndocuments = [
            "รูปถ่ายหน้าตรง",
            "สำเนาบัตรประชาชนผู้สมัคร",
            "หนังสือรับรองสภาพการเป็นนิสิต",
            "ภาพถ่ายบ้านที่เห็นตัวบ้านทั้งหมด",
            "ใบสะสมผลการเรียน",
          ];

          const qualificationsArray: { text: string; isActive: boolean }[] = [];
          let otherQualificationText = "";

          data.qualifications.forEach((qual: any) => {
            if (knownQualifications.includes(qual.QualificationText)) {
              qualificationsArray.push({
                text: qual.QualificationText,
                isActive: qual.IsActive,
              });
            } else {
              otherQualificationText += `${qual.QualificationText} `;
            }
          });

          const documentsArray: { text: string; isActive: boolean }[] = [];
          let otherDocument = "";

          data.documents.forEach((doc: any) => {
            if (knowndocuments.includes(doc.DocumentText)) {
              documentsArray.push({
                text: doc.DocumentText,
                isActive: doc.IsActive,
              });
            } else {
              otherDocument += `${doc.DocumentText} `;
            }
          });

          if (data) {
            setFormData((prev: any) => ({
              ...prev,
              ...data,
              course: data.courses.map((course: any) => course.CourseName),
              qualifications: qualificationsArray,
              otherQualificationText: otherQualificationText.trim(),
              documents: documentsArray,
              otherDocument: otherDocument.trim(),
              Files: data.files.map((file: any) => ({
                file: null,
                existing: true,
                id: file.FileID,
                FilePath: file.FilePath
              })),
            }));

            if (otherQualificationText) {
              setShowDescriptionOtherInput(true);
            }
            if (otherDocument) {
              setShowinformationOtherInput(true);
            }
          }
        } catch (error) {
          console.error("Failed to fetch scholarship data:", error);
          setError("Failed to load data.");
        }
      }
    };

    fetchScholarshipData();
  }, [id]);

  const handleArrayMajorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    let updatedArray = [...(formData.course || [])];

    if (checked) {
      if (!updatedArray.includes(value)) {
        updatedArray.push(value);
      }
    } else {
      updatedArray = updatedArray.filter((course) => course !== value);
    }

    setFormData({
      ...formData,
      course: updatedArray,
    });
  };

  const handleArrayChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    arrayName: string,
    otherInputSetter?: React.Dispatch<React.SetStateAction<string>>,
    showOtherInputSetter?: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    const { value, checked } = e.target;
    let updatedArray = [...(formData[arrayName as keyof typeof formData] || [])] as { text: string, isActive: boolean }[];

    const itemIndex = updatedArray.findIndex(item => item.text === value);

    if (value === "อื่น ๆ") {
      if (checked) {
        showOtherInputSetter && showOtherInputSetter(true);
        if (itemIndex === -1) {
          updatedArray.push({ text: value, isActive: true });
        } else {
          updatedArray[itemIndex].isActive = true;
        }
      } else {
        showOtherInputSetter && showOtherInputSetter(false);
        otherInputSetter && otherInputSetter("");
        if (itemIndex !== -1) {
          updatedArray[itemIndex].isActive = false;
        }
      }
    } else {
      if (checked) {
        if (itemIndex === -1) {
          updatedArray.push({ text: value, isActive: true });
        } else {
          updatedArray[itemIndex].isActive = true;
        }
      } else {
        if (itemIndex !== -1) {
          updatedArray[itemIndex].isActive = false;
        }
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
      newFiles[index] = { file: e.target.files[0], existing: false }; // Mark as new file
      setFormData({
        ...formData,
        Files: newFiles,
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const imageFile = e.target.files[0];
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        Image: imageFile,
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

    if (!id) {
      setError("Scholarship ID is missing.");
      return;
    }

    const scholarshipID = id ? Number(id) : 0; // Ensure scholarshipID is a valid number, or fallback to 0
    const submitFormData = {
      ScholarshipName: formData.ScholarshipName,
      Year: formData.Year,
      Num_scholarship: formData.Num_scholarship,
      Minimum_GPA: formData.Minimum_GPA,
      TypeID: formData.TypeID,
      YearLevel: formData.YearLevel,
      StartDate: formData.StartDate,
      EndDate: formData.EndDate,
      CreatedBy: formData.CreatedBy,
    };

    try {
      // Convert submitFormData to FormData
      const payload = new FormData();
      for (const [key, value] of Object.entries(submitFormData)) {
        if (value !== undefined && value !== null) {
          payload.append(key, value.toString());
        }
      }

      // Ensure id is not null and is passed as a string
      if (id) {
        await ApiUpdateServiceScholarships.updateScholarship(id, payload);
      } else {
        throw new Error("Scholarship ID is missing.");
      }





      // Update Courses
      if ((formData.course || []).length > 0) {
        await ApiUpdateServiceScholarships.updateCourse(scholarshipID, {
          ScholarshipID: scholarshipID,
          CourseName: formData.course,
        });
      }

      // Update Documents
      const selectedDocuments = formData.documents
        .filter((item: { text: string, isActive: boolean }) => item.isActive && item.text !== "อื่น ๆ")
        .map((item: { text: string }) => item.text);

      if (formData.showinformationOtherInput && formData.otherDocument) {
        selectedDocuments.push(formData.otherDocument);
      }

      if (selectedDocuments.length > 0) {
        await ApiUpdateServiceScholarships.updateDocument(scholarshipID, {
          ScholarshipID: scholarshipID,
          documents: selectedDocuments,
          otherDocument: formData.otherDocument,
          IsActive: true,
        });
      }

      // Update Qualifications
      const selectedQualifications = formData.qualifications
        .filter((item: { text: string, isActive: boolean }) => item.isActive && item.text !== "อื่น ๆ")
        .map((item: { text: string }) => item.text);

      if (formData.showDescriptionOtherInput && formData.otherQualificationText) {
        selectedQualifications.push(formData.otherQualificationText);
      }

      if (selectedQualifications.length > 0) {
        await ApiUpdateServiceScholarships.updateQualification(scholarshipID, {
          ScholarshipID: scholarshipID,
          qualifications: selectedQualifications,
          otherQualificationText: formData.otherQualificationText,
          IsActive: true,
        });
      }

      if (formData.Image) {
        await ApiUpdateServiceScholarships.updateImage(scholarshipID, formData.Image);
      }



      // Prepare and Update other files
      const filesToUpdate = formData.Files
        .filter((fileObj: { file: File | null }) => fileObj.file)
        .map((fileObj: { file: File | null }) => ({
          FileType: "ไฟล์",
          FilePath: fileObj.file as File,
          Description: fileObj.file?.name || ""
        }));

      if (filesToUpdate.length > 0) {
        await ApiUpdateServiceScholarships.updateFiles(scholarshipID, filesToUpdate, scholarshipID);
      }

      // Success message
      Swal.fire({
        title: "Good job!",
        text: "Scholarship updated successfully!",
        icon: "success"
      });

      // Clear session storage and redirect
      sessionStorage.clear();
      router.push("/page/scholarships/Manage-internal-scholarships");

    } catch (error) {
      setError("Failed to update scholarship. Please try again.");
      console.error("Error updating scholarship:", error);
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
            <h2 className="text-2xl font-semibold mb-6">Edit Scholarship</h2>
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
                            checked={formData.course?.includes("คณิตศาสตร์และการจัดการข้อมูล") || false}
                            onChange={handleArrayMajorChange}
                            className="mr-2"
                          />
                          <label htmlFor="math">คณิตศาสตร์และการจัดการข้อมูล</label>
                        </div>

                        <div>
                          <input
                            type="checkbox"
                            id="cs"
                            value="วิทยาการคอมพิวเตอร์และสารสนเทศ"
                            checked={formData.course?.includes("วิทยาการคอมพิวเตอร์และสารสนเทศ") || false}
                            onChange={handleArrayMajorChange}
                            className="mr-2"
                          />
                          <label htmlFor="cs">วิทยาการคอมพิวเตอร์และสารสนเทศ</label>
                        </div>

                        <div>
                          <input
                            type="checkbox"
                            id="env_sci"
                            value="วิทยาศาสตร์สิ่งแวดล้อม"
                            checked={formData.course?.includes("วิทยาศาสตร์สิ่งแวดล้อม") || false}
                            onChange={handleArrayMajorChange}
                            className="mr-2"
                          />
                          <label htmlFor="env_sci">วิทยาศาสตร์สิ่งแวดล้อม</label>
                        </div>

                        <div>
                          <input
                            type="checkbox"
                            id="chem"
                            value="เคมี"
                            checked={formData.course?.includes("เคมี") || false}
                            onChange={handleArrayMajorChange}
                            className="mr-2"
                          />
                          <label htmlFor="chem">เคมี</label>
                        </div>

                        <div>
                          <input
                            type="checkbox"
                            id="fish"
                            value="วิทยาศาสตร์การประมงและทรัพยากรทางน้ำ"
                            checked={formData.course?.includes("วิทยาศาสตร์การประมงและทรัพยากรทางน้ำ") || false}
                            onChange={handleArrayMajorChange}
                            className="mr-2"
                          />
                          <label htmlFor="fish">วิทยาศาสตร์การประมงและทรัพยากรทางน้ำ</label>
                        </div>

                        <div>
                          <input
                            type="checkbox"
                            id="bio"
                            value="ชีววิทยาศาสตร์"
                            checked={formData.course?.includes("ชีววิทยาศาสตร์") || false}
                            onChange={handleArrayMajorChange}
                            className="mr-2"
                          />
                          <label htmlFor="bio">ชีววิทยาศาสตร์</label>
                        </div>

                        <div>
                          <input
                            type="checkbox"
                            id="phy"
                            value="ฟิสิกส์วัสดุและนาโนเทคโนโลยี"
                            checked={formData.course?.includes("ฟิสิกส์วัสดุและนาโนเทคโนโลยี") || false}
                            onChange={handleArrayMajorChange}
                            className="mr-2"
                          />
                          <label htmlFor="phy">ฟิสิกส์วัสดุและนาโนเทคโนโลยี</label>
                        </div>

                      </div>
                    </div>

                    <div className="flex">
                      <div className="w-1/2">
                        <div className="mb-4">
                          <label htmlFor="Year" className="block text-gray-700 mb-2">ปีการศึกษา</label>
                          <select
                            id="Year"
                            name="Year"
                            value={formData.Year}
                            onChange={handleChange}
                            className="w-2/5 p-3 border border-gray-300 rounded"
                          >
                            {Array.from({ length: 18 }, (_, i) => (
                              <option key={2563 + i} value={2563 + i}>
                                {2563 + i}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="w-1/2">
                        <div className="mb-4">
                          <label htmlFor="YearLevel" className="block text-gray-700 mb-2">ชั้นปี</label>
                          <select
                            id="YearLevel"
                            name="YearLevel"
                            value={formData.YearLevel}
                            onChange={handleChange}
                            className="w-2/5 p-3 border border-gray-300 rounded"
                          >
                            {[
                              { value: "1", label: "ปี 1" },
                              { value: "2", label: "ปี 2" },
                              { value: "3", label: "ปี 3" },
                              { value: "4", label: "ปี 4" },
                              { value: "1-2", label: "ปี 1-2" },
                              { value: "1-3", label: "ปี 1-3" },
                              { value: "1-4", label: "ปี 1-4" },
                              { value: "2-3", label: "ปี 2-3" },
                              { value: "3-4", label: "ปี 3-4" }
                            ].map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="w-1/2">
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
                      <div className="w-1/2">
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
                        {[
                          "กำลังศึกษาอยู่ในระดับปริญญาตรี",
                          "ไม่ได้รับทุนการศึกษาจากหน่วยงานหรือองค์กรอื่นใดยกเว้น  (กยศ.)",
                          "มีความประพฤติดี มีความขยันหมั่นเพียร",
                          "เป็นผู้พิการ",
                          "มีฐานะยากจน หรือขาดแคลนทุนทรัพย์",
                          "อื่น ๆ"
                        ].map((qualification) => (
                          <div key={qualification}>
                            <input
                              type="checkbox"
                              id={qualification}
                              value={qualification}
                              checked={formData.qualifications?.some((q: { text: string; isActive: any; }) => q.text === qualification && q.isActive) || false}
                              onChange={(e) =>
                                handleArrayChange(
                                  e,
                                  "qualifications",
                                  setFormData,
                                  qualification === "อื่น ๆ" ? setShowDescriptionOtherInput : undefined
                                )
                              }
                              className="mr-2"
                            />
                            <label htmlFor={qualification}>{qualification}</label>
                            {qualification === "อื่น ๆ" && showDescriptionOtherInput && (
                              <input
                                type="text"
                                name="otherQualificationText"
                                value={formData.otherQualificationText}
                                onChange={handleChange}
                                className="ml-4 p-2 border border-gray-300 rounded"
                                placeholder="ระบุคุณสมบัติอื่น ๆ"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">เอกสารประกอบการสมัคร</label>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          "รูปถ่ายหน้าตรง",
                          "สำเนาบัตรประชาชนผู้สมัคร",
                          "หนังสือรับรองสภาพการเป็นนิสิต",
                          "ภาพถ่ายบ้านที่เห็นตัวบ้านทั้งหมด",
                          "ใบสะสมผลการเรียน",
                          "อื่น ๆ"
                        ].map((document) => (
                          <div key={document}>
                            <input
                              type="checkbox"
                              id={document}
                              value={document}
                              checked={formData.documents?.some((q: { text: string; isActive: any; }) => q.text === document && q.isActive) || false}
                              onChange={(e) =>
                                handleArrayChange(
                                  e,
                                  "documents",
                                  setFormData,
                                  document === "อื่น ๆ" ? setShowinformationOtherInput : undefined
                                )
                              }
                              className="mr-2"
                            />
                            <label htmlFor={document}>{document}</label>
                            {document === "อื่น ๆ" && showinformationOtherInput && (
                              <input
                                type="text"
                                name="otherDocument"
                                value={formData.otherDocument}
                                onChange={handleChange}
                                className="ml-4 p-2 border border-gray-300 rounded"
                                placeholder="ระบุเอกสารอื่น ๆ"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex">
                      <div className="w-1/2">
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
                                เพิ่มไฟล์
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="w-1/2">
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

                    <div className="flex">
                      <div className="w-1/2">
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

                      <div className="w-1/2">
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
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-6 mb-8">
                Update Scholarship
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
