import Link from "next/link";
import { prisma } from "@verita/database";
import { formatCurrency } from "@verita/shared";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Search,
  Filter,
} from "lucide-react";

async function getPublishedJobs(filters?: {
  search?: string;
  payType?: string;
  commitment?: string;
}) {
  const where: any = { status: "PUBLISHED" };

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { shortDescription: { contains: filters.search, mode: "insensitive" } },
      { skillTags: { has: filters.search } },
    ];
  }

  if (filters?.payType && filters.payType !== "all") {
    where.payType = filters.payType;
  }

  return prisma.job.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      payMin: true,
      payMax: true,
      payType: true,
      timeCommitment: true,
      remoteWorldwide: true,
      skillTags: true,
      publishedAt: true,
    },
  });
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: { search?: string; payType?: string; commitment?: string };
}) {
  const jobs = await getPublishedJobs(searchParams);

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
              <Link
                href="/jobs"
                className="text-blue-600 font-medium"
              >
                Jobs
              </Link>
              <Link href="/applications" className="text-gray-600 hover:text-gray-900">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Open Positions</h1>
          <p className="text-gray-600 mt-2">
            Find your next opportunity in AI
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border p-4 mb-8">
          <form className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="search"
                defaultValue={searchParams.search}
                placeholder="Search jobs by title, skills, or keywords..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              name="payType"
              defaultValue={searchParams.payType || "all"}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Pay Types</option>
              <option value="HOURLY">Hourly</option>
              <option value="PER_TASK">Per Task</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
          </form>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-500 mb-4">
          {jobs.length} {jobs.length === 1 ? "position" : "positions"} available
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No positions found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search criteria
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.slug}`}
                className="block bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {job.title}
                    </h3>
                    <p className="text-gray-500 mb-4 line-clamp-2">
                      {job.shortDescription}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
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
                        {job.remoteWorldwide ? "Remote (Worldwide)" : "Remote"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {job.skillTags.slice(0, 5).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {job.skillTags.length > 5 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{job.skillTags.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="ml-6">
                    <span className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                      View Details
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
