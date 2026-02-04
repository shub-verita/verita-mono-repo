import Link from "next/link";
import { prisma } from "@verita/database";
import { formatDate } from "@verita/shared";
import {
  Users,
  Search,
  Filter,
  Star,
  Mail,
  MapPin,
  Briefcase,
  ExternalLink,
} from "lucide-react";

async function getApplications(status?: string, jobId?: string) {
  const where: any = {};

  if (status && status !== "all") {
    where.status = status;
  }

  if (jobId) {
    where.jobId = jobId;
  }

  return prisma.application.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      _count: {
        select: { notes: true },
      },
    },
  });
}

async function getJobs() {
  return prisma.job.findMany({
    where: { status: { in: ["PUBLISHED", "CLOSED"] } },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true },
  });
}

async function getStats() {
  const [total, newCount, reviewing, shortlisted, hired, rejected] =
    await Promise.all([
      prisma.application.count(),
      prisma.application.count({ where: { status: "NEW" } }),
      prisma.application.count({ where: { status: "REVIEWING" } }),
      prisma.application.count({ where: { status: "SHORTLISTED" } }),
      prisma.application.count({ where: { status: "HIRED" } }),
      prisma.application.count({ where: { status: "REJECTED" } }),
    ]);

  return { total, new: newCount, reviewing, shortlisted, hired, rejected };
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

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: { status?: string; job?: string };
}) {
  const [applications, jobs, stats] = await Promise.all([
    getApplications(searchParams.status, searchParams.job),
    getJobs(),
    getStats(),
  ]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600">
            Review and manage job applications
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-4 mb-8">
        <Link
          href="/applications"
          className={`bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${
            !searchParams.status ? "ring-2 ring-green-500" : ""
          }`}
        >
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total</div>
        </Link>
        <Link
          href="/applications?status=NEW"
          className={`bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${
            searchParams.status === "NEW" ? "ring-2 ring-blue-500" : ""
          }`}
        >
          <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          <div className="text-sm text-gray-500">New</div>
        </Link>
        <Link
          href="/applications?status=REVIEWING"
          className={`bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${
            searchParams.status === "REVIEWING" ? "ring-2 ring-yellow-500" : ""
          }`}
        >
          <div className="text-2xl font-bold text-yellow-600">
            {stats.reviewing}
          </div>
          <div className="text-sm text-gray-500">Reviewing</div>
        </Link>
        <Link
          href="/applications?status=SHORTLISTED"
          className={`bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${
            searchParams.status === "SHORTLISTED" ? "ring-2 ring-purple-500" : ""
          }`}
        >
          <div className="text-2xl font-bold text-purple-600">
            {stats.shortlisted}
          </div>
          <div className="text-sm text-gray-500">Shortlisted</div>
        </Link>
        <Link
          href="/applications?status=HIRED"
          className={`bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${
            searchParams.status === "HIRED" ? "ring-2 ring-green-500" : ""
          }`}
        >
          <div className="text-2xl font-bold text-green-600">{stats.hired}</div>
          <div className="text-sm text-gray-500">Hired</div>
        </Link>
        <Link
          href="/applications?status=REJECTED"
          className={`bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${
            searchParams.status === "REJECTED" ? "ring-2 ring-red-500" : ""
          }`}
        >
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-sm text-gray-500">Rejected</div>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <select
            defaultValue={searchParams.job || ""}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Jobs</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                Applicant
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                Job
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                AI Score
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                Status
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                Applied
              </th>
              <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {applications.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No applications found
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {app.fullName}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {app.email}
                      </div>
                      {app.country && (
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {app.country}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/jobs/${app.job.id}`}
                      className="text-green-600 hover:text-green-700 flex items-center gap-1"
                    >
                      <Briefcase className="w-4 h-4" />
                      {app.job.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    {app.aiScore ? (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">{app.aiScore}/100</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Not screened</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(app.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/applications/${app.id}`}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
