'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderHome from "@/app/components/headerHome/headerHome";
import AdminHeader from "@/app/components/headerAdmin/headerAdmin";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import Footer from "@/app/components/footer/footer";
import Swal from "sweetalert2";
import ApiAllcreateServiceScholarships from "@/app/services/scholarships/createScholarship";
import ApiLineNotifyServices from "@/app/services/line-notifies/line";
import ScholarshipService from "@/app/services/scholarships/ApiScholarShips"; // Adjust the path accordingly
const URL = `${process.env.NEXT_PUBLIC_API_Forned}`;
export default function CreateInternalScholarshipPage() {
  const router = useRouter();
  const [errors, setErrors] = useState({
    ScholarshipName: "",
    Year: "",
    YearLevel: "",
    Num_scholarship: "",
    // Add other fields as needed
  });

  const [formData, setFormData] = useState(() => {
    const savedFormData = sessionStorage.getItem('createInternalScholarshipForm');
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
        otherQualificationText: "",  // Initialize as an empty string
        otherDocument: "",           // Initialize as an empty string
        CreatedBy: localStorage.getItem('AcademicID') || '',
        Major: [] as string[],  // Initialize as an empty array
        Description: [] as string[],  // Initialize as an empty array
        information: [] as string[],  // Initialize as an empty array
        Files: [] as File[],  // Initialize as an empty array
        Image: [] as File[],  // Initialize Image as null
      };
  });
  const [LineData, setLineData] = useState({
    notify_client_id: '',
    client_secret: '',
    AcademicID: '', // AcademicID กำหนดเป็น string ที่ว่างเปล่าเริ่มต้น
  });
  const [fileInputs, setFileInputs] = useState([0]);
  const [showDescriptionOtherInput, setShowDescriptionOtherInput] = useState(false);
  const [showinformationOtherInput, setShowinformationOtherInput] = useState(false);
  const [errorGpa, setErrorGpa] = useState("");
  const [error, setError] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // For displaying errors
  const [fileErrors, setFileErrors] = useState<string[]>([]); // State to track errors for each file
  const [lineToken, setLineToken] = useState<string | null>(null);
  const [showSection, setShowSection] = useState({
    scholarshipInfo: true,
    additionalInfo: true,
    files: true,
  });
  const AcademicID = typeof window !== "undefined" ? localStorage.getItem('AcademicID') ?? '' : '';
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFormData = sessionStorage.getItem('createInternalScholarshipForm');
      if (savedFormData) {
        setFormData(JSON.parse(savedFormData));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('createInternalScholarshipForm', JSON.stringify(formData));
    }
  }, [formData]);

  const fetchLineNotifies = async () => {
    try {
      if (!AcademicID) {
        throw new Error('AcademicID is missing');
      }
      const response = await ApiLineNotifyServices.getLineNotifiesByAcademicID(AcademicID);

      if (response.length > 0) {
        const { client_secret, notify_client_id, LineToken } = response[0];
        setLineToken(LineToken);
      }
    } catch (error) {
      console.error('Error fetching line notifies:', error);
    }
  };

  useEffect(() => {
    fetchLineNotifies();
    fetchScholarship();
  }, []);

  const fetchScholarship = async () => {
    try {
      const Scholarship = await ScholarshipService.getAllScholarships();
     
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };
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

     
    }
  };



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate required fields before showing the loading spinner
    if (!formData.ScholarshipName) {
      setError("กรุณากรอกข้อมูลในฟิลด์ ชื่อทุนการศึกษา");
      return;
    }

    if (!formData.Year || isNaN(Number(formData.Year))) {
      setError("กรุณากรอกข้อมูลในฟิลด์ ปีการศึกษา");
      return;
    }

    if (!formData.YearLevel || (!/^\d+$/.test(formData.YearLevel) && !["1-4", "2-4", "3-4"].includes(formData.YearLevel))) {
      setError("กรุณากรอกข้อมูลในฟิลด์ ชั้นปี");
      return;
    }


    if (!formData.Num_scholarship || isNaN(Number(formData.Num_scholarship))) {
      setError("กรุณากรอกข้อมูลในฟิลด์ จำนวนทุน");
      return;
    }

    const minimumGPA = Number(formData.Minimum_GPA);
    if (!formData.Minimum_GPA || isNaN(minimumGPA) || minimumGPA < 1.00 || minimumGPA >= 4.00) {
      setErrorGpa("กรุณากรอกข้อมูลในฟิลด์ เกรดเฉลี่ยขั้นต่ำ 1.00-4.00");
      return;
    }

    if (formData.Major.length === 0) {
      setError("กรุณาเลือกอย่างน้อยหนึ่งสาขาวิชา");
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

    if (!formData.Image) {
      setError("กรุณาอัปโหลดรูปภาพประกอบการสมัคร");
      return;
    }

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

    // Show loading spinner only after all validations have passed
    Swal.fire({
      title: "",
      html: "",
      timer: 10,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
      },
    });


    try {
      // Fetch all scholarships and check for duplicates
      const response = await ScholarshipService.getAllScholarships();
      const scholarships = response.data;

      const duplicate = scholarships.find(
        (scholarship: any) =>
          scholarship.ScholarshipName.trim().toLowerCase() === formData.ScholarshipName.trim().toLowerCase() &&
          scholarship.Year === formData.Year
      );

      if (duplicate) {
        Swal.fire({
          title: "พบทุนการศึกษาที่ซ้ำกัน",
          text: "พบทุนการศึกษาที่ซ้ำกัน ทุนการศึกษาชื่อนี้มีอยู่แล้วในปีเดียวกัน",
          icon: "error"
        });
        return;
      }


      // Prepare the form data
      const submitFormData = {
        ...formData,
        information: formData.information.filter((item: string) => item !== "อื่น ๆ"),
        Description: formData.Description.filter((item: string) => item !== "อื่น ๆ"),
      };

      const payload = new FormData();
      for (const [key, value] of Object.entries(submitFormData)) {
        if (Array.isArray(value)) {
          value.forEach((item: string) => {
            payload.append(`${key}[]`, item);
          });
        } else if (value instanceof Blob) {
          payload.append(key, value);
        } else {
          payload.append(key, value as string);
        }
      }

      // Create Scholarship
      const scholarshipID = await ApiAllcreateServiceScholarships.createScholarship(payload);

      // Send notification if lineToken exists
      if (lineToken) {
        const message = `ทุนการศึกษาใหม่ ${formData.ScholarshipName} \nคลิกเพื่อดูรายละเอียด: ${URL}/page/scholarships/detail?id=${scholarshipID}`;
        await ApiLineNotifyServices.sendLineNotify(message, lineToken);
      } else {
        console.error("LINE Notify token is null");
      }

      // Create Courses
      if (formData.Major.length > 0) {
        await ApiAllcreateServiceScholarships.createCourses({
          ScholarshipID: scholarshipID,
          CourseName: formData.Major,
        });
      }

      // Create Documents
      if (submitFormData.information.length > 0 || formData.otherDocument) {
        await ApiAllcreateServiceScholarships.createDocuments({
          ScholarshipID: scholarshipID,
          documents: submitFormData.information,
          otherDocument: formData.otherDocument
        });
      }

      // Create Qualifications
      if (submitFormData.Description.length > 0) {
        await ApiAllcreateServiceScholarships.createQualifications({
          ScholarshipID: scholarshipID,
          qualifications: submitFormData.Description,
          otherQualificationText: submitFormData.otherQualificationText
        });
      }

      // Upload the image file
      if (formData.Image) {
        await ApiAllcreateServiceScholarships.createImage({
          ScholarshipID: scholarshipID,
          ImagePath: formData.Image,
        });
      }

      // Upload other files
      for (const file of formData.Files) {
        if (file) {
          await ApiAllcreateServiceScholarships.createFile({
            ScholarshipID: scholarshipID,
            FileType: "ไฟล์",
            FilePath: file,
          });
        }
      }

      // Success message
      Swal.fire({
        title: "",
        text: "สร้างทุนการศึกษาเรียบร้อยแล้ว!",
        icon: "success"
      });


      // Clear session storage and redirect
      sessionStorage.clear();
      router.push("/page/scholarships/Manage-internal-scholarships");

    } catch (error: any) {
      // If there is a response with an error message, display it
      if (error.response && error.response.data && error.response.data.error) {
        Swal.fire({
          title: "Error",
          text: error.response.data.error,
          icon: "error",
        });
      } else {
        // Fallback for any other errors
        setError("Failed to create scholarship. Please try again.");
        console.error("Error creating scholarship:", error);
        Swal.fire({
          title: "Error",
          text: error.response.data.error,
          icon: "error",
        });
      }
    }
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
            <h2 className="text-2xl font-semibold mb-6">เพิ่มทุนการศึกษาภายในคณะมหาวิทยาลัย</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <>
                  <div className="w-full md:w-1/1 px-4 mb-4">
                    <label htmlFor="ScholarshipName" className="block  mb-2">ชื่อทุนการศึกษา</label>
                    <input
                      type="text"
                      id="ScholarshipName"
                      name="ScholarshipName"
                      value={formData.ScholarshipName}
                      onChange={handleChange}
                      className={`w-5/6 p-3 border rounded ${errors.ScholarshipName ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.ScholarshipName && <p className="text-red-500 text-sm">{errors.ScholarshipName}</p>}
                  </div>
                  <div className="flex flex-wrap">
                    <div className="w-full md:w-1/2 px-4 mb-4">
                      <div className="mb-4">
                        <label htmlFor="Year" className="block  mb-2">ปีการศึกษา</label>
                        <select
                          id="Year"
                          name="Year"
                          value={formData.Year}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded"
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

                    <div className="w-full md:w-1/2 px-4 mb-4">
                      <div className="mb-4">
                        <label htmlFor="YearLevel" className="block  mb-2">ชั้นปี</label>
                        <select
                          id="YearLevel"
                          name="YearLevel"
                          value={formData.YearLevel}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300  rounded"
                        >
                          <option value="" disabled>เลือกชั้นปี</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="1-4">ทุกชั้นปี</option>
                          <option value="2-4">2ขึ้นไป</option>
                          <option value="3-4">3ขึ้นไป</option>
                        </select>
                      </div>
                    </div>

                    <div className="w-full md:w-1/2 px-4 mb-4">
                      <div className="mb-4">
                        <label htmlFor="Num_scholarship" className="block  mb-2">จำนวนทุน</label>
                        <input
                          type="number"
                          id="Num_scholarship"
                          name="Num_scholarship"
                          value={formData.Num_scholarship}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded"
                        />
                      </div>
                    </div>

                    <div className="w-full md:w-1/2 px-4 mb-4">
                      <div className="mb-4">
                        <label htmlFor="Minimum_GPA" className="block mb-2">เกรดเฉลี่ย</label>
                        <input
                          type="text"
                          id="Minimum_GPA"
                          name="Minimum_GPA"
                          value={formData.Minimum_GPA}
                          onChange={(e) => {
                            let value = e.target.value;

                            // ตรวจสอบว่ามีทศนิยมเกิน 2 ตำแหน่งหรือไม่
                            const decimalPattern = /^\d*\.?\d{0,2}$/;

                            if (value === "" || decimalPattern.test(value)) {
                              // Allow empty or valid decimal inputs
                              setFormData({ ...formData, Minimum_GPA: value });

                              if (value === "") {
                                setErrorGpa("กรุณากรอกเกรดเฉลี่ยระหว่าง 0.00 ถึง 4.00");
                              } else {
                                const numericValue = parseFloat(value);
                                if (numericValue >= 0 && numericValue <= 4.00) {
                                  setErrorGpa(""); // Clear error if the value is valid
                                } else {
                                  setErrorGpa("กรุณากรอกเกรดเฉลี่ยระหว่าง 0.00 ถึง 4.00");
                                }
                              }
                            } else {
                              setErrorGpa("กรุณากรอกทศนิยมไม่เกิน 2 ตำแหน่ง");
                            }
                          }}
                          className="w-full p-3 border border-gray-300 rounded"
                        />
                        {errorGpa && <p className="text-red-500 text-sm mt-1">{errorGpa}</p>}
                      </div>
                    </div>





                  </div>

                  <div className="mb-4">
                    <label className="block  mb-2">สาขาวิชา</label>
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


                  <div className="mb-4">
                    <label className="block  mb-2">คุณสมบัติ</label>
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
                            placeholder="อื่น ๆ"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block  mb-2">เอกสารประกอบการสมัคร</label>
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
                    <div className="w-1/2">
                      <div className="mb-4">
                        {showSection.files && (
                          <>
                            {fileInputs.map((_, index) => (
                              <div className="mb-4" key={index}>
                                <label htmlFor={`Files-${index}`} className="block mb-2">
                                  อัพโหลดไฟล์ {index + 1}
                                </label>
                                <input
                                  type="file"
                                  id={`Files-${index}`}
                                  name="Files"
                                  accept="application/pdf" // Allow only PDF files
                                  onChange={(e) => handleFileChange(e, index)}
                                  className="w-1/3 p-3 border border-gray-300 rounded"
                                />
                                {fileErrors[index] && (
                                  <p className="text-red-500 text-sm mt-1">{fileErrors[index]}</p> // Display error message if exists
                                )}
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

                    <div className="w-1/2">
                      <div className="mb-4">
                        <label htmlFor="Image" className="block mb-2">อัพโหลดรูปภาพ</label>
                        <input
                          type="file"
                          id="Image"
                          name="Image"
                          accept=".png, .jpg, .jpeg" // Only allow PNG, JPG, and JPEG formats
                          onChange={handleImageChange}
                          className="w-1/3 p-3 border border-gray-300 rounded"
                        />
                        {/* Display error message */}
                        {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
                      </div>

                    </div>

                  </div>

                  <div className="flex ...">
                    <div className="w-1/2 ...">
                      <div className="mb-4">
                        <label htmlFor="StartDate" className="block  mb-2">วันที่เริ่ม</label>
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
                        <label htmlFor="EndDate" className="block  mb-2">วันที่สิ้นสุด</label>
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
