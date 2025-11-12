import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "FinSight",
  description: "AI-powered finance tracker",
};
export default async function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <Providers>
        <html lang="en">
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <Header></Header>
            <main className="min-h-screen grow">{children}</main>
            <Footer></Footer>
            <Toaster position="bottom-right" reverseOrder={false} />
          </body>
        </html>
      </Providers>
    </ClerkProvider>
  );
}
