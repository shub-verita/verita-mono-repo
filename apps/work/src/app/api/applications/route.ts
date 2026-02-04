import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@verita/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const applications = await prisma.application.findMany({
      where: { email },
      orderBy: { createdAt: "desc" },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
            shortDescription: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ["jobId", "fullName", "email", "phone", "country", "whyInterested", "relevantExperience"];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Check if job exists and is published
    const job = await prisma.job.findUnique({
      where: { id: body.jobId },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "This job is not accepting applications" },
        { status: 400 }
      );
    }

    // Check for duplicate application
    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId: body.jobId,
        email: body.email,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 400 }
      );
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId: body.jobId,
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        country: body.country,
        timezone: body.timezone || null,
        linkedinUrl: body.linkedinUrl || null,
        portfolioUrl: body.portfolioUrl || null,
        githubUrl: body.githubUrl || null,
        resumeUrl: body.resumeUrl || null,
        whyInterested: body.whyInterested,
        relevantExperience: body.relevantExperience,
        expectedRate: body.expectedRate || null,
        availableHours: body.availableHours || null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        source: body.source || "OTHER",
        status: "NEW",
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
