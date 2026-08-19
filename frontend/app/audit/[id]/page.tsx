"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getAudit } from "@/lib/api";
import ReportCard from "@/components/ReportCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";

export default function AuditReportPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    getAudit(id)
      .then(data => {
        setReport(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto py-32 px-6 flex justify-center">
        <span className="flex items-center justify-center gap-3 text-[var(--color-primary)] font-semibold text-lg">
          <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Loading Audit Report...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 w-full max-w-4xl mx-auto mt-24">
        <div className="glass-panel p-12 text-center">
          <p className="text-[var(--color-error)] font-medium mb-6 text-xl">{error}</p>
          <Link href="/audit/new" className="neu-btn px-6 py-3 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Go back
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-24 px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="flex justify-between items-center mb-8">
          <Link href="/audit/new" className="neu-btn px-4 py-2 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Scan another building
          </Link>
        </div>
        <ReportCard report={report} />
      </motion.div>
    </div>
  );
}
