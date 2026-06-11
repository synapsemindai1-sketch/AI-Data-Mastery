import { useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetCertificates, useIssueCertificate, useGetCourse, useGetProgress } from "@workspace/api-client-react";
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
}: {
  courseTitle: string;
  instructor: string;
  recipientName: string;
  issuedAt: string;
  certId: number;
  courseId: number;
}) {
  const date = new Date(issuedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const certCode = `TM-${new Date(issuedAt).getFullYear()}-${String(courseId).padStart(3, "0")}-${String(certId).padStart(4, "0")}`;

  return (
    <div
      style={{
        width: "900px",
        height: "640px",
        background: "linear-gradient(135deg, #0f1729 0%, #1a1f4e 40%, #0d2240 100%)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Georgia', serif",
        overflow: "hidden",
      }}
    >
      {/* Corner ornaments */}
      {[
        { top: 0, left: 0, transform: "none" },
        { top: 0, right: 0, transform: "scaleX(-1)" },
        { bottom: 0, left: 0, transform: "scaleY(-1)" },
        { bottom: 0, right: 0, transform: "scale(-1,-1)" },
      ].map((style, i) => (
        <svg
          key={i}
          width="120"
          height="120"
          viewBox="0 0 120 120"
          style={{ position: "absolute", ...style }}
        >
          <path d="M0,0 L80,0 L80,8 L8,8 L8,80 L0,80 Z" fill="#d4a843" opacity="0.6" />
          <path d="M0,0 L60,0 L60,4 L4,4 L4,60 L0,60 Z" fill="#f0c96b" opacity="0.4" />
          <circle cx="20" cy="20" r="6" fill="none" stroke="#d4a843" strokeWidth="1.5" opacity="0.5" />
          <circle cx="20" cy="20" r="3" fill="#d4a843" opacity="0.4" />
        </svg>
      ))}

      {/* Outer border */}
      <div
        style={{
          position: "absolute",
          inset: "20px",
          border: "1.5px solid rgba(212,168,67,0.35)",
          borderRadius: "4px",
          pointerEvents: "none",
        }}
      />
      {/* Inner border */}
      <div
        style={{
          position: "absolute",
          inset: "28px",
          border: "1px solid rgba(212,168,67,0.18)",
          borderRadius: "2px",
          pointerEvents: "none",
        }}
      />

      {/* Watermark circle */}
      <div
        style={{
          position: "absolute",
          width: "340px",
          height: "340px",
          borderRadius: "50%",
          border: "1px solid rgba(212,168,67,0.06)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "0 80px", width: "100%" }}>
        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "22px" }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke="#d4a843" strokeWidth="1.5" />
            <path d="M8 14 L14 8 L20 14 L14 20 Z" stroke="#d4a843" strokeWidth="1.5" fill="none" />
            <circle cx="14" cy="14" r="3" fill="#d4a843" />
          </svg>
          <span style={{ color: "#d4a843", fontSize: "13px", letterSpacing: "4px", fontFamily: "system-ui, sans-serif", fontWeight: 600 }}>
            AI DATA MASTERY
          </span>
        </div>

        {/* Main heading */}
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", letterSpacing: "5px", fontFamily: "system-ui, sans-serif", marginBottom: "8px", textTransform: "uppercase" }}>
          Certificate of Completion
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{ width: "80px", height: "1px", background: "linear-gradient(to right, transparent, #d4a843)" }} />
          <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="4" fill="none" stroke="#d4a843" strokeWidth="1" /><circle cx="6" cy="6" r="2" fill="#d4a843" /></svg>
          <div style={{ width: "80px", height: "1px", background: "linear-gradient(to left, transparent, #d4a843)" }} />
        </div>

        {/* "This certifies that" */}
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", fontStyle: "italic", marginBottom: "12px", fontFamily: "Georgia, serif" }}>
          This certifies that
        </div>

        {/* Recipient name */}
        <div style={{
          color: "#ffffff",
          fontSize: "38px",
          fontWeight: "bold",
          fontFamily: "Georgia, serif",
          letterSpacing: "1px",
          marginBottom: "12px",
          textShadow: "0 2px 20px rgba(212,168,67,0.3)",
        }}>
          {recipientName}
        </div>

        {/* "has successfully completed" */}
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", fontStyle: "italic", marginBottom: "14px", fontFamily: "Georgia, serif" }}>
          has successfully completed
        </div>

        {/* Course title */}
        <div style={{
          color: "#f0c96b",
          fontSize: "19px",
          fontWeight: "bold",
          fontFamily: "Georgia, serif",
          letterSpacing: "0.5px",
          marginBottom: "6px",
          maxWidth: "600px",
          margin: "0 auto 6px",
        }}>
          {courseTitle}
        </div>

        {/* Instructor */}
        <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", fontFamily: "system-ui, sans-serif", marginBottom: "28px" }}>
          Taught by {instructor}
        </div>

        {/* Bottom row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "8px", paddingTop: "16px", borderTop: "1px solid rgba(212,168,67,0.2)" }}>
          <div style={{ textAlign: "left" }}>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "9px", letterSpacing: "3px", fontFamily: "system-ui, sans-serif", marginBottom: "4px", textTransform: "uppercase" }}>Date Issued</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", fontFamily: "Georgia, serif" }}>{date}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <svg width="44" height="44" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="20" fill="none" stroke="#d4a843" strokeWidth="1.5" opacity="0.6" />
              <path d="M22 10 L25.5 18.5 L35 19.5 L28 26 L30 35 L22 30.5 L14 35 L16 26 L9 19.5 L18.5 18.5 Z" fill="#d4a843" opacity="0.7" />
            </svg>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "9px", letterSpacing: "3px", fontFamily: "system-ui, sans-serif", marginBottom: "4px", textTransform: "uppercase" }}>Certificate ID</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", fontFamily: "system-ui, 'Courier New', monospace", letterSpacing: "1px" }}>{certCode}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CertificatePage({ courseId }: { courseId: number }) {
  const certRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [, navigate] = useLocation();

  const { user, isAuthenticated } = useAuth();
  const { data: certificates, isLoading: certsLoading } = useGetCertificates();
  const { data: course } = useGetCourse(courseId, { query: { enabled: !!courseId } });
  const { data: progress } = useGetProgress();

  const issueMutation = useIssueCertificate();

  const cert = certificates?.find((c) => c.courseId === courseId);

  const completedLessonIds = new Set(
    (progress ?? []).filter((p) => p.completed).map((p) => p.lessonId)
  );

  const totalLessons = course?.totalLessons ?? 0;
  const completedInCourse = course?.modules
    ? course.modules.reduce((acc, mod) => acc + (mod.completedLessons ?? 0), 0)
    : 0;
  const isFullyComplete = totalLessons > 0 && completedInCourse >= totalLessons;

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
        backgroundColor: null,
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
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b bg-card/50 backdrop-blur px-6 py-4 flex items-center justify-between">
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
            <div className="flex justify-center mb-8 overflow-x-auto">
              <div
                ref={certRef}
                className="shadow-2xl rounded-lg overflow-hidden"
                style={{ minWidth: "900px" }}
              >
                <CertificateDisplay
                  courseTitle={cert.courseTitle}
                  instructor={cert.instructor}
                  recipientName={recipientName}
                  issuedAt={cert.issuedAt}
                  certId={cert.id}
                  courseId={cert.courseId}
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
