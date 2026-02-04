"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, RefreshCw, Briefcase, Eye } from "lucide-react";

export default function NewJobPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    fullDescription: "",
    responsibilities: "",
    requirements: "",
    niceToHave: "",
    payMin: "",
    payMax: "",
    payType: "HOURLY",
    timeCommitment: "Part-time (10-20 hrs/week)",
    remoteWorldwide: true,
    allowedCountries: "",
    skillTags: "",
    tools: "",
  });

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          payMin: parseInt(formData.payMin),
          payMax: parseInt(formData.payMax),
          allowedCountries: formData.allowedCountries
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          skillTags: formData.skillTags
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          tools: formData.tools
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          status: publish ? "PUBLISHED" : "DRAFT",
        }),
      });

      if (response.ok) {
        const job = await response.json();
        router.push(`/jobs/${job.id}`);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to create job");
      }
    } catch (error) {
      alert("Error creating job");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/jobs"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Job Posting</h1>
          <p className="text-gray-600">Define a new position for contractors</p>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)}>
        <div className="bg-white rounded-xl border">
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., AI Data Annotator"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Short Description * (max 200 chars)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={200}
                    placeholder="Brief summary for job listings..."
                    value={formData.shortDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, shortDescription: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.shortDescription.length}/200 characters
                  </p>
                </div>
              </div>
            </div>

            {/* Compensation */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Compensation
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pay Min (USD) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.payMin}
                    onChange={(e) =>
                      setFormData({ ...formData, payMin: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pay Max (USD) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.payMax}
                    onChange={(e) =>
                      setFormData({ ...formData, payMax: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pay Type
                  </label>
                  <select
                    value={formData.payType}
                    onChange={(e) =>
                      setFormData({ ...formData, payType: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="HOURLY">Per Hour</option>
                    <option value="PER_TASK">Per Task</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Time & Location */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Time & Location
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Commitment
                  </label>
                  <select
                    value={formData.timeCommitment}
                    onChange={(e) =>
                      setFormData({ ...formData, timeCommitment: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option>Part-time (10-20 hrs/week)</option>
                    <option>Part-time (20-30 hrs/week)</option>
                    <option>Full-time (40+ hrs/week)</option>
                    <option>Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remote
                  </label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={formData.remoteWorldwide}
                        onChange={() =>
                          setFormData({ ...formData, remoteWorldwide: true })
                        }
                        className="text-green-600"
                      />
                      <span className="text-sm">Worldwide</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={!formData.remoteWorldwide}
                        onChange={() =>
                          setFormData({ ...formData, remoteWorldwide: false })
                        }
                        className="text-green-600"
                      />
                      <span className="text-sm">Specific Countries</span>
                    </label>
                  </div>
                </div>
              </div>
              {!formData.remoteWorldwide && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allowed Countries (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., United States, Canada, United Kingdom"
                    value={formData.allowedCountries}
                    onChange={(e) =>
                      setFormData({ ...formData, allowedCountries: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}
            </div>

            {/* Job Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Job Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Detailed description of the role..."
                    value={formData.fullDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, fullDescription: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Responsibilities *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="- Responsibility 1&#10;- Responsibility 2&#10;- Responsibility 3"
                    value={formData.responsibilities}
                    onChange={(e) =>
                      setFormData({ ...formData, responsibilities: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requirements *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="- Requirement 1&#10;- Requirement 2&#10;- Requirement 3"
                    value={formData.requirements}
                    onChange={(e) =>
                      setFormData({ ...formData, requirements: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nice to Have
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Optional preferred qualifications..."
                    value={formData.niceToHave}
                    onChange={(e) =>
                      setFormData({ ...formData, niceToHave: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Skills & Tools */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Skills & Tools
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills/Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Python, Machine Learning, Data Annotation"
                    value={formData.skillTags}
                    onChange={(e) =>
                      setFormData({ ...formData, skillTags: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tools (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Label Studio, VS Code, Git"
                    value={formData.tools}
                    onChange={(e) =>
                      setFormData({ ...formData, tools: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
            <Link
              href="/jobs"
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Save as Draft
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={(e) => handleSubmit(e as any, true)}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              Publish
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
