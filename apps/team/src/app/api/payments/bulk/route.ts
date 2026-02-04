import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@verita/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, action } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No payment IDs provided" },
        { status: 400 }
      );
    }

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    const newStatus = action === "approve" ? "APPROVED" : "CANCELLED";

    const result = await prisma.payment.updateMany({
      where: {
        id: { in: ids },
        status: "PENDING",
      },
      data: {
        status: newStatus,
        approvedAt: action === "approve" ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      updated: result.count,
      action,
    });
  } catch (error) {
    console.error("Error bulk updating payments:", error);
    return NextResponse.json(
      { error: "Failed to update payments" },
      { status: 500 }
    );
  }
}
