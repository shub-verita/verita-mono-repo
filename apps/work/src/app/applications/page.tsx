"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDate } from "@verita/shared";
import {
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  ExternalLink,
} from "lucide-react";

interface Application {
  id: string;
  status: string;
  createdAt: string;
  aiScore: number | null;
  job: {
    id: string;
    title: string;
    slug: string;
    shortDescription: string;
    status: string;
  };
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<
    string,
    { icon: any; bg: string; text: string; label: string }
  > = {
    NEW: {
      icon: Clock,
      bg: "bg-blue-100",
      text: "text-blue-700",
      label: "Application Received",
    },
    REVIEWING: {
      icon: AlertCircle,
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      label: "Under Review",
    },
    SHORTLISTED: {
      icon: CheckCircle,
      bg: "bg-purple-100",
      text: "text-purple-700",
      label: "Shortlisted",
    },
    INTERVIEWING: {
      icon: Briefcase,
      bg: "bg-indigo-100",
      text: "text-indigo-700",
      label: "Interview Stage",
    },
    OFFERED: {
      icon: CheckCircle,
      bg: "bg-green-100",
      text: "text-green-700",
      label: "Offer Extended",
    },
    HIRED: {
      icon: CheckCircle,
      bg: "bg-green-100",
      text: "text-green-700",
      label: "Hired",
    },
    REJECTED: {
      icon: XCircle,
      bg: "bg-red-100",
      text: "text-red-700",
      label: "Not Selected",
    },
    WITHDRAWN: {
      icon: XCircle,
      bg: "bg-gray-100",
      text: "text-gray-700",
      label: "Withdrawn",
    },
  };

  const statusConfig = config[status] || config.NEW;
  const Icon = statusConfig.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 ${statusConfig.bg} ${statusConfig.text} text-xs rounded-full`}
    >
      <Icon className="w-3 h-3" />
      {statusConfig.label}
    </span>
  );
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const fetchApplications = async (searchEmail: string) => {
    if (!searchEmail) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/applications?email=${encodeURIComponent(searchEmail)}`
      );
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplications(email);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="font-semibold text-xl">Verita AI</span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/jobs" className="text-gray-600 hover:text-gray-900">
                Jobs
              </Link>
              <Link href="/applications" className="text-blue-600 font-medium">
                My Applications
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-2">
            Track the status of your job applications
          </p>
        </div>

        {/* Email Search */}
        <div className="bg-white rounded-xl border p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="email"
              required
              placeholder="Enter your email to view applications..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View Applications
            </button>
          </form>
        </div>

        {/* Applications List */}
        {hasSearched && (
          <>
            {isLoading ? (
              <div className="bg-white rounded-xl border p-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
              </div>
            ) : applications.length === 0 ? (
              <div className="bg-white rounded-xl border p-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No applications found
                </h3>
                <p className="text-gray-500 mb-6">
                  No applications found for this email address
                </p>
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Briefcase className="w-4 h-4" />
                  Browse Open Positions
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {app.job.title}
                          </h3>
                          <StatusBadge status={app.status} />
                        </div>
                        <p className="text-gray-500 mb-4">
                          {app.job.shortDescription}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Applied {formatDate(new Date(app.createdAt))}
                          </span>
                          {app.aiScore && (
                            <span className="flex items-center gap-1">
                              AI Score: {app.aiScore}/100
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/jobs/${app.job.slug}`}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        View Job
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Status Timeline */}
                    <div className="mt-6 pt-6 border-t">
                      <div className="flex items-center justify-between">
                        <StatusStep
                          label="Applied"
                          isComplete={true}
                          isActive={app.status === "NEW"}
                        />
                        <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
                        <StatusStep
                          label="Reviewing"
                          isComplete={[
                            "REVIEWING",
                            "SHORTLISTED",
                            "INTERVIEWING",
                            "OFFERED",
                            "HIRED",
                          ].includes(app.status)}
                          isActive={app.status === "REVIEWING"}
                        />
                        <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
                        <StatusStep
                          label="Shortlisted"
                          isComplete={[
                            "SHORTLISTED",
                            "INTERVIEWING",
                            "OFFERED",
                            "HIRED",
                          ].includes(app.status)}
                          isActive={app.status === "SHORTLISTED"}
                        />
                        <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
                        <StatusStep
                          label="Interview"
                          isComplete={["INTERVIEWING", "OFFERED", "HIRED"].includes(
                            app.status
                          )}
                          isActive={app.status === "INTERVIEWING"}
                        />
                        <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
                        <StatusStep
                          label="Offer"
                          isComplete={["OFFERED", "HIRED"].includes(app.status)}
                          isActive={app.status === "OFFERED" || app.status === "HIRED"}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function StatusStep({
  label,
  isComplete,
  isActive,
}: {
  label: string;
  isComplete: boolean;
  isActive: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center ${
          isComplete
            ? "bg-blue-600 text-white"
            : isActive
            ? "bg-blue-100 text-blue-600 border-2 border-blue-600"
            : "bg-gray-100 text-gray-400"
        }`}
      >
        {isComplete ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-current" />
        )}
      </div>
      <span
        className={`text-xs mt-1 ${
          isComplete || isActive ? "text-gray-900" : "text-gray-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
