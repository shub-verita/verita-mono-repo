import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@verita/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contractor = await prisma.contractor.findUnique({
      where: { id: params.id },
      include: {
        documents: true,
        projectAssignments: { include: { project: true } },
        timeEntries: { orderBy: { date: "desc" }, take: 20 },
        payments: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });

    if (!contractor) {
      return NextResponse.json({ error: "Contractor not found" }, { status: 404 });
    }

    return NextResponse.json(contractor);
  } catch (error) {
    console.error("Error fetching contractor:", error);
    return NextResponse.json(
      { error: "Failed to fetch contractor" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const contractor = await prisma.contractor.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json(contractor);
  } catch (error) {
    console.error("Error updating contractor:", error);
    return NextResponse.json(
      { error: "Failed to update contractor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.contractor.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting contractor:", error);
    return NextResponse.json(
      { error: "Failed to delete contractor" },
      { status: 500 }
    );
  }
}
