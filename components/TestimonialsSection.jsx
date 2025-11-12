import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote, User } from "lucide-react";

const testimonials = [
  {
    name: "Aarav Patel",
    role: "Startup Founder",
    feedback:
      "AI Finance Tracker completely changed how I manage my company’s cash flow. The AI insights are spot-on and help me make faster, smarter financial decisions.",
  },
  {
    name: "Sophie Chen",
    role: "Freelancer",
    feedback:
      "The best finance app I’ve ever used! I love the clean dashboard and how it automatically tracks my income and expenses from multiple sources.",
  },
  {
    name: "Daniel Rodriguez",
    role: "Investor",
    feedback:
      "Incredible tool. The AI forecasting and visual analytics have made it easy to plan my investments and savings strategy with confidence.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          What Our Users Say
        </h2>

        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-14">
          Trusted by professionals, creators, and investors around the world — here’s how AI Finance Tracker helps them take control of their finances.
        </p>

        <div className="grid gap-10 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="relative hover:shadow-xl transition-transform duration-300 hover:-translate-y-2 border border-gray-200 dark:border-gray-700"
            >
              <CardHeader>
                <div className="absolute top-4 left-4 text-blue-500/20">
                  <Quote className="w-8 h-8" />
                </div>

                <div className="flex flex-col items-center mt-6">
                  <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-md mb-4">
                    <User className="w-10 h-10 text-white" />
                  </div>

                  <CardTitle className="text-xl font-semibold">
                    {testimonial.name}
                  </CardTitle>
                  <CardDescription>{testimonial.role}</CardDescription>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 italic mb-4">
                  “{testimonial.feedback}”
                </p>

                <div className="flex justify-center mb-3">
                  <Badge variant="outline" className="text-sm text-blue-600 dark:text-blue-400">
                    Verified User
                  </Badge>
                </div>

                <div className="flex justify-center space-x-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}