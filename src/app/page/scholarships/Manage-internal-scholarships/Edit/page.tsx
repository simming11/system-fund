"use client"
import React, { Suspense } from "react";
import dynamic from "next/dynamic";

const EditInternalScholarshipPage = dynamic(() => import("./editInternal"), {
  ssr: false
});


const UsersPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
      <EditInternalScholarshipPage/>
      </Suspense>
    </div>
  );
};

export default UsersPage;
