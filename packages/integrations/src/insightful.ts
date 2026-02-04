// Insightful Integration for time tracking
// Documentation: https://www.insightful.io/api-docs

const INSIGHTFUL_API_BASE = process.env.INSIGHTFUL_API_BASE_URL || "https://api.insightful.io/v1";
const INSIGHTFUL_API_KEY = process.env.INSIGHTFUL_API_KEY;

interface InsightfulUserInput {
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
}

interface TimeEntryData {
  userId: string;
  date: string;
  totalSeconds: number;
  productiveSeconds?: number;
  idleSeconds?: number;
  projects?: { name: string; seconds: number }[];
}

async function insightfulRequest(endpoint: string, options: RequestInit = {}) {
  if (!INSIGHTFUL_API_KEY) {
    console.warn("Insightful API key not configured - running in mock mode");
    return { mock: true, success: true };
  }

  const response = await fetch(`${INSIGHTFUL_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${INSIGHTFUL_API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Insightful API error: ${response.status} - ${error}`);
  }

  return response.json();
}

export async function createInsightfulUser(input: InsightfulUserInput) {
  if (!INSIGHTFUL_API_KEY) {
    return {
      id: `insightful_user_${Date.now()}`,
      ...input,
    };
  }

  return insightfulRequest("/employees", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      first_name: input.firstName,
      last_name: input.lastName,
      role: input.role || "employee",
    }),
  });
}

export async function getInsightfulUser(userId: string) {
  if (!INSIGHTFUL_API_KEY) {
    return { id: userId, status: "active", mock: true };
  }

  return insightfulRequest(`/employees/${userId}`);
}

export async function getTimeEntries(
  userId: string,
  startDate: string,
  endDate: string
): Promise<TimeEntryData[]> {
  if (!INSIGHTFUL_API_KEY) {
    // Return mock data
    return [
      {
        userId,
        date: startDate,
        totalSeconds: 28800, // 8 hours
        productiveSeconds: 25200, // 7 hours
        idleSeconds: 3600, // 1 hour
      },
    ];
  }

  const response = await insightfulRequest(
    `/time-tracking?employee_id=${userId}&date_from=${startDate}&date_to=${endDate}`
  );

  return response.data.map((entry: any) => ({
    userId: entry.employee_id,
    date: entry.date,
    totalSeconds: entry.total_seconds,
    productiveSeconds: entry.productive_seconds,
    idleSeconds: entry.idle_seconds,
    projects: entry.projects,
  }));
}

export async function syncTimeEntries(
  userId: string,
  startDate: string,
  endDate: string
) {
  const entries = await getTimeEntries(userId, startDate, endDate);

  return entries.map((entry) => ({
    ...entry,
    totalHours: entry.totalSeconds / 3600,
    productiveHours: entry.productiveSeconds ? entry.productiveSeconds / 3600 : null,
    nonProductiveHours: entry.idleSeconds ? entry.idleSeconds / 3600 : null,
  }));
}

export async function getProductivityReport(userId: string, date: string) {
  if (!INSIGHTFUL_API_KEY) {
    return {
      userId,
      date,
      productivityScore: 85,
      totalHours: 8,
      productiveHours: 7,
      topApps: [
        { name: "VS Code", minutes: 180 },
        { name: "Chrome", minutes: 120 },
        { name: "Slack", minutes: 60 },
      ],
      mock: true,
    };
  }

  return insightfulRequest(`/productivity?employee_id=${userId}&date=${date}`);
}
