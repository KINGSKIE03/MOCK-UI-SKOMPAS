import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  RotateCcw, 
  Plus, 
  Trash2, 
  FileSpreadsheet, 
  Save, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles,
  Info,
  Calendar,
  Layers,
  FileCheck,
  User,
  Settings,
  HelpCircle,
  TrendingDown,
  Coins,
  Send,
  Loader2,
  FileText,
  ShieldAlert,
  ShieldCheck,
  CheckSquare,
  Activity
} from "lucide-react";
import { useAuth } from "../components/auth/AuthProvider";
import { saveDocumentSubmission, autoArchivePreviousDocument, getBarangayRecords } from "../lib/barangayStore";
import { db } from "../lib/firebase";
import { collection, addDoc, getDocs, doc, setDoc } from "firebase/firestore";
const logo = "/src/assets/images/input_file_0.png";

// Interfaces for our dynamic budget builder
interface AirLineItem {
  id: string;
  name: string;
  amount: number;
}

interface BudgetProgram {
  id: string;
  name: string;
  expectedResults: string;
  performanceIndicator: string;
  subcategories: {
    id: string;
    label?: string; // Optional subtitle e.g. "*BASIC LIFE SUPPORT..."
    items: AirLineItem[];
  }[];
}

export function BudgetTemplatePage() {
  const navigate = useNavigate();
  const { role, user } = useAuth();

  // Basic Header Info
  const [province, setProvince] = useState("DAVAO DE ORO");
  const [municipality, setMunicipality] = useState("LAAK");
  const [barangay, setBarangay] = useState(user?.barangayName || "Kapatagan");
  const [calendarYear, setCalendarYear] = useState(2026);

  // Signatures
  const [preparedBy, setPreparedBy] = useState("FLORY ANN A. JAKOSALEM");
  const [preparedRole, setPreparedRole] = useState("SK TREASURER");
  const [approvedBy, setApprovedBy] = useState("HON. JAMES JOHN G. CATUBAY");
  const [approvedRole, setApprovedRole] = useState("SK CHAIRPERSON");

  // PART I & II
  const [beginningBalance, setBeginningBalance] = useState(0.00);
  const [tenPercentFund, setTenPercentFund] = useState(954653.30);

  // Dynamic Expenditure Items
  // 1. General Administration Program
  const [gaPersonalServices, setGaPersonalServices] = useState<AirLineItem[]>([
    { id: "ga-ps-1", name: "Honorarium", amount: 238572.00 }
  ]);
  const [gaMOOE, setGaMOOE] = useState<AirLineItem[]>([
    { id: "ga-mooe-1", name: "Office Supply Expenses", amount: 21000.00 },
    { id: "ga-mooe-2", name: "Representation Expenses", amount: 20000.30 },
    { id: "ga-mooe-3", name: "Fidelity Bond Premium", amount: 3000.00 },
    { id: "ga-mooe-4", name: "Other supplies & Materials", amount: 100000.00 },
  ]);

  // Expected results & indicators for General Administration
  const [gaExpected, setGaExpected] = useState("To provide honorarium for SK Officials");
  const [gaIndicator, setGaIndicator] = useState("Received and Used by the SK Officials");

  // 2. SK Youth Development and Empowerment Programs (YDEP)
  const [ydepPrograms, setYdepPrograms] = useState<BudgetProgram[]>([
    {
      id: "ydep-health",
      name: "HEALTH",
      expectedResults: "Help the youth enhance their knowledge about first aid.",
      performanceIndicator: "Number of KK Members, SK Officials, and Youth participated on the Program and Activities.",
      subcategories: [
        {
          id: "sub-health-1",
          label: "*BASIC LIFE SUPPORT WITH FIRST AND TRAINING",
          items: [
            { id: "health-item-1", name: "Representation Expenses", amount: 5000.00 },
            { id: "health-item-2", name: "Honorarium of Speaker", amount: 3000.00 }
          ]
        }
      ]
    },
    {
      id: "ydep-governance",
      name: "GOVERNANCE",
      expectedResults: "To plan and discuss various programs and activities. Educating the SK officials and other youth volunteers to become effective leaders through trainings",
      performanceIndicator: "Number of KK Members, SK Officials, and Youth participated on the Program and Activities.",
      subcategories: [
        {
          id: "sub-gov-1",
          label: "*KK ASSEMBLY",
          items: [
            { id: "gov-item-1", name: "Representation Expenses", amount: 30000.00 }
          ]
        },
        {
          id: "sub-gov-2",
          items: [
            { id: "gov-item-2", name: "Travelling Expenses", amount: 50000.00 },
            { id: "gov-item-3", name: "Training & Seminar Expenses", amount: 50000.00 }
          ]
        },
        {
          id: "sub-gov-3",
          label: "LINGGO NG KABATAAN",
          items: [
            { id: "gov-item-4", name: "Prizes", amount: 100000.00 }
          ]
        }
      ]
    },
    {
      id: "ydep-citizenship",
      name: "ACTIVE CITIZENSHIP",
      expectedResults: "To enhance the sportsmanship and camaraderie",
      performanceIndicator: "Number of KK Members, SK Officials, and Youth participated on the Program and Activities.",
      subcategories: [
        {
          id: "sub-cite-1",
          label: "BOLA-TA-SOY (SPORTS DEVELOPMENT)",
          items: [
            { id: "cite-item-1", name: "*Sports Supplies", amount: 50081.00 },
            { id: "cite-item-2", name: "*Prizes", amount: 170000.00 },
            { id: "cite-item-3", name: "*Honorarium", amount: 61000.00 }
          ]
        }
      ]
    },
    {
      id: "ydep-education",
      name: "EDUCATION",
      expectedResults: "Decrease the number students or pupils who were dishearten to go to school",
      performanceIndicator: "Number of KK Members, SK Officials, and Youth participated on the Program and Activities.",
      subcategories: [
        {
          id: "sub-edu-1",
          items: [
            { id: "edu-item-1", name: "Provision of School Supplies (MOOE)", amount: 30000.00 }
          ]
        }
      ]
    },
    {
      id: "ydep-environment",
      name: "ENVIRONMENT",
      expectedResults: "Maintain waste free public environments",
      performanceIndicator: "Number of KK Members, SK Officials, and Youth participated on the Program and Activities.",
      subcategories: [
        {
          id: "sub-env-1",
          items: [
            { id: "env-item-1", name: "*Installation of trash cans", amount: 23000.00 }
          ]
        }
      ]
    }
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // AI Compliance and Submission States
  const [isScanning, setIsScanning] = useState(false);
  const [complianceReport, setComplianceReport] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Sequential Guard Check
  useEffect(() => {
    const cbydp = localStorage.getItem("skompas_status_cbydp");
    const abyip = localStorage.getItem("skompas_status_abyip");

    if (cbydp !== "submitted" || abyip !== "submitted") {
      // In the iframe environment, a direct browser navigation alert is safer or redirect
      console.warn("Sequential workflow block active.");
      alert("⚠️ Sequential Workflow Block: You must complete and submit both the 3-Year CBYDP and Annual ABYIP prior to constructing the Annual Budget spreadsheet.");
      navigate("/dashboard");
    }
  }, [navigate]);

  // Load saved state if any
  useEffect(() => {
    const saved = localStorage.getItem("skompas_budget_reference_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProvince(parsed.province || "DAVAO DE ORO");
        setMunicipality(parsed.municipality || "LAAK");
        setBarangay(parsed.barangay || "Kapatagan");
        setCalendarYear(parsed.calendarYear || 2026);
        setPreparedBy(parsed.preparedBy || "FLORY ANN A. JAKOSALEM");
        setPreparedRole(parsed.preparedRole || "SK TREASURER");
        setApprovedBy(parsed.approvedBy || "HON. JAMES JOHN G. CATUBAY");
        setApprovedRole(parsed.approvedRole || "SK CHAIRPERSON");
        setBeginningBalance(parsed.beginningBalance || 0);
        setTenPercentFund(parsed.tenPercentFund || 954653.30);
        if (parsed.gaPersonalServices) setGaPersonalServices(parsed.gaPersonalServices);
        if (parsed.gaMOOE) setGaMOOE(parsed.gaMOOE);
        if (parsed.gaExpected) setGaExpected(parsed.gaExpected);
        if (parsed.gaIndicator) setGaIndicator(parsed.gaIndicator);
        if (parsed.ydepPrograms) setYdepPrograms(parsed.ydepPrograms);
      } catch (e) {
        console.error("Failed to parse saved budget", e);
      }
    }
  }, []);

  const handleSaveToLocalStorage = () => {
    const state = {
      province, municipality, barangay, calendarYear,
      preparedBy, preparedRole, approvedBy, approvedRole,
      beginningBalance, tenPercentFund,
      gaPersonalServices, gaMOOE, gaExpected, gaIndicator,
      ydepPrograms
    };
    localStorage.setItem("skompas_budget_reference_state", JSON.stringify(state));
    showToast("Budget reference saved securely nearby!");
  };

  const handleResetToDefault = () => {
    if (confirm("Are you sure you want to revert all budget entries back to the original Barangay Kapatagan reference values?")) {
      localStorage.removeItem("skompas_budget_reference_state");
      window.location.reload();
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Compiler: Turn budget state into descriptive raw text suitable for AI scanner
  const compileBudgetText = () => {
    let summaryText = `SANGGUNIANG KABATAAN ANNUAL BUDGET AUDIT REFERENCE SHEETS\n`;
    summaryText += `Province: ${province}\nMunicipality: ${municipality}\nBarangay: ${barangay}\nCalendar Year: ${calendarYear}\n\n`;
    summaryText += `--- PART I. BEGINNING CASH BALANCE ---\n`;
    summaryText += `Amount: PHP ${beginningBalance.toFixed(2)}\n\n`;
    summaryText += `--- PART II. RECEIPT PROGRAM ---\n`;
    summaryText += `Ten Percent (10%) SK Fund allocation: PHP ${tenPercentFund.toFixed(2)}\n`;
    summaryText += `Total Funds Available for Appropriation: PHP ${(beginningBalance + tenPercentFund).toFixed(2)}\n\n`;
    
    summaryText += `--- PART III. EXPENDITURE PROGRAM ---\n`;
    summaryText += `General Administration Program:\n`;
    summaryText += `- Personal Services:\n`;
    gaPersonalServices.forEach((ps) => {
      summaryText += `  * ${ps.name}: PHP ${ps.amount.toFixed(2)}\n`;
    });
    summaryText += `  * PS Expected Result: ${gaExpected}\n`;
    summaryText += `  * PS Performance Indicator: ${gaIndicator}\n`;
    summaryText += `- Maintenance & Other Operating Expenses (MOOE):\n`;
    gaMOOE.forEach((mooe) => {
      summaryText += `  * ${mooe.name}: PHP ${mooe.amount.toFixed(2)}\n`;
    });
    
    summaryText += `\nYouth Development and Empowerment Programs (YDEP):\n`;
    ydepPrograms.forEach((prog) => {
      summaryText += `- Category Program: ${prog.name}\n`;
      summaryText += `  * Expected Results: ${prog.expectedResults}\n`;
      summaryText += `  * Performance Indicator: ${prog.performanceIndicator}\n`;
      prog.subcategories.forEach((sub) => {
        if (sub.label) {
          summaryText += `  * Section Header: ${sub.label}\n`;
        }
        sub.items.forEach((item) => {
          summaryText += `    - ${item.name}: PHP ${item.amount.toFixed(2)}\n`;
        });
      });
      summaryText += `  * Subtotal for ${prog.name}: PHP ${getYdepProgramTotal(prog).toFixed(2)}\n\n`;
    });

    summaryText += `--- PART IV. SUMMARY OVERVIEW ---\n`;
    const computedTotalExp = totalPersonalServices + totalMOOE + ydepPrograms.reduce((sum, p) => sum + getYdepProgramTotal(p), 0);
    summaryText += `Total Proposed Expenditures: PHP ${computedTotalExp.toFixed(2)}\n`;
    summaryText += `Ending Net Balance: PHP ${(beginningBalance + tenPercentFund - computedTotalExp).toFixed(2)}\n`;
    summaryText += `Prepared By: ${preparedBy} (${preparedRole})\n`;
    summaryText += `Approved By: ${approvedBy} (${approvedRole})\n`;
    return summaryText;
  };

  // Compile full descriptive markdown representation that renders perfectly on Dashboard / Editor
  const compileBudgetMarkdown = () => {
    let md = `# Sangguniang Kabataan Annual Budget Proposal\n`;
    md += `**Province:** ${province}  \n`;
    md += `**Municipality:** ${municipality}  \n`;
    md += `**Barangay:** ${barangay}  \n`;
    md += `**Calendar Budget Year:** CY ${calendarYear}  \n\n`;
    
    md += `### Source of Funds\n`;
    md += `| Part | Source / Allocation | Amount | \n`;
    md += `| :--- | :--- | :--- | \n`;
    md += `| I | Beginning Cash Balance | ₱${beginningBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} | \n`;
    md += `| II | Ten Percent (10%) Barangay Allocation | ₱${tenPercentFund.toLocaleString('en-US', { minimumFractionDigits: 2 })} | \n`;
    md += `| | **TOTAL FUNDS AVAILABLE** | **₱${totalFundsAvailable.toLocaleString('en-US', { minimumFractionDigits: 2 })}** | \n\n`;

    md += `### Expenditure Summary Table\n`;
    md += `| Category / Program | Projected Allocation | Expected Outcomes | Performance Indicators | \n`;
    md += `| :--- | :--- | :--- | :--- | \n`;
    md += `| **General Administration (PS)** | ₱${totalPersonalServices.toLocaleString('en-US', { minimumFractionDigits: 2 })} | ${gaExpected} | ${gaIndicator} | \n`;
    md += `| **General Administration (MOOE)** | ₱${totalMOOE.toLocaleString('en-US', { minimumFractionDigits: 2 })} | Office operational supplies | Efficiency of administrative support | \n`;
    
    ydepPrograms.forEach((p) => {
      const budgetSum = getYdepProgramTotal(p);
      md += `| **YDEP: ${p.name}** | ₱${budgetSum.toLocaleString('en-US', { minimumFractionDigits: 2 })} | ${p.expectedResults} | ${p.performanceIndicator} | \n`;
    });

    md += `| **TOTAL EXPENDITURE BUDGET** | **₱${totalExpenditures.toLocaleString('en-US', { minimumFractionDigits: 2 })}** | Comprehensive youth program integration | Perfect compliance alignment | \n\n`;

    md += `### Net Budget Status\n`;
    md += `- **Ending Net Cash Balance:** ₱${endingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}  \n`;
    if (endingBalance === 0) {
      md += `> ✅ **BALANCED BUDGET STATUS**: Proposed allocation maps perfectly with 100% of the available youth funds.  \n`;
    } else if (endingBalance < 0) {
      md += `> ⚠️ **DEFICIT DETECTED**: Proposed expenditures exceed general funds by ₱${Math.abs(endingBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}. Please rebalance prior to submission.  \n`;
    } else {
      md += `> ℹ️ **SURPLUS REMAINING**: ₱${endingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} represents funds not yet fully allocated.  \n`;
    }
    
    return md;
  };

  // Perform Gemini AI Compliance Check
  const handleAICanCheck = async () => {
    setIsScanning(true);
    setComplianceReport(null);
    try {
      const compiledContent = compileBudgetText();
      const res = await fetch("/api/analyze-compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: "budget",
          content: compiledContent
        })
      });
      if (!res.ok) {
        throw new Error("Auditor endpoint rejected scan.");
      }
      const data = await res.json();
      setComplianceReport(data);
      showToast("AI Compliance Audit completed successfully!");
    } catch (err: any) {
      console.error(err);
      showToast("Compliance scanner encountered an unexpected interruption.");
    } finally {
      setIsScanning(false);
    }
  };

  // Submit budget straight to SK Chairman
  const handleSubmitToChairman = async () => {
    setIsSubmitting(true);
    try {
      const timestampString = new Date().toISOString();
      const budgetId = `budget-${Date.now()}`;
      const mdContent = compileBudgetMarkdown();
      const targetBarangay = user?.barangayName || barangay;
      
      const newDoc = {
        id: budgetId,
        title: `Annual Youth Budget CY ${calendarYear} - Barangay ${targetBarangay}`,
        type: "budget",
        content: mdContent,
        status: "pending",
        authorRole: role || "Treasurer",
        authorId: user?.uid || "trea-1",
        createdAt: timestampString,
        updatedAt: timestampString,
        budgetAmount: totalExpenditures,
        aiFeedback: complianceReport ? `${complianceReport.status} (Score: ${complianceReport.score}/100)` : "Draft Created - Manual Audit Pending",
        complianceReport: complianceReport
      };

      // Auto-archive previous approved Annual Budget if calendar year differs
      const prevRecords = getBarangayRecords(targetBarangay).filter(r => r.docType === "Annual Budget" && r.yearOrPeriod !== String(calendarYear));
      prevRecords.forEach(prev => {
        autoArchivePreviousDocument({
          barangayName: targetBarangay,
          docType: "Annual Budget",
          previousYearOrPeriod: prev.yearOrPeriod,
          title: prev.title,
          totalBudget: prev.totalBudget,
          remarks: `Archived upon creation and submission of Annual Budget for CY ${calendarYear}.`
        });
      });

      // Submit to LYDO review queue
      saveDocumentSubmission({
        barangayName: targetBarangay,
        docCode: "ANNUAL-BUDGET",
        docType: "Annual Budget",
        title: `Annual Youth Budget CY ${calendarYear} - Barangay ${targetBarangay}`,
        yearOrPeriod: String(calendarYear),
        submittedBy: `${user?.displayName || preparedBy} (${role || "Treasurer"})`,
        officerRole: (role as any) || "Treasurer",
        totalBudget: totalExpenditures,
        contentSnapshot: {
          calendarYear,
          beginningBalance,
          tenPercentFund,
          gaPersonalServices,
          gaMOOE,
          ydepPrograms,
          totalExpenditures
        }
      });

      // 1. Try to record to Firestore (requires auth session, handles gracefully if sandbox is running offline)
      try {
        await setDoc(doc(db, "documents", budgetId), {
          ...newDoc,
          // Firestore rule checks the timestamp data types, so convert to real Date objects
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } catch (fbErr) {
        console.warn("Firestore write bypassed, persisting securely inside local session: ", fbErr);
      }

      // 2. Persist in local storage table sync to ensure seamless local role switching
      const existingDraftsString = localStorage.getItem("skompas_submitted_budgets");
      const list = existingDraftsString ? JSON.parse(existingDraftsString) : [];
      list.unshift(newDoc);
      localStorage.setItem("skompas_submitted_budgets", JSON.stringify(list));
      localStorage.setItem("skompas_status_budget", "submitted");

      setSubmissionSuccess(true);
      showToast("Budget draft submitted directly to the Chairman!");
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      console.error(err);
      showToast("Could not publish budget proposal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChairmanExportPrint = () => {
    const mdContent = compileBudgetMarkdown();
    
    // Download as TXT file
    const element = document.createElement("a");
    const file = new Blob([mdContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `SK-Budget-${calendarYear}-${barangay.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    // Call print
    window.print();
  };

  // Math Computations
  const totalReceiptProgram = tenPercentFund;
  const totalFundsAvailable = beginningBalance + totalReceiptProgram;

  const totalPersonalServices = gaPersonalServices.reduce((sum, item) => sum + item.amount, 0);
  const totalMOOE = gaMOOE.reduce((sum, item) => sum + item.amount, 0);
  const totalGeneralAdministration = totalPersonalServices + totalMOOE;

  // YDEP subtotals per program category
  const getYdepProgramTotal = (prog: BudgetProgram) => {
    return prog.subcategories.reduce((pSum, sub) => {
      return pSum + sub.items.reduce((iSum, i) => iSum + i.amount, 0);
    }, 0);
  };

  const totalYDEP = ydepPrograms.reduce((sum, prog) => sum + getYdepProgramTotal(prog), 0);
  const totalExpenditures = totalGeneralAdministration + totalYDEP;
  const endingBalance = totalFundsAvailable - totalExpenditures;

  // Change amount helper
  const handleItemValueChange = (
    type: "ga-ps" | "ga-mooe" | "ydep",
    itemId: string,
    val: number,
    progId?: string,
    subId?: string
  ) => {
    if (type === "ga-ps") {
      setGaPersonalServices(prev => prev.map(item => item.id === itemId ? { ...item, amount: val } : item));
    } else if (type === "ga-mooe") {
      setGaMOOE(prev => prev.map(item => item.id === itemId ? { ...item, amount: val } : item));
    } else if (type === "ydep" && progId && subId) {
      setYdepPrograms(prev => prev.map(p => {
        if (p.id !== progId) return p;
        return {
          ...p,
          subcategories: p.subcategories.map(s => {
            if (s.id !== subId) return s;
            return {
              ...s,
              items: s.items.map(i => i.id === itemId ? { ...i, amount: val } : i)
            };
          })
        };
      }));
    }
  };

  // Add Item Helper
  const handleAddItem = (
    type: "ga-ps" | "ga-mooe" | "ydep",
    progId?: string,
    subId?: string
  ) => {
    const freshName = prompt("Enter object of expenditure designation label:", "Custom Program Expense");
    if (!freshName) return;

    const freshAmount = Number(prompt("Enter budget amount (PHP):", "1000")) || 0;

    const newItem: AirLineItem = {
      id: `item-${Date.now()}`,
      name: freshName,
      amount: freshAmount
    };

    if (type === "ga-ps") {
      setGaPersonalServices(prev => [...prev, newItem]);
    } else if (type === "ga-mooe") {
      setGaMOOE(prev => [...prev, newItem]);
    } else if (type === "ydep" && progId && subId) {
      setYdepPrograms(prev => prev.map(p => {
        if (p.id !== progId) return p;
        return {
          ...p,
          subcategories: p.subcategories.map(s => {
            if (s.id !== subId) return s;
            return {
              ...s,
              items: [...s.items, newItem]
            };
          })
        };
      }));
    }
  };

  // Remove Item Helper
  const handleDeleteItem = (
    type: "ga-ps" | "ga-mooe" | "ydep",
    itemId: string,
    progId?: string,
    subId?: string
  ) => {
    if (type === "ga-ps") {
      setGaPersonalServices(prev => prev.filter(i => i.id !== itemId));
    } else if (type === "ga-mooe") {
      setGaMOOE(prev => prev.filter(i => i.id !== itemId));
    } else if (type === "ydep" && progId && subId) {
      setYdepPrograms(prev => prev.map(p => {
        if (p.id !== progId) return p;
        return {
          ...p,
          subcategories: p.subcategories.map(s => {
            if (s.id !== subId) return s;
            return {
              ...s,
              items: s.items.filter(i => i.id !== itemId)
            };
          })
        };
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col font-sans pb-16 relative">
      {/* Decorative colored ambient light fields */}
      <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-0 bottom-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Top action control bar */}
      <div className="bg-white border-b border-zinc-200 py-4 px-8 sticky top-20 z-50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => navigate("/dashboard")}
            className="p-2 bg-stone-50 border border-zinc-200 hover:border-zinc-300 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-zinc-600" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 bg-amber-500 text-white text-[8px] font-black rounded uppercase tracking-wider">
                Reference Spreadsheet
              </span>
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                Prepared by Secretary & Treasurer
              </span>
            </div>
            <h1 className="text-lg font-black tracking-tight text-[#0C1E36]">
              Annual Youth Development & Empowerment Budget Template
            </h1>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-stone-100 text-zinc-700 hover:bg-stone-200 transition-all text-[10px] font-black uppercase tracking-wider rounded-xl border border-zinc-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Original
          </button>

          <button
            onClick={handleSaveToLocalStorage}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 transition-all text-[10px] font-black uppercase tracking-wider rounded-xl shadow-md cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            Keep Progress
          </button>

          {role === "Chairman" && (
            <button
              onClick={handleChairmanExportPrint}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#0C1E36] text-white hover:bg-[#C89311] transition-all text-[10px] font-black uppercase tracking-wider rounded-xl shadow-md cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              Export / Ready to Print
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl w-full mx-auto px-4 mt-8 grid lg:grid-cols-4 gap-8">
        
        {/* Left Control Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#0C1E36] border-b pb-2 flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-500" />
              Template Variables
            </h3>

            <div>
              <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">
                Province name
              </label>
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">
                Municipality name
              </label>
              <input
                type="text"
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">
                Barangay name
              </label>
              <input
                type="text"
                value={barangay}
                onChange={(e) => setBarangay(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">
                Calendar Year
              </label>
              <input
                type="number"
                value={calendarYear}
                onChange={(e) => setCalendarYear(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
              />
            </div>

            <div className="pt-2 border-t border-dashed">
              <label className="text-[9px] font-black text-[#C89311] uppercase tracking-widest block mb-1">
                Ten percent (10%) Allocation Fund
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-400">₱</span>
                <input
                  type="number"
                  step="0.01"
                  value={tenPercentFund}
                  onChange={(e) => setTenPercentFund(Number(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2.5 border rounded-xl text-xs font-bold bg-amber-50 border-amber-200 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">
                Beginning Cash Balance
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-400">₱</span>
                <input
                  type="number"
                  step="0.01"
                  value={beginningBalance}
                  onChange={(e) => setBeginningBalance(Number(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 border rounded-xl text-xs font-bold"
                />
              </div>
            </div>
          </div>

          {/* Quick Stats Summary Card */}
          <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#0C1E36] border-b pb-2 flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-500" />
              Fund Real-Time Checks
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-zinc-500">Available Appropriation:</span>
                <span className="text-[#0C1E36] font-black">₱{totalFundsAvailable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-zinc-500">Proposed Expenditures:</span>
                <span className="text-[#0C1E36] font-black">₱{totalExpenditures.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="h-px bg-zinc-100" />
              <div className="flex items-center justify-between text-xs font-black uppercase">
                <span>Ending Net Balance:</span>
                <span className={endingBalance === 0 ? "text-emerald-600" : "text-amber-600"}>
                  ₱{endingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {endingBalance === 0 ? (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-[9px] font-black rounded-xl border border-emerald-100 uppercase tracking-widest flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                Balanced Sheet (Perfect match!)
              </div>
            ) : endingBalance < 0 ? (
              <div className="p-3 bg-red-50 text-red-700 text-[9px] font-black rounded-xl border border-red-100 uppercase tracking-widest flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Deficit of ₱{Math.abs(endingBalance).toLocaleString()}
              </div>
            ) : (
              <div className="p-3 bg-amber-50 text-amber-700 text-[9px] font-black rounded-xl border border-amber-200 uppercase tracking-widest flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0" />
                Surplus of ₱{endingBalance.toLocaleString()} (Not fully allocated)
              </div>
            )}
          </div>

          {/* Officers sign setup */}
          <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#0C1E36] border-b pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-purple-500" />
              Officers Signature Setup
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block mb-1">
                  Prepared By (Name)
                </label>
                <input
                  type="text"
                  value={preparedBy}
                  onChange={(e) => setPreparedBy(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-lg text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block mb-1">
                  Prepared By (Role)
                </label>
                <input
                  type="text"
                  value={preparedRole}
                  onChange={(e) => setPreparedRole(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-lg text-xs font-bold"
                />
              </div>

              <div className="h-px bg-zinc-100" />

              <div>
                <label className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block mb-1">
                  Approved By (Name)
                </label>
                <input
                  type="text"
                  value={approvedBy}
                  onChange={(e) => setApprovedBy(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-lg text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block mb-1">
                  Approved By (Role)
                </label>
                <input
                  type="text"
                  value={approvedRole}
                  onChange={(e) => setApprovedRole(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-lg text-xs font-bold"
                />
              </div>
            </div>
          </div>

          {/* AI Compliance Check Panel */}
          <div className="bg-white border rounded-[32px] p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#0C1E36] border-b pb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              AI Compliance Audit
            </h3>
            <p className="text-[10px] text-zinc-500 font-semibold leading-normal">
              Scan draft against RA 10742 (SK Reform Act) and general DILG/COA guidelines.
            </p>

            <button
              onClick={handleAICanCheck}
              disabled={isScanning}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Auditing Spreadsheet...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                  Scan Budget Draft
                </>
              )}
            </button>

            {/* AI Report Output */}
            {complianceReport && (
              <div className="mt-4 pt-4 border-t border-dashed border-zinc-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">AI Audit Verdict</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                    complianceReport.status === 'Compliant' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    complianceReport.status === 'Partially Compliant' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {complianceReport.status || "Audited"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Audit Score</span>
                  <span className="font-mono text-xs font-black text-[#0C1E36]">{complianceReport.score || 0}/100</span>
                </div>

                {/* Score bar */}
                <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      (complianceReport.score || 0) >= 90 ? 'bg-emerald-500' :
                      (complianceReport.score || 0) >= 70 ? 'bg-amber-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${complianceReport.score || 0}%` }}
                  />
                </div>

                {/* Warnings / Violations */}
                {complianceReport.violations && complianceReport.violations.length > 0 ? (
                  <div className="space-y-2 pt-2">
                    <span className="text-[8px] font-black uppercase text-red-500 tracking-widest block">Discovered Discrepancies:</span>
                    <div className="max-h-56 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                      {complianceReport.violations.map((v: any, index: number) => (
                        <div key={index} className="p-2.5 bg-red-50/50 rounded-xl border border-red-100/60 text-[9px] leading-relaxed">
                          <div className="font-extrabold text-red-800">{v.section || 'General Code'}</div>
                          <p className="text-zinc-600 mt-0.5">{v.violation}</p>
                          {v.suggestion && (
                            <div className="mt-1 text-zinc-700 leading-normal bg-white p-1.5 rounded border border-red-50">
                              <span className="font-black text-[8px] text-zinc-450 uppercase tracking-wider block">Suggestion:</span>
                              {v.suggestion}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100/60 text-[9px] font-bold flex items-center gap-1.5 uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    Zero legal issues found!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Official Submission Panel */}
          <div className="bg-white border rounded-[32px] p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#0C1E36] border-b pb-2 flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-500" />
              Official Review
            </h3>
            <p className="text-[10px] text-zinc-500 font-semibold leading-normal">
              Publish this compiled budget sheet to the Sangguniang Kabataan Chairperson portal.
            </p>

            <button
              onClick={handleSubmitToChairman}
              disabled={isSubmitting || submissionSuccess}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0C1E36] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 hover:bg-[#C89311] transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Submitting Draft...
                </>
              ) : submissionSuccess ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                  Submitted!
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Submit to Chairman
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Spreadsheet Grid */}
        <div className="lg:col-span-3">
          <div className="bg-white border rounded-[36px] shadow-sm p-4 md:p-8 overflow-x-auto relative">
            
            {/* Dynamic toast alert */}
            <AnimatePresence>
              {toastMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-zinc-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl z-[100]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span>{toastMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Print Header */}
            <div className="text-center pb-8 border-b border-zinc-200 flex flex-col items-center justify-center relative">
              
              {/* Seal Graphic Icons */}
              <div className="flex items-center justify-between w-full max-w-lg mb-4">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#0C1E36]/30 flex items-center justify-center p-1 bg-stone-50 overflow-hidden">
                  <img src={logo} alt="Barangay Seal" className="w-full h-full object-cover scale-[1.22]" />
                </div>
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#C89311]/30 flex items-center justify-center p-1 bg-stone-50 overflow-hidden">
                  <img src={logo} alt="SK Seal" className="w-full h-full object-cover scale-[1.22] rotate-12" />
                </div>
              </div>

              <h2 className="text-xs font-black uppercase text-zinc-600 tracking-wider">REPUBLIC OF THE PHILIPPINES</h2>
              <h2 className="text-xs font-black uppercase text-zinc-600 tracking-wider">PROVINCE OF {province}</h2>
              <h2 className="text-xs font-black uppercase text-zinc-600 tracking-wider">MUNICIPALITY OF {municipality}</h2>
              <h2 className="text-sm font-black uppercase text-[#0C1E36] tracking-widest mt-1">BARANGAY {barangay}</h2>
              <h1 className="text-lg font-black uppercase text-[#0C1E36] mt-2 italic tracking-tight">
                OFFICE OF THE SANGGUNIANG KABATAAN
              </h1>
              <h2 className="text-xs font-extrabold text-[#C89311] tracking-widest mt-1">CALENDAR YEAR {calendarYear}</h2>
            </div>

            {/* Official Grid */}
            <div className="min-w-[800px] mt-6 border border-zinc-200 rounded-2xl overflow-hidden select-none">
              
              {/* Excel Column Coordinates (A, B, C, D) header */}
              <div className="grid grid-cols-12 bg-zinc-100 border-b border-zinc-200 text-center font-mono text-[9px] font-bold text-zinc-400 py-1.5 print:hidden">
                <div className="col-span-1 border-r border-zinc-200 bg-zinc-200/50">ROW</div>
                <div className="col-span-4 border-r border-zinc-200 text-left pl-4">COL A (Designation / Item Name)</div>
                <div className="col-span-3 border-r border-zinc-200">COL B (Allocation Amount)</div>
                <div className="col-span-2 border-r border-zinc-200">COL C (Target Outcomes)</div>
                <div className="col-span-2">COL D (Performance Metrics)</div>
              </div>

              {/* Header Columns */}
              <div className="grid grid-cols-12 bg-stone-50 border-b-2 border-zinc-300 text-center font-black text-[9px] uppercase tracking-wider py-3">
                <div className="col-span-1 text-center font-mono text-[9px] text-zinc-400 border-r border-zinc-200 print:hidden pr-1">#</div>
                <div className="col-span-4 text-left pl-4 text-zinc-700">OBJECT OF EXPENDITURES</div>
                <div className="col-span-3 text-zinc-700">BUDGET YEAR EXPENDITURES</div>
                <div className="col-span-2 text-zinc-700">EXPECTED RESULTS</div>
                <div className="col-span-2 pr-4 text-zinc-700 font-bold">PERFORMANCE INDICATOR</div>
              </div>

              {/* PART I: BEGINNING CASH BALANCE */}
              <div className="grid grid-cols-12 border-b-2 border-zinc-200 py-3 text-[10px] items-center">
                <div className="col-span-1 text-center font-mono text-[9px] text-zinc-400 border-r border-zinc-200 print:hidden">1</div>
                <div className="col-span-4 pl-4 font-black text-[#0C1E36]">PART I. BEGINNING CASH BALANCE</div>
                <div className="col-span-3 text-center flex items-center justify-center gap-1">
                  <span className="font-bold text-zinc-400">₱</span>
                  <span className="font-extrabold text-zinc-700">{beginningBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="col-span-2"></div>
                <div className="col-span-2"></div>
              </div>

              {/* PART II: RECEIPT PROGRAM */}
              <div className="grid grid-cols-12 border-b border-dashed border-zinc-200 py-2.5 text-[10px] items-center bg-stone-50/20">
                <div className="col-span-1 text-center font-mono text-[9px] text-zinc-400 border-r border-zinc-200 print:hidden">2</div>
                <div className="col-span-4 pl-4 font-black text-[#0C1E36]">PART II. RECEIPT PROGRAM</div>
                <div className="col-span-3"></div>
                <div className="col-span-2"></div>
                <div className="col-span-2"></div>
              </div>

              <div className="grid grid-cols-12 border-b border-dashed border-zinc-200 py-3 text-[10px] items-center pl-0 bg-white hover:bg-stone-50/10 transition-colors">
                <div className="col-span-1 text-center font-mono text-[9px] text-zinc-400 border-r border-zinc-200 print:hidden">3</div>
                <div className="col-span-4 pl-4 font-bold text-zinc-800">
                  TEN PERCENT (10%) OF GENERAL FUND OF THE BARANGAY
                </div>
                <div className="col-span-3 text-center flex items-center justify-center gap-1 font-bold">
                  <span>₱</span>
                  <span className="tabular-nums">{tenPercentFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="col-span-2"></div>
                <div className="col-span-2"></div>
              </div>

              <div className="grid grid-cols-12 border-b-2 border-zinc-200 py-3.5 text-[10px] items-center bg-stone-100/30">
                <div className="col-span-1 text-center font-mono text-[9px] text-zinc-400 border-r border-zinc-200 print:hidden font-black text-[#0C1E36]">4</div>
                <div className="col-span-4 pl-4 font-black uppercase text-[#0C1E36]">
                  TOTAL ESTIMATED FUNDS AVAILABLE FOR APPROPRIATION
                </div>
                <div className="col-span-3 text-center flex items-center justify-center gap-1 font-black text-[#0C1E36] border-t border-b border-[#0C1E36] py-1 max-w-[150px] mx-auto">
                  <span>₱</span>
                  <span className="tabular-nums">{totalFundsAvailable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="col-span-2"></div>
                <div className="col-span-2"></div>
              </div>

              {/* PART III: EXPENDITURE PROGRAM */}
              <div className="grid grid-cols-12 border-b border-zinc-200 py-3 text-[10px] items-center bg-stone-50">
                <div className="col-span-1 text-center font-mono text-[9px] text-zinc-400 border-r border-zinc-200 print:hidden font-black">5</div>
                <div className="col-span-4 pl-4 font-black text-[#0C1E36]">PART III. EXPENDITURE PROGRAM</div>
                <div className="col-span-3"></div>
                <div className="col-span-2"></div>
                <div className="col-span-2"></div>
              </div>

              {/* GENERAL ADMINISTRATION PROGRAM */}
              <div className="grid grid-cols-12 border-b border-dashed border-zinc-200 py-3 text-[10px] items-center pl-4">
                <div className="col-span-5 pl-4 font-black uppercase text-[#0C1E36] italic">
                  GENERAL ADMINISTRATION PROGRAM
                </div>
                <div className="col-span-3"></div>
                <div className="col-span-2"></div>
                <div className="col-span-2"></div>
              </div>

              {/* PERSONAL SERVICES (PS) */}
              <div className="grid grid-cols-12 border-b border-dashed border-zinc-100 py-2 text-[10px] items-center pl-8">
                <div className="col-span-5 pl-4 font-black text-zinc-700">* PERSONAL SERVICES (PS)</div>
                <div className="col-span-3"></div>
                
                {/* Unified Expected Results spanning across this group */}
                <div className="col-span-2 text-center text-[9px] font-bold text-zinc-600 px-2 leading-tight py-4 border-l">
                  {gaExpected}
                  <input
                    type="text"
                    value={gaExpected}
                    onChange={(e) => setGaExpected(e.target.value)}
                    className="w-full mt-2 border p-1 rounded font-normal text-[8px] focus:outline-none print:hidden"
                    placeholder="Edit Expected Results"
                  />
                </div>
                <div className="col-span-2 text-center text-[9px] font-bold text-zinc-600 px-2 leading-tight py-4 border-l pr-4">
                  {gaIndicator}
                  <input
                    type="text"
                    value={gaIndicator}
                    onChange={(e) => setGaIndicator(e.target.value)}
                    className="w-full mt-2 border p-1 rounded font-normal text-[8px] focus:outline-none print:hidden"
                    placeholder="Edit Performance Indicators"
                  />
                </div>
              </div>

              {/* PS Items */}
              {gaPersonalServices.map((item) => (
                <div 
                  key={item.id} 
                  className="grid grid-cols-12 border-b border-dashed border-zinc-100 py-2.5 text-[10px] items-center pl-10 group/row"
                >
                  <div className="col-span-5 pl-4 flex items-center gap-2">
                    <span className="text-zinc-500 font-medium">{item.name}</span>
                    <button
                      onClick={() => handleDeleteItem("ga-ps", item.id)}
                      className="opacity-0 group-hover/row:opacity-100 text-red-500 hover:scale-110 active:scale-95 transition-all p-1 print:hidden cursor-pointer"
                      title="Remove expenditure item"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="col-span-3 text-center flex items-center justify-center gap-1.5 pl-4">
                    <span className="text-zinc-400 font-bold">₱</span>
                    <input
                      type="number"
                      step="0.01"
                      value={item.amount}
                      onChange={(e) => handleItemValueChange("ga-ps", item.id, Number(e.target.value) || 0)}
                      className="w-24 text-center border-b border-dashed border-zinc-300 focus:border-indigo-500 py-0.5 font-bold text-zinc-800 focus:outline-none"
                    />
                  </div>
                </div>
              ))}

              {/* Add PS item button */}
              <div className="grid grid-cols-12 pl-14 py-2 border-b border-dashed border-zinc-100 print:hidden justify-items-start">
                <button
                  onClick={() => handleAddItem("ga-ps")}
                  className="flex items-center gap-1 px-3 py-1 bg-stone-50 border border-zinc-200 text-[#0C1E36] hover:bg-stone-100 rounded-lg text-[9px] font-black uppercase tracking-wider relative cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add PS item
                </button>
              </div>

              {/* Total PS */}
              <div className="grid grid-cols-12 border-b border-dashed border-zinc-200 py-3 text-[10px] items-center pl-8 bg-zinc-50/40">
                <div className="col-span-5 pl-4 font-black uppercase text-zinc-700">TOTAL PERSONAL SERVICES</div>
                <div className="col-span-3 text-center flex items-center justify-center gap-1 font-black text-zinc-700">
                  <span>₱</span>
                  <span className="tabular-nums">{totalPersonalServices.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* MAINTENANCE AND OTHER OPERATING SERVICES (MOOE) */}
              <div className="grid grid-cols-12 border-b border-dashed border-zinc-100 py-2 text-[10px] items-center pl-8 mt-2">
                <div className="col-span-5 pl-4 font-black text-zinc-700">* MAINTENANCE AND OTHER OPERATING SERVICES</div>
                <div className="col-span-3"></div>
              </div>

              {/* MOOE Items */}
              {gaMOOE.map((item) => (
                <div 
                  key={item.id} 
                  className="grid grid-cols-12 border-b border-dashed border-zinc-100 py-2.5 text-[10px] items-center pl-10 group/row"
                >
                  <div className="col-span-5 pl-4 flex items-center gap-2">
                    <span className="text-zinc-500 font-semibold">{item.name}</span>
                    <button
                      onClick={() => handleDeleteItem("ga-mooe", item.id)}
                      className="opacity-0 group-hover/row:opacity-100 text-red-500 hover:scale-110 active:scale-95 transition-all p-1 print:hidden cursor-pointer"
                      title="Remove expenditure item"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="col-span-3 text-center flex items-center justify-center gap-1.5 pl-4">
                    <span className="text-zinc-400 font-bold">₱</span>
                    <input
                      type="number"
                      step="0.01"
                      value={item.amount}
                      onChange={(e) => handleItemValueChange("ga-mooe", item.id, Number(e.target.value) || 0)}
                      className="w-24 text-center border-b border-dashed border-zinc-300 focus:border-indigo-500 py-0.5 font-bold text-zinc-800 focus:outline-none"
                    />
                  </div>
                </div>
              ))}

              {/* Add MOOE item button */}
              <div className="grid grid-cols-12 pl-14 py-2 border-b border-dashed border-zinc-100 print:hidden justify-items-start">
                <button
                  onClick={() => handleAddItem("ga-mooe")}
                  className="flex items-center gap-1 px-3 py-1 bg-stone-50 border border-zinc-200 text-[#0C1E36] hover:bg-stone-100 rounded-lg text-[9px] font-black uppercase tracking-wider relative cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add MOOE item
                </button>
              </div>

              {/* Total MOOE */}
              <div className="grid grid-cols-12 border-b border-dashed border-zinc-200 py-3 text-[10px] items-center pl-8 bg-zinc-50/40">
                <div className="col-span-5 pl-4 font-black uppercase text-zinc-700">TOTAL MAINTENANCE AND OTHER OPERATING EXPENSES</div>
                <div className="col-span-3 text-center flex items-center justify-center gap-1 font-black text-zinc-700">
                  <span>₱</span>
                  <span className="tabular-nums">{totalMOOE.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* TOTAL GENERAL ADMINISTRATION PROGRAM */}
              <div className="grid grid-cols-12 border-b border-zinc-300 py-4 text-[10px] items-center pl-4 bg-stone-100/40 mt-1">
                <div className="col-span-5 pl-4 font-black uppercase text-[#0C1E36]">
                  TOTAL GENERAL ADMINISTRATION PROGRAM
                </div>
                <div className="col-span-3 text-center flex items-center justify-center gap-1 font-black text-[#0C1E36] border-t border-b border-dashed border-[#0C1E36]/50 py-1 max-w-[130px] mx-auto">
                  <span>₱</span>
                  <span className="tabular-nums">{totalGeneralAdministration.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>


              {/* SK YOUTH DEVELOPMENT AND EMPOWERMENT PROGRAMS (YDEP) */}
              <div className="grid grid-cols-12 border-b border-dashed border-zinc-200 py-4 text-[10.5px] items-center pl-4 bg-stone-50/50 mt-4">
                <div className="col-span-5 pl-4 font-black uppercase text-[#0C1E36]">
                  SK YOUTH DEVELOPMENT AND EMPOWERMENT PROGRAMS (YDEP)
                </div>
                <div className="col-span-3"></div>
                <div className="col-span-2"></div>
                <div className="col-span-2"></div>
              </div>

              {/* Dynamic YDEP segments */}
              {ydepPrograms.map((prog) => {
                const progTotal = getYdepProgramTotal(prog);

                return (
                  <div key={prog.id} className="border-b border-zinc-200 pl-4 bg-white/50">
                    
                    {/* Program category label (e.g. HEALTH) */}
                    <div className="grid grid-cols-12 py-3.5 text-[10.5px] font-black text-[#0C1E36] tracking-wide items-center pl-4 border-b border-dashed border-zinc-100 bg-stone-50/10">
                      <div className="col-span-5 pl-4 uppercase">{prog.name}</div>
                      <div className="col-span-3"></div>
                      
                      {/* Expected Results span */}
                      <div className="col-span-2 text-center text-[9px] font-bold text-zinc-600 px-2.5 leading-relaxed py-2 border-l border-r border-dashed border-zinc-200">
                        {prog.expectedResults}
                        <textarea
                          value={prog.expectedResults}
                          onChange={(e) => {
                            setYdepPrograms(prev => prev.map(p => p.id === prog.id ? { ...p, expectedResults: e.target.value } : p));
                          }}
                          rows={2}
                          className="w-full mt-2 border p-1 rounded font-normal text-[8px] focus:outline-none print:hidden resize-none"
                          placeholder="Edit"
                        />
                      </div>

                      {/* Performance Indicator span */}
                      <div className="col-span-2 text-center text-[9px] font-bold text-zinc-600 px-2.5 leading-relaxed py-2 pr-4">
                        {prog.performanceIndicator}
                        <textarea
                          value={prog.performanceIndicator}
                          onChange={(e) => {
                            setYdepPrograms(prev => prev.map(p => p.id === prog.id ? { ...p, performanceIndicator: e.target.value } : p));
                          }}
                          rows={2}
                          className="w-full mt-2 border p-1 rounded font-normal text-[8px] focus:outline-none print:hidden resize-none"
                          placeholder="Edit"
                        />
                      </div>
                    </div>

                    {/* Subcategories and line items */}
                    {prog.subcategories.map((sub, sIdx) => (
                      <div key={sub.id} className="pl-6 pt-1">
                        
                        {/* Subheading label (e.g. *BASIC LIFE SUPPORT WITH FIRST AND TRAINING) */}
                        {sub.label && (
                          <div className="grid grid-cols-12 py-2 text-[10px] font-black text-stone-700 italic pl-4">
                            <div className="col-span-5 pl-4 uppercase">{sub.label}</div>
                            <div className="col-span-3"></div>
                          </div>
                        )}

                        {/* Items listed under subheading */}
                        {sub.items.map((item) => (
                          <div 
                            key={item.id} 
                            className="grid grid-cols-12 py-2.5 text-[10px] items-center pl-8 group/ydeprow"
                          >
                            <div className="col-span-5 pl-4 flex items-center gap-2">
                              <span className="text-zinc-600 font-semibold">• {item.name}</span>
                              <button
                                onClick={() => handleDeleteItem("ydep", item.id, prog.id, sub.id)}
                                className="opacity-0 group-hover/ydeprow:opacity-100 text-red-500 hover:scale-110 active:scale-95 transition-all p-1 print:hidden cursor-pointer"
                                title="Remove expenditure"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="col-span-3 text-center flex items-center justify-center gap-1.5 pl-4">
                              <span className="text-zinc-400 font-bold">₱</span>
                              <input
                                type="number"
                                step="0.01"
                                value={item.amount}
                                onChange={(e) => handleItemValueChange("ydep", item.id, Number(e.target.value) || 0, prog.id, sub.id)}
                                className="w-24 text-center border-b border-dashed border-zinc-300 focus:border-indigo-500 py-0.5 font-bold text-zinc-800 focus:outline-none"
                              />
                            </div>
                          </div>
                        ))}

                        {/* Add Item to Subcategory button */}
                        <div className="grid grid-cols-12 pl-12 py-1 print:hidden justify-items-start">
                          <button
                            onClick={() => handleAddItem("ydep", prog.id, sub.id)}
                            className="flex items-center gap-1 px-2.5 py-0.5 bg-stone-50 border border-zinc-200 text-stone-700 hover:bg-stone-100 rounded-md text-[8px] font-black uppercase tracking-wider relative cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5" /> Add sub-item
                          </button>
                        </div>

                      </div>
                    ))}

                    {/* Category Total (e.g. TOTAL FOR HEALTH) */}
                    <div className="grid grid-cols-12 py-3 text-[10px] items-center pl-6 font-black text-stone-700 bg-stone-50/20 border-t border-dashed border-zinc-100">
                      <div className="col-span-5 pl-4 uppercase">TOTAL FOR {prog.name}</div>
                      <div className="col-span-3 text-center flex items-center justify-center gap-1">
                        <span>₱</span>
                        <span className="tabular-nums">{progTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                  </div>
                );
              })}


              {/* TOTAL SANGGUNIANG KABATAAN YOUTH DEVELOPMENT AND EMPOWERMENT PROGRAMS, PLANS, AND ACTIVITIES (SK YDEP) */}
              <div className="grid grid-cols-12 border-b-2 border-zinc-300 py-4.5 text-[10px] items-center pl-4 bg-stone-100/50 mt-1">
                <div className="col-span-5 pl-4 font-black uppercase text-[#0C1E36]">
                  TOTAL SANGGUNIANG KABATAAN YOUTH DEVELOPMENT AND EMPOWERMENT PROGRAMS, PLANS, AND ACTIVITIES (SK YDEP)
                </div>
                <div className="col-span-3 text-center flex items-center justify-center gap-1 font-black text-[#0C1E36] border-t border-b border-[#0C1E36] py-1 max-w-[130px] mx-auto">
                  <span>₱</span>
                  <span className="tabular-nums">{totalYDEP.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="col-span-2"></div>
                <div className="col-span-2"></div>
              </div>


              {/* TOTAL EXPENDITURE PROGRAM */}
              <div className="grid grid-cols-12 border-b-2 border-zinc-300 py-5 text-[10.5px] items-center pl-4 bg-amber-50/10">
                <div className="col-span-5 pl-4 font-black uppercase text-[#0C1E36]">
                  TOTAL EXPENDITURE PROGRAM
                </div>
                <div className="col-span-3 text-center flex items-center justify-center gap-1 font-black text-[#0C1E36] border-2 border-[#0C1E36] py-1 max-w-[140px] mx-auto bg-[#0C1E36]/5">
                  <span>₱</span>
                  <span className="tabular-nums">{totalExpenditures.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="col-span-2"></div>
                <div className="col-span-2"></div>
              </div>


              {/* PART IV: ENDING BALANCE */}
              <div className="grid grid-cols-12 border-b-2 border-zinc-950 py-4 text-[11px] items-center bg-[#FDFCFB]">
                <div className="col-span-5 pl-4 font-black text-[#0C1E36]">PART IV. ENDING BALANCE</div>
                <div className="col-span-3 text-center flex items-center justify-center gap-1 font-black text-[#0C1E36] border-b-4 border-double border-[#0C1E36] py-1 max-w-[130px] mx-auto bg-stone-100/30">
                  <span>₱</span>
                  <span className={endingBalance === 0 ? "text-zinc-600" : "text-amber-600"}>
                    {endingBalance === 0 ? "-" : endingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="col-span-2"></div>
                <div className="col-span-2"></div>
              </div>


              {/* Signatures sections */}
              <div className="grid grid-cols-2 gap-12 pt-16 pb-12 text-center text-xs">
                
                {/* Prepared by */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-16">
                    Prepared By:
                  </span>
                  <div className="max-w-[280px] w-full border-b border-zinc-950 pb-1 font-bold text-[#0C1E36] uppercase tracking-wide">
                    {preparedBy}
                  </div>
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1.5">
                    {preparedRole}
                  </span>
                </div>

                {/* Approved by */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-16">
                    APPROVED BY:
                  </span>
                  <div className="max-w-[280px] w-full border-b border-zinc-950 pb-1 font-bold text-[#0C1E36] uppercase tracking-wide">
                    {approvedBy}
                  </div>
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1.5">
                    {approvedRole}
                  </span>
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
