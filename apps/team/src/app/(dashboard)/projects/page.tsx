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
  AlertTriangle,
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
      timeEntries: {
        select: { totalHours: true },
      },
    },
  });
}

async function getStats() {
  const [total, active] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: "ACTIVE" } }),
  ]);
  return { total, active };
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

export default async function ProjectsPage() {
  const [projects, stats] = await Promise.all([getProjects(), getStats()]);

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Manage your projects and teams</p>
        </div>
        <Link
          href="/projects/new"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-gray-500 text-sm">Total Projects</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-gray-500 text-sm">Active</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
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
          {projects.length === 0 ? (
            <div className="p-12 text-center">
              <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No projects yet
              </h3>
              <p className="text-gray-500 mb-4">Create your first project</p>
              <Link
                href="/projects/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Create Project
              </Link>
            </div>
          ) : (
            projects.map((project) => {
              const totalHours = project.timeEntries.reduce(
                (sum, te) => sum + Number(te.totalHours),
                0
              );
              const budgetUsed = project.budget
                ? (totalHours * 50) / Number(project.budget) * 100
                : 0;

              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {project.code}
                      </span>
                      <StatusBadge status={project.status} />
                    </div>
                    {project.client && (
                      <p className="text-sm text-gray-500 mt-1">{project.client}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Team */}
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {project.assignments.slice(0, 3).map((a) => (
                          <div
                            key={a.id}
                            className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 text-xs font-medium border-2 border-white"
                            title={`${a.contractor.firstName} ${a.contractor.lastName}`}
                          >
                            {a.contractor.firstName[0]}
                            {a.contractor.lastName[0]}
                          </div>
                        ))}
                        {project.assignments.length > 3 && (
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                            +{project.assignments.length - 3}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Budget */}
                    {project.budget && (
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(Number(project.budget))}
                        </div>
                        <div className="text-xs text-gray-500">
                          {budgetUsed.toFixed(0)}% used
                        </div>
                      </div>
                    )}

                    <div className="text-right text-sm text-gray-500">
                      {formatDate(project.createdAt)}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
