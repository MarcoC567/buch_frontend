import type { Metadata } from "next";
import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/Navbar';
import { AuthProvider } from "../app/api/auth/AuthProvider";

export const metadata: Metadata = {
  title: "Bookstore",
  description: "a Simple Bookstore",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
    <html lang="en">
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
      <Navbar></Navbar>
        {children}
      </body>
    </html>
    </AuthProvider>
  );
}
