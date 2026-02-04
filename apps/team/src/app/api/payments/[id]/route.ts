import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@verita/database";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const data: any = { ...body };
    if (body.status === "APPROVED" && !body.approvedAt) {
      data.approvedAt = new Date();
    }

    const payment = await prisma.payment.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    );
  }
}
