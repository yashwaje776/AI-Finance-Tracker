"use client";

import React from "react";
import { Brain, Wallet, LineChart, Target } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const features = [
  {
    title: "AI-Powered Insights",
    description:
      "Leverage intelligent algorithms to analyze your spending, investments, and income — helping you make smarter financial decisions automatically.",
    icon: <Brain className="w-8 h-8 text-white" />,
    tag: "Intelligence",
  },
  {
    title: "Smart Budgeting",
    description:
      "Set flexible budgets that adapt to your lifestyle. Get predictive alerts before you overspend and insights to help you stay on track.",
    icon: <Wallet className="w-8 h-8 text-white" />,
    tag: "Budget",
  },
  {
    title: "Real-Time Tracking",
    description:
      "Connect your bank accounts and track all transactions instantly with end-to-end encryption and stunning visual dashboards.",
    icon: <LineChart className="w-8 h-8 text-white" />,
    tag: "Tracking",
  },
  {
    title: "Goal Management",
    description:
      "Define financial goals — whether saving for a vacation or long-term growth — and watch AI guide you toward achieving them faster.",
    icon: <Target className="w-8 h-8 text-white" />,
    tag: "Goals",
  },
];

const FeatureSection = () => {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Powerful Features for Smarter Finances
          </span>
        </h2>

        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-16">
          AI Finance Tracker helps you understand, control, and grow your money effortlessly — powered by automation, analytics, and secure integrations.
        </p>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <CardHeader className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-md">
                        {feature.icon}
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {feature.tag}
                      </Badge>
                      <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                    </CardHeader>

                    <Separator className="my-2" />

                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-sm">
                  {feature.title}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
