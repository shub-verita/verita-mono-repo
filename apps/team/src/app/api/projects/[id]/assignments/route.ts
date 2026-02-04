import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@verita/database";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { contractorId, role, hourlyRate, weeklyCap } = body;

    if (!contractorId) {
      return NextResponse.json(
        { error: "Contractor ID is required" },
        { status: 400 }
      );
    }

    const contractor = await prisma.contractor.findUnique({
      where: { id: contractorId },
    });

    if (!contractor) {
      return NextResponse.json(
        { error: "Contractor not found" },
        { status: 404 }
      );
    }

    const existingAssignment = await prisma.projectAssignment.findUnique({
      where: {
        projectId_contractorId: {
          projectId: params.id,
          contractorId,
        },
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: "Contractor is already assigned to this project" },
        { status: 400 }
      );
    }

    const assignment = await prisma.projectAssignment.create({
      data: {
        projectId: params.id,
        contractorId,
        role: role || null,
        hourlyRate: hourlyRate || contractor.hourlyRate,
        weeklyCap: weeklyCap || null,
        status: "ACTIVE",
      },
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

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error("Error creating project assignment:", error);
    return NextResponse.json(
      { error: "Failed to create project assignment" },
      { status: 500 }
    );
  }
}
