import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { prisma } from "@verita/database";
import { formatDate } from "@verita/shared";
import { UserButton } from "@clerk/nextjs";
import {
  FileText,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  Eye,
  Shield,
  FileSignature,
  File,
} from "lucide-react";

async function getContractorDocuments(email: string) {
  return prisma.contractor.findUnique({
    where: { email },
    include: {
      documents: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

function getDocumentIcon(type: string) {
  switch (type) {
    case "NDA":
      return <Shield className="w-5 h-5 text-purple-600" />;
    case "CIIAA":
      return <FileSignature className="w-5 h-5 text-blue-600" />;
    case "TERMS_OF_WORK":
      return <FileText className="w-5 h-5 text-green-600" />;
    case "OFFER_LETTER":
      return <File className="w-5 h-5 text-orange-600" />;
    default:
      return <FileText className="w-5 h-5 text-gray-600" />;
  }
}

function getDocumentTitle(type: string) {
  const titles: Record<string, string> = {
    NDA: "Non-Disclosure Agreement",
    CIIAA: "Confidential Information & Invention Assignment Agreement",
    TERMS_OF_WORK: "Terms of Work",
    OFFER_LETTER: "Offer Letter",
    W8_BEN: "W-8BEN Tax Form",
    W9: "W-9 Tax Form",
    RESUME: "Resume",
    ID_DOCUMENT: "ID Document",
  };
  return titles[type] || type;
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; icon: any }> = {
    SIGNED: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
    PENDING: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
    SENT: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
    VIEWED: { bg: "bg-blue-100", text: "text-blue-700", icon: Eye },
    EXPIRED: { bg: "bg-red-100", text: "text-red-700", icon: AlertCircle },
  };

  const { bg, text, icon: Icon } = config[status] || config.PENDING;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 ${bg} ${text} text-xs rounded-full`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}

export default async function DocumentsPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) {
    redirect("/login");
  }

  const contractor = await getContractorDocuments(email);
  const documents = contractor?.documents || [];

  const signedDocs = documents.filter((d) => d.status === "SIGNED");
  const pendingDocs = documents.filter((d) =>
    ["PENDING", "SENT", "VIEWED"].includes(d.status)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="font-semibold text-xl">Verita AI</span>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/payments" className="text-gray-600 hover:text-gray-900">
                Payments
              </Link>
              <Link href="/documents" className="text-blue-600 font-medium">
                Documents
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-gray-900">
                Profile
              </Link>
              <UserButton afterSignOutUrl="/login" />
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-600">View and sign your documents</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-gray-500 text-sm">Signed</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {signedDocs.length}
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-gray-500 text-sm">Pending</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {pendingDocs.length}
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-gray-500 text-sm">Total</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {documents.length}
            </div>
          </div>
        </div>

        {/* Pending Documents */}
        {pendingDocs.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <h2 className="text-lg font-semibold text-yellow-900">
                Action Required
              </h2>
            </div>
            <div className="space-y-3">
              {pendingDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between bg-white rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    {getDocumentIcon(doc.type)}
                    <div>
                      <div className="font-medium text-gray-900">
                        {getDocumentTitle(doc.type)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Sent {formatDate(doc.sentAt || doc.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={doc.status} />
                    {doc.fileUrl && (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View & Sign
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signed Documents */}
        <div className="bg-white rounded-xl border">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">Signed Documents</h2>
          </div>

          {signedDocs.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No signed documents yet
              </h3>
              <p className="text-gray-500">
                Your signed documents will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {signedDocs.map((doc) => (
                <div key={doc.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getDocumentIcon(doc.type)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {getDocumentTitle(doc.type)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Signed on {formatDate(doc.signedAt || doc.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={doc.status} />
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          download
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-sm"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
