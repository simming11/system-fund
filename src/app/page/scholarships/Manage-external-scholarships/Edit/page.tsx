"use client"
import React, { Suspense } from "react";
import dynamic from "next/dynamic";

const EditExternalScholarshipPage = dynamic(() => import("./editExternal"), {
  ssr: false
});

const UsersPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
      <EditExternalScholarshipPage/>
      </Suspense>
    </div>
  );
};

export default UsersPage;
