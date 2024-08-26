'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import ApiService from "@/app/services/scholarships/ApiScholarShips";
import HeaderHome from "@/app/components/headerHome/headerHome";
import Header from "@/app/components/header/Header";
import Footer from "@/app/components/footer/footer";

export default function CreateApplicationExternalPage() {
    const searchParams = useSearchParams();
    const id = searchParams.get('scholarshipId');
    const router = useRouter();
    const [formData, setFormData] = useState({
        ScholarshipName: "",
        Description: "",
        YearLevel: "",
        TypeID: "",
        FundingSource: "",
        StartDate: "",
        EndDate: "",
        Status: "",
        CreatedBy: localStorage.getItem('AcademicID') || '',
        Files: [] as File[],
        Image: null as File | null,
    });
    const [fileInputs, setFileInputs] = useState([0]);

    const [error, setError] = useState("");
    const [showSection, setShowSection] = useState({
        scholarshipInfo: true,
        additionalInfo: true,
        files: true,
    });

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
        if (e.target.files) {
            setFormData({
                ...formData,
                Image: e.target.files[0] as File,
            });
        }
    };

    const handleAddFileInput = () => {
        setFileInputs([...fileInputs, fileInputs.length]);
    };

    const handleRemoveFileInput = (index: number) => {
        const newFileInputs = fileInputs.filter((_, i) => i !== index);
        const newFiles = formData.Files.filter((_, i) => i !== index);
        setFileInputs(newFileInputs);
        setFormData({
            ...formData,
            Files: newFiles,
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // if (Object.values(formData).some((value) => value === "" || (Array.isArray(value) && value.length === 0))) {
        //   setError("All fields are required");
        //   return;
        // }

        const payload = new FormData();
        for (const [key, value] of Object.entries(formData)) {
            if (key === "Files" && Array.isArray(value)) {
                value.forEach((file) => payload.append("Files[]", file));
            } else {
                payload.append(key, value as string | Blob);
            }
        }

        try {
            await ApiService.createScholarship(payload);
            router.push("/scholarships");
        } catch (error) {
            setError("Failed to create scholarship");
            console.error("Error creating scholarship", error);
        }
    };

    const toggleSection = (section: keyof typeof showSection) => {
        setShowSection((prevShowSection) => ({
            ...prevShowSection,
            [section]: !prevShowSection[section],
        }));
    };

    return (
        <div className="min-h-screen flex flex-col">
            <HeaderHome />
            <Header />
            <div className="flex-1 container mx-auto px-4 py-8">
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-2xl font-semibold mb-6">Create Scholarship</h2>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <h3
                                className="text-lg font-semibold mb-2 cursor-pointer"
                                onClick={() => toggleSection("scholarshipInfo")}
                            >
                                ข้อมูลทุนการศึกษา
                                <span>{showSection.scholarshipInfo ? "-" : "+"}</span>
                            </h3>
                            {showSection.scholarshipInfo && (
                                <>
                                    <div className="mb-4">
                                        <label
                                            htmlFor="ScholarshipName"
                                            className="block text-gray-700 mb-2"
                                        >
                                            ชื่อทุนการศึกษา
                                        </label>
                                        <input
                                            type="text"
                                            id="ScholarshipName"
                                            name="ScholarshipName"
                                            value={formData.ScholarshipName}
                                            onChange={handleChange}
                                            className="w-full p-3 border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label
                                            htmlFor="Description"
                                            className="block text-gray-700 mb-2"
                                        >
                                            รายละเอียด
                                        </label>
                                        <textarea
                                            id="Description"
                                            name="Description"
                                            value={formData.Description}
                                            onChange={handleChange}
                                            className="w-full p-3 border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label
                                            htmlFor="YearLevel"
                                            className="block text-gray-700 mb-2"
                                        >
                                            ชั้นปี
                                        </label>
                                        <select
                                            id="YearLevel"
                                            name="YearLevel"
                                            value={formData.YearLevel}
                                            onChange={handleChange}
                                            className="w-full p-3 border border-gray-300 rounded"
                                        >
                                            <option value="" disabled>เลือกชั้นปี</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="4">4</option>
                                            <option value="1-2">1-2</option>
                                            <option value="1-3">1-3</option>
                                            <option value="1-4">1-4</option>
                                            <option value="2-2">2-2</option>
                                            <option value="2-3">2-3</option>
                                            <option value="2-4">2-4</option>
                                            <option value="3-4">3-4</option>
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <label
                                            htmlFor="TypeID"
                                            className="block text-gray-700 mb-2"
                                        >
                                            ประเภททุน
                                        </label>
                                        <select
                                            id="TypeID"
                                            name="TypeID"
                                            value={formData.TypeID}
                                            onChange={handleChange}
                                            className="w-full p-3 border border-gray-300 rounded"
                                        >
                                            <option value="" disabled>
                                                เลือกประเภททุน
                                            </option>
                                            <option value="1">ภายใน</option>
                                            <option value="2">ภายนอก</option>
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <label
                                            htmlFor="FundingSource"
                                            className="block text-gray-700 mb-2"
                                        >
                                            แหล่งที่มาของทุน
                                        </label>
                                        <input
                                            type="text"
                                            id="FundingSource"
                                            name="FundingSource"
                                            value={formData.FundingSource}
                                            onChange={handleChange}
                                            className="w-full p-3 border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="StartDate" className="block text-gray-700 mb-2">
                                            วันที่เริ่ม
                                        </label>
                                        <input
                                            type="date"
                                            id="StartDate"
                                            name="StartDate"
                                            value={formData.StartDate}
                                            onChange={handleChange}
                                            className="w-full p-3 border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="EndDate" className="block text-gray-700 mb-2">
                                            วันที่สิ้นสุด
                                        </label>
                                        <input
                                            type="date"
                                            id="EndDate"
                                            name="EndDate"
                                            value={formData.EndDate}
                                            onChange={handleChange}
                                            className="w-full p-3 border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="Status" className="block text-gray-700 mb-2">
                                            สถานะ
                                        </label>
                                        <input
                                            type="text"
                                            id="Status"
                                            name="Status"
                                            value={formData.Status}
                                            onChange={handleChange}
                                            className="w-full p-3 border border-gray-300 rounded"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="mb-4">
                            <h3
                                className="text-lg font-semibold mb-2 cursor-pointer"
                                onClick={() => toggleSection("files")}
                            >
                                อัพโหลดไฟล์
                                <span>{showSection.files ? "-" : "+"}</span>
                            </h3>
                            {showSection.files && (
                                <>
                                    {fileInputs.map((input, index) => (
                                        <div className="mb-4" key={index}>
                                            <label
                                                htmlFor={`Files-${index}`}
                                                className="block text-gray-700 mb-2"
                                            >
                                                อัพโหลดไฟล์
                                            </label>
                                            <input
                                                type="file"
                                                id={`Files-${index}`}
                                                name="Files"
                                                onChange={(e) => handleFileChange(e, index)}
                                                className="w-full p-3 border border-gray-300 rounded"
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
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-2"
                                    >
                                        เพิ่มอัพโหลดไฟล์
                                    </button>
                                    <div className="mb-4">
                                        <label
                                            htmlFor="Image"
                                            className="block text-gray-700 mb-2"
                                        >
                                            อัพโหลดรูปภาพ
                                        </label>
                                        <input
                                            type="file"
                                            id="Image"
                                            name="Image"
                                            onChange={handleImageChange}
                                            className="w-full p-3 border border-gray-300 rounded"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-6"
                        >
                            ประกาศทุนการศึกษาใหม่
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
}
