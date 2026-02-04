"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Edit,
  MoreHorizontal,
  RefreshCw,
  Pause,
  Play,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react";

interface ProjectActionsProps {
  projectId: string;
  currentStatus: string;
}

export function ProjectActions({
  projectId,
  currentStatus,
}: ProjectActionsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateStatus = async (newStatus: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      alert("Error updating status");
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const deleteProject = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/projects");
      } else {
        alert("Failed to delete project");
      }
    } catch (error) {
      alert("Error deleting project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => router.push(`/projects/${projectId}/edit`)}
        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
      >
        <Edit className="w-4 h-4" />
        Edit
      </button>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <MoreHorizontal className="w-4 h-4" />
          )}
          Actions
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-20">
              <div className="py-1">
                {currentStatus === "ACTIVE" && (
                  <button
                    onClick={() => updateStatus("PAUSED")}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50"
                  >
                    <Pause className="w-4 h-4" />
                    Pause Project
                  </button>
                )}

                {currentStatus === "PAUSED" && (
                  <button
                    onClick={() => updateStatus("ACTIVE")}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                  >
                    <Play className="w-4 h-4" />
                    Resume Project
                  </button>
                )}

                {(currentStatus === "ACTIVE" || currentStatus === "PAUSED") && (
                  <button
                    onClick={() => updateStatus("COMPLETED")}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark Completed
                  </button>
                )}

                {currentStatus !== "CANCELLED" && (
                  <button
                    onClick={() => updateStatus("CANCELLED")}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel Project
                  </button>
                )}

                <div className="border-t my-1" />

                <button
                  onClick={deleteProject}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
