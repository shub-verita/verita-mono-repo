import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@verita/database";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the original job
    const originalJob = await prisma.job.findUnique({
      where: { id: params.id },
    });

    if (!originalJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Generate unique slug for the duplicate
    const baseTitle = `${originalJob.title} (Copy)`;
    let slug = slugify(baseTitle);
    let slugExists = await prisma.job.findUnique({ where: { slug } });
    let counter = 1;
    while (slugExists) {
      slug = `${slugify(baseTitle)}-${counter}`;
      slugExists = await prisma.job.findUnique({ where: { slug } });
      counter++;
    }

    // Create duplicate job
    const duplicateJob = await prisma.job.create({
      data: {
        title: baseTitle,
        slug,
        shortDescription: originalJob.shortDescription,
        fullDescription: originalJob.fullDescription,
        responsibilities: originalJob.responsibilities,
        requirements: originalJob.requirements,
        niceToHave: originalJob.niceToHave,
        payMin: originalJob.payMin,
        payMax: originalJob.payMax,
        payType: originalJob.payType,
        timeCommitment: originalJob.timeCommitment,
        remoteWorldwide: originalJob.remoteWorldwide,
        allowedCountries: originalJob.allowedCountries,
        skillTags: originalJob.skillTags,
        tools: originalJob.tools,
        status: "DRAFT", // Always start as draft
        publishedAt: null,
        applicationDeadline: null, // Reset deadline
      },
    });

    return NextResponse.json(duplicateJob, { status: 201 });
  } catch (error) {
    console.error("Error duplicating job:", error);
    return NextResponse.json(
      { error: "Failed to duplicate job" },
      { status: 500 }
    );
  }
}
