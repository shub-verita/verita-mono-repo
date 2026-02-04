import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@verita/database";
import { formatCurrency, formatDate } from "@verita/shared";
import {
  ArrowLeft,
  Users,
  Clock,
  DollarSign,
  MapPin,
  Calendar,
  Eye,
  ExternalLink,
} from "lucide-react";
import { JobActions } from "./job-actions";

async function getJob(id: string) {
  return prisma.job.findUnique({
    where: { id },
    include: {
      applications: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      _count: { select: { applications: true } },
    },
  });
}

async function getApplicationStats(jobId: string) {
  const [total, newCount, reviewing, shortlisted, hired] = await Promise.all([
    prisma.application.count({ where: { jobId } }),
    prisma.application.count({ where: { jobId, status: "NEW" } }),
    prisma.application.count({ where: { jobId, status: "REVIEWING" } }),
    prisma.application.count({ where: { jobId, status: "SHORTLISTED" } }),
    prisma.application.count({ where: { jobId, status: "HIRED" } }),
  ]);
  return { total, new: newCount, reviewing, shortlisted, hired };
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
    <span className={`px-2 py-1 ${bg} ${text} text-xs rounded-full`}>
      {status}
    </span>
  );
}

export default async function JobDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [job, stats] = await Promise.all([
    getJob(params.id),
    getApplicationStats(params.id),
  ]);

  if (!job) {
    notFound();
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/jobs"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  job.status === "PUBLISHED"
                    ? "bg-green-100 text-green-700"
                    : job.status === "CLOSED"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-100 text-gray-700"
                }`}
              >
                {job.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {formatCurrency(job.payMin)} - {formatCurrency(job.payMax)}
                {job.payType === "HOURLY" ? "/hr" : "/task"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {job.timeCommitment}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {job.remoteWorldwide ? "Worldwide" : "Limited"}
              </span>
            </div>
          </div>
        </div>

        <JobActions jobId={job.id} currentStatus={job.status} slug={job.slug} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Applications</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          <div className="text-sm text-gray-500">New</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.reviewing}</div>
          <div className="text-sm text-gray-500">Reviewing</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.shortlisted}</div>
          <div className="text-sm text-gray-500">Shortlisted</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-2xl font-bold text-green-600">{stats.hired}</div>
          <div className="text-sm text-gray-500">Hired</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Applications */}
          <div className="bg-white rounded-xl border">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                Recent Applications ({job._count.applications})
              </h2>
              <Link
                href={`/applications?job=${job.id}`}
                className="text-sm text-green-600 hover:text-green-700"
              >
                View All
              </Link>
            </div>
            <div className="divide-y">
              {job.applications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No applications yet
                </div>
              ) : (
                job.applications.map((app) => (
                  <Link
                    key={app.id}
                    href={`/applications/${app.id}`}
                    className="p-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{app.fullName}</div>
                      <div className="text-sm text-gray-500">{app.email}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-500">
                        {formatDate(app.createdAt)}
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Job Details */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Job Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-900">{formatDate(job.createdAt)}</span>
              </div>
              {job.publishedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Published</span>
                  <span className="text-gray-900">{formatDate(job.publishedAt)}</span>
                </div>
              )}
              {job.applicationDeadline && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Deadline</span>
                  <span className="text-gray-900">
                    {formatDate(job.applicationDeadline)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {job.skillTags.length > 0 && (
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skillTags.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tools */}
          {job.tools.length > 0 && (
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Tools</h3>
              <div className="flex flex-wrap gap-2">
                {job.tools.map((tool) => (
                  <span
                    key={tool}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
