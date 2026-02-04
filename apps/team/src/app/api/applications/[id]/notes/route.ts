import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@verita/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notes = await prisma.applicationNote.findMany({
      where: { applicationId: params.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    if (!body.noteText) {
      return NextResponse.json(
        { error: "Note text is required" },
        { status: 400 }
      );
    }

    const note = await prisma.applicationNote.create({
      data: {
        applicationId: params.id,
        noteText: body.noteText,
        authorId: body.authorId || "system",
        authorName: body.authorName || "System",
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
