'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderHome from "@/app/components/headerHome/headerHome";
import AdminHeader from "@/app/components/headerAdmin/headerAdmin";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import Footer from "@/app/components/footer/footer";
import Swal from "sweetalert2";
import ApiServiceScholarships from "@/app/services/scholarships/ApiScholarShips";
import ApiUpdateServiceScholarships from "@/app/services/scholarships/updateScholarships";

export default function EditInternalScholarshipPage() {
  const router = useRouter();
  const searchParams = new URLSearchParams(window.location.search);
  const id = searchParams.get('id');


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const Role = localStorage.getItem('UserRole');

      if (!token || Role?.trim().toLowerCase() !== 'admin') {
        console.error('Unauthorized access or missing token. Redirecting to login.');
        router.push('/page/control');
      }
    }
  }, [router]);



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
  const [loading, setLoading] = useState(false);  // Loading state
  const [errorGpa, setErrorGpa] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // For displaying errors
  const [fileErrors, setFileErrors] = useState<string[]>([]); // State to track errors for each file
  const [showSection, setShowSection] = useState({
    scholarshipInfo: true,
    additionalInfo: true,
    files: true,
  });

  useEffect(() => {
    sessionStorage.setItem('editInternalScholarshipForm', JSON.stringify(formData));
    console.log(id);
  }, [formData]);

  useEffect(() => {
    const fetchScholarshipData = async () => {
      if (id) {
        console.log("Scholarship ID from URL:", id); // Log the id value
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

    // If the field is "Minimum_GPA", validate it
    if (name === "Minimum_GPA") {
      // Allow users to type and see validation immediately without truncating their input
      let gpa = parseFloat(value);

      // Allow any value input, but show an error if it's out of the valid range
      if (!isNaN(gpa)) {
        if (gpa < 1 || gpa > 4) {
          setErrorGpa("กรุณากรอกข้อมูลในฟิลด์ เกรดเฉลี่ยขั้นต่ำ 1.00-4.00");
        } else {
          setErrorGpa(""); // Clear error when value is valid

          // Truncate GPA to 2 decimal places without rounding
          const truncatedGPA = Math.floor(gpa * 100) / 100; // Truncate to 2 decimal places
          setFormData({
            ...formData,
            [name]: truncatedGPA.toString(),
          });
        }
      } else if (value === "") {
        setErrorGpa("กรุณากรอกข้อมูลในฟิลด์ เกรดเฉลี่ยขั้นต่ำ 1.00-4.00"); // Handle empty input
        setFormData({
          ...formData,
          [name]: "", // Allow the user to clear the input
        });
      }
    } else {
      // Update form data for other fields
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };


  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Check if the file is a PDF
      if (file.type !== 'application/pdf') {
        const newErrors = [...fileErrors];
        newErrors[index] = 'กรุณาอัพโหลดเฉพาะไฟล์ PDF';
        setFileErrors(newErrors);
        return;
      }

      // Check if file size is less than 20MB
      const fileSizeInMB = file.size / 1024 / 1024;
      if (fileSizeInMB > 20) {
        const newErrors = [...fileErrors];
        newErrors[index] = 'ขนาดไฟล์ไม่ควรเกิน 20MB';
        setFileErrors(newErrors);
        return;
      }

      // If no error, clear any existing errors for this index
      const newErrors = [...fileErrors];
      newErrors[index] = ''; // Clear error
      setFileErrors(newErrors);

      // Update file in form data
      const newFiles = [...formData.Files];
      newFiles[index] = file; // Update the selected file at the given index
      setFormData({
        ...formData,
        Files: newFiles,  // Update the form data with the new file array
      });
    }
  };

  // Add a new file input
  const handleAddFileInput = () => {
    setFileInputs([...fileInputs, fileInputs.length]); // Add a new index for a new file input
    setFileErrors([...fileErrors, '']); // Add a blank error message slot for the new file
  };

  // Remove an existing file input
  const handleRemoveFileInput = (index: number) => {
    const newFileInputs = fileInputs.filter((_, i) => i !== index); // Remove the file input at the given index
    const newFiles = formData.Files.filter((_: any, i: number) => i !== index);  // Remove the corresponding file in the form data
    const newErrors = fileErrors.filter((_, i) => i !== index); // Remove the corresponding error message
    setFileInputs(newFileInputs); // Update the file inputs
    setFileErrors(newErrors); // Update the errors
    setFormData({
      ...formData,
      Files: newFiles,  // Update the form data without the removed file
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const imageFile = e.target.files[0];

      // Check file size (limit to 20MB)
      const fileSizeInMB = imageFile.size / 1024 / 1024;
      if (fileSizeInMB > 20) {
        setErrorMessage("ขนาดไฟล์ไม่ควรเกิน 20MB"); // Set error message
        e.target.value = ""; // Clear the input value
        return;
      }

      // Check file type (image)
      const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validImageTypes.includes(imageFile.type)) {
        setErrorMessage("กรุณาอัพโหลดเฉพาะไฟล์รูปภาพ (JPEG, PNG, GIF)"); // Set error message
        e.target.value = ""; // Clear the input value
        return;
      }

      // If no error, clear the error message and store the image
      setErrorMessage(null);

      // Store the image file directly in formData
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        Image: imageFile, // Store the image file directly
      }));

      console.log("Image file selected:", imageFile);
    }
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

    let timerInterval: string | number | NodeJS.Timeout | undefined;
    Swal.fire({
      title: "",
      html: "",
      timer: 10,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
        const timer = Swal.getHtmlContainer()?.querySelector("b");
        timerInterval = setInterval(() => {
          if (timer) {
            timer.textContent = `${Swal.getTimerLeft()}`;
          }
        }, 100);
      },
      willClose: () => {
        clearInterval(timerInterval);
      }
    }).then(async (result) => {
      if (result.dismiss === Swal.DismissReason.timer) {
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

          Swal.fire({
            title: "",
            text: "อัปเดตทุนการศึกษาเรียบร้อยแล้ว!",
            icon: "success"
          });


          // Clear session storage and redirect
          sessionStorage.clear();
          router.push("/page/scholarships/Manage-internal-scholarships");

        } catch (error) {
          setError("Failed to update scholarship. Please try again.");
          console.error("Error updating scholarship:", error);
        }
      }
    });
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
            <h2 className="text-2xl font-semibold mb-6">แก้ไขข้อมูลทุนการศึกษาภายในมหาวิทยาลัย</h2>
            {loading && (
              <div className="flex items-center justify-center mb-4">
                <div className="loader border-t-4 border-blue-500 rounded-full w-16 h-16 animate-spin"></div>
                <p className="ml-4 text-gray-600">Loading...</p>
              </div>
            )}
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">

                <>
                  <div className="w-full md:w-1/1 px-4 mb-4">
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

              </div>
              <div className="flex ...">
                <div className="w-5/6 ..."></div>
                <div className="w-1/6 ...">
                  <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-6 mb-8">
                    แก้ไขทุน
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
