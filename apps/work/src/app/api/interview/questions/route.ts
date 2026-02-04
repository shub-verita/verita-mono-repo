import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@verita/database";
// import { generateInterviewQuestions } from "@verita/integrations/claude";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId } = body;

    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }

    // Get application and job details
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Generate mock interview questions
    // In production: const questions = await generateInterviewQuestions(...)
    const questions = [
      {
        id: "q1",
        type: "introduction",
        question: `Tell us about yourself and why you're interested in the ${application.job.title} position at Verita AI.`,
        timeLimit: 120,
        category: "Background",
      },
      {
        id: "q2",
        type: "experience",
        question: `Describe a challenging project you've worked on that's relevant to ${application.job.skillTags[0] || "this role"}. What was your approach and what was the outcome?`,
        timeLimit: 180,
        category: "Experience",
      },
      {
        id: "q3",
        type: "technical",
        question: `How would you approach ${application.job.responsibilities.split("\n")[0] || "the main responsibilities of this role"}? Walk us through your thought process.`,
        timeLimit: 180,
        category: "Technical",
      },
      {
        id: "q4",
        type: "situational",
        question: "Describe a time when you had to learn a new tool or technology quickly. How did you approach the learning process?",
        timeLimit: 150,
        category: "Adaptability",
      },
      {
        id: "q5",
        type: "closing",
        question: "What questions do you have for us about the role or working with Verita AI?",
        timeLimit: 120,
        category: "Questions",
      },
    ];

    return NextResponse.json({
      applicationId,
      jobTitle: application.job.title,
      questions,
      totalTime: questions.reduce((sum, q) => sum + q.timeLimit, 0),
    });
  } catch (error) {
    console.error("Error generating interview questions:", error);
    return NextResponse.json(
      { error: "Failed to generate interview questions" },
      { status: 500 }
    );
  }
}
