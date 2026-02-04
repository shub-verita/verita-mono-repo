import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@verita/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const contractorId = searchParams.get("contractor");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (contractorId) {
      where.contractorId = contractorId;
    }

    if (startDate || endDate) {
      where.periodStart = {};
      if (startDate) {
        where.periodStart.gte = new Date(startDate);
      }
      if (endDate) {
        where.periodStart.lte = new Date(endDate);
      }
    }

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        contractor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ["contractorId", "periodStart", "periodEnd", "amount"];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Get contractor's hourly rate for defaults
    const contractor = await prisma.contractor.findUnique({
      where: { id: body.contractorId },
      select: { hourlyRate: true },
    });

    const hourlyRate = body.hourlyRate || contractor?.hourlyRate || 0;
    const totalHours = body.hours || 0;
    const grossAmount = body.amount || Number(totalHours) * Number(hourlyRate);

    const payment = await prisma.payment.create({
      data: {
        contractorId: body.contractorId,
        periodStart: new Date(body.periodStart),
        periodEnd: new Date(body.periodEnd),
        totalHours: totalHours,
        hourlyRate: hourlyRate,
        grossAmount: grossAmount,
        netAmount: grossAmount, // Same as gross for now (no deductions)
        status: "PENDING",
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
