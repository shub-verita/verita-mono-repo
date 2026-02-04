import Link from "next/link";
import { prisma } from "@verita/database";
import { formatDate, formatCurrency } from "@verita/shared";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  Users,
  Clock,
} from "lucide-react";

async function getJobs() {
  return prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { applications: true } },
    },
  });
}

async function getStats() {
  const [total, published, applications] = await Promise.all([
    prisma.job.count(),
    prisma.job.count({ where: { status: "PUBLISHED" } }),
    prisma.application.count(),
  ]);
  return { total, published, applications };
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    DRAFT: { bg: "bg-gray-100", text: "text-gray-700" },
    PUBLISHED: { bg: "bg-green-100", text: "text-green-700" },
    CLOSED: { bg: "bg-orange-100", text: "text-orange-700" },
    ARCHIVED: { bg: "bg-red-100", text: "text-red-700" },
  };

  const { bg, text } = config[status] || config.DRAFT;

  return (
    <span className={`px-2 py-1 ${bg} ${text} text-xs rounded-full`}>
      {status}
    </span>
  );
}

export default async function JobsPage() {
  const [jobs, stats] = await Promise.all([getJobs(), getStats()]);

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
          <p className="text-gray-600 mt-1">Manage your job listings</p>
        </div>
        <Link
          href="/jobs/new"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Job
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-gray-500 text-sm">Total Jobs</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-gray-500 text-sm">Published</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.published}</div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-gray-500 text-sm">Total Applications</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.applications}</div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                className="pl-10 pr-4 py-2 border rounded-lg text-sm w-64"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        <div className="divide-y">
          {jobs.length === 0 ? (
            <div className="p-12 text-center">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No jobs yet
              </h3>
              <p className="text-gray-500 mb-4">
                Create your first job posting
              </p>
              <Link
                href="/jobs/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Create Job
              </Link>
            </div>
          ) : (
            jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-gray-900">{job.title}</h3>
                    <StatusBadge status={job.status} />
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                    {job.shortDescription}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(job.payMin)} - {formatCurrency(job.payMax)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {job.payType === "HOURLY" ? "per hour" : "per task"}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-gray-900">
                      <Users className="w-4 h-4" />
                      {job._count.applications}
                    </div>
                    <div className="text-xs text-gray-500">applications</div>
                  </div>

                  <div className="text-right text-sm text-gray-500">
                    {formatDate(job.createdAt)}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
