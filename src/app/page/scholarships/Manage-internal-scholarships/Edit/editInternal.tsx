'use client';
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import HeaderHome from "@/app/components/headerHome/headerHome";
import AdminHeader from "@/app/components/headerAdmin/headerAdmin";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import Footer from "@/app/components/footer/footer";
import Swal from "sweetalert2";
import ApiServiceScholarships from "@/app/services/scholarships/ApiScholarShips";
import ApiUpdateServiceScholarships from "@/app/services/scholarships/updateScholarships";
import ApiLineNotifyServices from "@/app/services/line-notifies/line";
const URL = `${process.env.NEXT_PUBLIC_API_Forned}`;
export default function EditInternalScholarshipPage() {
  const router = useRouter();
  const searchParams = new URLSearchParams(window.location.search);
  const id = searchParams.get('id');
  const [lineToken, setLineToken] = useState<string | null>(null);
  const pathname = usePathname(); // ใช้ usePathname แทน router.events
  const [loading, setLoading] = useState(true); // เพิ่ม loading state
  const [isLoaded, setIsLoaded] = useState(false); // state เพื่อบอกว่าข้อมูลโหลดสำเร็จหรือไม่
  const [fileInputs, setFileInputs] = useState([0]);
  const [showDescriptionOtherInput, setShowDescriptionOtherInput] = useState(false);
  const [showinformationOtherInput, setShowinformationOtherInput] = useState(false);
  const [error, setError] = useState("");
  const [errorGpa, setErrorGpa] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // For displaying errors
  const [fileErrors, setFileErrors] = useState<string[]>([]); // State to track errors for each file
  const [isDraft, setIsdraft] = useState(false);
  const [existingImagePath, setExistingImagePath] = useState<string | null>(null);
  const [errorDate, setErrorDate] = useState<string | null>(null);
  const [Sstatus, setStatus] = useState(""); // เพิ่ม loading state
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
    const clearSessionStorage = () => {
      sessionStorage.removeItem('editInternalScholarshipForm');
    };

    // ล้างข้อมูลเมื่อผู้ใช้ปิดหรือโหลดหน้าใหม่
    window.addEventListener('beforeunload', clearSessionStorage);

    // ล้างข้อมูลเมื่อเส้นทางเปลี่ยนแปลง
    return () => {
      window.removeEventListener('beforeunload', clearSessionStorage);
      clearSessionStorage(); // ล้างข้อมูลเมื่อเส้นทางเปลี่ยน
    };
  }, [pathname]); // ใช้ pathname แทน router

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
  }, []);

  useEffect(() => {
    const fetchScholarshipData = async () => {
      if (id) {
        try {
          const response = await ApiServiceScholarships.getScholarship(Number(id));
          const data = response.data;
          console.log(data);
          setStatus(data.status);

          // Store the existing image path
          setExistingImagePath(data.ImagePath || null);
          // Determine if scholarship is in 'draft' status
          setIsLoaded(true); // ตั้งค่าว่าข้อมูลถูกโหลดสำเร็จแล้ว
          setLoading(false); // หยุดโหลด
          setIsdraft(data.status !== 'draft');

          const knownQualifications = [
            "มีฐานะยากจน หรือขาดแคลนทุนทรัพย์",
            "เป็นผู้พิการ",
            "มีความประพฤติดี มีความขยันหมั่นเพียร",
            "ไม่ได้รับทุนการศึกษาจากหน่วยงานหรือองค์กรอื่นใดยกเว้น  (กยศ.)",
            "กำลังศึกษาอยู่ในระดับปริญญาตรี",
          ];

          const knowndocuments = [
            "รูปถ่ายหน้าตรง",
            "สำเนาบัตรประชาชนผู้สมัคร",
            "หนังสือรับรองสภาพการเป็นนิสิต",
            "ภาพถ่ายบ้านที่เห็นตัวบ้านทั้งหมด",
            "ใบสะสมผลการเรียน",
          ];

          // Processing qualifications
          const qualificationsArray: { text: string; isActive: boolean }[] = [];
          let otherQualificationText = "";
          data.qualifications.forEach((q: { QualificationText: string, IsActive: boolean }) => {
            if (knownQualifications.includes(q.QualificationText)) {
              qualificationsArray.push({
                text: q.QualificationText,
                isActive: q.IsActive,
              });
            } else {
              otherQualificationText += `${q.QualificationText} `;
            }
          });


          // Processing documents
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


          // Store the fetched data in the form state
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
              FilePath: file.FilePath,
              Image: null, // Initially set Image to null until the user uploads a new one
            })),
          }));
          setLoading(false); // Data has been fetched

          // Show additional input fields if needed
          if (otherQualificationText) setShowDescriptionOtherInput(true);
          if (otherDocument) setShowinformationOtherInput(true);
        } catch (error) {
          console.error("Failed to fetch scholarship data:", error);
          setError("Failed to load data.");
          setLoading(false); // Stop loading even if there's an error
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }
    };

    // รีโหลดหน้าใหม่ถ้ายังไม่มีข้อมูล
    if (!isLoaded && !loading) {
      window.location.reload(); // รีโหลดหน้าใหม่ถ้าข้อมูลยังไม่มา
    } else {
      fetchScholarshipData(); // ถ้ามีข้อมูลก็ทำการ fetch
    }
  }, [id, isLoaded]);

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
        status: ''
      };
  });

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
    otherInputSetter?: React.Dispatch<React.SetStateAction<string>> | React.Dispatch<React.SetStateAction<boolean>>,
    showOtherInputSetter?: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    const { value, checked } = e.target;
    let updatedArray = [...(formData[arrayName as keyof typeof formData] || [])] as { text: string, isActive: boolean }[];

    const itemIndex = updatedArray.findIndex(item => item.text === value);

    if (value === "อื่น ๆ") {
      if (checked) {
        showOtherInputSetter && showOtherInputSetter(true); // Show "อื่น ๆ" input
        if (itemIndex === -1) {
          updatedArray.push({ text: value, isActive: true });
        } else {
          updatedArray[itemIndex].isActive = true;
        }
      } else {
        showOtherInputSetter && showOtherInputSetter(false); // Hide "อื่น ๆ" input
        if (otherInputSetter) {
          // Type narrowing based on `typeof`
          if (typeof otherInputSetter === "function" && otherInputSetter.toString().includes("string")) {
            // If it's a string setter, set it to an empty string
            (otherInputSetter as React.Dispatch<React.SetStateAction<string>>)("");
          } else {
            // If it's a boolean setter, set it to false
            (otherInputSetter as React.Dispatch<React.SetStateAction<boolean>>)(false);
          }
        }
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


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Check if the field being changed is the date fields
    if (name === "EndDate") {
      if (formData.StartDate && value < formData.StartDate) {
        setErrorDate("วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่ม");
        return; // Prevent updating the end date if it is before the start date
      } else {
        setErrorDate(null); // Clear the error if the date is valid
      }
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

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

      // Update the file in form data, making sure to keep the "file" as an object.
      const newFiles = [...formData.Files];
      newFiles[index] = { file: file, existing: false };  // Ensure the file is stored correctly
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

  // const handleCopyAndPostNew = async () => {
  //   try {
  //     // Log the original formData
  //     console.log("Original formData:", formData);

  //     // Check if formData.information and formData.Description are defined and set to empty array if not
  //     const information = Array.isArray(formData.information) ? formData.information : [];
  //     const description = Array.isArray(formData.Description) ? formData.Description : [];

  //     // Modify the ScholarshipName to avoid duplication
  //     const newScholarshipName = formData.ScholarshipName + " (คัดลอก)";

  //     // Prepare the form data for submission
  //     const submitFormData = {
  //       ...formData,
  //       ScholarshipName: newScholarshipName, // Use the new name to avoid duplication
  //       information: information.filter((item: string) => item !== "อื่น ๆ"),
  //       Description: description.filter((item: string) => item !== "อื่น ๆ"),
  //     };

  //     // Log submitFormData to see what it contains
  //     console.log("submitFormData:", submitFormData);

  //     const payload = new FormData();
  //     for (const [key, value] of Object.entries(submitFormData)) {
  //       if (Array.isArray(value)) {
  //         value.forEach((item: string) => {
  //           payload.append(`${key}[]`, item);
  //         });
  //       } else if (value instanceof Blob) {
  //         payload.append(key, value);
  //       } else {
  //         payload.append(key, value as string);
  //       }
  //     }

  //     // Log payload to check what will be sent
  //     payload.forEach((value, key) => {
  //       console.log(key, value);
  //     });

  //     // Check if an announcement file exists before adding it to the payload
  //     if (formData.AnnouncementFile) {
  //       payload.append('AnnouncementFile', formData.AnnouncementFile);
  //       console.log('AnnouncementFile:', formData.AnnouncementFile);
  //     }

  //     // Create a new scholarship
  //     const scholarshipID = await ApiAllcreateServiceScholarships.createScholarship(payload);
  //     console.log("Scholarship created with ID:", scholarshipID);

  //     // Send notification if lineToken exists
  //     if (lineToken) {
  //       const message = `ทุนการศึกษาใหม่ ${newScholarshipName} \nคลิกเพื่อดูรายละเอียด: ${URL}/page/scholarships/detail?id=${scholarshipID}`;
  //       await ApiLineNotifyServices.sendLineNotify(message, lineToken);
  //       console.log("Line notify sent with message:", message);
  //     } else {
  //       console.error("LINE Notify token is null");
  //     }

  //     // Update Courses
  //     if (formData.Major.length > 0) {
  //       await ApiAllcreateServiceScholarships.createCourses({
  //         ScholarshipID: scholarshipID,
  //         CourseName: formData.Major,
  //       });
  //       console.log("Courses updated with Major:", formData.Major);
  //     }

  //     // Update Documents
  //     if (submitFormData.information.length > 0 || formData.otherDocument) {
  //       await ApiAllcreateServiceScholarships.createDocuments({
  //         ScholarshipID: scholarshipID,
  //         documents: submitFormData.information,
  //         otherDocument: formData.otherDocument,
  //       });
  //       console.log("Documents updated with information:", submitFormData.information);
  //     }

  //     // Update Qualifications
  //     if (submitFormData.Description.length > 0) {
  //       await ApiAllcreateServiceScholarships.createQualifications({
  //         ScholarshipID: scholarshipID,
  //         qualifications: submitFormData.Description,
  //         otherQualificationText: formData.otherQualificationText,
  //       });
  //       console.log("Qualifications updated with Description:", submitFormData.Description);
  //     }

  //     // Upload the image if it exists
  //     if (formData.Image) {
  //       await ApiAllcreateServiceScholarships.createImage({
  //         ScholarshipID: scholarshipID,
  //         ImagePath: formData.Image,
  //       });
  //       console.log("Image uploaded:", formData.Image);
  //     }

  //     // Upload other files if they exist
  //     for (const file of formData.Files) {
  //       if (file && file.file) {
  //         await ApiAllcreateServiceScholarships.createFile({
  //           ScholarshipID: scholarshipID,
  //           FileType: "ไฟล์",
  //           FilePath: file.file,
  //         });
  //         console.log("File uploaded:", file.file);
  //       }
  //     }

  //     // Display success message
  //     Swal.fire({
  //       title: "",
  //       text: "คัดลอกและสร้างทุนการศึกษาใหม่เรียบร้อยแล้ว!",
  //       icon: "success"
  //     });

  //     // Clear session storage and redirect
  //     sessionStorage.clear();
  //     router.push("/page/scholarships/Manage-internal-scholarships");
  //   } catch (error) {
  //     console.error("Error copying scholarship:", error);
  //     Swal.fire({
  //       title: "Error",
  //       text: "ไม่สามารถคัดลอกทุนการศึกษาได้ กรุณาลองอีกครั้ง",
  //       icon: "error",
  //     });
  //   }
  // };




  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!id) {
      setError("Scholarship ID is missing.");
      return;
    }

    const scholarshipID = id ? Number(id) : 0; // Ensure scholarshipID is a valid number
    const originalStatus = Sstatus;  // Store the original status
    console.log(`Original status before update: ${originalStatus}`); // Log the original status

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
      status: 'finalized', // Set status to 'finalized' here
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

          // Log the status after the update to see if it changed
          console.log(`Status after update: ${submitFormData.status}`);

          // Check if the **original status** is "draft" before sending LINE notification
          if (originalStatus === "draft") {
            console.log('Original status is draft. Preparing to send LINE notification...');
            if (lineToken) {
              const message = `ทุนการศึกษาใหม่ ${formData.ScholarshipName} \nคลิกเพื่อดูรายละเอียด: ${URL}/page/scholarships/detail?id=${scholarshipID}`;
              try {
                await ApiLineNotifyServices.sendLineNotify(message, lineToken);
                console.log('LINE notification sent successfully');
              } catch (error) {
                console.error('Error sending LINE notification:', error);
              }
            } else {
              console.log('LINE token is missing. Cannot send notification.');
            }
          } else {
            console.log('Notification not sent because original status is not "draft"');
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
          // Only update the image if a new one is uploaded or the existing one is provided
          if (formData.Image) {
            await ApiUpdateServiceScholarships.updateImage(scholarshipID, formData.Image);
          } else if (existingImagePath) {
            // Send existing image path if no new image is provided
            await ApiUpdateServiceScholarships.updateImage(scholarshipID, existingImagePath);
          }


          const filesToUpdate = formData.Files
            .filter((fileObj: { file: File | null }) => fileObj.file)
            .map((fileObj: { file: File | null }) => ({
              FileType: "ไฟล์",
              FilePath: fileObj.file as File,  // Make sure fileObj.file is a File object
              Description: fileObj.file?.name || ""  // Add description as file name or empty
            }));

          // Log the filesToUpdate array to check its structure
          console.log("Files to be updated:", filesToUpdate);

          if (filesToUpdate.length > 0) {
            await ApiUpdateServiceScholarships.updateFiles(scholarshipID, filesToUpdate, scholarshipID);
          }

          console.log('Scholarship update process completed.');

          Swal.fire({
            title: "",
            text: "อัปเดตทุนการศึกษาเรียบร้อยแล้ว!",
            icon: "success"
          });

          // Clear form data and reset states
          setFormData({
            ...formData,
            Files: []  // Reset the Files array
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

                  {isDraft || (
                    <>
                      <div className="flex flex-wrap">
                        <div className="w-full md:w-1/2 px-4 mb-4">
                          <div className="mb-4">
                            <label htmlFor="Year" className="block text-gray-700 mb-2">ปีการศึกษา</label>
                            <select
                              id="Year"
                              name="Year"
                              value={formData.Year}
                              onChange={handleChange}
                              className="w-full p-3 border border-gray-300 rounded"
                            >
                              {Array.from({ length: 18 }, (_, i) => (
                                <option key={2563 + i} value={2563 + i}>
                                  {2563 + i}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="w-full md:w-1/2 px-4 mb-4">
                          <div className="mb-4">
                            <label htmlFor="YearLevel" className="block text-gray-700 mb-2">ชั้นปี</label>
                            <select
                              id="YearLevel"
                              name="YearLevel"
                              value={formData.YearLevel}
                              onChange={handleChange}
                              className="w-full p-3 border border-gray-300 rounded"
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
                        <div className="w-full md:w-1/2 px-4 mb-4">
                          <div className="mb-4">
                            <label htmlFor="Num_scholarship" className="block text-gray-700 mb-2">จำนวนทุน</label>
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

                      <div className="mb-4">
                        <label className="block text-gray-700 mb-2">คุณสมบัติ</label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <input
                              type="checkbox"
                              id="undergrad"
                              value="กำลังศึกษาอยู่ในระดับปริญญาตรี"
                              checked={formData.qualifications?.some((q: { text: string; isActive: any; }) => q.text === "กำลังศึกษาอยู่ในระดับปริญญาตรี" && q.isActive) || false}
                              onChange={(e) => handleArrayChange(e, "qualifications")}
                              className="mr-2"
                            />
                            <label htmlFor="undergrad">กำลังศึกษาอยู่ในระดับปริญญาตรี</label>
                          </div>

                          <div>
                            <input
                              type="checkbox"
                              id="notReceivingOtherScholarships"
                              value="ไม่ได้รับทุนการศึกษาจากหน่วยงานหรือองค์กรอื่นใดยกเว้น  (กยศ.)"
                              checked={formData.qualifications?.some((q: { text: string; isActive: any; }) => q.text === "ไม่ได้รับทุนการศึกษาจากหน่วยงานหรือองค์กรอื่นใดยกเว้น  (กยศ.)" && q.isActive) || false}
                              onChange={(e) => handleArrayChange(e, "qualifications")}
                              className="mr-2"
                            />
                            <label htmlFor="notReceivingOtherScholarships">ไม่ได้รับทุนการศึกษาจากหน่วยงานหรือองค์กรอื่นใดยกเว้น  (กยศ.)</label>
                          </div>

                          <div>
                            <input
                              type="checkbox"
                              id="goodBehavior"
                              value="มีความประพฤติดี มีความขยันหมั่นเพียร"
                              checked={formData.qualifications?.some((q: { text: string; isActive: any; }) => q.text === "มีความประพฤติดี มีความขยันหมั่นเพียร" && q.isActive) || false}
                              onChange={(e) => handleArrayChange(e, "qualifications")}
                              className="mr-2"
                            />
                            <label htmlFor="goodBehavior">มีความประพฤติดี มีความขยันหมั่นเพียร</label>
                          </div>

                          <div>
                            <input
                              type="checkbox"
                              id="disabled"
                              value="เป็นผู้พิการ"
                              checked={formData.qualifications?.some((q: { text: string; isActive: any; }) => q.text === "เป็นผู้พิการ" && q.isActive) || false}
                              onChange={(e) => handleArrayChange(e, "qualifications")}
                              className="mr-2"
                            />
                            <label htmlFor="disabled">เป็นผู้พิการ</label>
                          </div>

                          <div>
                            <input
                              type="checkbox"
                              id="poorFinancialStatus"
                              value="มีฐานะยากจน หรือขาดแคลนทุนทรัพย์"
                              checked={formData.qualifications?.some((q: { text: string; isActive: any; }) => q.text === "มีฐานะยากจน หรือขาดแคลนทุนทรัพย์" && q.isActive) || false}
                              onChange={(e) => handleArrayChange(e, "qualifications")}
                              className="mr-2"
                            />
                            <label htmlFor="poorFinancialStatus">มีฐานะยากจน หรือขาดแคลนทุนทรัพย์</label>
                          </div>

                          <div>
                            <input
                              type="checkbox"
                              id="other"
                              value="อื่น ๆ"
                              checked={formData.qualifications?.some((q: { text: string; isActive: any; }) => q.text === "อื่น ๆ" && q.isActive) || false}
                              onChange={(e) => handleArrayChange(e, "qualifications", setShowDescriptionOtherInput)}
                              className="mr-2"
                            />
                            <label htmlFor="other">อื่น ๆ</label>

                            {showDescriptionOtherInput && (
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
                              accept="image/*" // Only allow image types
                              onChange={handleImageChange}
                              className="w-1/3 p-3 border border-gray-300 rounded"
                            />
                            {/* Display error message */}
                            {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
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
                            {errorDate && <p className="text-red-500">{errorDate}</p>} {/* Error message */}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end mt-6 mb-8">
                        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                          บันทึก
                        </button>
                      </div>
                    </>
                  )}
                  {!isDraft || (
                    <>
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
                            {errorDate && <p className="text-red-500">{errorDate}</p>} {/* Error message */}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end mt-6 mb-8">
                        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                          บันทึก
                        </button>
                      </div>
                    </>
                  )}

                </>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
