import Link from "next/link";
import { prisma } from "@verita/database";
import { formatCurrency, formatDate } from "@verita/shared";
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Users,
  DollarSign,
  Clock,
  Building2,
} from "lucide-react";

async function getProjects() {
  return prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      assignments: {
        where: { status: "ACTIVE" },
        include: {
          contractor: {
            select: { firstName: true, lastName: true },
          },
        },
      },
      _count: {
        select: { timeEntries: true },
      },
    },
  });
}

async function getStats() {
  const [total, active, paused, completed] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: "ACTIVE" } }),
    prisma.project.count({ where: { status: "PAUSED" } }),
    prisma.project.count({ where: { status: "COMPLETED" } }),
  ]);
  return { total, active, paused, completed };
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

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const [projects, stats] = await Promise.all([getProjects(), getStats()]);

  const filteredProjects = searchParams.status
    ? projects.filter((p) => p.status === searchParams.status)
    : projects;

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage client projects and assignments</p>
        </div>
        <Link
          href="/projects/new"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Link
          href="/projects"
          className={`bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${
            !searchParams.status ? "ring-2 ring-green-500" : ""
          }`}
        >
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Projects</div>
        </Link>
        <Link
          href="/projects?status=ACTIVE"
          className={`bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${
            searchParams.status === "ACTIVE" ? "ring-2 ring-green-500" : ""
          }`}
        >
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-500">Active</div>
        </Link>
        <Link
          href="/projects?status=PAUSED"
          className={`bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${
            searchParams.status === "PAUSED" ? "ring-2 ring-yellow-500" : ""
          }`}
        >
          <div className="text-2xl font-bold text-yellow-600">{stats.paused}</div>
          <div className="text-sm text-gray-500">Paused</div>
        </Link>
        <Link
          href="/projects?status=COMPLETED"
          className={`bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${
            searchParams.status === "COMPLETED" ? "ring-2 ring-blue-500" : ""
          }`}
        >
          <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
          <div className="text-sm text-gray-500">Completed</div>
        </Link>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                className="pl-10 pr-4 py-2 border rounded-lg text-sm w-64 focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                Project
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                Client
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                Team
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                Budget
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                Status
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No projects found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchParams.status
                      ? `No ${searchParams.status.toLowerCase()} projects`
                      : "Create your first project to get started"}
                  </p>
                  <Link
                    href="/projects/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4" />
                    Create Project
                  </Link>
                </td>
              </tr>
            ) : (
              filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/projects/${project.id}`}
                      className="font-medium text-gray-900 hover:text-green-600"
                    >
                      {project.name}
                    </Link>
                    {project.description && (
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {project.description}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{project.client || "-"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {project.assignments.slice(0, 3).map((a) => (
                          <div
                            key={a.id}
                            className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center text-green-700 text-xs font-medium border-2 border-white"
                            title={`${a.contractor.firstName} ${a.contractor.lastName}`}
                          >
                            {a.contractor.firstName[0]}
                            {a.contractor.lastName[0]}
                          </div>
                        ))}
                      </div>
                      {project.assignments.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{project.assignments.length - 3}
                        </span>
                      )}
                      {project.assignments.length === 0 && (
                        <span className="text-sm text-gray-400">No team</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {project.budget ? (
                      <span className="font-medium text-gray-900">
                        {formatCurrency(Number(project.budget))}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(project.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
