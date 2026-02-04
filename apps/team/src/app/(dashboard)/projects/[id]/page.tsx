import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@verita/database";
import { formatCurrency, formatDate, formatHours } from "@verita/shared";
import {
  ArrowLeft,
  Users,
  Clock,
  DollarSign,
  Calendar,
  Building2,
  Edit,
  UserPlus,
  MoreHorizontal,
} from "lucide-react";
import { ProjectActions } from "./project-actions";

async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      assignments: {
        include: {
          contractor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              hourlyRate: true,
              status: true,
            },
          },
        },
      },
      timeEntries: {
        orderBy: { date: "desc" },
        take: 20,
        include: {
          contractor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });
}

async function getProjectStats(projectId: string) {
  const timeEntries = await prisma.timeEntry.findMany({
    where: { projectId },
    include: {
      contractor: {
        select: { hourlyRate: true },
      },
    },
  });

  const totalHours = timeEntries.reduce((sum, t) => sum + Number(t.totalHours), 0);
  const totalSpent = timeEntries
    .filter((t) => t.status === "APPROVED")
    .reduce((sum, t) => sum + Number(t.totalHours) * Number(t.contractor.hourlyRate), 0);
  const pendingHours = timeEntries
    .filter((t) => t.status === "PENDING")
    .reduce((sum, t) => sum + Number(t.totalHours), 0);

  return { totalHours, totalSpent, pendingHours };
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    ACTIVE: { bg: "bg-green-100", text: "text-green-700" },
    PAUSED: { bg: "bg-yellow-100", text: "text-yellow-700" },
    COMPLETED: { bg: "bg-blue-100", text: "text-blue-700" },
    CANCELLED: { bg: "bg-red-100", text: "text-red-700" },
  };

  const { bg, text } = config[status] || config.ACTIVE;

  return (
    <span className={`px-2 py-1 ${bg} ${text} text-xs rounded-full`}>
      {status}
    </span>
  );
}

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [project, stats] = await Promise.all([
    getProject(params.id),
    getProjectStats(params.id),
  ]);

  if (!project) {
    notFound();
  }

  const activeAssignments = project.assignments.filter(
    (a) => a.status === "ACTIVE"
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/projects"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                {project.client || "No client"}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {activeAssignments.length} contractors
              </span>
            </div>
          </div>
        </div>

        <ProjectActions projectId={project.id} currentStatus={project.status} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-4">
          <div className="text-2xl font-bold text-gray-900">
            {formatHours(stats.totalHours)}
          </div>
          <div className="text-sm text-gray-500">Total Hours</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {formatHours(stats.pendingHours)}
          </div>
          <div className="text-sm text-gray-500">Pending Approval</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.totalSpent)}
          </div>
          <div className="text-sm text-gray-500">Total Spent</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-2xl font-bold text-blue-600">
            {project.budget
              ? formatCurrency(Number(project.budget) - stats.totalSpent)
              : "N/A"}
          </div>
          <div className="text-sm text-gray-500">Budget Remaining</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Team */}
          <div className="bg-white rounded-xl border">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                Team ({activeAssignments.length})
              </h2>
              <Link
                href={`/projects/${project.id}/assign`}
                className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
              >
                <UserPlus className="w-4 h-4" />
                Add Member
              </Link>
            </div>
            <div className="divide-y">
              {activeAssignments.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No contractors assigned yet
                </div>
              ) : (
                activeAssignments.map((assignment) => (
                  <Link
                    key={assignment.id}
                    href={`/contractors/${assignment.contractor.id}`}
                    className="p-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {assignment.contractor.firstName}{" "}
                        {assignment.contractor.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {assignment.role || "Contractor"} -{" "}
                        {formatCurrency(Number(assignment.contractor.hourlyRate))}/hr
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Since {formatDate(assignment.assignedAt)}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Recent Time Entries */}
          <div className="bg-white rounded-xl border">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Recent Time Entries</h2>
              <Link
                href={`/hours/pending?project=${project.id}`}
                className="text-sm text-green-600 hover:text-green-700"
              >
                View All
              </Link>
            </div>
            <div className="divide-y">
              {project.timeEntries.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No time entries yet
                </div>
              ) : (
                project.timeEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {entry.contractor.firstName} {entry.contractor.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {entry.notes || "No description"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {formatHours(Number(entry.totalHours))}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(entry.date)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Project Details */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Project Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-900">{formatDate(project.createdAt)}</span>
              </div>
              {project.startDate && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Start Date</span>
                  <span className="text-gray-900">
                    {formatDate(project.startDate)}
                  </span>
                </div>
              )}
              {project.endDate && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">End Date</span>
                  <span className="text-gray-900">
                    {formatDate(project.endDate)}
                  </span>
                </div>
              )}
              {project.budget && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Budget</span>
                  <span className="text-gray-900">
                    {formatCurrency(Number(project.budget))}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Description</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {project.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
