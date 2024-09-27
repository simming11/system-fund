"use client"
import React, { Suspense } from "react";
import dynamic from "next/dynamic";

const CreateExternalScholarshipPage = dynamic(() => import("./CreateExternalScholarships"), {
  ssr: false
});

const UsersPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
      <CreateExternalScholarshipPage/>
      </Suspense>
    </div>
  );
};

export default UsersPage;
