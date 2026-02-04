import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@verita/database";
import { formatCurrency } from "@verita/shared";
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  CheckCircle,
} from "lucide-react";

async function getJob(slug: string) {
  return prisma.job.findUnique({
    where: { slug, status: "PUBLISHED" },
  });
}

export default async function JobDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const job = await getJob(params.slug);

  if (!job) {
    notFound();
  }

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
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Jobs
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>

        {/* Job Header */}
        <div className="bg-white rounded-xl border p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>

          <div className="flex flex-wrap gap-6 text-gray-600 mb-6">
            <span className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              {formatCurrency(job.payMin)} - {formatCurrency(job.payMax)}
              {job.payType === "HOURLY" ? "/hr" : "/task"}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {job.timeCommitment}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {job.remoteWorldwide ? "Remote (Worldwide)" : "Remote"}
            </span>
          </div>

          <p className="text-gray-600 text-lg mb-6">{job.shortDescription}</p>

          <div className="flex flex-wrap gap-2 mb-8">
            {job.skillTags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          <Link
            href={`/jobs/${job.slug}/apply`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            <Briefcase className="w-5 h-5" />
            Apply Now
          </Link>
        </div>

        {/* Job Details */}
        <div className="space-y-8">
          <section className="bg-white rounded-xl border p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              About the Role
            </h2>
            <div className="prose text-gray-600 whitespace-pre-line">
              {job.fullDescription}
            </div>
          </section>

          <section className="bg-white rounded-xl border p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Responsibilities
            </h2>
            <div className="prose text-gray-600 whitespace-pre-line">
              {job.responsibilities}
            </div>
          </section>

          <section className="bg-white rounded-xl border p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Requirements
            </h2>
            <div className="prose text-gray-600 whitespace-pre-line">
              {job.requirements}
            </div>
          </section>

          {job.niceToHave && (
            <section className="bg-white rounded-xl border p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Nice to Have
              </h2>
              <div className="prose text-gray-600 whitespace-pre-line">
                {job.niceToHave}
              </div>
            </section>
          )}

          {job.tools.length > 0 && (
            <section className="bg-white rounded-xl border p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Tools & Technologies
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.tools.map((tool) => (
                  <span
                    key={tool}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Apply CTA */}
        <div className="bg-blue-600 rounded-xl p-8 mt-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Apply?</h2>
          <p className="mb-6 text-blue-100">
            Join our team and work on cutting-edge AI projects
          </p>
          <Link
            href={`/jobs/${job.slug}/apply`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50"
          >
            <Briefcase className="w-5 h-5" />
            Apply Now
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
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
