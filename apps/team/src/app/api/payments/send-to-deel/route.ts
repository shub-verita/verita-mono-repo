import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@verita/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No payment IDs provided" },
        { status: 400 }
      );
    }

    const payments = await prisma.payment.findMany({
      where: {
        id: { in: ids },
        status: "APPROVED",
      },
      include: {
        contractor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            deelContractId: true,
            paymentEligible: true,
          },
        },
      },
    });

    if (payments.length === 0) {
      return NextResponse.json(
        { error: "No approved payments found" },
        { status: 400 }
      );
    }

    const validPayments = payments.filter(
      (p) => p.contractor.deelContractId && p.contractor.paymentEligible
    );

    if (validPayments.length === 0) {
      return NextResponse.json(
        { error: "No payments eligible for Deel processing" },
        { status: 400 }
      );
    }

    // Update payments to PROCESSING status
    await prisma.payment.updateMany({
      where: { id: { in: validPayments.map((p) => p.id) } },
      data: {
        status: "PROCESSING",
        processedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      processed: validPayments.length,
      skipped: payments.length - validPayments.length,
    });
  } catch (error) {
    console.error("Error sending payments to Deel:", error);
    return NextResponse.json(
      { error: "Failed to process payments" },
      { status: 500 }
    );
  }
}
