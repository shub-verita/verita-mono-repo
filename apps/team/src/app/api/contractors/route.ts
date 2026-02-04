import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@verita/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const contractors = await prisma.contractor.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        projectAssignments: {
          where: { status: "ACTIVE" },
          include: { project: { select: { name: true } } },
        },
        _count: {
          select: { timeEntries: true, payments: true },
        },
      },
    });

    return NextResponse.json(contractors);
  } catch (error) {
    console.error("Error fetching contractors:", error);
    return NextResponse.json(
      { error: "Failed to fetch contractors" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ["firstName", "lastName", "email", "country", "hourlyRate"];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Check if email already exists
    const existing = await prisma.contractor.findUnique({
      where: { email: body.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A contractor with this email already exists" },
        { status: 400 }
      );
    }

    const contractor = await prisma.contractor.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone || null,
        country: body.country,
        timezone: body.timezone || null,
        hourlyRate: body.hourlyRate,
        weeklyCap: body.weeklyCap || null,
        skills: body.skills || [],
        bio: body.bio || null,
        status: "ONBOARDING",
      },
    });

    return NextResponse.json(contractor, { status: 201 });
  } catch (error) {
    console.error("Error creating contractor:", error);
    return NextResponse.json(
      { error: "Failed to create contractor" },
      { status: 500 }
    );
  }
}
