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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "all") {
      where.status = status;
    }

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { applications: true } },
      },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = [
      "title",
      "shortDescription",
      "fullDescription",
      "responsibilities",
      "requirements",
      "payMin",
      "payMax",
    ];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Generate unique slug
    let slug = slugify(body.title);
    let slugExists = await prisma.job.findUnique({ where: { slug } });
    let counter = 1;
    while (slugExists) {
      slug = `${slugify(body.title)}-${counter}`;
      slugExists = await prisma.job.findUnique({ where: { slug } });
      counter++;
    }

    const job = await prisma.job.create({
      data: {
        title: body.title,
        slug,
        shortDescription: body.shortDescription,
        fullDescription: body.fullDescription,
        responsibilities: body.responsibilities,
        requirements: body.requirements,
        niceToHave: body.niceToHave || null,
        payMin: body.payMin,
        payMax: body.payMax,
        payType: body.payType || "HOURLY",
        timeCommitment: body.timeCommitment || "Part-time",
        remoteWorldwide: body.remoteWorldwide ?? true,
        allowedCountries: body.allowedCountries || [],
        skillTags: body.skillTags || [],
        tools: body.tools || [],
        status: body.status || "DRAFT",
        publishedAt: body.status === "PUBLISHED" ? new Date() : null,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
