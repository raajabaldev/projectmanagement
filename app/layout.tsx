import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ProjectProvider } from "./context/ProjectContext";
import { AuthProvider } from "./context/AuthContext";
import { ExpenseProvider } from "./context/ExpenseContext";
import { ReportProvider } from "./context/ReportContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Project Manager — Antigravity",
  description: "All-In-One Project Manager with Antigravity UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 min-h-screen`}>
        <AuthProvider>
          <ProjectProvider>
            <ExpenseProvider>
              <ReportProvider>
                {children}
              </ReportProvider>
            </ExpenseProvider>
          </ProjectProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
