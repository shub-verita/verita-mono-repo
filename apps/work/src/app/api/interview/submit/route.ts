import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@verita/database";
// import { analyzeInterviewResponses } from "@verita/integrations/claude";

interface InterviewResponse {
  questionId: string;
  question: string;
  videoUrl?: string;
  transcription?: string;
  duration: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId, responses } = body;

    if (!applicationId || !responses) {
      return NextResponse.json(
        { error: "Application ID and responses are required" },
        { status: 400 }
      );
    }

    // Get application
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

    // Analyze responses with AI (mock for now)
    // In production: const analysis = await analyzeInterviewResponses(...)
    const mockAnalysis = {
      overallScore: Math.floor(Math.random() * 25) + 75, // 75-100
      communicationScore: Math.floor(Math.random() * 20) + 80,
      technicalScore: Math.floor(Math.random() * 30) + 70,
      cultureFitScore: Math.floor(Math.random() * 20) + 80,
      summary: `${application.fullName} demonstrated strong communication skills and relevant experience during the interview. Their responses showed good understanding of the ${application.job.title} role requirements.`,
      strengths: [
        "Clear and articulate communication",
        "Relevant experience demonstrated",
        "Good problem-solving approach",
        "Enthusiasm for the role",
      ],
      areasForImprovement: [
        "Could provide more specific examples",
        "Technical depth could be explored further",
      ],
      recommendation: Math.random() > 0.2 ? "PROCEED" : "REVIEW",
      questionAnalysis: responses.map((r: InterviewResponse, i: number) => ({
        questionId: r.questionId,
        score: Math.floor(Math.random() * 20) + 80,
        feedback: `Response was ${Math.random() > 0.5 ? "comprehensive" : "adequate"} and addressed the key points.`,
      })),
    };

    // Update application with interview results
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        interviewScore: mockAnalysis.overallScore,
        interviewStatus: "COMPLETED",
        interviewCompletedAt: new Date(),
        status: "INTERVIEWING",
      },
    });

    // Add note about interview completion
    await prisma.applicationNote.create({
      data: {
        applicationId,
        noteText: `AI Video Interview completed. Overall Score: ${mockAnalysis.overallScore}/100. Recommendation: ${mockAnalysis.recommendation}`,
        authorId: "ai-system",
        authorName: "AI Interview",
      },
    });

    return NextResponse.json({
      success: true,
      analysis: mockAnalysis,
    });
  } catch (error) {
    console.error("Error submitting interview:", error);
    return NextResponse.json(
      { error: "Failed to submit interview" },
      { status: 500 }
    );
  }
}
