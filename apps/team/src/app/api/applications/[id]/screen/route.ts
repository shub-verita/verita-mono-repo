import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@verita/database";
// import { analyzeResume } from "@verita/integrations/claude";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: { job: true },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // For now, generate mock AI screening results
    // In production, use: const analysis = await analyzeResume(...)
    const mockAnalysis = {
      overallScore: Math.floor(Math.random() * 30) + 70, // 70-100
      summary: `${application.fullName} is a ${Math.random() > 0.5 ? "strong" : "promising"} candidate for the ${application.job.title} position. Their background shows relevant experience in the required areas.`,
      strengths: [
        "Strong technical background",
        "Relevant industry experience",
        "Good communication skills indicated in cover letter",
      ],
      weaknesses: [
        "Limited experience with specific tools mentioned",
        "May need onboarding time for team processes",
      ],
      recommendation: Math.random() > 0.3 ? "RECOMMEND" : "REVIEW",
      skillMatches: application.job.skillTags.map((skill: string) => ({
        skill,
        matched: Math.random() > 0.3,
        confidence: Math.floor(Math.random() * 30) + 70,
      })),
    };

    // Update application with AI analysis
    const updatedApplication = await prisma.application.update({
      where: { id: params.id },
      data: {
        aiScore: mockAnalysis.overallScore,
        aiSummary: mockAnalysis.summary,
        aiStrengths: mockAnalysis.strengths,
        aiWeaknesses: mockAnalysis.weaknesses,
      },
    });

    // Add a note about the screening
    await prisma.applicationNote.create({
      data: {
        applicationId: params.id,
        noteText: `AI Resume Screening completed. Score: ${mockAnalysis.overallScore}/100. Recommendation: ${mockAnalysis.recommendation}`,
        authorId: "ai-system",
        authorName: "AI Screening",
      },
    });

    return NextResponse.json({
      application: updatedApplication,
      analysis: mockAnalysis,
    });
  } catch (error) {
    console.error("Error screening application:", error);
    return NextResponse.json(
      { error: "Failed to screen application" },
      { status: 500 }
    );
  }
}
