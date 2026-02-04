"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  RefreshCw,
  Star,
  CheckCircle,
  XCircle,
  UserPlus,
  Video,
  Send,
} from "lucide-react";

interface ApplicationActionsProps {
  applicationId: string;
  currentStatus: string;
  hasAiScore: boolean;
}

export function ApplicationActions({
  applicationId,
  currentStatus,
  hasAiScore,
}: ApplicationActionsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateStatus = async (newStatus: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
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

  const runAiScreening = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/applications/${applicationId}/screen`, {
        method: "POST",
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Failed to run AI screening");
      }
    } catch (error) {
      alert("Error running AI screening");
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {!hasAiScore && (
        <button
          onClick={runAiScreening}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Star className="w-4 h-4" />
          )}
          Run AI Screening
        </button>
      )}

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
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-20">
              <div className="py-1">
                {currentStatus === "NEW" && (
                  <button
                    onClick={() => updateStatus("REVIEWING")}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Mark as Reviewing
                  </button>
                )}

                {(currentStatus === "NEW" || currentStatus === "REVIEWING") && (
                  <button
                    onClick={() => updateStatus("SHORTLISTED")}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-purple-700 hover:bg-purple-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Add to Shortlist
                  </button>
                )}

                {currentStatus === "SHORTLISTED" && (
                  <>
                    <button
                      onClick={() => updateStatus("INTERVIEWING")}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50"
                    >
                      <Video className="w-4 h-4" />
                      Schedule Interview
                    </button>
                  </>
                )}

                {currentStatus === "INTERVIEWING" && (
                  <>
                    <button
                      onClick={() => updateStatus("OFFERED")}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                    >
                      <Send className="w-4 h-4" />
                      Send Offer
                    </button>
                  </>
                )}

                {currentStatus === "OFFERED" && (
                  <button
                    onClick={() => updateStatus("HIRED")}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    Mark as Hired
                  </button>
                )}

                {currentStatus !== "REJECTED" && currentStatus !== "HIRED" && (
                  <>
                    <div className="border-t my-1" />
                    <button
                      onClick={() => updateStatus("REJECTED")}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Application
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
