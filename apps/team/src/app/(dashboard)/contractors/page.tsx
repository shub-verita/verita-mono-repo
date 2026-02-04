import Link from "next/link";
import { prisma } from "@verita/database";
import { formatCurrency, formatDate } from "@verita/shared";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
} from "lucide-react";

async function getContractors() {
  return prisma.contractor.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      projectAssignments: {
        where: { status: "ACTIVE" },
        include: { project: { select: { name: true } } },
      },
      _count: {
        select: { timeEntries: true, payments: true },
      },
    },
  });
}

async function getStats() {
  const [total, active, onboarding, paused] = await Promise.all([
    prisma.contractor.count(),
    prisma.contractor.count({ where: { status: "ACTIVE" } }),
    prisma.contractor.count({ where: { status: "ONBOARDING" } }),
    prisma.contractor.count({ where: { status: "PAUSED" } }),
  ]);
  return { total, active, onboarding, paused };
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; icon: any }> = {
    ACTIVE: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
    ONBOARDING: { bg: "bg-blue-100", text: "text-blue-700", icon: Clock },
    PENDING_CHECKR: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
    PAUSED: { bg: "bg-orange-100", text: "text-orange-700", icon: AlertTriangle },
    OFFBOARDED: { bg: "bg-gray-100", text: "text-gray-700", icon: XCircle },
  };

  const { bg, text, icon: Icon } = config[status] || config.ONBOARDING;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 ${bg} ${text} text-xs rounded-full`}>
      <Icon className="w-3 h-3" />
      {status.replace("_", " ")}
    </span>
  );
}

export default async function ContractorsPage() {
  const [contractors, stats] = await Promise.all([getContractors(), getStats()]);

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contractors</h1>
          <p className="text-gray-600 mt-1">
            Manage your workforce and onboarding
          </p>
        </div>
        <Link
          href="/contractors/new"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add Contractor
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-gray-500 text-sm">Total</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-gray-500 text-sm">Active</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-gray-500 text-sm">Onboarding</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.onboarding}</div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-gray-500 text-sm">Paused</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.paused}</div>
        </div>
      </div>

      {/* Contractors List */}
      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search contractors..."
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
          {contractors.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No contractors yet
              </h3>
              <p className="text-gray-500 mb-4">
                Start by adding your first contractor
              </p>
              <Link
                href="/contractors/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <UserPlus className="w-4 h-4" />
                Add Contractor
              </Link>
            </div>
          ) : (
            contractors.map((contractor) => (
              <Link
                key={contractor.id}
                href={`/contractors/${contractor.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-medium">
                    {contractor.firstName[0]}
                    {contractor.lastName[0]}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {contractor.firstName} {contractor.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{contractor.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(Number(contractor.hourlyRate))}/hr
                    </div>
                    <div className="text-xs text-gray-500">
                      {contractor.projectAssignments.length} project(s)
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-500">{contractor.country}</div>
                    <div className="text-xs text-gray-400">
                      Since {formatDate(contractor.createdAt)}
                    </div>
                  </div>

                  <StatusBadge status={contractor.status} />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
