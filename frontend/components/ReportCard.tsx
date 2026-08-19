"use client";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, Calendar, MapPin, ClipboardCheck, ShieldAlert } from "lucide-react";
import ScoreBadge from "./ScoreBadge";
import { useLanguage } from "./LanguageContext";

export default function ReportCard({ report, isModal = false }: { report: any, isModal?: boolean }) {
  const { t, language } = useLanguage();
  if (!report) return null;

  return (
    <motion.div 
      initial={isModal ? false : { opacity: 0, y: 10 }}
      animate={isModal ? false : { opacity: 1, y: 0 }}
      className={`bg-white text-black overflow-hidden border border-gray-300 shadow-md mx-auto ${isModal ? 'w-full min-h-full font-serif' : 'max-w-2xl rounded-xl font-serif'}`}
      style={{
        boxShadow: "0 0 15px rgba(0,0,0,0.05), inset 0 0 30px rgba(0,0,0,0.02)",
        backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')"
      }}
    >
      {/* Formal Academic Header Section */}
      <div className="px-6 py-4 border-b-2 border-double border-gray-800 relative">
        <div className="text-center mb-3">
          <h1 className="text-[9px] font-bold tracking-[0.1em] uppercase text-gray-500 mb-1 font-sans">
            {t("official_report", "Official Accessibility Inspection Report")}
          </h1>
          <h2 className="text-2xl font-bold mb-1 font-serif text-gray-900 leading-tight">
            {report.building_name}
          </h2>
          {report.location && (
            <p className="text-gray-700 flex items-center justify-center gap-1 font-medium text-xs italic font-serif">
              <MapPin className="w-3 h-3" />
              {report.location}
            </p>
          )}
        </div>
        
        <div className="flex justify-between items-end border-t border-gray-300 pt-2 mt-3">
          <div className="text-left font-sans text-[9px] uppercase tracking-wider text-gray-600">
            <span className="block font-bold">{t("document_id", "Document ID:")}</span>
            <span>{report.id || "SYS-GEN-REP"}</span>
          </div>
          <div className="text-right font-sans text-[9px] uppercase tracking-wider text-gray-600">
            <span className="block font-bold flex items-center justify-end gap-1"><Calendar className="w-3 h-3" /> {t("date_of_audit", "Date of Audit:")}</span>
            <span>{new Date(report.created_at).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Print PDF Button (Hidden on Print) */}
      <div className="flex justify-end px-6 pt-4 pb-2 print:hidden">
        <button 
          onClick={() => window.print()}
          className="neu-btn text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 py-1.5 px-3 bg-white hover:bg-gray-50 border border-gray-300 rounded shadow-sm text-gray-700"
        >
          <ClipboardCheck className="w-3 h-3" />
          {t("export_pdf", "Export PDF")}
        </button>
      </div>

      {/* Score Summary Banner */}
      <div className="flex justify-between items-center bg-gray-50 px-6 py-2 border-b border-t border-gray-300">
        <div className="text-[10px] font-bold text-gray-800 uppercase tracking-widest font-sans">
          {t("final_score", "Final Compliance Score")}
        </div>
        <div className="scale-75 origin-right">
          <ScoreBadge score={report.score} />
        </div>
      </div>

      {/* Findings Section */}
      <div className="px-6 py-4">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3 pb-1.5 border-b border-gray-300 font-sans">
          {t("detailed_assessment", "I. Detailed Criteria Assessment")}
        </h3>
        
        <div className="space-y-2">
          {report.findings.map((finding: any, idx: number) => {
            let statusColor = "bg-gray-100 border-gray-300 text-gray-600";
            let Icon = HelpCircle;
            let iconColor = "text-gray-600";
            let statusText = t("status_unverified", "UNVERIFIED");
            
            if (finding.result === "verified") {
              statusColor = "bg-white border-gray-300 text-gray-900";
              Icon = CheckCircle2;
              iconColor = "text-green-700";
              statusText = t("status_pass", "PASS");
            } else if (finding.result === "flagged") {
              statusColor = "bg-white border-gray-300 text-gray-900";
              Icon = XCircle;
              iconColor = "text-red-700";
              statusText = t("status_fail", "FAIL");
            } else if (finding.result === "cannot_verify") {
              statusColor = "bg-yellow-50 border-yellow-300 text-gray-900";
              Icon = ShieldAlert;
              iconColor = "text-yellow-600";
              statusText = t("status_uncertain", "NEEDS REVIEW");
            }

            return (
              <div 
                key={idx} 
                className={`px-3 py-2 border ${statusColor} flex flex-row gap-4 items-center relative rounded-sm print:border-gray-300 print:bg-transparent`}
              >
                {/* Stamp-like Status Badge */}
                <div className="flex-shrink-0 w-16 flex flex-col items-center justify-center text-center">
                  <Icon className={`w-5 h-5 mb-0.5 ${iconColor} opacity-90`} />
                  <span className={`text-[8px] font-bold tracking-widest uppercase font-sans ${iconColor}`}>{statusText}</span>
                </div>
                
                {/* Details */}
                <div className="flex-grow pl-3 border-l border-gray-200 print:border-gray-400">
                  <h4 className="font-bold text-xs capitalize font-serif text-gray-900 mb-0.5 tracking-wide">
                    {idx + 1}. {t(finding.criterion_id, finding.criterion_id.replace('crit_', '').replace(/_/g, ' '))}
                  </h4>
                  <p className="font-serif leading-tight text-gray-700 text-[10px] italic line-clamp-2 print:line-clamp-none">
                    "{language === 'bn' && finding.note_bn ? finding.note_bn : finding.note}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Official Footer */}
      <div className="bg-white px-6 py-3 text-center border-t border-dashed border-gray-300">
        <p className="text-[8px] text-gray-500 font-sans uppercase tracking-[0.2em]">
          {t("end_of_report", "End of Report • WayMark AI Engine")} • v{report.checklist_version}
        </p>
      </div>
    </motion.div>
  );
}
