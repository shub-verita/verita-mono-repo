import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@verita/database";
import { formatDate } from "@verita/shared";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Phone,
  Globe,
  Briefcase,
  Star,
  FileText,
  MessageSquare,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { ApplicationActions } from "./application-actions";
import { ApplicationNotes } from "./application-notes";

async function getApplication(id: string) {
  return prisma.application.findUnique({
    where: { id },
    include: {
      job: true,
      notes: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    NEW: { bg: "bg-blue-100", text: "text-blue-700" },
    REVIEWING: { bg: "bg-yellow-100", text: "text-yellow-700" },
    SHORTLISTED: { bg: "bg-purple-100", text: "text-purple-700" },
    INTERVIEWING: { bg: "bg-indigo-100", text: "text-indigo-700" },
    OFFERED: { bg: "bg-green-100", text: "text-green-700" },
    HIRED: { bg: "bg-green-100", text: "text-green-700" },
    REJECTED: { bg: "bg-red-100", text: "text-red-700" },
    WITHDRAWN: { bg: "bg-gray-100", text: "text-gray-700" },
  };

  const { bg, text } = config[status] || config.NEW;

  return (
    <span className={`px-3 py-1 ${bg} ${text} text-sm rounded-full font-medium`}>
      {status}
    </span>
  );
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const application = await getApplication(params.id);

  if (!application) {
    notFound();
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/applications"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {application.fullName}
              </h1>
              <StatusBadge status={application.status} />
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {application.email}
              </span>
              {application.country && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {application.country}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Applied {formatDate(application.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <ApplicationActions
          applicationId={application.id}
          currentStatus={application.status}
          hasAiScore={!!application.aiScore}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* AI Screening Results */}
          {application.aiScore && (
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-500" />
                <h2 className="font-semibold text-gray-900">
                  AI Screening Results
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-900">
                    {application.aiScore}
                  </div>
                  <div className="text-sm text-gray-500">Overall Score</div>
                </div>
                <div className="col-span-2 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-700">
                    {application.aiSummary || "No summary available"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {application.aiStrengths &&
                  application.aiStrengths.length > 0 && (
                    <div>
                      <h4 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Strengths
                      </h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {application.aiStrengths.map(
                          (strength: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-green-500">+</span>
                              {strength}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                {application.aiWeaknesses &&
                  application.aiWeaknesses.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-700 mb-2 flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        Areas of Concern
                      </h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {application.aiWeaknesses.map(
                          (weakness: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-red-500">-</span>
                              {weakness}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Why Interested */}
          {application.whyInterested && (
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-gray-500" />
                <h2 className="font-semibold text-gray-900">Why They're Interested</h2>
              </div>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {application.whyInterested}
              </div>
            </div>
          )}

          {/* Relevant Experience */}
          {application.relevantExperience && (
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-gray-500" />
                <h2 className="font-semibold text-gray-900">Relevant Experience</h2>
              </div>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {application.relevantExperience}
              </div>
            </div>
          )}

          {/* Resume / Portfolio */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-gray-500" />
              <h2 className="font-semibold text-gray-900">Documents</h2>
            </div>
            <div className="space-y-3">
              {application.resumeUrl && (
                <a
                  href={application.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-red-500" />
                    <span className="font-medium">Resume</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              )}
              {application.portfolioUrl && (
                <a
                  href={application.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">Portfolio</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              )}
              {application.linkedinUrl && (
                <a
                  href={application.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">LinkedIn</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              )}
              {!application.resumeUrl &&
                !application.portfolioUrl &&
                !application.linkedinUrl && (
                  <p className="text-gray-500 text-sm">No documents attached</p>
                )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-gray-500" />
              <h2 className="font-semibold text-gray-900">Notes</h2>
            </div>
            <ApplicationNotes
              applicationId={application.id}
              notes={application.notes}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Job Details */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Applied For
            </h3>
            <Link
              href={`/jobs/${application.job.id}`}
              className="block p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="font-medium text-gray-900">
                {application.job.title}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {application.job.shortDescription}
              </div>
            </Link>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Contact Information
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <a
                  href={`mailto:${application.email}`}
                  className="text-green-600 hover:underline"
                >
                  {application.email}
                </a>
              </div>
              {application.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{application.phone}</span>
                </div>
              )}
              {application.country && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{application.country}</span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                <div>
                  <div className="text-sm font-medium">Application Received</div>
                  <div className="text-xs text-gray-500">
                    {formatDate(application.createdAt)}
                  </div>
                </div>
              </div>
              {application.aiScore && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />
                  <div>
                    <div className="text-sm font-medium">AI Screening Complete</div>
                    <div className="text-xs text-gray-500">
                      Score: {application.aiScore}/100
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
