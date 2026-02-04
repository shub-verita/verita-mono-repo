"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pause, Play, UserX, RefreshCw } from "lucide-react";

interface ContractorActionsProps {
  contractorId: string;
  currentStatus: string;
}

export function ContractorActions({
  contractorId,
  currentStatus,
}: ContractorActionsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateStatus = async (newStatus: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/contractors/${contractorId}`, {
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

  return (
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
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-orange-600 hover:bg-orange-50"
                >
                  <Pause className="w-4 h-4" />
                  Pause Contractor
                </button>
              )}

              {currentStatus === "PAUSED" && (
                <button
                  onClick={() => updateStatus("ACTIVE")}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                >
                  <Play className="w-4 h-4" />
                  Reactivate
                </button>
              )}

              {currentStatus !== "OFFBOARDED" && (
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to offboard this contractor?")) {
                      updateStatus("OFFBOARDED");
                    }
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <UserX className="w-4 h-4" />
                  Offboard
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
