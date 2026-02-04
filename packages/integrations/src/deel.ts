// Deel Integration for contractor payments
// Documentation: https://developer.deel.com/docs

const DEEL_API_BASE = process.env.DEEL_API_BASE_URL || "https://api.deel.com/rest/v2";
const DEEL_API_KEY = process.env.DEEL_API_KEY;

interface DeelContractInput {
  contractorEmail: string;
  contractorName: string;
  jobTitle: string;
  hourlyRate: number;
  currency?: string;
  country: string;
  startDate: string;
}

interface DeelPaymentInput {
  contractId: string;
  amount: number;
  currency?: string;
  description: string;
  periodStart: string;
  periodEnd: string;
}

async function deelRequest(endpoint: string, options: RequestInit = {}) {
  if (!DEEL_API_KEY) {
    console.warn("Deel API key not configured - running in mock mode");
    return { mock: true, success: true };
  }

  const response = await fetch(`${DEEL_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${DEEL_API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Deel API error: ${response.status} - ${error}`);
  }

  return response.json();
}

export async function createDeelContract(input: DeelContractInput) {
  // In production, this would create an actual Deel contract
  // For now, return a mock response
  if (!DEEL_API_KEY) {
    return {
      id: `deel_contract_${Date.now()}`,
      status: "pending",
      ...input,
    };
  }

  return deelRequest("/contracts", {
    method: "POST",
    body: JSON.stringify({
      type: "contractor",
      contractor_details: {
        email: input.contractorEmail,
        first_name: input.contractorName.split(" ")[0],
        last_name: input.contractorName.split(" ").slice(1).join(" "),
      },
      job_title: input.jobTitle,
      rate: {
        amount: input.hourlyRate,
        currency: input.currency || "USD",
        scale: "hourly",
      },
      country: input.country,
      start_date: input.startDate,
    }),
  });
}

export async function getDeelContract(contractId: string) {
  if (!DEEL_API_KEY) {
    return { id: contractId, status: "active", mock: true };
  }

  return deelRequest(`/contracts/${contractId}`);
}

export async function createDeelPayment(input: DeelPaymentInput) {
  if (!DEEL_API_KEY) {
    return {
      id: `deel_payment_${Date.now()}`,
      status: "pending",
      ...input,
    };
  }

  return deelRequest("/payments", {
    method: "POST",
    body: JSON.stringify({
      contract_id: input.contractId,
      amount: input.amount,
      currency: input.currency || "USD",
      description: input.description,
      date_from: input.periodStart,
      date_to: input.periodEnd,
    }),
  });
}

export async function getDeelPaymentStatus(paymentId: string) {
  if (!DEEL_API_KEY) {
    return { id: paymentId, status: "completed", mock: true };
  }

  return deelRequest(`/payments/${paymentId}`);
}

export async function listDeelContracts() {
  if (!DEEL_API_KEY) {
    return { data: [], mock: true };
  }

  return deelRequest("/contracts");
}
