// Claude AI Integration for interviews and resume screening
import Anthropic from "@anthropic-ai/sdk";

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// ============================================
// AI VIDEO INTERVIEW SYSTEM
// ============================================

export interface InterviewQuestion {
  id: string;
  question: string;
  category: "technical" | "behavioral" | "situational" | "background";
  expectedDuration: number; // seconds
}

export interface InterviewResponse {
  questionId: string;
  transcript: string;
  duration: number;
}

export interface InterviewAnalysis {
  overallScore: number; // 0-100
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  recommendation: "strong_hire" | "hire" | "maybe" | "no_hire";
  detailedFeedback: {
    questionId: string;
    score: number;
    feedback: string;
  }[];
}

export async function generateInterviewQuestions(
  jobTitle: string,
  jobDescription: string,
  requirements: string,
  skillTags: string[]
): Promise<InterviewQuestion[]> {
  if (!anthropic) {
    // Return default questions for mock mode
    return [
      {
        id: "q1",
        question: "Tell me about yourself and your relevant experience.",
        category: "background",
        expectedDuration: 120,
      },
      {
        id: "q2",
        question: `What interests you about the ${jobTitle} role?`,
        category: "behavioral",
        expectedDuration: 90,
      },
      {
        id: "q3",
        question: "Describe a challenging project you worked on and how you handled it.",
        category: "situational",
        expectedDuration: 120,
      },
      {
        id: "q4",
        question: `What experience do you have with ${skillTags.slice(0, 3).join(", ")}?`,
        category: "technical",
        expectedDuration: 120,
      },
      {
        id: "q5",
        question: "How do you handle feedback and criticism on your work?",
        category: "behavioral",
        expectedDuration: 90,
      },
    ];
  }

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `Generate 5-7 interview questions for a ${jobTitle} position.

Job Description: ${jobDescription}

Requirements: ${requirements}

Skills: ${skillTags.join(", ")}

Return a JSON array with questions in this format:
[
  {
    "id": "q1",
    "question": "The question text",
    "category": "technical|behavioral|situational|background",
    "expectedDuration": 90
  }
]

Include a mix of:
- 1-2 background questions
- 2-3 technical questions specific to the skills needed
- 1-2 behavioral questions
- 1 situational question

Make questions specific to the role and skills listed.`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type === "text") {
    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  }

  throw new Error("Failed to generate interview questions");
}

export async function analyzeInterviewResponses(
  jobTitle: string,
  questions: InterviewQuestion[],
  responses: InterviewResponse[]
): Promise<InterviewAnalysis> {
  if (!anthropic) {
    // Return mock analysis
    return {
      overallScore: 75,
      technicalScore: 70,
      communicationScore: 80,
      problemSolvingScore: 75,
      summary:
        "The candidate demonstrated solid communication skills and relevant experience. Technical knowledge is adequate for the role.",
      strengths: [
        "Clear communication",
        "Relevant background experience",
        "Positive attitude",
      ],
      areasForImprovement: [
        "Could provide more specific technical examples",
        "Time management in responses",
      ],
      recommendation: "hire",
      detailedFeedback: responses.map((r) => ({
        questionId: r.questionId,
        score: 75,
        feedback: "Adequate response with good structure.",
      })),
    };
  }

  const questionsWithResponses = questions.map((q) => {
    const response = responses.find((r) => r.questionId === q.id);
    return {
      question: q.question,
      category: q.category,
      response: response?.transcript || "No response provided",
      duration: response?.duration || 0,
    };
  });

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 3000,
    messages: [
      {
        role: "user",
        content: `Analyze this job interview for a ${jobTitle} position.

Questions and Responses:
${JSON.stringify(questionsWithResponses, null, 2)}

Provide a comprehensive analysis in this JSON format:
{
  "overallScore": 0-100,
  "technicalScore": 0-100,
  "communicationScore": 0-100,
  "problemSolvingScore": 0-100,
  "summary": "2-3 sentence summary of the candidate",
  "strengths": ["strength1", "strength2", "strength3"],
  "areasForImprovement": ["area1", "area2"],
  "recommendation": "strong_hire|hire|maybe|no_hire",
  "detailedFeedback": [
    {
      "questionId": "q1",
      "score": 0-100,
      "feedback": "Specific feedback for this answer"
    }
  ]
}

Be thorough but fair in your assessment. Consider:
- Relevance and depth of answers
- Communication clarity
- Technical accuracy
- Problem-solving approach
- Cultural fit indicators`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type === "text") {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  }

  throw new Error("Failed to analyze interview");
}

// ============================================
// AI RESUME SCREENING
// ============================================

export interface ResumeAnalysis {
  score: number; // 0-100
  matchPercentage: number;
  summary: string;
  relevantExperience: string[];
  skills: {
    matched: string[];
    missing: string[];
    additional: string[];
  };
  education: string[];
  redFlags: string[];
  recommendation: "strong_match" | "good_match" | "partial_match" | "poor_match";
}

export async function analyzeResume(
  resumeText: string,
  jobTitle: string,
  jobDescription: string,
  requirements: string,
  skillTags: string[]
): Promise<ResumeAnalysis> {
  if (!anthropic) {
    // Return mock analysis
    return {
      score: 72,
      matchPercentage: 68,
      summary:
        "Candidate has relevant experience in the field with 3+ years of work history. Shows potential for the role.",
      relevantExperience: [
        "3 years in similar role",
        "Experience with required tools",
        "Remote work experience",
      ],
      skills: {
        matched: skillTags.slice(0, Math.ceil(skillTags.length * 0.6)),
        missing: skillTags.slice(Math.ceil(skillTags.length * 0.6)),
        additional: ["Communication", "Teamwork"],
      },
      education: ["Bachelor's degree in relevant field"],
      redFlags: [],
      recommendation: "good_match",
    };
  }

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `Analyze this resume for the ${jobTitle} position.

Resume:
${resumeText}

Job Description:
${jobDescription}

Requirements:
${requirements}

Required Skills: ${skillTags.join(", ")}

Provide analysis in this JSON format:
{
  "score": 0-100,
  "matchPercentage": 0-100,
  "summary": "2-3 sentence summary of candidate fit",
  "relevantExperience": ["experience1", "experience2"],
  "skills": {
    "matched": ["skill1", "skill2"],
    "missing": ["skill3"],
    "additional": ["extra_skill1"]
  },
  "education": ["degree/certification"],
  "redFlags": ["any concerns"],
  "recommendation": "strong_match|good_match|partial_match|poor_match"
}

Be objective and focus on:
- Skill match with requirements
- Relevant work experience
- Education/certifications
- Any potential concerns`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type === "text") {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  }

  throw new Error("Failed to analyze resume");
}

// ============================================
// AI CHAT SUPPORT (for future use)
// ============================================

export async function generateChatResponse(
  messages: { role: "user" | "assistant"; content: string }[],
  context?: string
): Promise<string> {
  if (!anthropic) {
    return "I'm here to help! However, the AI service is currently in mock mode. Please contact support@verita.ai for assistance.";
  }

  const systemPrompt = `You are a helpful assistant for Verita AI, a platform that connects talented contractors with AI companies.
${context ? `Context: ${context}` : ""}

Be helpful, professional, and concise. If you don't know something specific about a user's account, direct them to contact support.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const content = response.content[0];
  if (content.type === "text") {
    return content.text;
  }

  return "I apologize, but I couldn't process your request. Please try again.";
}
