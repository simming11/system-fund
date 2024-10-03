"use client"
import React, { Suspense } from "react";
import dynamic from "next/dynamic";

const CloneInternalScholarshipPage = dynamic(() => import("./cloneInternal"), {
  ssr: false
});


const UsersPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
      <CloneInternalScholarshipPage/>
      </Suspense>
    </div>
  );
};

export default UsersPage;
