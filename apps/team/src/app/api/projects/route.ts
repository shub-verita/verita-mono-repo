import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@verita/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const clientName = searchParams.get("client");

    const where: any = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (clientName) {
      where.client = { contains: clientName, mode: "insensitive" };
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        assignments: {
          where: { status: "ACTIVE" },
          include: {
            contractor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: { timeEntries: true, assignments: true },
        },
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ["name", "code"];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const project = await prisma.project.create({
      data: {
        name: body.name,
        code: body.code,
        client: body.client || null,
        description: body.description || null,
        budget: body.budget || null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        status: body.status || "ACTIVE",
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
