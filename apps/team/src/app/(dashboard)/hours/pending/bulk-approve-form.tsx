"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { formatDate, formatHours, formatCurrency } from "@verita/shared";

interface TimeEntry {
  id: string;
  date: Date;
  totalHours: any;
  project: { id: string; name: string; code: string } | null;
}

interface ContractorGroup {
  contractor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    hourlyRate: any;
  };
  entries: TimeEntry[];
  totalHours: number;
  totalAmount: number;
}

interface BulkApproveFormProps {
  groupedEntries: ContractorGroup[];
}

export function BulkApproveForm({ groupedEntries }: BulkApproveFormProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<string | null>(null);

  const allEntryIds = groupedEntries.flatMap((g) => g.entries.map((e) => e.id));

  const toggleContractor = (contractorId: string, entryIds: string[]) => {
    const newSet = new Set(selected);
    const allSelected = entryIds.every((id) => selected.has(id));

    if (allSelected) {
      entryIds.forEach((id) => newSet.delete(id));
    } else {
      entryIds.forEach((id) => newSet.add(id));
    }
    setSelected(newSet);
  };

  const toggleEntry = (id: string) => {
    const newSet = new Set(selected);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelected(newSet);
  };

  const toggleExpand = (contractorId: string) => {
    const newSet = new Set(expanded);
    if (newSet.has(contractorId)) {
      newSet.delete(contractorId);
    } else {
      newSet.add(contractorId);
    }
    setExpanded(newSet);
  };

  const selectAll = () => {
    if (selected.size === allEntryIds.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allEntryIds));
    }
  };

  const handleBulkAction = async (actionType: "approve" | "reject") => {
    if (selected.size === 0) return;

    setIsLoading(true);
    setAction(actionType);

    try {
      const response = await fetch("/api/hours/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: Array.from(selected),
          action: actionType,
        }),
      });

      if (response.ok) {
        router.refresh();
        setSelected(new Set());
      } else {
        const data = await response.json();
        alert(data.error || `Failed to ${actionType} entries`);
      }
    } catch (error) {
      alert(`Error ${actionType}ing entries`);
    } finally {
      setIsLoading(false);
      setAction(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      <div className="bg-white rounded-xl border p-4 flex items-center justify-between sticky top-20 z-10">
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            checked={selected.size === allEntryIds.length && allEntryIds.length > 0}
            onChange={selectAll}
            className="w-4 h-4 rounded border-gray-300 text-green-600"
          />
          <span className="text-sm text-gray-600">
            {selected.size} of {allEntryIds.length} selected
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleBulkAction("reject")}
            disabled={selected.size === 0 || isLoading}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && action === "reject" ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            Reject
          </button>
          <button
            onClick={() => handleBulkAction("approve")}
            disabled={selected.size === 0 || isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && action === "approve" ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Approve ({selected.size})
          </button>
        </div>
      </div>

      {/* Grouped Entries */}
      {groupedEntries.map((group) => {
        const entryIds = group.entries.map((e) => e.id);
        const isExpanded = expanded.has(group.contractor.id);
        const selectedCount = entryIds.filter((id) => selected.has(id)).length;
        const allSelected = selectedCount === entryIds.length;

        return (
          <div key={group.contractor.id} className="bg-white rounded-xl border">
            {/* Contractor Header */}
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
              onClick={() => toggleExpand(group.contractor.id)}
            >
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleContractor(group.contractor.id, entryIds);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 rounded border-gray-300 text-green-600"
                />
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-medium">
                  {group.contractor.firstName[0]}
                  {group.contractor.lastName[0]}
                </div>
                <div>
                  <Link
                    href={`/contractors/${group.contractor.id}`}
                    className="font-medium text-gray-900 hover:text-green-600"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {group.contractor.firstName} {group.contractor.lastName}
                  </Link>
                  <div className="text-sm text-gray-500">
                    {group.entries.length} entries • {formatHours(group.totalHours)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(group.totalAmount)}
                  </div>
                  <div className="text-sm text-gray-500">
                    @ {formatCurrency(Number(group.contractor.hourlyRate))}/hr
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Entries */}
            {isExpanded && (
              <div className="border-t divide-y">
                {group.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-4 pl-16 flex items-center justify-between ${
                      selected.has(entry.id) ? "bg-green-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selected.has(entry.id)}
                        onChange={() => toggleEntry(entry.id)}
                        className="w-4 h-4 rounded border-gray-300 text-green-600"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(entry.date)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {entry.project?.name || "No project"}
                        </div>
                      </div>
                    </div>
                    <div className="font-medium text-gray-900">
                      {formatHours(Number(entry.totalHours))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
