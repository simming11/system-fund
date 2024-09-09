import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import HeaderHome from "./components/headerHome/headerHome";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ทุนการศึกษา",
  description: "ทุนการศึกษาของมหาวิทยาลัย",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="content">
          {children}
        </div>
      </body>
    </html>
  );
}
