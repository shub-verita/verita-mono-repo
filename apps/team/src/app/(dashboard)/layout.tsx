import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import {
  Users,
  Briefcase,
  FolderKanban,
  Clock,
  DollarSign,
  FileText,
} from "lucide-react";

const navItems = [
  { href: "/contractors", label: "Contractors", icon: Users },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/applications", label: "Applications", icon: FileText },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/hours/pending", label: "Hours", icon: Clock },
  { href: "/payments/process", label: "Payments", icon: DollarSign },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/verita-logo.png"
                  alt="Verita AI"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="font-semibold text-xl">Verita AI</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Team
                </span>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <UserButton afterSignOutUrl="/login" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
