"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Circle,
  FileText,
  Shield,
  CreditCard,
  User,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  status: "complete" | "current" | "pending";
  href?: string;
  action?: string;
}

export default function OnboardingPage() {
  const [steps] = useState<OnboardingStep[]>([
    {
      id: "profile",
      title: "Complete Your Profile",
      description: "Add your personal information, skills, and experience",
      icon: User,
      status: "complete",
      href: "/profile",
    },
    {
      id: "background",
      title: "Background Check",
      description: "Complete the Checkr background verification",
      icon: Shield,
      status: "current",
      action: "Start Background Check",
    },
    {
      id: "documents",
      title: "Sign Documents",
      description: "Review and sign contractor agreement and NDA",
      icon: FileText,
      status: "pending",
      href: "/documents",
    },
    {
      id: "payment",
      title: "Set Up Payments",
      description: "Connect with Deel to receive payments",
      icon: CreditCard,
      status: "pending",
      action: "Connect Deel",
    },
  ]);

  const completedSteps = steps.filter((s) => s.status === "complete").length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="font-semibold text-xl">Verita AI</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Verita AI!
          </h1>
          <p className="text-gray-600 text-lg">
            Complete these steps to start working with us
          </p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium text-gray-900">Your Progress</span>
            <span className="text-sm text-gray-500">
              {completedSteps} of {steps.length} completed
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isComplete = step.status === "complete";
            const isCurrent = step.status === "current";

            return (
              <div
                key={step.id}
                className={`bg-white rounded-xl border p-6 ${
                  isCurrent ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isComplete
                        ? "bg-green-100"
                        : isCurrent
                          ? "bg-blue-100"
                          : "bg-gray-100"
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <Icon
                        className={`w-6 h-6 ${
                          isCurrent ? "text-blue-600" : "text-gray-400"
                        }`}
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`font-semibold ${
                          isComplete ? "text-green-700" : "text-gray-900"
                        }`}
                      >
                        {step.title}
                      </h3>
                      {isComplete && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Completed
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          In Progress
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 mb-4">{step.description}</p>

                    {!isComplete && (
                      <div className="flex items-center gap-3">
                        {step.href && (
                          <Link
                            href={step.href}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                              isCurrent
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {step.action || "Continue"}
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        )}
                        {step.action && !step.href && (
                          <button
                            disabled={!isCurrent}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                              isCurrent
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-100 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            {step.action}
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-gray-300 font-bold text-lg">
                    {index + 1}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Help */}
        <div className="mt-12 text-center">
          <p className="text-gray-500">
            Need help?{" "}
            <a href="mailto:support@verita-ai.com" className="text-blue-600 hover:underline">
              Contact our support team
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
