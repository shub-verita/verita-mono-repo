import { prisma } from "@verita/database";
import { formatCurrency, formatHours, formatDate } from "@verita/shared";
import { DollarSign, Clock, Send, CheckCircle } from "lucide-react";
import { ProcessPaymentsForm } from "./process-payments-form";

async function getPayments() {
  const [pendingApproval, readyToSend] = await Promise.all([
    prisma.payment.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: {
        contractor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            deelContractId: true,
            paymentEligible: true,
          },
        },
        timeEntries: {
          select: { id: true, date: true, totalHours: true },
        },
      },
    }),
    prisma.payment.findMany({
      where: { status: "APPROVED" },
      orderBy: { approvedAt: "desc" },
      include: {
        contractor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            deelContractId: true,
            paymentEligible: true,
          },
        },
        timeEntries: {
          select: { id: true, date: true, totalHours: true },
        },
      },
    }),
  ]);

  return { pendingApproval, readyToSend };
}

async function getStats() {
  const [pending, approved, processing, paid] = await Promise.all([
    prisma.payment.count({ where: { status: "PENDING" } }),
    prisma.payment.count({ where: { status: "APPROVED" } }),
    prisma.payment.count({ where: { status: "PROCESSING" } }),
    prisma.payment.count({ where: { status: "PAID" } }),
  ]);

  const pendingAmount = await prisma.payment.aggregate({
    where: { status: "PENDING" },
    _sum: { netAmount: true },
  });

  const approvedAmount = await prisma.payment.aggregate({
    where: { status: "APPROVED" },
    _sum: { netAmount: true },
  });

  return {
    pending,
    approved,
    processing,
    paid,
    pendingAmount: Number(pendingAmount._sum.netAmount || 0),
    approvedAmount: Number(approvedAmount._sum.netAmount || 0),
  };
}

export default async function ProcessPaymentsPage() {
  const [{ pendingApproval, readyToSend }, stats] = await Promise.all([
    getPayments(),
    getStats(),
  ]);

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Process Payments</h1>
          <p className="text-gray-600 mt-1">
            Approve and send payments to contractors via Deel
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-gray-500 text-sm">Pending Approval</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
          <div className="text-sm text-gray-500">
            {formatCurrency(stats.pendingAmount)}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-gray-500 text-sm">Ready to Send</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.approved}</div>
          <div className="text-sm text-gray-500">
            {formatCurrency(stats.approvedAmount)}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Send className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-gray-500 text-sm">Processing</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.processing}</div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-gray-500 text-sm">Paid This Month</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.paid}</div>
        </div>
      </div>

      {/* Payments Lists */}
      {pendingApproval.length === 0 && readyToSend.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            All caught up!
          </h3>
          <p className="text-gray-500">No payments to process right now.</p>
        </div>
      ) : (
        <ProcessPaymentsForm
          pendingApproval={pendingApproval}
          readyToSend={readyToSend}
        />
      )}
    </div>
  );
}
