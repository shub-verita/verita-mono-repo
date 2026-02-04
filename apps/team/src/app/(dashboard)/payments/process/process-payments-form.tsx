"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Send,
  RefreshCw,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { formatCurrency, formatHours, formatDate } from "@verita/shared";

interface Payment {
  id: string;
  periodStart: Date;
  periodEnd: Date;
  totalHours: any;
  hourlyRate: any;
  grossAmount: any;
  netAmount: any;
  status: string;
  contractor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    deelContractId: string | null;
    paymentEligible: boolean;
  };
  timeEntries: {
    id: string;
    date: Date;
    totalHours: any;
  }[];
}

interface ProcessPaymentsFormProps {
  pendingApproval: Payment[];
  readyToSend: Payment[];
}

export function ProcessPaymentsForm({
  pendingApproval,
  readyToSend,
}: ProcessPaymentsFormProps) {
  const router = useRouter();
  const [selectedPending, setSelectedPending] = useState<Set<string>>(new Set());
  const [selectedReady, setSelectedReady] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<string | null>(null);

  const togglePending = (id: string) => {
    const newSet = new Set(selectedPending);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedPending(newSet);
  };

  const toggleReady = (id: string) => {
    const newSet = new Set(selectedReady);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedReady(newSet);
  };

  const selectAllPending = () => {
    if (selectedPending.size === pendingApproval.length) {
      setSelectedPending(new Set());
    } else {
      setSelectedPending(new Set(pendingApproval.map((p) => p.id)));
    }
  };

  const selectAllReady = () => {
    if (selectedReady.size === readyToSend.length) {
      setSelectedReady(new Set());
    } else {
      const validPayments = readyToSend.filter(
        (p) => p.contractor.deelContractId && p.contractor.paymentEligible
      );
      setSelectedReady(new Set(validPayments.map((p) => p.id)));
    }
  };

  const handleApprove = async () => {
    if (selectedPending.size === 0) return;

    setIsLoading(true);
    setAction("approve");

    try {
      const response = await fetch("/api/payments/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: Array.from(selectedPending),
          action: "approve",
        }),
      });

      if (response.ok) {
        router.refresh();
        setSelectedPending(new Set());
      } else {
        const data = await response.json();
        alert(data.error || "Failed to approve payments");
      }
    } catch (error) {
      alert("Error approving payments");
    } finally {
      setIsLoading(false);
      setAction(null);
    }
  };

  const handleSendToDeel = async () => {
    if (selectedReady.size === 0) return;

    setIsLoading(true);
    setAction("send");

    try {
      const response = await fetch("/api/payments/send-to-deel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: Array.from(selectedReady),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.refresh();
        setSelectedReady(new Set());
        alert(
          `Successfully queued ${data.processed} payments for processing via Deel`
        );
      } else {
        const data = await response.json();
        alert(data.error || "Failed to send payments to Deel");
      }
    } catch (error) {
      alert("Error sending payments to Deel");
    } finally {
      setIsLoading(false);
      setAction(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this payment?")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Failed to cancel payment");
      }
    } catch (error) {
      alert("Error cancelling payment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Pending Approval Section */}
      {pendingApproval.length > 0 && (
        <div className="bg-white rounded-xl border">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={
                  selectedPending.size === pendingApproval.length &&
                  pendingApproval.length > 0
                }
                onChange={selectAllPending}
                className="w-4 h-4 rounded border-gray-300 text-green-600"
              />
              <h2 className="font-semibold text-gray-900">
                Pending Approval ({pendingApproval.length})
              </h2>
            </div>
            <button
              onClick={handleApprove}
              disabled={selectedPending.size === 0 || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && action === "approve" ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Approve Selected ({selectedPending.size})
            </button>
          </div>

          <div className="divide-y">
            {pendingApproval.map((payment) => (
              <div
                key={payment.id}
                className={`p-4 flex items-center justify-between hover:bg-gray-50 ${
                  selectedPending.has(payment.id) ? "bg-green-50" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedPending.has(payment.id)}
                    onChange={() => togglePending(payment.id)}
                    className="w-4 h-4 rounded border-gray-300 text-green-600"
                  />
                  <div>
                    <Link
                      href={`/contractors/${payment.contractor.id}`}
                      className="font-medium text-gray-900 hover:text-green-600"
                    >
                      {payment.contractor.firstName} {payment.contractor.lastName}
                    </Link>
                    <div className="text-sm text-gray-500">
                      {formatDate(payment.periodStart)} -{" "}
                      {formatDate(payment.periodEnd)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(Number(payment.netAmount))}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatHours(Number(payment.totalHours))} @{" "}
                      {formatCurrency(Number(payment.hourlyRate))}/hr
                    </div>
                  </div>

                  <button
                    onClick={() => handleCancel(payment.id)}
                    disabled={isLoading}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg disabled:opacity-50"
                    title="Cancel"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ready to Send Section */}
      {readyToSend.length > 0 && (
        <div className="bg-white rounded-xl border">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={
                  selectedReady.size ===
                    readyToSend.filter(
                      (p) =>
                        p.contractor.deelContractId && p.contractor.paymentEligible
                    ).length && readyToSend.length > 0
                }
                onChange={selectAllReady}
                className="w-4 h-4 rounded border-gray-300 text-green-600"
              />
              <h2 className="font-semibold text-gray-900">
                Ready to Send ({readyToSend.length})
              </h2>
            </div>
            <button
              onClick={handleSendToDeel}
              disabled={selectedReady.size === 0 || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && action === "send" ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send to Deel ({selectedReady.size})
            </button>
          </div>

          <div className="divide-y">
            {readyToSend.map((payment) => {
              const hasIssues =
                !payment.contractor.deelContractId ||
                !payment.contractor.paymentEligible;

              return (
                <div
                  key={payment.id}
                  className={`p-4 flex items-center justify-between hover:bg-gray-50 ${
                    selectedReady.has(payment.id) ? "bg-blue-50" : ""
                  } ${hasIssues ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedReady.has(payment.id)}
                      onChange={() => toggleReady(payment.id)}
                      disabled={hasIssues}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 disabled:cursor-not-allowed"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/contractors/${payment.contractor.id}`}
                          className="font-medium text-gray-900 hover:text-green-600"
                        >
                          {payment.contractor.firstName}{" "}
                          {payment.contractor.lastName}
                        </Link>
                        {hasIssues && (
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(payment.periodStart)} -{" "}
                        {formatDate(payment.periodEnd)}
                      </div>
                      {hasIssues && (
                        <div className="text-xs text-orange-600 mt-1">
                          {!payment.contractor.deelContractId &&
                            "Missing Deel contract • "}
                          {!payment.contractor.paymentEligible &&
                            "Not payment eligible"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(Number(payment.netAmount))}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatHours(Number(payment.totalHours))} @{" "}
                        {formatCurrency(Number(payment.hourlyRate))}/hr
                      </div>
                    </div>

                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      APPROVED
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
