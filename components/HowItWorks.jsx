import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link as LinkIcon, BrainCircuit, BarChart3 } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Connect Your Accounts",
    description:
      "Securely link your bank, credit card, and investment accounts in seconds. We use bank-level encryption to keep your data safe.",
    icon: <LinkIcon className="w-10 h-10 text-white" />,
  },
  {
    step: "02",
    title: "AI Analyzes Your Finances",
    description:
      "Our intelligent engine categorizes your transactions, tracks spending, and identifies insights to optimize your money flow automatically.",
    icon: <BrainCircuit className="w-10 h-10 text-white" />,
  },
  {
    step: "03",
    title: "Get Personalized Insights",
    description:
      "Receive actionable insights, visual reports, and predictions to help you save more, invest better, and reach your goals faster.",
    icon: <BarChart3 className="w-10 h-10 text-white" />,
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            How It Works
          </span>
        </h2>

        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-16">
          Get started in minutes. Connect your accounts, let AI do the heavy lifting, and enjoy financial clarity like never before.
        </p>

        <div className="grid md:grid-cols-3 gap-10 mt-10">
          {steps.map((step, index) => (
            <Card
              key={index}
              className="relative overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:-translate-y-2 transition-all duration-300"
            >
              <CardHeader className="flex flex-col items-center">
                <Badge
                  variant="secondary"
                  className="mb-3 px-3 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                >
                  Step {step.step}
                </Badge>

                <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-md mb-4">
                  {step.icon}
                </div>

                <CardTitle className="text-2xl font-semibold">{step.title}</CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400 mt-2">
                  {step.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Separator className="my-4 bg-gray-200 dark:bg-gray-700" />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Simple, secure, and designed to make finance effortless.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}