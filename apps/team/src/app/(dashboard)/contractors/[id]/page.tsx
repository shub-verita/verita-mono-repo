import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@verita/database";
import { formatCurrency, formatDate, formatHours } from "@verita/shared";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  FileText,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { ContractorActions } from "./contractor-actions";

async function getContractor(id: string) {
  return prisma.contractor.findUnique({
    where: { id },
    include: {
      documents: { orderBy: { createdAt: "desc" } },
      projectAssignments: {
        include: { project: true },
        orderBy: { assignedAt: "desc" },
      },
      timeEntries: {
        orderBy: { date: "desc" },
        take: 10,
        include: { project: { select: { name: true } } },
      },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      notes: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });
}

export default async function ContractorDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const contractor = await getContractor(params.id);

  if (!contractor) {
    notFound();
  }

  const totalEarnings = contractor.payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + Number(p.netAmount), 0);

  const totalHours = contractor.timeEntries.reduce(
    (sum, te) => sum + Number(te.totalHours),
    0
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/contractors"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-700 text-xl font-semibold">
              {contractor.firstName[0]}
              {contractor.lastName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {contractor.firstName} {contractor.lastName}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {contractor.email}
                </span>
                {contractor.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {contractor.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {contractor.country}
                </span>
              </div>
            </div>
          </div>
        </div>

        <ContractorActions
          contractorId={contractor.id}
          currentStatus={contractor.status}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-gray-500 text-sm">Hourly Rate</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(Number(contractor.hourlyRate))}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-gray-500 text-sm">Total Hours</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatHours(totalHours)}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-gray-500 text-sm">Total Earned</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalEarnings)}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-gray-500 text-sm">Start Date</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatDate(contractor.startDate)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Project Assignments */}
          <div className="bg-white rounded-xl border">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Project Assignments</h2>
            </div>
            <div className="divide-y">
              {contractor.projectAssignments.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No project assignments yet
                </div>
              ) : (
                contractor.projectAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div>
                      <Link
                        href={`/projects/${assignment.project.id}`}
                        className="font-medium text-gray-900 hover:text-green-600"
                      >
                        {assignment.project.name}
                      </Link>
                      {assignment.role && (
                        <div className="text-sm text-gray-500">
                          {assignment.role}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(
                          Number(assignment.hourlyRate || contractor.hourlyRate)
                        )}
                        /hr
                      </div>
                      <div className="text-xs text-gray-500">
                        Since {formatDate(assignment.assignedAt)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Time Entries */}
          <div className="bg-white rounded-xl border">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Recent Time Entries</h2>
              <Link
                href={`/hours?contractor=${contractor.id}`}
                className="text-sm text-green-600 hover:text-green-700"
              >
                View All
              </Link>
            </div>
            <div className="divide-y">
              {contractor.timeEntries.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No time entries yet
                </div>
              ) : (
                contractor.timeEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {formatDate(entry.date)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {entry.project?.name || "No project"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {formatHours(Number(entry.totalHours))}
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          entry.status === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : entry.status === "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {entry.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Status & Documents */}
        <div className="space-y-8">
          {/* Status Card */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Account Status</span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    contractor.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {contractor.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Checkr Status</span>
                <span
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                    contractor.checkrStatus === "CLEAR"
                      ? "bg-green-100 text-green-700"
                      : contractor.checkrStatus === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <Shield className="w-3 h-3" />
                  {contractor.checkrStatus}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Payment Eligible</span>
                {contractor.paymentEligible ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Deel Contract</span>
                {contractor.deelContractId ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                )}
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl border">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Documents</h3>
              <Link
                href={`/contractors/${contractor.id}/documents`}
                className="text-sm text-green-600 hover:text-green-700"
              >
                Manage
              </Link>
            </div>
            <div className="divide-y">
              {contractor.documents.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">
                  No documents yet
                </div>
              ) : (
                contractor.documents.slice(0, 5).map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{doc.type}</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        doc.status === "SIGNED"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
