"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-6">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>

      <p className="text-lg text-gray-600 mb-8">
        Oops! The page you’re looking for doesn’t exist or has been moved.
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full shadow-lg transition-all"
      >
        <ArrowLeft className="w-5 h-5" />
        Go Back Home
      </Link>
    </div>
  );
}
