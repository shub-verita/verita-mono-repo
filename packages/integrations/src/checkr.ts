// Checkr Integration for background checks
// Documentation: https://docs.checkr.com/

const CHECKR_API_BASE = "https://api.checkr.com/v1";
const CHECKR_API_KEY = process.env.CHECKR_API_KEY;

interface CheckrCandidateInput {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  country?: string;
}

interface CheckrInvitationInput {
  candidateId: string;
  package: string; // e.g., "tasker_standard", "driver_standard"
}

async function checkrRequest(endpoint: string, options: RequestInit = {}) {
  if (!CHECKR_API_KEY) {
    console.warn("Checkr API key not configured - running in mock mode");
    return { mock: true, success: true };
  }

  const response = await fetch(`${CHECKR_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Authorization": `Basic ${Buffer.from(CHECKR_API_KEY + ":").toString("base64")}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Checkr API error: ${response.status} - ${error}`);
  }

  return response.json();
}

export async function createCheckrCandidate(input: CheckrCandidateInput) {
  if (!CHECKR_API_KEY) {
    return {
      id: `checkr_candidate_${Date.now()}`,
      status: "pending",
      ...input,
    };
  }

  return checkrRequest("/candidates", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone,
      work_locations: [{ country: input.country || "US" }],
    }),
  });
}

export async function createCheckrInvitation(input: CheckrInvitationInput) {
  if (!CHECKR_API_KEY) {
    return {
      id: `checkr_invitation_${Date.now()}`,
      status: "pending",
      invitation_url: `https://checkr.com/apply/mock/${Date.now()}`,
      ...input,
    };
  }

  return checkrRequest("/invitations", {
    method: "POST",
    body: JSON.stringify({
      candidate_id: input.candidateId,
      package: input.package,
    }),
  });
}

export async function getCheckrCandidate(candidateId: string) {
  if (!CHECKR_API_KEY) {
    return { id: candidateId, status: "clear", mock: true };
  }

  return checkrRequest(`/candidates/${candidateId}`);
}

export async function getCheckrReport(reportId: string) {
  if (!CHECKR_API_KEY) {
    return {
      id: reportId,
      status: "complete",
      result: "clear",
      mock: true,
    };
  }

  return checkrRequest(`/reports/${reportId}`);
}

export type CheckrStatus = "pending" | "clear" | "consider" | "suspended" | "dispute";

export function mapCheckrStatus(status: string): CheckrStatus {
  const statusMap: Record<string, CheckrStatus> = {
    pending: "pending",
    clear: "clear",
    consider: "consider",
    suspended: "suspended",
    dispute: "consider",
  };
  return statusMap[status.toLowerCase()] || "pending";
}
