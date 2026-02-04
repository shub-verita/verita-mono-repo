import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@verita/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const job = await prisma.job.findUnique({
      where: { slug: params.slug, status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        fullDescription: true,
        responsibilities: true,
        requirements: true,
        niceToHave: true,
        payMin: true,
        payMax: true,
        payType: true,
        timeCommitment: true,
        remoteWorldwide: true,
        allowedCountries: true,
        skillTags: true,
        tools: true,
        publishedAt: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}
