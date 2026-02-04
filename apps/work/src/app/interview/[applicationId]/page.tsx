"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Clock,
  ChevronRight,
  ChevronLeft,
  Send,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Play,
  Square,
} from "lucide-react";

interface Question {
  id: string;
  type: string;
  question: string;
  timeLimit: number;
  category: string;
}

interface InterviewData {
  applicationId: string;
  jobTitle: string;
  questions: Question[];
  totalTime: number;
}

interface Response {
  questionId: string;
  question: string;
  duration: number;
  recordingBlob?: Blob;
}

export default function InterviewPage({
  params,
}: {
  params: { applicationId: string };
}) {
  const [stage, setStage] = useState<"intro" | "interview" | "complete">("intro");
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [responses, setResponses] = useState<Response[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch interview questions
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch("/api/interview/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicationId: params.applicationId }),
        });

        if (response.ok) {
          const data = await response.json();
          setInterviewData(data);
        } else {
          setError("Failed to load interview questions");
        }
      } catch (err) {
        setError("Error loading interview");
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuestions();
  }, [params.applicationId]);

  // Request camera/mic access
  const requestMediaAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraEnabled(true);
      setMicEnabled(true);
    } catch (err) {
      setError("Please allow camera and microphone access to continue");
    }
  };

  // Start recording
  const startRecording = () => {
    if (!videoRef.current?.srcObject) return;

    chunksRef.current = [];
    const stream = videoRef.current.srcObject as MediaStream;

    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
    });

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);

    // Start timer
    const question = interviewData?.questions[currentQuestionIndex];
    if (question) {
      setTimeRemaining(question.timeLimit);
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Save response
      const question = interviewData?.questions[currentQuestionIndex];
      if (question) {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setResponses((prev) => [
          ...prev,
          {
            questionId: question.id,
            question: question.question,
            duration: question.timeLimit - timeRemaining,
            recordingBlob: blob,
          },
        ]);
      }
    }
  };

  // Move to next question
  const nextQuestion = () => {
    if (!interviewData) return;

    if (currentQuestionIndex < interviewData.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTimeRemaining(0);
    } else {
      setStage("complete");
    }
  };

  // Submit interview
  const submitInterview = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/interview/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: params.applicationId,
          responses: responses.map((r) => ({
            questionId: r.questionId,
            question: r.question,
            duration: r.duration,
            // In production, upload video to storage and include URL
          })),
        }),
      });

      if (response.ok) {
        // Show success
      } else {
        setError("Failed to submit interview");
      }
    } catch (err) {
      setError("Error submitting interview");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/applications"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  // Intro stage
  if (stage === "intro") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              AI Video Interview
            </h1>
            <p className="text-gray-600">
              {interviewData?.jobTitle || "Position"}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {interviewData?.questions.length || 5} Questions
                </h3>
                <p className="text-sm text-gray-500">
                  Answer each question within the time limit
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  ~{Math.round((interviewData?.totalTime || 750) / 60)} Minutes
                </h3>
                <p className="text-sm text-gray-500">
                  Total estimated time for the interview
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Camera & Mic Required</h3>
                <p className="text-sm text-gray-500">
                  Ensure you're in a quiet, well-lit space
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                requestMediaAccess();
                setStage("interview");
              }}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              <Play className="w-5 h-5" />
              Start Interview
            </button>
            <Link
              href="/applications"
              className="block w-full text-center px-6 py-3 border text-gray-600 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Interview stage
  if (stage === "interview") {
    const currentQuestion = interviewData?.questions[currentQuestionIndex];
    const hasRecordedCurrent = responses.some(
      (r) => r.questionId === currentQuestion?.id
    );

    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="text-white">
              <h1 className="text-xl font-bold">{interviewData?.jobTitle}</h1>
              <p className="text-gray-400">
                Question {currentQuestionIndex + 1} of{" "}
                {interviewData?.questions.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {isRecording && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <Clock className="w-4 h-4" />
                  <span className="font-mono">{formatTime(timeRemaining)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Video Preview */}
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {!cameraEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <button
                    onClick={requestMediaAccess}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Enable Camera
                  </button>
                </div>
              )}

              {/* Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
                <button
                  onClick={() => setCameraEnabled(!cameraEnabled)}
                  className={`p-3 rounded-full ${
                    cameraEnabled ? "bg-white text-gray-900" : "bg-red-600 text-white"
                  }`}
                >
                  {cameraEnabled ? (
                    <Video className="w-5 h-5" />
                  ) : (
                    <VideoOff className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => setMicEnabled(!micEnabled)}
                  className={`p-3 rounded-full ${
                    micEnabled ? "bg-white text-gray-900" : "bg-red-600 text-white"
                  }`}
                >
                  {micEnabled ? (
                    <Mic className="w-5 h-5" />
                  ) : (
                    <MicOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Question Panel */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="mb-4">
                <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                  {currentQuestion?.category}
                </span>
              </div>

              <h2 className="text-xl font-semibold text-white mb-4">
                {currentQuestion?.question}
              </h2>

              <p className="text-gray-400 text-sm mb-8">
                Time limit: {formatTime(currentQuestion?.timeLimit || 0)}
              </p>

              <div className="space-y-3">
                {!isRecording && !hasRecordedCurrent && (
                  <button
                    onClick={startRecording}
                    disabled={!cameraEnabled}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
                  >
                    <div className="w-3 h-3 bg-white rounded-full" />
                    Start Recording
                  </button>
                )}

                {isRecording && (
                  <button
                    onClick={stopRecording}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700"
                  >
                    <Square className="w-4 h-4" />
                    Stop Recording
                  </button>
                )}

                {hasRecordedCurrent && (
                  <div className="flex items-center gap-2 text-green-500 justify-center py-3">
                    <CheckCircle className="w-5 h-5" />
                    Response Recorded
                  </div>
                )}

                {hasRecordedCurrent && (
                  <button
                    onClick={nextQuestion}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                  >
                    {currentQuestionIndex < (interviewData?.questions.length || 0) - 1
                      ? "Next Question"
                      : "Finish Interview"}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-8 flex items-center gap-2">
            {interviewData?.questions.map((q, i) => (
              <div
                key={q.id}
                className={`h-2 flex-1 rounded-full ${
                  i < currentQuestionIndex
                    ? "bg-green-500"
                    : i === currentQuestionIndex
                      ? "bg-blue-500"
                      : "bg-gray-700"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Complete stage
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Interview Complete!
        </h1>
        <p className="text-gray-600 mb-8">
          Thank you for completing the interview. We'll analyze your responses
          and get back to you soon.
        </p>

        <div className="space-y-3">
          <button
            onClick={submitInterview}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Interview
              </>
            )}
          </button>
          <Link
            href="/applications"
            className="block w-full px-6 py-3 border text-gray-600 rounded-lg hover:bg-gray-50"
          >
            View Applications
          </Link>
        </div>
      </div>
    </div>
  );
}
