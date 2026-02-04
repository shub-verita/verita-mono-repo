"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Edit,
  Copy,
  Trash2,
  MoreHorizontal,
  Eye,
  EyeOff,
  Archive,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

interface JobActionsProps {
  jobId: string;
  currentStatus: string;
  slug: string;
}

export function JobActions({ jobId, currentStatus, slug }: JobActionsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateStatus = async (newStatus: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
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

  const duplicateJob = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}/duplicate`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/jobs/${data.id}`);
      } else {
        alert("Failed to duplicate job");
      }
    } catch (error) {
      alert("Error duplicating job");
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const deleteJob = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this job? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/jobs");
      } else {
        alert("Failed to delete job");
      }
    } catch (error) {
      alert("Error deleting job");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <a
        href={`${process.env.NEXT_PUBLIC_WORK_URL || "http://localhost:3000"}/jobs/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
      >
        <ExternalLink className="w-4 h-4" />
        Preview
      </a>

      <button
        onClick={() => router.push(`/jobs/${jobId}/edit`)}
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
                {currentStatus === "DRAFT" && (
                  <button
                    onClick={() => updateStatus("PUBLISHED")}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                  >
                    <Eye className="w-4 h-4" />
                    Publish
                  </button>
                )}

                {currentStatus === "PUBLISHED" && (
                  <button
                    onClick={() => updateStatus("CLOSED")}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <EyeOff className="w-4 h-4" />
                    Close Applications
                  </button>
                )}

                {currentStatus === "CLOSED" && (
                  <>
                    <button
                      onClick={() => updateStatus("PUBLISHED")}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                    >
                      <Eye className="w-4 h-4" />
                      Reopen
                    </button>
                    <button
                      onClick={() => updateStatus("ARCHIVED")}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Archive className="w-4 h-4" />
                      Archive
                    </button>
                  </>
                )}

                {currentStatus === "ARCHIVED" && (
                  <button
                    onClick={() => updateStatus("DRAFT")}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Restore to Draft
                  </button>
                )}

                <button
                  onClick={duplicateJob}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>

                <div className="border-t my-1" />

                <button
                  onClick={deleteJob}
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
