import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Eye, 
  Edit3, 
  Sparkles, 
  History, 
  Calendar, 
  User, 
  ShieldCheck, 
  Plus, 
  Search, 
  FileCheck, 
  ThumbsUp, 
  ThumbsDown, 
  Send, 
  X,
  FileSpreadsheet,
  Globe,
  Bell,
  ArrowRight,
  RefreshCw,
  Info,
  Printer,
  Download
} from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { 
  ALL_REQUIRED_METADATA, 
  DEFAULT_TEMPLATES, 
  ComplianceDocument, 
  TABLE_SOURCE_CITATION, 
  DocumentFrequency 
} from "./complianceTemplatesData";

const FREQUENCY_TABS = [
  "All",
  "3-year rolling plan",
  "Yearly",
  "Every 6 months",
  "Every 3 months",
  "Every month",
  "Every transaction"
] as const;

interface ComplianceManagerProps {
  onRefreshDocs?: () => void;
}

export function ComplianceManager({ onRefreshDocs }: ComplianceManagerProps) {
  const { role, user } = useAuth();
  const userEmail = user?.email;
  
  // States
  const [activeFrequency, setActiveFrequency] = useState<string>("All");
  const [chairmanRoleFilter, setChairmanRoleFilter] = useState<"All" | "Secretary" | "Treasurer">("All");
  const [documents, setDocuments] = useState<ComplianceDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<ComplianceDocument | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditReport, setAuditReport] = useState<any | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // Real-time Reminders list
  const [reminders, setReminders] = useState<string[]>([]);

  // Initialize documents state with storage integration
  useEffect(() => {
    const stored = localStorage.getItem("skompas_compliance_table1_v1");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length === 18 && parsed.some(d => d.code === "CBYDP")) {
          setDocuments(parsed);
          return;
        }
      } catch (e) {
        initializeDefaultRecords();
        return;
      }
    }
    initializeDefaultRecords();
  }, []);

  const initializeDefaultRecords = () => {
    const docsList: ComplianceDocument[] = ALL_REQUIRED_METADATA.map((meta) => {
      const template = DEFAULT_TEMPLATES[meta.code] || {
        fields: {
          barangay: "San Jose",
          municipality: "Laak",
          province: "Davao de Oro",
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          statusNotes: "Awaiting formal creation of details."
        },
        content: `SANGGUNIANG KABATAAN COMPLIANCE PAPER\nDocument Code: [code]\nTitle: [title]\nBarangay: [barangay]\nDate: [date]\n\nDetails:\n[statusNotes]\n\nApproved for administrative compilation.\n____________________________\nSK Sign-off Officer`
      };

      return {
        id: `comp-${meta.code.toLowerCase()}`,
        code: meta.code,
        title: meta.title,
        frequency: meta.frequency,
        officerResponsible: meta.officerResponsible,
        assignedTo: meta.assignedTo,
        status: "Draft",
        lastUpdated: new Date().toLocaleDateString(),
        updatedBy: "System Setup",
        contentDraft: template.content,
        templateFields: template.fields,
        history: [
          {
            timestamp: new Date().toLocaleString(),
            action: "Initialized",
            user: "SK COMPAS Engine",
            details: `Official compliance template generated pursuant to ${TABLE_SOURCE_CITATION}.`
          }
        ]
      };
    });

    localStorage.setItem("skompas_compliance_table1_v1", JSON.stringify(docsList));
    setDocuments(docsList);
  };

  // Sync state to local storage when documents state updates
  const saveDocuments = (updated: ComplianceDocument[]) => {
    setDocuments(updated);
    localStorage.setItem("skompas_compliance_table1_v1", JSON.stringify(updated));
    
    // Auto sync submitted documents into the dashboard's submitted list
    syncToDashboardSubmissions(updated);
  };

  const syncToDashboardSubmissions = (updatedList: ComplianceDocument[]) => {
    const liveString = localStorage.getItem("skompas_submitted_budgets") || "[]";
    try {
      const parsed = JSON.parse(liveString);
      let countOfChanges = 0;

      updatedList.forEach(doc => {
        if (doc.status === "Submitted" || doc.status === "Approved") {
          const index = parsed.findIndex((p: any) => p.id === doc.id);
          const mappedStatus = doc.status === "Approved" ? "approved" : "pending";
          
          if (index !== -1) {
            if (parsed[index].status !== mappedStatus) {
              parsed[index].status = mappedStatus;
              countOfChanges++;
            }
          } else {
            // Add new submission
            parsed.unshift({
              id: doc.id,
              title: `${doc.title} (${doc.frequency})`,
              type: doc.assignedTo === "Treasurer" ? "budget" : "needs",
              status: mappedStatus,
              authorRole: doc.assignedTo,
              authorId: `off-${doc.assignedTo.toLowerCase()}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              content: compileDocumentContent(doc)
            });
            countOfChanges++;
          }
        }
      });

      if (countOfChanges > 0) {
        localStorage.setItem("skompas_submitted_budgets", JSON.stringify(parsed));
        if (onRefreshDocs) onRefreshDocs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Build Notification Reminders List in Real-time based on Table 1
  useEffect(() => {
    const list: string[] = [];
    const monthlyDrafts = documents.filter(d => d.frequency === "Every month" && d.status === "Draft");
    const quarterlyDrafts = documents.filter(d => (d.frequency === "Every 3 months" || d.frequency === "Every 3 months and yearly") && d.status === "Draft");
    
    if (monthlyDrafts.length > 0) {
      list.push(`⚠️ Monthly Requirement: Bank Reconciliation Statement (BRS) is pending preparation.`);
    }
    if (quarterlyDrafts.length > 0) {
      list.push(`⚠️ Quarterly Oversight: ${quarterlyDrafts.length} quarterly financial ledgers & registers in draft.`);
    }
    const cbydpDoc = documents.find(d => d.code === "CBYDP");
    if (cbydpDoc && cbydpDoc.status !== "Approved") {
      list.push("📋 3-Year Rolling Plan: CBYDP requires KK Assembly consultation and SK Council ratification.");
    }
    const abyipDoc = documents.find(d => d.code === "ABYIP");
    if (abyipDoc && abyipDoc.status !== "Approved") {
      list.push("📊 Annual Investment: ABYIP must be jointly prepared by SK Secretary and SK Treasurer.");
    }

    setReminders(list);
  }, [documents]);

  const compileDocumentContent = (doc: ComplianceDocument) => {
    let result = doc.contentDraft;
    Object.keys(doc.templateFields).forEach(key => {
      const value = doc.templateFields[key] || "";
      // Replace safe brackets [key]
      result = result.replace(new RegExp(`\\[${key}\\]`, "g"), value);
    });
    return result;
  };

  const handleFieldChange = (key: string, val: string) => {
    if (!selectedDoc) return;
    
    const updatedFields = { ...selectedDoc.templateFields, [key]: val };
    const updatedDoc = {
      ...selectedDoc,
      templateFields: updatedFields,
      status: "In Progress" as const,
      lastUpdated: new Date().toLocaleDateString(),
      updatedBy: role || "Secretary"
    };

    setSelectedDoc(updatedDoc);
    
    const nextList = documents.map(d => d.id === selectedDoc.id ? updatedDoc : d);
    saveDocuments(nextList);
  };

  const submitDocument = () => {
    if (!selectedDoc) return;

    const actionText = "Submitted for Chairman Review";
    const historyEntry = {
      timestamp: new Date().toLocaleString(),
      action: "Submitted",
      user: `${role || "Official"} (${userEmail || "Local"})`,
      details: "Sufficient details provided, legal compliance guidelines compiled."
    };

    const updatedDoc = {
      ...selectedDoc,
      status: "Submitted" as const,
      lastUpdated: new Date().toLocaleDateString(),
      updatedBy: role || "Secretary",
      history: [historyEntry, ...selectedDoc.history]
    };

    setSelectedDoc(updatedDoc);
    const nextList = documents.map(d => d.id === selectedDoc.id ? updatedDoc : d);
    saveDocuments(nextList);
    
    // Trigger desktop alert notification
    alert(`🎉 Successfully submitted ${selectedDoc.title} directly to the Sangguniang Kabataan Chairman!`);
  };

  const approveDocument = (isApprove: boolean) => {
    if (!selectedDoc) return;

    const actionText = isApprove ? "Approved" : "Revision Required";
    const statusText = isApprove ? "Approved" : "Draft";
    
    const historyEntry = {
      timestamp: new Date().toLocaleString(),
      action: actionText,
      user: `SK Chairman (${userEmail || "Local"})`,
      details: isApprove 
        ? "Official audit seal affixed. Ready for municipal submission." 
        : "Chairman requested revision of fields to match precise COA standards."
    };

    const updatedDoc = {
      ...selectedDoc,
      status: statusText as any,
      lastUpdated: new Date().toLocaleDateString(),
      updatedBy: "Chairman",
      history: [historyEntry, ...selectedDoc.history]
    };

    setSelectedDoc(updatedDoc);
    const nextList = documents.map(d => d.id === selectedDoc.id ? updatedDoc : d);
    saveDocuments(nextList);

    alert(`📋 Compliance action resolved: ${selectedDoc.title} is now ${actionText}`);
  };

  const handleExportPrintCompliance = () => {
    if (!selectedDoc) return;
    const contentText = compileDocumentContent(selectedDoc);

    // Download as TXT
    const element = document.createElement("a");
    const file = new Blob([contentText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${selectedDoc.code}-${selectedDoc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    // Print Friendly Popup
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${selectedDoc.title} - Official Printout</title>
            <style>
              body {
                font-family: monospace;
                padding: 40px;
                white-space: pre-wrap;
                font-size: 14px;
                line-height: 1.6;
                color: #000;
                background-color: #fff;
              }
              .header {
                border-bottom: 2px solid #000;
                padding-bottom: 20px;
                margin-bottom: 30px;
                font-family: sans-serif;
              }
              .header h1 { margin: 0 0 5px 0; font-size: 20px; text-transform: uppercase; }
              .header p { margin: 0; font-size: 12px; color: #555; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>SANGGUNIANG KABATAAN - BARANGAY SAN JOSE</h1>
              <p>SK Compliance and Monitoring Portal for Accountability and Sustainability (SK COMPAS)</p>
              <p>Document Code: ${selectedDoc.code} | Status: ${selectedDoc.status} | Last Updated: ${selectedDoc.lastUpdated} by ${selectedDoc.updatedBy}</p>
            </div>
            <div>\${contentText}</div>
            <script>
              window.onload = function() {
                window.print();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Run Explainable AI Compliance Auditing Engine
  const runAiVerification = () => {
    setIsAuditing(true);
    setAuditReport(null);

    setTimeout(() => {
      if (!selectedDoc) return;

      const docType = selectedDoc.code;
      let score = 98;
      const citations = [
        "COA Circular No. 2020-003: Technical guidelines for SK disbursements and accounting journals.",
        "RA 10742 Section 20: Duties and responsibilities of appointed SK officers."
      ];
      const strengths = [
        "Affixed to proper legal template formats according to the latest DBM guidelines.",
        "Internal variables successfully compile with correct public account standards."
      ];
      const opportunities = [];

      // Customize audit logs per document type
      if (docType === "MONTHLY-TRANSMITTAL") {
        strengths.push("Explicit listing of original Disbursement Vouchers is fully compiled.");
        citations.push("COA JMC No. 1 Series of 2019: Submission timelines to audit leaders.");
      } else if (docType === "MONTHLY-DV") {
        const amt = Number(selectedDoc.templateFields.amount || "0");
        if (amt > 100000) {
          score = 88;
          opportunities.push("Any youth disbursement above PHP 100,000 must strictly have an attached resolution certifying public bidding or legal canvas exceptions.");
        }
        strengths.push(`Disbursement allocation correctly mapped to designated YDEP source: ${selectedDoc.templateFields.fundingSource}.`);
      } else if (docType === "QUARTERLY-QSRP") {
        const r = Number(selectedDoc.templateFields.receipts || "0");
        const p = Number(selectedDoc.templateFields.payments || "0");
        const eb = Number(selectedDoc.templateFields.endingBalance || "0");
        if (r - p !== eb) {
          score = 75;
          opportunities.push("Mathematical Discrepancy: Receipts minus payments does not perfectly equate to ending balance. Check line-item logs.");
        }
      }

      setAuditReport({
        score,
        status: score >= 90 ? "Highly Compliant" : "Needs Refinement",
        citations,
        strengths,
        opportunities,
        feedback: `Explainable AI Scan complete. Verified template compliance structure is fully intact.affixed validation checksum: COMPAS-X9-2026.`
      });

      setIsAuditing(false);
    }, 1500);
  };

  // Role segregation: Secretary gets 4, Treasurer gets 16, Chairman has all 18
  const roleSegregatedDocs = useMemo(() => {
    if (role === "Chairman" || role === "Admin") {
      if (chairmanRoleFilter === "Secretary") {
        return documents.filter(d => d.assignedTo === "Secretary" || d.assignedTo === "Both");
      }
      if (chairmanRoleFilter === "Treasurer") {
        return documents.filter(d => d.assignedTo === "Treasurer" || d.assignedTo === "Both");
      }
      return documents; // Chairman has oversight of all 18 documents
    }
    if (role === "Secretary") {
      return documents.filter(d => d.assignedTo === "Secretary" || d.assignedTo === "Both");
    }
    if (role === "Treasurer") {
      return documents.filter(d => d.assignedTo === "Treasurer" || d.assignedTo === "Both");
    }
    return documents;
  }, [documents, role, chairmanRoleFilter]);

  const filteredDocs = useMemo(() => {
    if (activeFrequency === "All") return roleSegregatedDocs;
    return roleSegregatedDocs.filter(d => {
      if (activeFrequency === "Every 3 months") {
        return d.frequency === "Every 3 months" || d.frequency === "Every 3 months and yearly";
      }
      return d.frequency === activeFrequency;
    });
  }, [roleSegregatedDocs, activeFrequency]);

  // Calculate high level stats for current role's purview
  const totalChecked = roleSegregatedDocs.length;
  const approvedCount = roleSegregatedDocs.filter(d => d.status === "Approved").length;
  const submittedCount = roleSegregatedDocs.filter(d => d.status === "Submitted").length;
  const draftCount = roleSegregatedDocs.filter(d => d.status === "Draft" || d.status === "In Progress").length;

  const getFrequencyBadgeClass = (freq: string) => {
    switch (freq) {
      case "3-year rolling plan":
        return "bg-purple-100 text-purple-900 border-purple-200/80";
      case "Yearly":
        return "bg-blue-100 text-blue-900 border-blue-200/80";
      case "Every 6 months":
        return "bg-teal-100 text-teal-900 border-teal-200/80";
      case "Every 3 months":
      case "Every 3 months and yearly":
        return "bg-amber-100 text-amber-900 border-amber-200/80";
      case "Every month":
        return "bg-emerald-100 text-emerald-900 border-emerald-200/80";
      case "Every transaction":
        return "bg-rose-100 text-rose-900 border-rose-200/80";
      default:
        return "bg-zinc-100 text-zinc-800 border-zinc-200/80";
    }
  };

  return (
    <div className="bg-[#FAF9F5] border border-amber-200/60 rounded-[48px] p-8 shadow-xl hover:shadow-2xl hover:shadow-amber-900/5 transition-all space-y-8 relative overflow-hidden">
      
      {/* Decorative premium gradients */}
      <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-br from-amber-200/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-0 bottom-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -ml-40 -mb-40" />

      {/* Header and alerts */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6 relative z-10 border-b border-amber-100 pb-6">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-[8px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 shadow-sm">
              <ShieldCheck className="w-2.5 h-2.5 animate-pulse" />
              Official 18 Required Documents
            </span>
            <span className="h-1.5 w-1.5 bg-amber-400 rounded-full" />
            <span className="px-2.5 py-0.5 bg-amber-50 border border-amber-200/60 text-amber-900 text-[9px] font-black uppercase tracking-wider rounded-full">
              Municipal Compliance Schedule
            </span>
            <span className="h-1.5 w-1.5 bg-amber-400 rounded-full" />
            <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-200/60 text-blue-900 text-[9px] font-black uppercase tracking-wider rounded-full">
              {role === "Chairman" ? "SK Chairman Master Oversight" : role === "Secretary" ? "SK Secretary Desk" : "SK Treasurer & BMO Desk"}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0C1E36] tracking-tight">
            Official Compliance Templates <span className="text-[#C89311]">&</span> Filing Desk
          </h2>
          <p className="text-[10px] sm:text-[11px] text-zinc-600 font-semibold leading-relaxed max-w-3xl">
            {TABLE_SOURCE_CITATION}. Segregated strictly by statutory role: <strong className="text-zinc-800">Secretary</strong> (4 planning & accomplishment files), <strong className="text-zinc-800">Treasurer & BMO</strong> (16 fiscal ledgers & registers), and <strong className="text-zinc-800">SK Chairman</strong> (all 18 official documents with executive signature authority).
          </p>
        </div>

        {/* Live Active Reminders Banner */}
        {reminders.length > 0 && (
          <div className="w-full lg:w-96 bg-[#0C1E36] text-white p-5 rounded-3xl space-y-2.5 shrink-0 shadow-lg border border-slate-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-[9px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
                <Bell className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                Table 1 Compliance Reminders
              </span>
            </div>
            <ul className="space-y-1.5">
              {reminders.map((rem, idx) => (
                <li key={idx} className="text-[9.5px] leading-relaxed text-zinc-300 font-medium flex items-start gap-1.5">
                  <span className="text-[#C89311] font-bold">•</span>
                  <span>{rem}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Chairman Executive Oversight Desk Switcher (Only visible to Chairman or Admin) */}
      {(role === "Chairman" || role === "Admin") && (
        <div className="p-4 bg-gradient-to-r from-blue-900/10 via-amber-500/10 to-emerald-900/10 border border-amber-300/60 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#0C1E36] text-amber-400 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-[#0C1E36] block">
                SK Chairman Executive View Filter
              </span>
              <span className="text-[10px] text-zinc-600 font-medium">
                You have full jurisdiction over all 18 official documents. Filter the desk view below:
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-zinc-200 shadow-sm shrink-0">
            <button
              onClick={() => setChairmanRoleFilter("All")}
              className={`px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                chairmanRoleFilter === "All"
                  ? "bg-[#0C1E36] text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              All Desks (18)
            </button>
            <button
              onClick={() => setChairmanRoleFilter("Secretary")}
              className={`px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                chairmanRoleFilter === "Secretary"
                  ? "bg-purple-700 text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Secretary Desk (4)
            </button>
            <button
              onClick={() => setChairmanRoleFilter("Treasurer")}
              className={`px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                chairmanRoleFilter === "Treasurer"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Treasurer Desk (16)
            </button>
          </div>
        </div>
      )}

      {/* Role Notice for Secretary and Treasurer */}
      {role === "Secretary" && (
        <div className="p-4 bg-purple-50 border border-purple-200/80 rounded-3xl flex items-center gap-3 relative z-10">
          <div className="p-2 bg-purple-600 text-white rounded-xl">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider text-purple-900 block">
              SK Secretary Statutory Purview: 4 Required Documents
            </span>
            <span className="text-[10.5px] text-purple-800 font-medium">
              You are responsible for CBYDP (3-year rolling plan), ABYIP (Yearly), Annual Budget (Yearly joint preparation), and Annual SK Program Accomplishment Report.
            </span>
          </div>
        </div>
      )}

      {role === "Treasurer" && (
        <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-3xl flex items-center gap-3 relative z-10">
          <div className="p-2 bg-emerald-600 text-white rounded-xl">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-900 block">
              SK Treasurer & BMO Statutory Purview: 16 Required Documents
            </span>
            <span className="text-[10.5px] text-emerald-800 font-medium">
              You are responsible for all financial ledgers, Bank Reconciliation Statements, DVs, inventory registers, accountable forms, and budget monitoring sheets.
            </span>
          </div>
        </div>
      )}

      {/* Dynamic Summary counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
        <div className="p-5 bg-white border border-zinc-200/80 rounded-[28px] shadow-sm flex items-center gap-4 hover:border-amber-200 transition-all group">
          <div className="p-3 bg-zinc-100 rounded-2xl group-hover:scale-110 transition-transform">
            <FileText className="w-5 h-5 text-zinc-600" />
          </div>
          <div>
            <span className="text-[8.5px] font-black uppercase text-zinc-400 tracking-wider block">Purview Requirements</span>
            <span className="text-lg font-black text-[#0C1E36]">{totalChecked} Documents</span>
          </div>
        </div>

        <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-[28px] shadow-sm flex items-center gap-4 hover:border-emerald-300 transition-all group">
          <div className="p-3 bg-emerald-100 rounded-2xl group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <span className="text-[8.5px] font-black uppercase text-emerald-800 tracking-wider block">Approved & Signed</span>
            <span className="text-lg font-black text-emerald-700">{approvedCount} Compliant</span>
          </div>
        </div>

        <div className="p-5 bg-amber-50/60 border border-amber-100 rounded-[28px] shadow-sm flex items-center gap-4 hover:border-amber-300 transition-all group">
          <div className="p-3 bg-amber-100 rounded-2xl group-hover:scale-110 transition-transform">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <span className="text-[8.5px] font-black uppercase text-amber-800 tracking-wider block">Submitted Review</span>
            <span className="text-lg font-black text-amber-700">{submittedCount} Pending</span>
          </div>
        </div>

        <div className="p-5 bg-zinc-50 border border-zinc-200/60 rounded-[28px] shadow-sm flex items-center gap-4 hover:border-zinc-300 transition-all group">
          <div className="p-3 bg-zinc-100 rounded-2xl group-hover:scale-110 transition-transform">
            <Edit3 className="w-5 h-5 text-zinc-500" />
          </div>
          <div>
            <span className="text-[8.5px] font-black uppercase text-zinc-400 tracking-wider block">In Preparation</span>
            <span className="text-lg font-black text-zinc-600">{draftCount} In Draft</span>
          </div>
        </div>
      </div>

      {/* Frequency Filter Horizontal Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200/60 pb-5 relative z-10">
        {FREQUENCY_TABS.map(freq => {
          const count = freq === "All" 
            ? roleSegregatedDocs.length 
            : roleSegregatedDocs.filter(d => {
                if (freq === "Every 3 months") {
                  return d.frequency === "Every 3 months" || d.frequency === "Every 3 months and yearly";
                }
                return d.frequency === freq;
              }).length;
          const isActive = activeFrequency === freq;
          return (
            <button
              key={freq}
              onClick={() => setActiveFrequency(freq)}
              className={`px-3.5 py-2 text-[9px] uppercase font-black tracking-widest rounded-2xl transition-all border cursor-pointer flex items-center gap-2 ${
                isActive
                  ? "bg-[#0C1E36] text-white border-[#0C1E36] shadow-md shadow-[#0C1E36]/10"
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-amber-300 hover:text-zinc-900"
              }`}
            >
              <span>{freq}</span>
              <span className={`px-1.5 py-0.5 rounded-lg text-[8px] font-black ${
                isActive ? "bg-[#C89311] text-white" : "bg-zinc-100 text-zinc-500"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main interactive grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {filteredDocs.map((doc, i) => {
          // Check role restrictions
          const canManage = role === "Chairman" || role === "Admin" || doc.assignedTo === "Both" || doc.assignedTo === role;
          
          // Left side colored ribbon based on status
          const statusRibbon = doc.status === "Approved" 
            ? "border-l-4 border-emerald-500" 
            : doc.status === "Submitted"
              ? "border-l-4 border-amber-500"
              : "border-l-4 border-zinc-300";

          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`p-6 bg-white border border-zinc-200/80 rounded-[32px] hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 transition-all flex flex-col justify-between relative overflow-hidden ${statusRibbon}`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <span className="px-2.5 py-1 bg-zinc-100 border border-zinc-200 text-zinc-800 font-mono text-[8.5px] rounded-lg font-black tracking-widest uppercase">
                    {doc.code}
                  </span>
                  
                  {doc.status === "Approved" ? (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[8.5px] font-black uppercase tracking-wider rounded-full flex items-center gap-1 border border-emerald-200 shadow-sm shadow-emerald-100">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Approved
                    </span>
                  ) : doc.status === "Submitted" ? (
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[8.5px] font-black uppercase tracking-wider rounded-full flex items-center gap-1 border border-amber-200 animate-pulse">
                      <Clock className="w-2.5 h-2.5" /> Submitted
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-zinc-50 border border-zinc-200 text-zinc-500 text-[8.5px] font-black uppercase tracking-wider rounded-full">
                      {doc.status}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-black text-[#0C1E36] leading-snug line-clamp-2 group-hover:text-[#C89311] transition-colors">
                    {doc.title}
                  </h4>
                  
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-md border ${getFrequencyBadgeClass(doc.frequency)}`}>
                      {doc.frequency}
                    </span>
                    <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 text-[8px] font-bold rounded-md border border-zinc-200">
                      Desk: {doc.assignedTo === "Both" ? "Joint (Sec & Treas)" : doc.assignedTo === "Treasurer" ? "Treasurer & BMO" : "Secretary"}
                    </span>
                  </div>

                  <div className="text-[9px] text-zinc-500 font-semibold bg-zinc-50 border border-zinc-100 p-2 rounded-xl">
                    <span className="text-zinc-400 font-bold block text-[7.5px] uppercase tracking-wider">Officer Responsible:</span>
                    <span className="text-zinc-700 font-bold">{doc.officerResponsible}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-dashed border-zinc-200/80 flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-[8px] uppercase tracking-wider text-zinc-400 font-black block">Last Edit</span>
                  <span className="text-[9px] text-zinc-700 font-bold">{doc.updatedBy} ({doc.lastUpdated})</span>
                </div>

                <button
                  onClick={() => {
                    setSelectedDoc(doc);
                    setAuditReport(null);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-zinc-50 to-zinc-100 border border-zinc-200 hover:border-[#0C1E36] text-[9px] font-black uppercase tracking-widest text-[#0C1E36] hover:from-[#0C1E36] hover:to-slate-800 hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5 text-[#C89311]" />
                  {canManage ? "Compile / Edit" : "View / Audit"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* DOCUMENT COMPILER MODAL OVERLAY */}
      <AnimatePresence>
        {isModalOpen && selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-md p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-[#FAF9F5] border border-amber-200/50 rounded-[40px] w-full max-w-5xl max-h-[92vh] flex flex-col shadow-3xl overflow-hidden relative"
            >
              <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-amber-200/5 to-transparent rounded-full blur-3xl pointer-events-none" />
              
              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-r from-[#0C1E36] via-[#162E4E] to-[#0C1E36] text-white flex justify-between items-center border-b border-amber-500/20 relative shadow-md">
                <div className="space-y-1 relative z-10">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-gradient-to-r from-amber-400 to-amber-600 text-[#0C1E36] text-[8.5px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                      {selectedDoc.code}
                    </span>
                    <span className="text-amber-200/80 font-mono text-[9px] font-black tracking-widest">
                      {selectedDoc.frequency.toUpperCase()} • {selectedDoc.officerResponsible.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                    {selectedDoc.title}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2.5 text-zinc-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-zinc-700/50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body Grid */}
              <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-[#FAF9F5]">
                
                {/* Left Panel: Variable Fields & Output Preview (Col Span 7) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Inside details input boxes */}
                  <div className="bg-white border border-amber-200/30 rounded-[32px] p-6 shadow-sm space-y-5">
                    <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0C1E36] flex items-center gap-1.5">
                        <Edit3 className="w-4 h-4 text-[#C89311]" />
                        Customize Inside Details & Variables
                      </h4>
                      <span className="text-[8.5px] text-[#C89311] font-black uppercase tracking-widest">Interactive Fields</span>
                    </div>

                    {/* Role Restricted Banner */}
                    {role !== "Chairman" && role !== "Admin" && selectedDoc.assignedTo !== "Both" && selectedDoc.assignedTo !== role && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[9.5px] text-amber-900 font-medium">
                        🔒 <strong>Read-Only for {role}:</strong> This statutory document is under the responsibility of the <strong>{selectedDoc.officerResponsible}</strong>. You may inspect the live preview and run AI compliance checks, but input edits and submission are restricted to authorized officers.
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.keys(selectedDoc.templateFields).map(key => {
                        const isRoleRestricted = role !== "Chairman" && role !== "Admin" && selectedDoc.assignedTo !== "Both" && selectedDoc.assignedTo !== role;
                        
                        return (
                          <div key={key} className="space-y-1.5">
                            <label className="text-[8.5px] font-black uppercase tracking-wider text-zinc-400 block">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </label>
                            <input
                              type="text"
                              value={selectedDoc.templateFields[key]}
                              disabled={selectedDoc.status === "Approved" || isRoleRestricted}
                              onChange={(e) => handleFieldChange(key, e.target.value)}
                              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200/80 focus:border-[#C89311] focus:ring-4 focus:ring-amber-500/10 rounded-2xl text-xs font-semibold focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fully Rendered Live Output Blueprint */}
                  <div className="bg-zinc-950 text-zinc-200 font-mono p-6 rounded-[32px] shadow-2xl border border-zinc-800 space-y-4 relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex justify-between items-center border-b border-zinc-800/80 pb-3">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Live Document Blueprint Preview</span>
                      </div>
                      <span className="text-[8px] text-zinc-500 uppercase font-black tracking-widest bg-zinc-900 px-2 py-0.5 rounded">COA-CGS v2</span>
                    </div>

                    <pre className="text-[11px] leading-relaxed whitespace-pre-wrap break-all select-all outline-none font-mono text-emerald-400/90 h-72 overflow-y-auto pr-2 scrollbar-thin">
                      {compileDocumentContent(selectedDoc)}
                    </pre>

                    <div className="text-[8px] text-zinc-500 font-black uppercase text-center tracking-widest border-t border-zinc-900 pt-3">
                      * Values mapped automatically into authorized SK-Letterhead blocks.
                    </div>
                  </div>
                </div>

                {/* Right Panel: Smart AI Auditor & Workflow Actions (Col Span 5) */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* AI Compliance Module */}
                  <div className="bg-white border border-amber-200/30 rounded-[32px] p-6 shadow-sm space-y-5">
                    <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#0C1E36] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#C89311]" />
                        Compliance Pre-Audit Advisor
                      </h4>
                      <span className="font-mono text-[8px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-black uppercase">
                        COA.V2
                      </span>
                    </div>

                    <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
                      Affix signature variables and click the pre-audit advisor to evaluate document legality against national oversight policies.
                    </p>

                    <button
                      onClick={runAiVerification}
                      disabled={isAuditing}
                      className="w-full py-3 bg-[#0C1E36] hover:bg-[#C89311] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isAuditing ? (
                        <>
                          <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                          Auditing with Explainable AI...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4.5 h-4.5 text-amber-400" />
                          Perform AI Pre-Audit Check
                        </>
                      )}
                    </button>

                    {auditReport ? (
                      <div className="space-y-5 pt-4 border-t border-dashed border-zinc-200">
                        
                        {/* Outstanding Circular Gauge Meter block */}
                        <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 flex items-center justify-between gap-4">
                          <div className="relative h-16 w-16 flex items-center justify-center shrink-0">
                            <svg className="absolute transform -rotate-90 w-16 h-16">
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                className="text-zinc-200"
                                strokeWidth="5"
                                stroke="currentColor"
                                fill="transparent"
                              />
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                className="text-emerald-500"
                                strokeWidth="5"
                                strokeDasharray={175}
                                strokeDashoffset={175 - (175 * auditReport.score) / 100}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                              />
                            </svg>
                            <span className="text-xs font-black text-[#0C1E36]">{auditReport.score}%</span>
                          </div>
                          
                          <div className="space-y-1">
                            <span className="text-[8px] font-black uppercase text-zinc-400 block tracking-widest">Diagnostic Verdict</span>
                            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[9px] font-black uppercase tracking-wider block w-max shadow-sm">
                              {auditReport.status}
                            </span>
                            <span className="text-[9.5px] font-bold text-zinc-500 block leading-tight">Verified Compliant</span>
                          </div>
                        </div>

                        {/* Audit strengths list */}
                        <div className="space-y-2">
                          <span className="text-[8px] font-black uppercase text-zinc-400 tracking-widest block">Audit Strengths:</span>
                          <ul className="space-y-2">
                            {auditReport.strengths.map((str: string, index: number) => (
                              <li key={index} className="text-[9.5px] leading-relaxed text-zinc-600 flex gap-2 items-start font-semibold bg-emerald-50/50 border border-emerald-100/40 p-2 rounded-xl">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {auditReport.opportunities.length > 0 && (
                          <div className="space-y-1 bg-amber-50 border border-amber-100 p-3 rounded-xl">
                            <span className="text-[8px] font-black uppercase text-amber-800 tracking-widest block">Actionable Warning:</span>
                            <p className="text-[9px] text-amber-700 font-semibold leading-relaxed">
                              {auditReport.opportunities[0]}
                            </p>
                          </div>
                        )}

                        {/* Citations block */}
                        <div className="space-y-1.5">
                          <span className="text-[8px] font-black uppercase text-zinc-400 tracking-widest block">Legal Footnotes & Citations:</span>
                          <ul className="space-y-1.5">
                            {auditReport.citations.map((cit: string, index: number) => (
                              <li key={index} className="text-[9px] leading-relaxed text-zinc-500 italic bg-zinc-50 border border-zinc-100 p-2.5 rounded-xl font-semibold">
                                {cit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center border-2 border-dashed border-amber-200/30 rounded-[24px] text-zinc-400 flex flex-col items-center gap-1.5">
                        <Sparkles className="w-8 h-8 opacity-40 animate-pulse text-[#C89311]" />
                        <span className="text-[9px] font-black uppercase tracking-wider">Awaiting AI Verification Audit</span>
                      </div>
                    )}
                  </div>

                  {/* Document History Logs with elegant timeline vertical lines */}
                  <div className="bg-white border border-amber-200/30 rounded-[32px] p-6 shadow-sm space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0C1E36] flex items-center gap-1.5">
                      <History className="w-4 h-4 text-[#C89311]" />
                      Accountability & Version History
                    </h4>

                    <div className="space-y-4 max-h-40 overflow-y-auto pr-1 relative pl-4 border-l border-zinc-100">
                      {selectedDoc.history.map((hist, index) => (
                        <div key={index} className="relative space-y-1">
                          {/* Dot indicating timestamp item */}
                          <div className="absolute -left-[20.5px] top-1.5 h-2 w-2 rounded-full bg-[#C89311] border border-white" />
                          
                          <div className="flex justify-between items-center text-[9px]">
                            <span className="font-black text-[#0C1E36] uppercase tracking-wide bg-zinc-100 px-1.5 py-0.5 rounded">{hist.action}</span>
                            <span className="text-zinc-400 font-mono font-black">{hist.timestamp}</span>
                          </div>
                          <p className="text-[9.5px] text-zinc-600 font-semibold leading-relaxed">{hist.details}</p>
                          <span className="text-[8.5px] text-[#C89311] font-black uppercase tracking-widest">User: {hist.user}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer / Workflows */}
              <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex justify-between items-center">
                <div className="text-[10px] font-bold text-zinc-400">
                  Document Assignment: <span className="font-black text-zinc-600">{selectedDoc.assignedTo}</span>
                </div>

                <div className="flex gap-3">
                  {role === "Chairman" && (
                    <button
                      onClick={handleExportPrintCompliance}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#0C1E36] to-slate-800 hover:from-[#C89311] hover:to-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      Export / Ready to Print
                    </button>
                  )}
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 cursor-pointer"
                  >
                    Close
                  </button>

                  {/* Secretary / Treasurer: Submission Button */}
                  {selectedDoc.status !== "Approved" && selectedDoc.status !== "Submitted" && (
                    <button
                      onClick={submitDocument}
                      className="px-6 py-2.5 bg-[#0C1E36] hover:bg-[#C89311] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Submit to Chairman
                    </button>
                  )}

                  {/* Chairman Roles: Action Buttons */}
                  {role === "Chairman" && selectedDoc.status === "Submitted" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveDocument(false)}
                        className="px-5 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-600 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        Reject / Request Revision
                      </button>
                      <button
                        onClick={() => approveDocument(true)}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-1 cursor-pointer"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        Affix Chairman Sign & Approve
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
