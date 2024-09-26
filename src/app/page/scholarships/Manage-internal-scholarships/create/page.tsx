"use client"
import React, { Suspense } from "react";
import dynamic from "next/dynamic";

const CreateInternalScholarshipPage = dynamic(() => import("./CreateInternalScholarships"), {
  ssr: false
});


const UsersPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
      <CreateInternalScholarshipPage/>
      </Suspense>
    </div>
  );
};

export default UsersPage;
