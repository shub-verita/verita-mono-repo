import { prisma } from "@verita/database";
import { formatDate, formatHours, formatCurrency } from "@verita/shared";
import { Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { BulkApproveForm } from "./bulk-approve-form";

async function getPendingHours() {
  const entries = await prisma.timeEntry.findMany({
    where: { status: "PENDING" },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: {
      contractor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          hourlyRate: true,
        },
      },
      project: {
        select: { id: true, name: true, code: true },
      },
    },
  });

  // Group by contractor
  const byContractor = entries.reduce(
    (acc, entry) => {
      const key = entry.contractorId;
      if (!acc[key]) {
        acc[key] = {
          contractor: entry.contractor,
          entries: [],
          totalHours: 0,
          totalAmount: 0,
        };
      }
      acc[key].entries.push(entry);
      acc[key].totalHours += Number(entry.totalHours);
      acc[key].totalAmount +=
        Number(entry.totalHours) * Number(entry.contractor.hourlyRate);
      return acc;
    },
    {} as Record<string, any>
  );

  return Object.values(byContractor);
}

async function getStats() {
  const [pending, approved, rejected] = await Promise.all([
    prisma.timeEntry.count({ where: { status: "PENDING" } }),
    prisma.timeEntry.count({ where: { status: "APPROVED" } }),
    prisma.timeEntry.count({ where: { status: "REJECTED" } }),
  ]);
  return { pending, approved, rejected };
}

export default async function PendingHoursPage() {
  const [groupedEntries, stats] = await Promise.all([
    getPendingHours(),
    getStats(),
  ]);

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pending Hours</h1>
          <p className="text-gray-600 mt-1">
            Review and approve contractor time entries
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-gray-500 text-sm">Pending</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-gray-500 text-sm">Approved</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.approved}</div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-gray-500 text-sm">Rejected</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.rejected}</div>
        </div>
      </div>

      {/* Pending Entries */}
      {groupedEntries.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            All caught up!
          </h3>
          <p className="text-gray-500">No pending time entries to review.</p>
        </div>
      ) : (
        <BulkApproveForm groupedEntries={groupedEntries} />
      )}
    </div>
  );
}
