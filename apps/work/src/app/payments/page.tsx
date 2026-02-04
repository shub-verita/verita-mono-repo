import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { prisma } from "@verita/database";
import { formatCurrency, formatHours, formatDate } from "@verita/shared";
import { UserButton } from "@clerk/nextjs";
import {
  DollarSign,
  Clock,
  CheckCircle,
  ArrowLeft,
  Download,
  AlertCircle,
} from "lucide-react";

async function getContractorPayments(email: string) {
  return prisma.contractor.findUnique({
    where: { email },
    include: {
      payments: {
        orderBy: { createdAt: "desc" },
        include: {
          timeEntries: {
            select: { id: true, date: true, totalHours: true },
          },
        },
      },
    },
  });
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: "bg-yellow-100", text: "text-yellow-700" },
    APPROVED: { bg: "bg-blue-100", text: "text-blue-700" },
    PROCESSING: { bg: "bg-blue-100", text: "text-blue-700" },
    IN_TRANSIT: { bg: "bg-purple-100", text: "text-purple-700" },
    PAID: { bg: "bg-green-100", text: "text-green-700" },
    FAILED: { bg: "bg-red-100", text: "text-red-700" },
    CANCELLED: { bg: "bg-gray-100", text: "text-gray-700" },
  };

  const { bg, text } = config[status] || config.PENDING;

  return (
    <span className={`px-2 py-1 ${bg} ${text} text-xs rounded-full`}>
      {status}
    </span>
  );
}

export default async function PaymentsPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) {
    redirect("/login");
  }

  const contractor = await getContractorPayments(email);
  const payments = contractor?.payments || [];

  const totalPaid = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + Number(p.netAmount), 0);

  const totalPending = payments
    .filter((p) => ["PENDING", "APPROVED", "PROCESSING", "IN_TRANSIT"].includes(p.status))
    .reduce((sum, p) => sum + Number(p.netAmount), 0);

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
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/payments" className="text-blue-600 font-medium">
                Payments
              </Link>
              <Link href="/documents" className="text-gray-600 hover:text-gray-900">
                Documents
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-gray-900">
                Profile
              </Link>
              <UserButton afterSignOutUrl="/login" />
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600">View your payment history</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-gray-500 text-sm">Total Received</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalPaid)}
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-gray-500 text-sm">Pending</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalPending)}
            </div>
          </div>
        </div>

        {/* Payments List */}
        <div className="bg-white rounded-xl border">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">Payment History</h2>
          </div>

          {payments.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No payments yet
              </h3>
              <p className="text-gray-500">
                Your payment history will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {payments.map((payment) => (
                <div key={payment.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {formatDate(payment.periodStart)} - {formatDate(payment.periodEnd)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatHours(Number(payment.totalHours))} @{" "}
                        {formatCurrency(Number(payment.hourlyRate))}/hr
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(Number(payment.netAmount))}
                        </div>
                        {payment.paidAt && (
                          <div className="text-xs text-gray-500">
                            Paid {formatDate(payment.paidAt)}
                          </div>
                        )}
                      </div>
                      <StatusBadge status={payment.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
