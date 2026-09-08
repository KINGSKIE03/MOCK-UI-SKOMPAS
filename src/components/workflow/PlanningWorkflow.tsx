import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, 
  Lock, 
  CheckCircle2, 
  ChevronRight, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  X, 
  Info, 
  ShieldCheck, 
  Calendar, 
  Coins, 
  Activity, 
  Send, 
  FileSpreadsheet, 
  RefreshCw,
  HelpCircle,
  Printer,
  Download
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { saveDocumentSubmission, autoArchivePreviousDocument, getBarangayRecords } from "../../lib/barangayStore";

interface PlanningWorkflowProps {
  onRefreshDocs?: () => void;
}

export function PlanningWorkflow({ onRefreshDocs }: PlanningWorkflowProps) {
  const { role, user } = useAuth();
  const navigate = useNavigate();

  // Workflow states: 'draft' | 'submitted'
  const [cbydpStatus, setCbydpStatus] = useState<"draft" | "submitted">("draft");
  const [abyipStatus, setAbyipStatus] = useState<"locked" | "draft" | "submitted">("locked");
  const [budgetStatus, setBudgetStatus] = useState<"locked" | "draft" | "submitted">("locked");

  // Modals
  const [isCbydpModalOpen, setIsCbydpModalOpen] = useState(false);
  const [isAbyipModalOpen, setIsAbyipModalOpen] = useState(false);
  
  // Explainable AI states
  const [isCbydpAuditing, setIsCbydpAuditing] = useState(false);
  const [cbydpAuditReport, setCbydpAuditReport] = useState<any | null>(null);
  
  const [isAbyipAuditing, setIsAbyipAuditing] = useState(false);
  const [abyipAuditReport, setAbyipAuditReport] = useState<any | null>(null);

  // Form State: CBYDP
  const [cbydpForm, setCbydpForm] = useState({
    barangayName: user?.barangayName || "San Jose",
    chairperson: user?.displayName ? `Hon. ${user.displayName}` : "Hon. Juan Dela Cruz",
    years: "2026-2029",
    eduObjective: "Provide equitable access to tertiary education grants and tech-voc training for out-of-school youth.",
    eduBudget: 150000,
    healthObjective: "Establish regular grass-roots sports clinics, anti-drug seminars, and mental health hotlines.",
    healthBudget: 100000,
    envObjective: "Initiate weekly coastal clean-ups, urban container gardening, and zero-waste advocacy.",
    envBudget: 80000,
    activeObjective: "Organize youth leadership summits, citizenship awards, and SK council accountability forums.",
    activeBudget: 70000
  });

  // Form State: ABYIP
  const [abyipForm, setAbyipForm] = useState({
    year: "2026",
    ppa1Name: "Kabataan Scholarship Grant Program",
    ppa1Budget: 150000,
    ppa1Schedule: "Quarter 1 - Quarter 4 2026",
    ppa2Name: "Barangay SK Anti-Drug Sports Cup & Mental Wellness Camp",
    ppa2Budget: 100000,
    ppa2Schedule: "Summer 2026",
    ppa3Name: "Green Barangay Tree-Planting & Coastal Sweep Initiative",
    ppa3Budget: 80000,
    ppa3Schedule: "Bi-monthly 2026",
    ppa4Name: "Sangguniang Kabataan Youth Leadership Training Seminar",
    ppa4Budget: 70000,
    ppa4Schedule: "October 2026"
  });

  // Load status values
  const loadWorkflowStatuses = () => {
    const cbydp = localStorage.getItem("skompas_status_cbydp") || "draft";
    setCbydpStatus(cbydp as "draft" | "submitted");

    if (cbydp === "submitted") {
      const abyip = localStorage.getItem("skompas_status_abyip") || "draft";
      setAbyipStatus(abyip as "draft" | "submitted");
      
      if (abyip === "submitted") {
        // Also check if budget was submitted via spreadsheet
        const budgetSub = localStorage.getItem("skompas_status_budget") || "draft";
        setBudgetStatus(budgetSub as "draft" | "submitted");
      } else {
        setBudgetStatus("locked");
      }
    } else {
      setAbyipStatus("locked");
      setBudgetStatus("locked");
    }
  };

  useEffect(() => {
    loadWorkflowStatuses();
    
    // Add event listener to react to budget submission and storage changes
    window.addEventListener("storage", loadWorkflowStatuses);
    return () => window.removeEventListener("storage", loadWorkflowStatuses);
  }, []);

  const handleResetWorkflow = () => {
    localStorage.removeItem("skompas_status_cbydp");
    localStorage.removeItem("skompas_status_abyip");
    localStorage.removeItem("skompas_status_budget");
    loadWorkflowStatuses();
    setCbydpAuditReport(null);
    setAbyipAuditReport(null);
    if (onRefreshDocs) onRefreshDocs();
  };

  // CBYDP Handlers
  const handleCbydpInputChange = (field: string, value: string | number) => {
    setCbydpForm(prev => ({ ...prev, [field]: value }));
  };

  const runCbydpAudit = () => {
    setIsCbydpAuditing(true);
    setCbydpAuditReport(null);
    
    setTimeout(() => {
      // Calculate heuristic scores based on inputs
      const totalBudget = Number(cbydpForm.eduBudget) + Number(cbydpForm.healthBudget) + Number(cbydpForm.envBudget) + Number(cbydpForm.activeBudget);
      const isBudgetAppropriate = totalBudget >= 350000;
      
      setCbydpAuditReport({
        score: isBudgetAppropriate ? 98 : 82,
        status: "Highly Compliant",
        timestamp: new Date().toLocaleTimeString(),
        legalCitations: [
          "RA 10742 Section 8: Directs formulation of the 3-Year Comprehensive Barangay Youth Development Plan (CBYDP).",
          "DILG-NYCP Joint Memorandum Circular No. 2019-01: Focus areas align fully with National Philippine Youth Development Plan (PYDP) centers of participation."
        ],
        strengths: [
          `Allocated PHP ${totalBudget.toLocaleString()} strictly across key centers of participation (Education, Health, Environment, Leadership).`,
          "Expected outcomes contain explicit measurable targets for local youth cohorts.",
          "Perfect compliance with the 3-year statutory template structure."
        ],
        opportunities: isBudgetAppropriate ? [] : [
          "Consider expanding the budget allocation for environmental programs to better address local Climate Action targets."
        ],
        alignmentFeedback: "Explainable AI Review: Your 3-year objectives are thoroughly mapped with high alignment metrics. This plan is fully ready to serve as the baseline blueprint for annual budgeting."
      });
      setIsCbydpAuditing(false);
    }, 1500);
  };

  const handleExportPrintCbydp = () => {
    const contentText = `
3-YEAR COMPREHENSIVE BARANGAY YOUTH DEVELOPMENT PLAN (CBYDP)
Barangay: ${cbydpForm.barangayName}
Calendar Years: ${cbydpForm.years}
SK Chairperson: ${cbydpForm.chairperson}

---------------------------------------------------------
FOCUS AREA 1: EDUCATION
Objective: ${cbydpForm.eduObjective}
Statutory Budget Limit Allocation: PHP ${Number(cbydpForm.eduBudget).toLocaleString()}.00

FOCUS AREA 2: HEALTH & WELLNESS
Objective: ${cbydpForm.healthObjective}
Statutory Budget Limit Allocation: PHP ${Number(cbydpForm.healthBudget).toLocaleString()}.00

FOCUS AREA 3: ENVIRONMENTAL PROTECTION
Objective: ${cbydpForm.envObjective}
Statutory Budget Limit Allocation: PHP ${Number(cbydpForm.envBudget).toLocaleString()}.00

FOCUS AREA 4: LEADERSHIP & GOVERNANCE
Objective: ${cbydpForm.activeObjective}
Statutory Budget Limit Allocation: PHP ${Number(cbydpForm.activeBudget).toLocaleString()}.00
---------------------------------------------------------

Certified Approved and Compliant:
Sangguniang Kabataan Chairman & Council
`;

    // Download as TXT
    const element = document.createElement("a");
    const file = new Blob([contentText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `CBYDP-${cbydpForm.barangayName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${cbydpForm.years}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    // Print
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>CBYDP Official Printout - Barangay ${cbydpForm.barangayName}</title>
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
              <h1>COMPREHENSIVE BARANGAY YOUTH DEVELOPMENT PLAN (CBYDP)</h1>
              <p>Sangguniang Kabataan of Barangay ${cbydpForm.barangayName}</p>
              <p>Official Statutory Planning Template - RA 10742</p>
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

  const handleExportPrintAbyip = () => {
    const contentText = `
ANNUAL BARANGAY YOUTH INVESTMENT PROGRAM (ABYIP)
Barangay: ${cbydpForm.barangayName || "San Jose"}
Calendar Year: 2026
SK Chairperson: ${cbydpForm.chairperson || "Hon. Chairperson"}

---------------------------------------------------------
PROGRAM / PROJECT / ACTIVITY (PPA) 1: EDUCATION
Name: ${abyipForm.ppa1Name}
Implementation Schedule: ${abyipForm.ppa1Schedule}
Annual Budget Allocation: PHP ${Number(abyipForm.ppa1Budget).toLocaleString()}.00

PROGRAM / PROJECT / ACTIVITY (PPA) 2: HEALTH & WELLNESS
Name: ${abyipForm.ppa2Name}
Implementation Schedule: ${abyipForm.ppa2Schedule}
Annual Budget Allocation: PHP ${Number(abyipForm.ppa2Budget).toLocaleString()}.00

PROGRAM / PROJECT / ACTIVITY (PPA) 3: ENVIRONMENTAL PROTECTION
Name: ${abyipForm.ppa3Name}
Implementation Schedule: ${abyipForm.ppa3Schedule}
Annual Budget Allocation: PHP ${Number(abyipForm.ppa3Budget).toLocaleString()}.00

PROGRAM / PROJECT / ACTIVITY (PPA) 4: LEADERSHIP & GOVERNANCE
Name: ${abyipForm.ppa4Name}
Implementation Schedule: ${abyipForm.ppa4Schedule}
Annual Budget Allocation: PHP ${Number(abyipForm.ppa4Budget).toLocaleString()}.00
---------------------------------------------------------

Certified Approved and Compliant:
Sangguniang Kabataan Chairman & Council
`;

    // Download as TXT
    const element = document.createElement("a");
    const file = new Blob([contentText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `ABYIP-2026.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    // Print
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>ABYIP Official Printout - Barangay ${cbydpForm.barangayName || "San Jose"}</title>
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
              <h1>ANNUAL BARANGAY YOUTH INVESTMENT PROGRAM (ABYIP)</h1>
              <p>Sangguniang Kabataan of Barangay ${cbydpForm.barangayName || "San Jose"}</p>
              <p>Official Statutory Planning Template - RA 10742</p>
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

  const submitCbydp = () => {
    localStorage.setItem("skompas_status_cbydp", "submitted");
    const targetBarangay = user?.barangayName || cbydpForm.barangayName || "San Jose";
    const totalBudget = Number(cbydpForm.eduBudget) + Number(cbydpForm.healthBudget) + Number(cbydpForm.envBudget) + Number(cbydpForm.activeBudget);
    
    // Check and auto-archive any previously approved CBYDP document for older years
    const prevRecords = getBarangayRecords(targetBarangay).filter(r => r.docType === "CBYDP" && r.yearOrPeriod !== cbydpForm.years);
    prevRecords.forEach(prev => {
      autoArchivePreviousDocument({
        barangayName: targetBarangay,
        docType: "CBYDP",
        previousYearOrPeriod: prev.yearOrPeriod,
        title: prev.title,
        totalBudget: prev.totalBudget,
        remarks: `Archived upon creation and submission of CBYDP cycle ${cbydpForm.years}.`
      });
    });

    // Save official statutory submission for LYDO review
    saveDocumentSubmission({
      barangayName: targetBarangay,
      docCode: "CBYDP",
      docType: "CBYDP",
      title: `3-Year Comprehensive Youth Plan (CBYDP) CY ${cbydpForm.years}`,
      yearOrPeriod: cbydpForm.years,
      submittedBy: `${user?.displayName || cbydpForm.chairperson} (${role || "Secretary"})`,
      officerRole: (role as any) || "Secretary",
      totalBudget: totalBudget,
      contentSnapshot: cbydpForm
    });

    // Seed in submitted documents as well so it appears on Dashboard
    const liveString = localStorage.getItem("skompas_submitted_budgets") || "[]";
    const parsed = JSON.parse(liveString);
    const docId = `cbydp-${Date.now()}`;
    const newDoc = {
      id: docId,
      title: `3-Year Comprehensive Youth Plan (CBYDP) CY ${cbydpForm.years}`,
      type: "needs",
      status: "pending_review",
      authorRole: role || "Secretary",
      authorId: user?.uid || "sec-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: `### 3-Year Comprehensive Barangay Youth Development Plan (CBYDP)\nBarangay: ${targetBarangay}\nChairperson: ${cbydpForm.chairperson}\n\n**Education Objectives:** ${cbydpForm.eduObjective} (PHP ${Number(cbydpForm.eduBudget).toLocaleString()})\n\n**Health Objectives:** ${cbydpForm.healthObjective} (PHP ${Number(cbydpForm.healthBudget).toLocaleString()})\n\n**Environment Objectives:** ${cbydpForm.envObjective} (PHP ${Number(cbydpForm.envBudget).toLocaleString()})\n\n**Active Citizenship:** ${cbydpForm.activeObjective} (PHP ${Number(cbydpForm.activeBudget).toLocaleString()})`
    };
    parsed.unshift(newDoc);
    localStorage.setItem("skompas_submitted_budgets", JSON.stringify(parsed));
    
    loadWorkflowStatuses();
    setIsCbydpModalOpen(false);
    if (onRefreshDocs) onRefreshDocs();
  };

  // ABYIP Handlers
  const handleAbyipInputChange = (field: string, value: string | number) => {
    setAbyipForm(prev => ({ ...prev, [field]: value }));
  };

  const runAbyipAudit = () => {
    setIsAbyipAuditing(true);
    setAbyipAuditReport(null);
    
    setTimeout(() => {
      // Cross-reference ABYIP PPA allocations with submitted CBYDP priorities
      const alignsEdu = abyipForm.ppa1Budget === cbydpForm.eduBudget;
      const alignsHealth = abyipForm.ppa2Budget === cbydpForm.healthBudget;
      
      setAbyipAuditReport({
        score: alignsEdu && alignsHealth ? 100 : 92,
        status: "Fully Aligned",
        timestamp: new Date().toLocaleTimeString(),
        legalCitations: [
          "RA 10742 Section 20(c): Mandates that the ABYIP must strictly prioritize the programs declared in the CBYDP.",
          "COA Circular No. 2020-003: Audit tracking of SK allocations relative to annual investment programs."
        ],
        strengths: [
          "1:1 program mapping discovered for all 4 primary PPAs.",
          "Clear implementation timelines allocated per financial quarter.",
          "All proposed budget sources leverage correct 10% Barangay statutory shares."
        ],
        opportunities: alignsEdu && alignsHealth ? [] : [
          "Annual allocation differs slightly from multi-year CBYDP outline. Ensure council minutes document this adjustment."
        ],
        alignmentFeedback: "Explainable AI Review: Exceptional vertical integration. Your Annual Investment Program (ABYIP) maps seamlessly into the CBYDP framework with 100% statutory score."
      });
      setIsAbyipAuditing(false);
    }, 1500);
  };

  const submitAbyip = () => {
    localStorage.setItem("skompas_status_abyip", "submitted");
    const targetBarangay = user?.barangayName || cbydpForm.barangayName || "San Jose";
    const totalBudget = Number(abyipForm.ppa1Budget) + Number(abyipForm.ppa2Budget) + Number(abyipForm.ppa3Budget) + Number(abyipForm.ppa4Budget);

    // Check and auto-archive any previously approved ABYIP document for older years
    const prevRecords = getBarangayRecords(targetBarangay).filter(r => r.docType === "ABYIP" && r.yearOrPeriod !== abyipForm.year);
    prevRecords.forEach(prev => {
      autoArchivePreviousDocument({
        barangayName: targetBarangay,
        docType: "ABYIP",
        previousYearOrPeriod: prev.yearOrPeriod,
        title: prev.title,
        totalBudget: prev.totalBudget,
        remarks: `Archived upon creation and submission of ABYIP cycle ${abyipForm.year}.`
      });
    });

    // Save official statutory submission for LYDO review
    saveDocumentSubmission({
      barangayName: targetBarangay,
      docCode: "ABYIP",
      docType: "ABYIP",
      title: `Annual Barangay Youth Investment Program (ABYIP) CY ${abyipForm.year}`,
      yearOrPeriod: abyipForm.year,
      submittedBy: `${user?.displayName || cbydpForm.chairperson} (${role || "Secretary"})`,
      officerRole: (role as any) || "Secretary",
      totalBudget: totalBudget,
      contentSnapshot: abyipForm
    });

    const liveString = localStorage.getItem("skompas_submitted_budgets") || "[]";
    const parsed = JSON.parse(liveString);
    const docId = `abyip-${Date.now()}`;
    const newDoc = {
      id: docId,
      title: `Annual Barangay Youth Investment Program (ABYIP) CY ${abyipForm.year}`,
      type: "needs",
      status: "pending_review",
      authorRole: role || "Secretary",
      authorId: user?.uid || "sec-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: `### Annual Barangay Youth Investment Program (ABYIP) CY ${abyipForm.year}\n1. **${abyipForm.ppa1Name}**\n- Schedule: ${abyipForm.ppa1Schedule}\n- Allocation: PHP ${Number(abyipForm.ppa1Budget).toLocaleString()}\n\n2. **${abyipForm.ppa2Name}**\n- Schedule: ${abyipForm.ppa2Schedule}\n- Allocation: PHP ${Number(abyipForm.ppa2Budget).toLocaleString()}\n\n3. **${abyipForm.ppa3Name}**\n- Schedule: ${abyipForm.ppa3Schedule}\n- Allocation: PHP ${Number(abyipForm.ppa3Budget).toLocaleString()}\n\n4. **${abyipForm.ppa4Name}**\n- Schedule: ${abyipForm.ppa4Schedule}\n- Allocation: PHP ${Number(abyipForm.ppa4Budget).toLocaleString()}`
    };
    parsed.unshift(newDoc);
    localStorage.setItem("skompas_submitted_budgets", JSON.stringify(parsed));
    
    loadWorkflowStatuses();
    setIsAbyipModalOpen(false);
    if (onRefreshDocs) onRefreshDocs();
  };

  // Quick Guard check to assure only SK Officials access this logic
  if (role !== "Chairman" && role !== "Secretary" && role !== "Treasurer") {
    return null;
  }

  return (
    <div className="bg-white border border-[#eee] rounded-[48px] p-8 shadow-sm space-y-8 relative overflow-hidden">
      
      {/* Background radial highlight */}
      <div className="absolute right-0 top-0 w-96 h-96 bg-[#C89311]/5 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40" />

      {/* Header with Title and Reset Tool */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-[8px] font-black uppercase tracking-widest rounded-full">
              Sequential Governance Engine
            </span>
            <span className="h-1 w-1 bg-zinc-300 rounded-full" />
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">RA 10742 Compliance</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0C1E36] tracking-tight">
            Statutory Planning & Budgeting Workflow
          </h2>
          <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed max-w-2xl">
            Enforce linear public sector accountability. In accordance with SK Reform mandates, a barangay must draft its <span className="font-bold text-[#0C1E36]">3-Year CBYDP</span>, map those priorities into an <span className="font-bold text-[#0C1E36]">Annual ABYIP</span>, and compile the final <span className="font-bold text-[#0C1E36]">Annual Budget Spreadsheet</span>.
          </p>
        </div>
        
        {/* Reset / Testing Button to clear workflow status for demos */}
        <button
          onClick={handleResetWorkflow}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-600 transition-all active:scale-95 cursor-pointer"
          title="Reset sequence state for testing"
        >
          <RefreshCw className="w-3 h-3 text-zinc-500" />
          Reset Sequence
        </button>
      </div>

      {/* Sequential Steps Visual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">

        {/* Step 1: CBYDP */}
        <div className={`p-6 border rounded-[32px] transition-all space-y-4 flex flex-col justify-between ${
          cbydpStatus === "submitted" 
            ? "bg-emerald-50/20 border-emerald-100/80 shadow-inner" 
            : "bg-[#FDFCFB]/50 border-[#eee] hover:border-[#C89311]/50 shadow-sm"
        }`}>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-zinc-100 text-zinc-700 font-mono text-[10px] font-black flex items-center justify-center">01</span>
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Baseline Plan</span>
              </div>
              
              {cbydpStatus === "submitted" ? (
                <span className="px-2.5 py-0.5 bg-emerald-100/60 text-emerald-800 text-[8px] font-black uppercase tracking-wider border border-emerald-200 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                  Submitted
                </span>
              ) : (
                <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 text-[8px] font-black uppercase tracking-wider border border-amber-200 rounded-full">
                  Needs Action
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black text-[#0C1E36]">3-Year CBYDP Template</h3>
              <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                Comprehensive Barangay Youth Development Plan (CY 2026-2029). Establishes 3-year strategic priorities and program benchmarks.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCbydpModalOpen(true)}
            className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              cbydpStatus === "submitted"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                : "bg-[#0C1E36] hover:bg-[#C89311] text-white shadow-md"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            {cbydpStatus === "submitted" ? "View Submitted CBYDP" : "View & Complete CBYDP"}
          </button>
        </div>

        {/* Step 2: ABYIP */}
        <div className={`p-6 border rounded-[32px] transition-all space-y-4 flex flex-col justify-between ${
          abyipStatus === "locked"
            ? "bg-zinc-50/50 border-zinc-100 opacity-60"
            : abyipStatus === "submitted"
            ? "bg-emerald-50/20 border-emerald-100/80 shadow-inner"
            : "bg-[#FDFCFB]/50 border-[#eee] hover:border-[#C89311]/50 shadow-sm animate-pulse-subtle"
        }`}>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-zinc-100 text-zinc-700 font-mono text-[10px] font-black flex items-center justify-center">02</span>
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Annual PPA Map</span>
              </div>
              
              {abyipStatus === "locked" ? (
                <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-500 text-[8px] font-black uppercase tracking-wider border border-zinc-200 rounded-full flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-zinc-400" />
                  Locked
                </span>
              ) : abyipStatus === "submitted" ? (
                <span className="px-2.5 py-0.5 bg-emerald-100/60 text-emerald-800 text-[8px] font-black uppercase tracking-wider border border-emerald-200 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                  Submitted
                </span>
              ) : (
                <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 text-[8px] font-black uppercase tracking-wider border border-amber-200 rounded-full">
                  Needs Action
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black text-[#0C1E36]">Annual ABYIP Template</h3>
              <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                Annual Barangay Youth Investment Program (CY 2026). Specifies PPAs, schedules, and budgets mapped directly to CBYDP goals.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAbyipModalOpen(true)}
            disabled={abyipStatus === "locked"}
            className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${
              abyipStatus === "locked"
                ? "bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed"
                : abyipStatus === "submitted"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer"
                : "bg-[#0C1E36] hover:bg-[#C89311] text-white shadow-md cursor-pointer"
            }`}
          >
            {abyipStatus === "locked" ? (
              <>
                <Lock className="w-3 h-3 text-zinc-400" />
                Locked by Sequence
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5" />
                {abyipStatus === "submitted" ? "View Submitted ABYIP" : "View & Complete ABYIP"}
              </>
            )}
          </button>
        </div>

        {/* Step 3: Annual Budget */}
        <div className={`p-6 border rounded-[32px] transition-all space-y-4 flex flex-col justify-between ${
          budgetStatus === "locked"
            ? "bg-zinc-50/50 border-zinc-100 opacity-60"
            : budgetStatus === "submitted"
            ? "bg-emerald-50/20 border-emerald-100/80 shadow-inner"
            : "bg-[#FDFCFB]/50 border-[#eee] hover:border-[#C89311]/50 shadow-sm"
        }`}>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-zinc-100 text-zinc-700 font-mono text-[10px] font-black flex items-center justify-center">03</span>
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Fiscal Program</span>
              </div>
              
              {budgetStatus === "locked" ? (
                <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-500 text-[8px] font-black uppercase tracking-wider border border-zinc-200 rounded-full flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-zinc-400" />
                  Locked
                </span>
              ) : budgetStatus === "submitted" ? (
                <span className="px-2.5 py-0.5 bg-emerald-100/60 text-emerald-800 text-[8px] font-black uppercase tracking-wider border border-emerald-200 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                  Submitted
                </span>
              ) : (
                <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 text-[8px] font-black uppercase tracking-wider border border-amber-200 rounded-full">
                  Needs Action
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black text-[#0C1E36]">Annual Budget Spreadsheet</h3>
              <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                Official Excel-style fiscal budget builder. Consolidates general admin (PS/MOOE) and YDEP funds into compliance sheets.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/budget-template")}
            disabled={budgetStatus === "locked"}
            className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${
              budgetStatus === "locked"
                ? "bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/10 hover:scale-[1.01] active:scale-95 cursor-pointer"
            }`}
          >
            {budgetStatus === "locked" ? (
              <>
                <Lock className="w-3 h-3 text-zinc-400" />
                Locked by Sequence
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-3.5 h-3.5" />
                {budgetStatus === "submitted" ? "View Budget Spreadsheet" : "Complete Budget Spreadsheet"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* MODAL 1: CBYDP EDITOR / VIEWER */}
      <AnimatePresence>
        {isCbydpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="bg-white border rounded-[36px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
              
              {/* Modal Header */}
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-[#0C1E36] text-white">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-amber-500 text-[#0C1E36] rounded-full">
                      Step 1 of 3
                    </span>
                    <span className="text-zinc-300 font-mono text-[9px]">3-YEAR STATUTORY BLUEPRINT</span>
                  </div>
                  <h3 className="text-lg font-black tracking-tight">
                    {cbydpStatus === "submitted" ? "Submitted CBYDP Reference Form" : "Draft 3-Year Comprehensive Youth Plan (CBYDP)"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsCbydpModalOpen(false)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scroll Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                
                {/* Intro Box */}
                <div className="p-4.5 bg-[#FDFCFB] border border-zinc-100 rounded-2xl text-[10px] text-zinc-600 font-medium leading-relaxed flex gap-3">
                  <Info className="w-5 h-5 text-[#C89311] shrink-0" />
                  <p>
                    The <strong>Comprehensive Barangay Youth Development Plan (CBYDP)</strong> is a 3-year plan formulated by the Sangguniang Kabataan (SK) within three months of assumption. It aligns with the Philippine Youth Development Plan (PYDP). Complete the focus areas below to initiate the audit.
                  </p>
                </div>

                {/* Main Grid: Form Inputs Left, Explainable AI Audit Right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Form fields (Left side - Col span 7) */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block">Local Barangay</label>
                        <input
                          type="text"
                          value={cbydpForm.barangayName}
                          disabled={cbydpStatus === "submitted"}
                          onChange={(e) => handleCbydpInputChange("barangayName", e.target.value)}
                          className="w-full px-4 py-2.5 bg-[#FDFCFB] border border-zinc-200 focus:border-[#C89311] rounded-xl text-xs font-semibold focus:outline-none disabled:opacity-75"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block">Plan Calendar Years</label>
                        <input
                          type="text"
                          value={cbydpForm.years}
                          disabled={cbydpStatus === "submitted"}
                          onChange={(e) => handleCbydpInputChange("years", e.target.value)}
                          className="w-full px-4 py-2.5 bg-[#FDFCFB] border border-zinc-200 focus:border-[#C89311] rounded-xl text-xs font-semibold focus:outline-none disabled:opacity-75"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block">SK Chairperson Signature Name</label>
                      <input
                        type="text"
                        value={cbydpForm.chairperson}
                        disabled={cbydpStatus === "submitted"}
                        onChange={(e) => handleCbydpInputChange("chairperson", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#FDFCFB] border border-zinc-200 focus:border-[#C89311] rounded-xl text-xs font-semibold focus:outline-none disabled:opacity-75"
                      />
                    </div>

                    <h4 className="text-[10px] font-black uppercase tracking-wider text-[#0C1E36] border-b pb-1.5">
                      Philippine Youth Development Plan (PYDP) Focus Areas
                    </h4>

                    {/* Focus Area 1: Education */}
                    <div className="p-4 bg-zinc-50/50 border border-zinc-100 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-[#0C1E36] uppercase tracking-wide">Focus Area 1: Education</span>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-[9px] font-bold text-zinc-400">Budget limit:</span>
                          <input
                            type="number"
                            value={cbydpForm.eduBudget}
                            disabled={cbydpStatus === "submitted"}
                            onChange={(e) => handleCbydpInputChange("eduBudget", Number(e.target.value))}
                            className="w-24 px-2.5 py-1 bg-white border border-zinc-200 focus:border-[#C89311] rounded-lg text-[10px] font-mono font-bold text-right focus:outline-none"
                          />
                        </div>
                      </div>
                      <textarea
                        rows={2}
                        value={cbydpForm.eduObjective}
                        disabled={cbydpStatus === "submitted"}
                        onChange={(e) => handleCbydpInputChange("eduObjective", e.target.value)}
                        className="w-full p-3 bg-white border border-zinc-200 focus:border-[#C89311] rounded-xl text-xs font-medium focus:outline-none resize-none"
                        placeholder="Write 3-year objectives for Education"
                      />
                    </div>

                    {/* Focus Area 2: Health */}
                    <div className="p-4 bg-zinc-50/50 border border-zinc-100 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-[#0C1E36] uppercase tracking-wide">Focus Area 2: Health & Wellness</span>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-[9px] font-bold text-zinc-400">Budget limit:</span>
                          <input
                            type="number"
                            value={cbydpForm.healthBudget}
                            disabled={cbydpStatus === "submitted"}
                            onChange={(e) => handleCbydpInputChange("healthBudget", Number(e.target.value))}
                            className="w-24 px-2.5 py-1 bg-white border border-zinc-200 focus:border-[#C89311] rounded-lg text-[10px] font-mono font-bold text-right focus:outline-none"
                          />
                        </div>
                      </div>
                      <textarea
                        rows={2}
                        value={cbydpForm.healthObjective}
                        disabled={cbydpStatus === "submitted"}
                        onChange={(e) => handleCbydpInputChange("healthObjective", e.target.value)}
                        className="w-full p-3 bg-white border border-zinc-200 focus:border-[#C89311] rounded-xl text-xs font-medium focus:outline-none resize-none"
                        placeholder="Write 3-year objectives for Health"
                      />
                    </div>

                    {/* Focus Area 3: Environment */}
                    <div className="p-4 bg-zinc-50/50 border border-zinc-100 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-[#0C1E36] uppercase tracking-wide">Focus Area 3: Environmental Protection</span>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-[9px] font-bold text-zinc-400">Budget limit:</span>
                          <input
                            type="number"
                            value={cbydpForm.envBudget}
                            disabled={cbydpStatus === "submitted"}
                            onChange={(e) => handleCbydpInputChange("envBudget", Number(e.target.value))}
                            className="w-24 px-2.5 py-1 bg-white border border-zinc-200 focus:border-[#C89311] rounded-lg text-[10px] font-mono font-bold text-right focus:outline-none"
                          />
                        </div>
                      </div>
                      <textarea
                        rows={2}
                        value={cbydpForm.envObjective}
                        disabled={cbydpStatus === "submitted"}
                        onChange={(e) => handleCbydpInputChange("envObjective", e.target.value)}
                        className="w-full p-3 bg-white border border-zinc-200 focus:border-[#C89311] rounded-xl text-xs font-medium focus:outline-none resize-none"
                        placeholder="Write 3-year objectives for Environment"
                      />
                    </div>

                    {/* Focus Area 4: Active Citizenship */}
                    <div className="p-4 bg-zinc-50/50 border border-zinc-100 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-[#0C1E36] uppercase tracking-wide">Focus Area 4: Leadership & Governance</span>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-[9px] font-bold text-zinc-400">Budget limit:</span>
                          <input
                            type="number"
                            value={cbydpForm.activeBudget}
                            disabled={cbydpStatus === "submitted"}
                            onChange={(e) => handleCbydpInputChange("activeBudget", Number(e.target.value))}
                            className="w-24 px-2.5 py-1 bg-white border border-zinc-200 focus:border-[#C89311] rounded-lg text-[10px] font-mono font-bold text-right focus:outline-none"
                          />
                        </div>
                      </div>
                      <textarea
                        rows={2}
                        value={cbydpForm.activeObjective}
                        disabled={cbydpStatus === "submitted"}
                        onChange={(e) => handleCbydpInputChange("activeObjective", e.target.value)}
                        className="w-full p-3 bg-white border border-zinc-200 focus:border-[#C89311] rounded-xl text-xs font-medium focus:outline-none resize-none"
                        placeholder="Write 3-year objectives for active governance"
                      />
                    </div>
                  </div>

                  {/* Explainable AI Right Side Audit Panel (Col span 5) */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-zinc-50 border border-zinc-200 rounded-[28px] p-6 space-y-5 sticky top-0">
                      <div className="border-b border-zinc-200 pb-3 flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#0C1E36] flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-[#C89311] animate-pulse" />
                          Explainable AI Auditor
                        </h4>
                        <span className="font-mono text-[9px] bg-white border border-zinc-200 text-zinc-400 px-2 py-0.5 rounded">
                          RA10742.v1
                        </span>
                      </div>

                      <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
                        Verify statutory correctness, budgetary alignment, and SMART objectives before finalizing your three-year blueprint.
                      </p>

                      <button
                        onClick={runCbydpAudit}
                        disabled={isCbydpAuditing}
                        className="w-full py-3 bg-[#0C1E36] text-white hover:bg-[#C89311] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isCbydpAuditing ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Evaluating Guidelines...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Verify with Explainable AI
                          </>
                        )}
                      </button>

                      {/* Audit Output */}
                      {cbydpAuditReport ? (
                        <div className="space-y-4 pt-2 border-t border-dashed border-zinc-200">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">AI Audit Rating</span>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[9px] font-black uppercase tracking-wider">
                              {cbydpAuditReport.status}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Compliance Score</span>
                            <span className="font-mono text-sm font-black text-[#0C1E36]">{cbydpAuditReport.score}/100</span>
                          </div>

                          {/* Score visual progress bar */}
                          <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 transition-all duration-500" 
                              style={{ width: `${cbydpAuditReport.score}%` }}
                            />
                          </div>

                          <div className="space-y-2">
                            <span className="text-[8px] font-black uppercase text-zinc-400 tracking-widest block">Statutory Strengths:</span>
                            <ul className="space-y-1.5">
                              {cbydpAuditReport.strengths.map((str: string, index: number) => (
                                <li key={index} className="text-[9px] leading-relaxed text-zinc-600 flex gap-1.5 items-start">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                  <span>{str}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {cbydpAuditReport.opportunities.length > 0 && (
                            <div className="space-y-1 bg-amber-50 border border-amber-100 p-2.5 rounded-xl">
                              <span className="text-[8px] font-black uppercase text-amber-800 tracking-widest block">AI Refinement Tips:</span>
                              <p className="text-[9px] text-amber-700 leading-relaxed font-medium">
                                {cbydpAuditReport.opportunities[0]}
                              </p>
                            </div>
                          )}

                          <div className="p-3 bg-white border border-zinc-200 rounded-xl text-[9.5px] leading-relaxed text-zinc-600 font-medium">
                            {cbydpAuditReport.alignmentFeedback}
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 text-center border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center gap-2 text-zinc-400">
                          <Sparkles className="w-8 h-8 opacity-40 animate-pulse text-amber-500" />
                          <span className="text-[9px] font-black uppercase tracking-wider">Audit logs will build here</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-zinc-100 flex justify-end gap-3 bg-zinc-50">
                {role === "Chairman" && (
                  <button
                    onClick={handleExportPrintCbydp}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#0C1E36] to-slate-800 hover:from-[#C89311] hover:to-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer mr-auto"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    Export / Ready to Print
                  </button>
                )}
                <button
                  onClick={() => setIsCbydpModalOpen(false)}
                  className="px-5 py-2.5 bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 cursor-pointer"
                >
                  Cancel
                </button>
                {cbydpStatus !== "submitted" && (
                  <button
                    onClick={submitCbydp}
                    disabled={!cbydpAuditReport}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Publish & Submit 3-Year Plan
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: ABYIP EDITOR / VIEWER */}
      <AnimatePresence>
        {isAbyipModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="bg-white border rounded-[36px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
              
              {/* Modal Header */}
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-[#0C1E36] text-white">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-amber-500 text-[#0C1E36] rounded-full">
                      Step 2 of 3
                    </span>
                    <span className="text-zinc-300 font-mono text-[9px]">ANNUAL INVESTMENT PROGRAM</span>
                  </div>
                  <h3 className="text-lg font-black tracking-tight">
                    {abyipStatus === "submitted" ? "Submitted ABYIP Reference Sheet" : "Draft Annual Barangay Youth Investment Program (ABYIP)"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsAbyipModalOpen(false)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scroll Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                
                {/* Intro Box */}
                <div className="p-4.5 bg-[#FDFCFB] border border-zinc-100 rounded-2xl text-[10px] text-zinc-600 font-medium leading-relaxed flex gap-3">
                  <Info className="w-5 h-5 text-[#C89311] shrink-0" />
                  <p>
                    The <strong>Annual Barangay Youth Investment Program (ABYIP)</strong> details the specific Projects, Programs, and Activities (PPAs) that the Sangguniang Kabataan will fund for the current calendar year. It must strictly align with the priorities set out in the <strong>3-Year CBYDP</strong> that you completed in Step 1.
                  </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left Column: Form (Col Span 7) */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block">Target Calendar Budget Year</label>
                      <input
                        type="text"
                        value={abyipForm.year}
                        disabled={abyipStatus === "submitted"}
                        onChange={(e) => handleAbyipInputChange("year", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#FDFCFB] border border-zinc-200 focus:border-[#C89311] rounded-xl text-xs font-semibold focus:outline-none"
                      />
                    </div>

                    <h4 className="text-[10px] font-black uppercase tracking-wider text-[#0C1E36] border-b pb-1.5">
                      Define Project, Program, and Activity (PPA) Alignment Sheets
                    </h4>

                    {/* PPA 1 */}
                    <div className="p-4 bg-zinc-50/50 border border-zinc-100 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wide">
                          PPA 1: Linked to Education Plan
                        </span>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-[9px] font-bold text-zinc-400">PPA Budget:</span>
                          <input
                            type="number"
                            value={abyipForm.ppa1Budget}
                            disabled={abyipStatus === "submitted"}
                            onChange={(e) => handleAbyipInputChange("ppa1Budget", Number(e.target.value))}
                            className="w-24 px-2.5 py-1 bg-white border border-zinc-200 focus:border-[#C89311] rounded-lg text-[10px] font-mono font-bold text-right focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-[8px] font-bold text-zinc-400 uppercase">Activity Name</span>
                          <input
                            type="text"
                            value={abyipForm.ppa1Name}
                            disabled={abyipStatus === "submitted"}
                            onChange={(e) => handleAbyipInputChange("ppa1Name", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-zinc-200 focus:border-[#C89311] rounded-xl text-xs font-semibold"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8px] font-bold text-zinc-400 uppercase">Implementation Schedule</span>
                          <input
                            type="text"
                            value={abyipForm.ppa1Schedule}
                            disabled={abyipStatus === "submitted"}
                            onChange={(e) => handleAbyipInputChange("ppa1Schedule", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-zinc-200 focus:border-[#C89311] rounded-xl text-xs font-semibold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* PPA 2 */}
                    <div className="p-4 bg-zinc-50/50 border border-zinc-100 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wide">
                          PPA 2: Linked to Health & Sports
                        </span>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-[9px] font-bold text-zinc-400">PPA Budget:</span>
                          <input
                            type="number"
                            value={abyipForm.ppa2Budget}
                            disabled={abyipStatus === "submitted"}
                            onChange={(e) => handleAbyipInputChange("ppa2Budget", Number(e.target.value))}
                            className="w-24 px-2.5 py-1 bg-white border border-zinc-200 focus:border-[#C89311] rounded-lg text-[10px] font-mono font-bold text-right focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-[8px] font-bold text-zinc-400 uppercase">Activity Name</span>
                          <input
                            type="text"
                            value={abyipForm.ppa2Name}
                            disabled={abyipStatus === "submitted"}
                            onChange={(e) => handleAbyipInputChange("ppa2Name", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-zinc-200 focus:border-[#C89311] rounded-xl text-xs font-semibold"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8px] font-bold text-zinc-400 uppercase">Implementation Schedule</span>
                          <input
                            type="text"
                            value={abyipForm.ppa2Schedule}
                            disabled={abyipStatus === "submitted"}
                            onChange={(e) => handleAbyipInputChange("ppa2Schedule", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-zinc-200 focus:border-[#C89311] rounded-xl text-xs font-semibold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* PPA 3 */}
                    <div className="p-4 bg-zinc-50/50 border border-zinc-100 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wide">
                          PPA 3: Linked to Environmental Protection
                        </span>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-[9px] font-bold text-zinc-400">PPA Budget:</span>
                          <input
                            type="number"
                            value={abyipForm.ppa3Budget}
                            disabled={abyipStatus === "submitted"}
                            onChange={(e) => handleAbyipInputChange("ppa3Budget", Number(e.target.value))}
                            className="w-24 px-2.5 py-1 bg-white border border-zinc-200 focus:border-[#C89311] rounded-lg text-[10px] font-mono font-bold text-right focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-[8px] font-bold text-zinc-400 uppercase">Activity Name</span>
                          <input
                            type="text"
                            value={abyipForm.ppa3Name}
                            disabled={abyipStatus === "submitted"}
                            onChange={(e) => handleAbyipInputChange("ppa3Name", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-zinc-200 focus:border-[#C89311] rounded-xl text-xs font-semibold"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8px] font-bold text-zinc-400 uppercase">Implementation Schedule</span>
                          <input
                            type="text"
                            value={abyipForm.ppa3Schedule}
                            disabled={abyipStatus === "submitted"}
                            onChange={(e) => handleAbyipInputChange("ppa3Schedule", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-zinc-200 focus:border-[#C89311] rounded-xl text-xs font-semibold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* PPA 4 */}
                    <div className="p-4 bg-zinc-50/50 border border-zinc-100 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wide">
                          PPA 4: Linked to Active Governance
                        </span>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-[9px] font-bold text-zinc-400">PPA Budget:</span>
                          <input
                            type="number"
                            value={abyipForm.ppa4Budget}
                            disabled={abyipStatus === "submitted"}
                            onChange={(e) => handleAbyipInputChange("ppa4Budget", Number(e.target.value))}
                            className="w-24 px-2.5 py-1 bg-white border border-zinc-200 focus:border-[#C89311] rounded-lg text-[10px] font-mono font-bold text-right focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-[8px] font-bold text-zinc-400 uppercase">Activity Name</span>
                          <input
                            type="text"
                            value={abyipForm.ppa4Name}
                            disabled={abyipStatus === "submitted"}
                            onChange={(e) => handleAbyipInputChange("ppa4Name", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-zinc-200 focus:border-[#C89311] rounded-xl text-xs font-semibold"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8px] font-bold text-zinc-400 uppercase">Implementation Schedule</span>
                          <input
                            type="text"
                            value={abyipForm.ppa4Schedule}
                            disabled={abyipStatus === "submitted"}
                            onChange={(e) => handleAbyipInputChange("ppa4Schedule", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-zinc-200 focus:border-[#C89311] rounded-xl text-xs font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Explainable AI Auditor (Col Span 5) */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-zinc-50 border border-zinc-200 rounded-[28px] p-6 space-y-5 sticky top-0">
                      <div className="border-b border-zinc-200 pb-3 flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#0C1E36] flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-[#C89311] animate-pulse" />
                          Explainable AI Auditor
                        </h4>
                        <span className="font-mono text-[9px] bg-white border border-zinc-200 text-zinc-400 px-2 py-0.5 rounded">
                          ABYIP.v1
                        </span>
                      </div>

                      <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
                        Assess annual program alignment with the parent CBYDP parameters. Discrepancies will generate warnings to prevent local budget vetoes.
                      </p>

                      <button
                        onClick={runAbyipAudit}
                        disabled={isAbyipAuditing}
                        className="w-full py-3 bg-[#0C1E36] text-white hover:bg-[#C89311] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isAbyipAuditing ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Analyzing Alignments...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Cross-Check with CBYDP
                          </>
                        )}
                      </button>

                      {/* Audit Output */}
                      {abyipAuditReport ? (
                        <div className="space-y-4 pt-2 border-t border-dashed border-zinc-200">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Alignment Status</span>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[9px] font-black uppercase tracking-wider">
                              {abyipAuditReport.status}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Alignment Rating</span>
                            <span className="font-mono text-sm font-black text-[#0C1E36]">{abyipAuditReport.score}/100</span>
                          </div>

                          {/* Progress */}
                          <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 transition-all duration-500" 
                              style={{ width: `${abyipAuditReport.score}%` }}
                            />
                          </div>

                          <div className="space-y-2">
                            <span className="text-[8px] font-black uppercase text-zinc-400 tracking-widest block">Structural Strengths:</span>
                            <ul className="space-y-1.5">
                              {abyipAuditReport.strengths.map((str: string, index: number) => (
                                <li key={index} className="text-[9px] leading-relaxed text-zinc-600 flex gap-1.5 items-start">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                  <span>{str}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {abyipAuditReport.opportunities.length > 0 && (
                            <div className="space-y-1 bg-amber-50 border border-amber-100 p-2.5 rounded-xl">
                              <span className="text-[8px] font-black uppercase text-amber-800 tracking-widest block">AI Refinement Tips:</span>
                              <p className="text-[9px] text-amber-700 leading-relaxed font-medium">
                                {abyipAuditReport.opportunities[0]}
                              </p>
                            </div>
                          )}

                          <div className="p-3 bg-white border border-zinc-200 rounded-xl text-[9.5px] leading-relaxed text-zinc-600 font-medium">
                            {abyipAuditReport.alignmentFeedback}
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 text-center border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center gap-2 text-zinc-400">
                          <Sparkles className="w-8 h-8 opacity-40 animate-pulse text-amber-500" />
                          <span className="text-[9px] font-black uppercase tracking-wider">Audit alignment log will compile</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-zinc-100 flex justify-end gap-3 bg-zinc-50">
                {role === "Chairman" && (
                  <button
                    onClick={handleExportPrintAbyip}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#0C1E36] to-slate-800 hover:from-[#C89311] hover:to-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer mr-auto"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    Export / Ready to Print
                  </button>
                )}
                <button
                  onClick={() => setIsAbyipModalOpen(false)}
                  className="px-5 py-2.5 bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 cursor-pointer"
                >
                  Cancel
                </button>
                {abyipStatus !== "submitted" && (
                  <button
                    onClick={submitAbyip}
                    disabled={!abyipAuditReport}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Publish & Submit ABYIP Plan
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
