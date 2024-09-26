// src/app/page/admins/page.tsx

"use client";
import React, { Suspense } from "react";
import dynamic from "next/dynamic";

const CreateApplicationInternalPage = dynamic(() => import("./CreateApplicationInternal"), {
  ssr: false
});

const AdminPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
      <CreateApplicationInternalPage />
      </Suspense>
    </div>
  );
}

export default AdminPage;
