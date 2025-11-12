"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-white dark:bg-gray-950">
      <div className="container mx-auto">
        <h1
          className="
            text-4xl 
            sm:text-6xl 
            md:text-7xl 
            lg:text-[85px] 
            font-extrabold 
            leading-tight 
            tracking-tight 
            gradient-title
          "
        >
          Simplify Your Workflow
          <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
            with Smart Collaboration
          </span>
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-300 mt-6 mb-10 max-w-2xl mx-auto">
          A next-generation project management tool that helps teams plan,
          track, and deliver projects faster — powered by real-time collaboration
          and AI insights.
        </p>

        <div className="flex justify-center ">
          <Link href="/sign-up">
            <Button
              size="lg"
              className="cursor-pointer animate-bounce px-8 py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition"
            >
              Try for Free
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
