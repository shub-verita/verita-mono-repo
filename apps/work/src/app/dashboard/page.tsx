import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { prisma } from "@verita/database";
import { formatCurrency, formatHours, formatDate } from "@verita/shared";
import { UserButton } from "@clerk/nextjs";
import {
  Clock,
  DollarSign,
  FolderKanban,
  FileText,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Briefcase,
} from "lucide-react";

async function getContractorData(email: string) {
  return prisma.contractor.findUnique({
    where: { email },
    include: {
      projectAssignments: {
        where: { status: "ACTIVE" },
        include: { project: { select: { name: true, client: true } } },
      },
      timeEntries: {
        orderBy: { date: "desc" },
        take: 5,
        include: { project: { select: { name: true } } },
      },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
      documents: {
        where: { status: { in: ["PENDING", "SENT"] } },
      },
    },
  });
}

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) {
    redirect("/login");
  }

  const contractor = await getContractorData(email);

  // If contractor doesn't exist, redirect to onboarding
  if (!contractor) {
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
              <UserButton afterSignOutUrl="/login" />
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-xl border p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to Verita AI!
            </h1>
            <p className="text-gray-600 mb-8">
              You're not yet registered as a contractor. Browse our open positions
              and apply to get started!
            </p>
            <div className="space-y-3">
              <Link
                href="/jobs"
                className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Browse Open Positions
              </Link>
              <Link
                href="/applications"
                className="block w-full px-6 py-3 border text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Check My Applications
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Calculate stats
  const thisWeekHours =
    contractor.timeEntries
      .filter((te) => {
        const date = new Date(te.date);
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        return date >= startOfWeek;
      })
      .reduce((sum, te) => sum + Number(te.totalHours), 0) || 0;

  const totalEarnings =
    contractor.payments
      .filter((p) => p.status === "PAID")
      .reduce((sum, p) => sum + Number(p.netAmount), 0) || 0;

  const pendingPayments =
    contractor.payments
      .filter((p) => ["PENDING", "APPROVED", "PROCESSING"].includes(p.status))
      .reduce((sum, p) => sum + Number(p.netAmount), 0) || 0;

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
              <Link href="/dashboard" className="text-blue-600 font-medium">
                Dashboard
              </Link>
              <Link
                href="/payments"
                className="text-gray-600 hover:text-gray-900"
              >
                Payments
              </Link>
              <Link
                href="/documents"
                className="text-gray-600 hover:text-gray-900"
              >
                Documents
              </Link>
              <UserButton afterSignOutUrl="/login" />
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {contractor.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">Here's an overview of your work</p>
        </div>

        {/* Alerts */}
        {contractor.documents && contractor.documents.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 flex items-center gap-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <div className="flex-1">
              <div className="font-medium text-yellow-900">Action Required</div>
              <div className="text-sm text-yellow-700">
                You have {contractor.documents.length} document(s) pending
                signature
              </div>
            </div>
            <Link
              href="/documents"
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              View Documents
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-gray-500 text-sm">This Week</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatHours(thisWeekHours)}
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-gray-500 text-sm">Total Earnings</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalEarnings)}
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-gray-500 text-sm">Pending</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(pendingPayments)}
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-gray-500 text-sm">Active Projects</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {contractor.projectAssignments.length}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Time Entries */}
          <div className="bg-white rounded-xl border">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                Recent Time Entries
              </h2>
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

          {/* Active Projects */}
          <div className="bg-white rounded-xl border">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Active Projects</h2>
            </div>
            <div className="divide-y">
              {contractor.projectAssignments.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No active projects
                </div>
              ) : (
                contractor.projectAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {assignment.project.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {assignment.role || "Contributor"} •{" "}
                        {assignment.project.client}
                      </div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
