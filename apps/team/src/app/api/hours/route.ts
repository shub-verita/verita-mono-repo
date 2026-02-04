import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@verita/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const contractorId = searchParams.get("contractor");
    const projectId = searchParams.get("project");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (contractorId) {
      where.contractorId = contractorId;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const timeEntries = await prisma.timeEntry.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        contractor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            hourlyRate: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            client: true,
          },
        },
      },
    });

    return NextResponse.json(timeEntries);
  } catch (error) {
    console.error("Error fetching time entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch time entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ["contractorId", "projectId", "date", "hours"];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Get contractor's hourly rate
    const contractor = await prisma.contractor.findUnique({
      where: { id: body.contractorId },
      select: { hourlyRate: true },
    });

    if (!contractor) {
      return NextResponse.json(
        { error: "Contractor not found" },
        { status: 404 }
      );
    }

    const timeEntry = await prisma.timeEntry.create({
      data: {
        contractorId: body.contractorId,
        projectId: body.projectId,
        date: new Date(body.date),
        totalHours: body.hours,
        productiveHours: body.productiveHours || body.hours,
        notes: body.description || null,
        status: "PENDING",
        source: "MANUAL",
      },
    });

    return NextResponse.json(timeEntry, { status: 201 });
  } catch (error) {
    console.error("Error creating time entry:", error);
    return NextResponse.json(
      { error: "Failed to create time entry" },
      { status: 500 }
    );
  }
}
