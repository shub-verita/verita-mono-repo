import Link from "next/link";
import { prisma } from "@verita/database";
import { formatCurrency } from "@verita/shared";
import { Briefcase, MapPin, Clock, DollarSign, ArrowRight } from "lucide-react";

async function getPublishedJobs() {
  return prisma.job.findMany({
    where: { status: "PUBLISHED" },
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
      _count: { select: { applications: true } },
    },
  });
}

export default async function HomePage() {
  const jobs = await getPublishedJobs();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="font-semibold text-xl">Verita AI</span>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/jobs" className="text-gray-600 hover:text-gray-900">
                Jobs
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Sign In
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

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Join the AI Revolution
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Work on cutting-edge AI projects with leading companies. Flexible hours,
            competitive pay, and meaningful work.
          </p>
          <Link
            href="#jobs"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            View Open Positions
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600">500+</div>
              <div className="text-gray-500 mt-1">Active Contractors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">50+</div>
              <div className="text-gray-500 mt-1">Countries</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">$5M+</div>
              <div className="text-gray-500 mt-1">Paid to Contractors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Jobs List */}
      <section id="jobs" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Open Positions</h2>
            <p className="text-gray-500 mt-2">
              Find your next opportunity
            </p>
          </div>

          {jobs.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No open positions
              </h3>
              <p className="text-gray-500">
                Check back soon for new opportunities
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.slug}`}
                  className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow"
                >
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
                    {job.skillTags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {job.skillTags.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{job.skillTags.length - 4} more
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="font-semibold text-xl">Verita AI</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 Verita AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
