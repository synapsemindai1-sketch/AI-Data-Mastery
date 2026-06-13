import { useRef, useState } from "react";
import { Link } from "wouter";
import { useGetCertificates, useIssueCertificate, useGetCourse, useGetCourseStats } from "@workspace/api-client-react";
import { useAuth } from "@workspace/replit-auth-web";
import { Button } from "@/components/ui/button";
import { Award, Download, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";

function CertificateDisplay({
  courseTitle,
  instructor,
  recipientName,
  issuedAt,
  certId,
  courseId,
  category,
  level,
  durationHours,
}: {
  courseTitle: string;
  instructor: string;
  recipientName: string;
  issuedAt: string;
  certId: number;
  courseId: number;
  category?: string;
  level?: string;
  durationHours?: number;
}) {
  const date = new Date(issuedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const certCode = `ADM-${new Date(issuedAt).getFullYear()}-${String(courseId).padStart(3, "0")}-${String(certId).padStart(4, "0")}`;

  return (
    <div
      style={{
        width: "900px",
        height: "636px",
        background: "#ffffff",
        position: "relative",
        display: "flex",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        overflow: "hidden",
        boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
      }}
    >
      {/* Left accent stripe */}
      <div style={{
        width: "10px",
        background: "linear-gradient(180deg, #6c47ff 0%, #4f35cc 50%, #2a1a8a 100%)",
        flexShrink: 0,
      }} />

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "48px 56px 40px 52px", position: "relative" }}>

        {/* Top: logo + cert label row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="8" fill="#6c47ff" />
              <path d="M10 18 L18 10 L26 18 L18 26 Z" fill="white" opacity="0.9" />
              <circle cx="18" cy="18" r="4" fill="white" />
            </svg>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a2e", fontFamily: "system-ui, -apple-system, sans-serif", letterSpacing: "-0.3px" }}>
                AI Data Mastery
              </div>
              <div style={{ fontSize: "10px", color: "#6c47ff", fontFamily: "system-ui, sans-serif", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600 }}>
                Professional Training
              </div>
            </div>
          </div>

          {/* Certificate label */}
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "10px", color: "#9ca3af", fontFamily: "system-ui, sans-serif", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "2px" }}>
              Certificate No.
            </div>
            <div style={{ fontSize: "11px", color: "#374151", fontFamily: "'Courier New', monospace", fontWeight: 600, letterSpacing: "1px" }}>
              {certCode}
            </div>
          </div>
        </div>

        {/* Thin divider */}
        <div style={{ height: "1px", background: "linear-gradient(90deg, #6c47ff 0%, #e5e7eb 60%, transparent 100%)", marginBottom: "32px" }} />

        {/* Main body */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {/* "Certificate of Completion" */}
          <div style={{ fontSize: "11px", color: "#6c47ff", fontFamily: "system-ui, sans-serif", letterSpacing: "4px", textTransform: "uppercase", fontWeight: 700, marginBottom: "16px" }}>
            Certificate of Completion
          </div>

          {/* "This is to certify that" */}
          <div style={{ fontSize: "14px", color: "#6b7280", fontStyle: "italic", marginBottom: "10px", fontFamily: "Georgia, serif" }}>
            This is to certify that
          </div>

          {/* Recipient name */}
          <div style={{
            fontSize: "44px",
            fontWeight: "bold",
            color: "#111827",
            fontFamily: "Georgia, 'Times New Roman', serif",
            letterSpacing: "-0.5px",
            lineHeight: 1.1,
            marginBottom: "16px",
            borderBottom: "3px solid #6c47ff",
            paddingBottom: "14px",
            maxWidth: "580px",
          }}>
            {recipientName}
          </div>

          {/* "has successfully completed" */}
          <div style={{ fontSize: "14px", color: "#6b7280", fontStyle: "italic", marginBottom: "10px", fontFamily: "Georgia, serif" }}>
            has successfully completed the course
          </div>

          {/* Course title */}
          <div style={{
            fontSize: "22px",
            fontWeight: "bold",
            color: "#1a1a2e",
            fontFamily: "Georgia, serif",
            lineHeight: 1.3,
            marginBottom: "6px",
          }}>
            {courseTitle}
          </div>

          {/* Instructor + meta row */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "4px" }}>
            <span style={{ fontSize: "12px", color: "#6b7280", fontFamily: "system-ui, sans-serif" }}>
              Instructed by <span style={{ color: "#374151", fontWeight: 600 }}>{instructor}</span>
            </span>
            {level && (
              <>
                <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#d1d5db", display: "inline-block" }} />
                <span style={{ fontSize: "12px", color: "#6b7280", fontFamily: "system-ui, sans-serif" }}>{level}</span>
              </>
            )}
            {durationHours && (
              <>
                <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#d1d5db", display: "inline-block" }} />
                <span style={{ fontSize: "12px", color: "#6b7280", fontFamily: "system-ui, sans-serif" }}>{durationHours}h of learning</span>
              </>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ marginTop: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          {/* Date */}
          <div>
            <div style={{ height: "1px", width: "160px", background: "#d1d5db", marginBottom: "8px" }} />
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#374151", fontFamily: "Georgia, serif", marginBottom: "2px" }}>
              {date}
            </div>
            <div style={{ fontSize: "10px", color: "#9ca3af", fontFamily: "system-ui, sans-serif", letterSpacing: "2px", textTransform: "uppercase" }}>
              Date Issued
            </div>
          </div>

          {/* Seal */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="38" fill="none" stroke="#6c47ff" strokeWidth="1.5" opacity="0.2" />
              <circle cx="40" cy="40" r="32" fill="none" stroke="#6c47ff" strokeWidth="1" opacity="0.3" />
              <circle cx="40" cy="40" r="26" fill="#6c47ff" opacity="0.08" />
              {/* Star */}
              <path d="M40 20 L43.5 32 L56 32 L46 39.5 L49.5 52 L40 45 L30.5 52 L34 39.5 L24 32 L36.5 32 Z" fill="#6c47ff" opacity="0.7" />
              <text x="40" y="68" textAnchor="middle" fontSize="7" fill="#6c47ff" fontFamily="system-ui" letterSpacing="1" opacity="0.8">VERIFIED</text>
            </svg>
          </div>

          {/* Signature placeholder */}
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Dancing Script', cursive, Georgia, serif", fontSize: "22px", color: "#374151", marginBottom: "4px", fontStyle: "italic" }}>
              {instructor.split(" ").slice(0, 2).join(" ")}
            </div>
            <div style={{ height: "1px", width: "160px", background: "#d1d5db", marginBottom: "8px" }} />
            <div style={{ fontSize: "10px", color: "#9ca3af", fontFamily: "system-ui, sans-serif", letterSpacing: "2px", textTransform: "uppercase" }}>
              Instructor Signature
            </div>
          </div>
        </div>
      </div>

      {/* Right accent panel */}
      <div style={{
        width: "56px",
        background: "linear-gradient(180deg, #6c47ff 0%, #4f35cc 60%, #2a1a8a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        flexShrink: 0,
      }}>
        {/* Vertical text */}
        <div style={{
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          transform: "rotate(180deg)",
          fontSize: "9px",
          color: "rgba(255,255,255,0.6)",
          fontFamily: "system-ui, sans-serif",
          letterSpacing: "3px",
          textTransform: "uppercase",
          fontWeight: 600,
        }}>
          {category ?? "AI Training"}
        </div>
        {/* Diamond accent */}
        <div style={{ width: "8px", height: "8px", background: "rgba(255,255,255,0.4)", transform: "rotate(45deg)", margin: "12px 0" }} />
        <div style={{
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          transform: "rotate(180deg)",
          fontSize: "9px",
          color: "rgba(255,255,255,0.4)",
          fontFamily: "'Courier New', monospace",
          letterSpacing: "1px",
        }}>
          {certCode}
        </div>
      </div>
    </div>
  );
}

export default function CertificatePage({ courseId }: { courseId: number }) {
  const certRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const { data: certificates, isLoading: certsLoading } = useGetCertificates();
  const { data: course } = useGetCourse(courseId, { query: { enabled: !!courseId } });
  const { data: stats } = useGetCourseStats(courseId, { query: { enabled: !!courseId } });

  const issueMutation = useIssueCertificate();

  const cert = certificates?.find((c) => c.courseId === courseId);

  const totalLessons = course?.totalLessons ?? 0;
  const completedInCourse = course?.modules
    ? course.modules.reduce((acc, mod) => acc + (mod.completedLessons ?? 0), 0)
    : 0;
  const isFullyComplete = stats?.completionPercent === 100 || (totalLessons > 0 && completedInCourse >= totalLessons);

  const recipientName = isAuthenticated && user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "Learner"
    : "Learner";

  const handleIssueCert = () => {
    issueMutation.mutate({ data: { courseId } });
  };

  const handleDownload = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `${course?.title ?? "certificate"}-certificate.png`
        .replace(/[^a-z0-9-]/gi, "-")
        .toLowerCase();
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  const isLoading = certsLoading && !cert;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="border-b bg-white px-6 py-4 flex items-center justify-between shadow-sm">
        <Link href={`/courses/${courseId}`}>
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </button>
        </Link>
        {cert && (
          <Button onClick={handleDownload} disabled={downloading} size="sm" className="gap-2">
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {downloading ? "Generating…" : "Download PNG"}
          </Button>
        )}
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : cert ? (
          <>
            {/* Success header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold font-display tracking-tight mb-2">
                Your Certificate
              </h1>
              <p className="text-muted-foreground">
                Congratulations on completing <span className="font-medium text-foreground">{cert.courseTitle}</span>
              </p>
            </div>

            {/* Certificate preview */}
            <div className="flex justify-center mb-8 overflow-x-auto pb-2">
              <div
                ref={certRef}
                className="rounded-lg overflow-hidden"
                style={{ minWidth: "900px" }}
              >
                <CertificateDisplay
                  courseTitle={cert.courseTitle}
                  instructor={cert.instructor}
                  recipientName={recipientName}
                  issuedAt={cert.issuedAt}
                  certId={cert.id}
                  courseId={cert.courseId}
                  category={course?.category}
                  level={course?.level}
                  durationHours={course?.durationHours}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Button onClick={handleDownload} disabled={downloading} size="lg" className="gap-2 h-12 px-8">
                {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {downloading ? "Generating…" : "Download as PNG"}
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="h-12 px-8">
                  View All Certificates
                </Button>
              </Link>
            </div>
          </>
        ) : (
          /* Not yet earned */
          <div className="max-w-lg mx-auto text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
              <Award className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h1 className="text-2xl font-bold font-display mb-3">
              {isFullyComplete ? "Claim Your Certificate" : "Complete the Course First"}
            </h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {isFullyComplete
                ? "You've completed all lessons! Click below to generate your official certificate of completion."
                : `You've completed ${completedInCourse} of ${totalLessons} lessons. Finish all lessons to earn your certificate.`}
            </p>
            {isFullyComplete ? (
              <Button
                onClick={handleIssueCert}
                disabled={issueMutation.isPending}
                size="lg"
                className="gap-2 h-12 px-8"
              >
                {issueMutation.isPending
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
                  : <><CheckCircle2 className="h-4 w-4" /> Generate Certificate</>
                }
              </Button>
            ) : (
              <Link href={`/courses/${courseId}`}>
                <Button variant="outline" size="lg" className="h-12 px-8">
                  Continue Learning
                </Button>
              </Link>
            )}
            {issueMutation.isError && (
              <p className="mt-4 text-sm text-destructive">
                {(issueMutation.error as Error)?.message ?? "Failed to issue certificate. Please try again."}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
