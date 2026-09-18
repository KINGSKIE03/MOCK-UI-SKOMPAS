import { 
  CbydpDocument, 
  AbyipDocument, 
  BudgetDocument,
  CbydpRowItem,
  AbyipRowItem
} from "../types";

export type ScanSeverity = "critical" | "warning" | "info" | "compliant";

export type ScanCategory = 
  | "missing_info" 
  | "incorrect_info" 
  | "ppa_classification" 
  | "ppa_alignment" 
  | "statutory_compliance" 
  | "financial_formula";

export interface ScanFinding {
  id: string;
  category: ScanCategory;
  severity: ScanSeverity;
  title: string;
  location: string;
  issueDescription: string;
  explanation: string;
  legalBasis: string;
  suggestion: string;
  suggestedActionText?: string;
  fieldKey?: string;
}

export interface PpaAnalysisItem {
  id: string;
  name: string;
  allocatedCenter: string;
  recommendedCenter: string;
  isAligned: boolean;
  budget: number;
  explanation: string;
  flags: string[];
}

export interface ScanCheckResult {
  docType: "CBYDP" | "ABYIP" | "Annual Budget" | "Editor Document" | "Compliance Document";
  barangayName: string;
  calendarYearOrPeriod: string;
  timestamp: string;
  overallScore: number; // 0 - 100
  status: "Ready for Approval" | "Needs Revision" | "Critical Non-Compliance";
  summaryText: string;
  
  // Categorized counts
  criticalCount: number;
  warningCount: number;
  compliantCount: number;
  
  // NYC 9 Centers of Youth Participation Analysis
  centersCoverage: {
    covered: string[];
    missing: string[];
    total: number;
  };
  
  // Detailed findings
  findings: ScanFinding[];
  
  // PPA Classification Matrix breakdown
  ppaAnalyses: PpaAnalysisItem[];
  
  // Financial & Statutory Summary
  financialSummary?: {
    totalBudget: number;
    gaTotal?: number;
    gaPercentage?: number;
    ydepTotal?: number;
    ydepPercentage?: number;
    isBalanced?: boolean;
    endingBalance?: number;
    statutoryNotes: string[];
  };
}

export const NYC_9_CENTERS = [
  "HEALTH",
  "EDUCATION",
  "ECONOMIC EMPOWERMENT",
  "ACTIVE CITIZENSHIP",
  "GOVERNANCE",
  "PEACE-BUILDING AND SECURITY",
  "SOCIAL INCLUSION AND EQUITY",
  "AGRICULTURE",
  "ENVIRONMENT"
];

const CENTER_KEYWORDS: Record<string, string[]> = {
  "HEALTH": ["health", "dental", "medical", "mental", "wellness", "sports", "nutrition", "feeding", "athletic", "tournament", "drug abuse", "reproductive", "clinic", "physical", "sanitation"],
  "EDUCATION": ["education", "school", "scholarship", "learning", "student", "als", "supplies", "tuition", "literacy", "academic", "vocational", "tech-voc", "training", "grant", "bag"],
  "ECONOMIC EMPOWERMENT": ["livelihood", "employment", "job", "business", "entrepreneur", "entrepreneurship", "spes", "income", "cooperative", "financial literacy", "skills training", "startup"],
  "ACTIVE CITIZENSHIP": ["citizenship", "leadership", "summit", "volunteer", "linggo ng kabataan", "voter", "voting", "assembly", "youth week", "advocacy", "youth organization", "kk assembly"],
  "GOVERNANCE": ["governance", "skmt", "mandatory training", "capability", "capability-building", "transparency", "session", "ordinance", "resolution", "council", "audit", "formulation", "board"],
  "PEACE-BUILDING AND SECURITY": ["peace", "security", "safety", "crime", "anti-drug", "illegal drugs", "drrm", "disaster", "calamity", "emergency", "anti-insurgency", "rescue", "protective"],
  "SOCIAL INCLUSION AND EQUITY": ["inclusion", "equity", "pwd", "disability", "indigenous", "ip", "gender", "lgbtq", "solo parent", "out-of-school", "vulnerable", "equality", "special needs"],
  "AGRICULTURE": ["agriculture", "farming", "farm", "garden", "gardening", "crops", "4-h", "young farmers", "food security", "livestock", "vegetable", "agri-tech", "urban farming"],
  "ENVIRONMENT": ["environment", "climate", "tree planting", "clean-up", "coastal", "waste", "recycling", "green", "river", "reforestation", "segregation", "renewable", "eco-friendly"]
};

/**
 * Predicts the most suitable NYC Center of Youth Participation based on text keywords.
 */
export function classifyPpaToCenter(text: string): { center: string; confidence: number } {
  const lower = text.toLowerCase();
  let bestCenter = "ACTIVE CITIZENSHIP";
  let maxMatches = 0;

  for (const [center, keywords] of Object.entries(CENTER_KEYWORDS)) {
    let matches = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        matches++;
      }
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      bestCenter = center;
    }
  }

  const confidence = maxMatches >= 2 ? 0.9 : maxMatches === 1 ? 0.65 : 0.4;
  return { center: bestCenter, confidence };
}

/**
 * Checks for prohibited non-youth expenditures under DBM/NYC/COA rules.
 */
function checkProhibitedKeywords(text: string): string | null {
  const lower = text.toLowerCase();
  if (lower.includes("tanod") || lower.includes("barangay police")) {
    return "Barangay Tanod expenses are the responsibility of the Barangay General Fund, not the 10% SK Youth Fund (RA 10742).";
  }
  if (lower.includes("senior citizen") || lower.includes("elderly")) {
    return "Senior Citizen programs must be funded from the Barangay 1% Senior/PWD Fund, not SK Youth appropriations.";
  }
  if (lower.includes("street light") || lower.includes("road cementing") || lower.includes("drainage canal")) {
    return "General barangay civil works / road infrastructure are non-youth expenditures unless exclusively part of an approved youth community facility.";
  }
  if (lower.includes("alcoholic") || lower.includes("liquor") || lower.includes("beer")) {
    return "Purchase of alcoholic beverages is strictly disallowed under COA Circular No. 2020-004.";
  }
  if (lower.includes("cash gift") && !lower.includes("educational assistance") && !lower.includes("incentive")) {
    return "Discretionary cash gifts without statutory guidelines or criteria violate COA rules.";
  }
  return null;
}

/**
 * Scans a CBYDP Document (3-Year Plan).
 */
export function scanCbydpDocument(doc: CbydpDocument): ScanCheckResult {
  const findings: ScanFinding[] = [];
  const ppaAnalyses: PpaAnalysisItem[] = [];
  const coveredCenters = new Set<string>();

  // 1. Check Header Information
  if (!doc.barangayName || doc.barangayName.trim() === "") {
    findings.push({
      id: "hdr-bgy-missing",
      category: "missing_info",
      severity: "critical",
      title: "Missing Barangay Jurisdiction Name",
      location: "Document Header",
      issueDescription: "The official Barangay name is blank or missing.",
      explanation: "Official planning documents submitted to the Sangguniang Bayan/Panlungsod and DILG must explicitly identify the local government unit.",
      legalBasis: "RA 10742 Section 8 & DILG-NYC JMC No. 1",
      suggestion: "Enter the complete official name of the barangay (e.g. 'Kapatagan').",
      suggestedActionText: "Set Barangay Name"
    });
  }

  if (!doc.calendarYears || !doc.calendarYears.includes("-")) {
    findings.push({
      id: "hdr-years-invalid",
      category: "incorrect_info",
      severity: "warning",
      title: "Invalid Multi-Year Planning Horizon",
      location: "Document Header: Calendar Years",
      issueDescription: `Calendar Years is set to "${doc.calendarYears || 'blank'}", expected a 3-year format (e.g. 2026-2028).`,
      explanation: "The CBYDP is mandated to be a 3-year rolling development plan synchronized with the Philippine Youth Development Plan.",
      legalBasis: "RA 10742 Section 8(a)",
      suggestion: "Update the planning period to a 3-year period such as '2026-2028'.",
      suggestedActionText: "Update Years to 2026-2028"
    });
  }

  if (!doc.preparedByName || doc.preparedByName.trim() === "" || doc.preparedByName.toLowerCase().includes("sample")) {
    findings.push({
      id: "hdr-prepared-missing",
      category: "missing_info",
      severity: "warning",
      title: "Signatory Incomplete: Prepared By (SK Secretary)",
      location: "Signatures: Prepared By",
      issueDescription: "The name of the SK Secretary who drafted the CBYDP is missing or placeholder.",
      explanation: "The SK Secretary has the statutory duty to prepare and document youth assembly plans and council records.",
      legalBasis: "RA 10742 Section 14(a)",
      suggestion: "Type the official name and title of the elected SK Secretary."
    });
  }

  if (!doc.approvedByName || doc.approvedByName.trim() === "") {
    findings.push({
      id: "hdr-approved-missing",
      category: "missing_info",
      severity: "critical",
      title: "Signatory Incomplete: Approved By (SK Chairperson)",
      location: "Signatures: Approved By",
      issueDescription: "The SK Chairperson's approval signature field is blank.",
      explanation: "Without the endorsement of the SK Chairperson and council approval, the CBYDP has no legal force.",
      legalBasis: "RA 10742 Section 12",
      suggestion: "Enter the name of the SK Chairperson."
    });
  }

  // 2. Scan Sections and PPAs
  const sections = doc.sections || [];
  if (sections.length === 0) {
    findings.push({
      id: "sec-empty",
      category: "missing_info",
      severity: "critical",
      title: "No Centers of Youth Participation Defined",
      location: "CBYDP Matrix",
      issueDescription: "The document has zero sections. A valid CBYDP must organize PPAs into Centers of Youth Participation.",
      explanation: "The National Youth Commission requires the CBYDP to address key development sectors.",
      legalBasis: "NYC CBYDP Guidelines & PYDP 2023-2028",
      suggestion: "Add the 9 NYC Centers of Participation starting with Health, Education, and Governance."
    });
  }

  let totalItemsCount = 0;
  let totalComputedBudget = 0;

  sections.forEach((sec, sIdx) => {
    const normCenter = sec.centerName.trim().toUpperCase();
    coveredCenters.add(normCenter);

    // Check Agenda Statement
    if (!sec.agendaStatement || sec.agendaStatement.trim().length < 15) {
      findings.push({
        id: `sec-agenda-${sec.id}`,
        category: "missing_info",
        severity: "warning",
        title: `Incomplete Agenda Statement in ${sec.centerName}`,
        location: `Section: ${sec.centerName}`,
        issueDescription: "The youth development agenda statement is either blank or too brief.",
        explanation: "Every Center of Participation in the CBYDP must open with a visionary agenda statement answering what the youth intend to achieve over the 3-year term.",
        legalBasis: "DILG-NYC Joint Memorandum Circular No. 1, Series of 2019",
        suggestion: `Provide a descriptive 3-year youth agenda for ${sec.centerName} (e.g. "By 2028, empower 100% of out-of-school youth with vocational opportunities.").`
      });
    }

    // Check Section Items
    const items = sec.items || [];
    if (items.length === 0) {
      findings.push({
        id: `sec-no-items-${sec.id}`,
        category: "missing_info",
        severity: "warning",
        title: `No Programs or Projects Listed Under ${sec.centerName}`,
        location: `Section: ${sec.centerName}`,
        issueDescription: `This center contains zero operational PPAs.`,
        explanation: "Empty sections leave development priorities unaddressed in the Katipunan ng Kabataan review.",
        legalBasis: "RA 10742 Section 8",
        suggestion: `Add at least one targeted youth activity or project under ${sec.centerName}.`
      });
    }

    items.forEach((item, iIdx) => {
      totalItemsCount++;
      totalComputedBudget += Number(item.budgetAmount) || 0;
      const itemTitle = item.ppas || `PPA Item #${iIdx + 1}`;

      // Check Concern
      if (!item.concern || item.concern.trim() === "" || item.concern.length < 5) {
        findings.push({
          id: `item-concern-${item.id}`,
          category: "missing_info",
          severity: "warning",
          title: `Vague or Missing Youth Concern`,
          location: `${sec.centerName} > ${itemTitle}`,
          issueDescription: "The Youth Development Concern column is blank or uninformative.",
          explanation: "PPAs must directly originate from identified youth problems gathered during KK assemblies or youth profiling.",
          legalBasis: "RA 10742 Section 5 (KK Assemblies)",
          suggestion: "Specify the exact youth challenge (e.g. 'High rate of youth unemployment', 'Lack of sports facilities')."
        });
      }

      // Check Objectives
      if (!item.objectives || item.objectives.trim() === "") {
        findings.push({
          id: `item-obj-${item.id}`,
          category: "missing_info",
          severity: "warning",
          title: `Missing Objectives for "${itemTitle}"`,
          location: `${sec.centerName} > ${itemTitle}`,
          issueDescription: "Objectives field is empty.",
          explanation: "COA and DBM require clear objectives for state funds to confirm legitimate public purpose.",
          legalBasis: "COA Circular 2020-004",
          suggestion: "State what this project aims to accomplish (e.g. 'To train 50 youth leaders in disaster preparedness')."
        });
      }

      // Check Performance Indicator
      if (!item.performanceIndicator || item.performanceIndicator.trim() === "" || item.performanceIndicator.toLowerCase() === "tbd") {
        findings.push({
          id: `item-pi-${item.id}`,
          category: "missing_info",
          severity: "critical",
          title: `Missing Performance Indicator for "${itemTitle}"`,
          location: `${sec.centerName} > ${itemTitle}`,
          issueDescription: "Performance Indicator is empty or set to placeholder.",
          explanation: "Performance indicators are required by DILG/DBM/NYC for monitoring and evaluation. An audit without verifiable indicators will be returned for revision.",
          legalBasis: "DILG-NYC JMC 2019-01 & RA 10742 Section 8",
          suggestion: "Formulate a quantifiable indicator (e.g. 'Number of youth recipients trained', 'Percentage of attendees evaluated competent')."
        });
      }

      // Check Target Years
      if (!item.targetYear1 && !item.targetYear2 && !item.targetYear3) {
        findings.push({
          id: `item-targets-${item.id}`,
          category: "missing_info",
          severity: "warning",
          title: `No Multi-Year Targets Specified for "${itemTitle}"`,
          location: `${sec.centerName} > ${itemTitle}`,
          issueDescription: "All Year 1, Year 2, and Year 3 target milestone fields are blank.",
          explanation: "The CBYDP is a multi-year plan requiring targets across the 3 calendar years.",
          legalBasis: "CBYDP Monitoring Framework",
          suggestion: "Enter target output figures (e.g., '50 participants' in Year 1, '75' in Year 2)."
        });
      }

      // Check Budget Amount
      if (item.budgetAmount === undefined || item.budgetAmount === null || item.budgetAmount < 0 || isNaN(item.budgetAmount)) {
        findings.push({
          id: `item-budget-${item.id}`,
          category: "incorrect_info",
          severity: "critical",
          title: `Invalid Budget Amount in "${itemTitle}"`,
          location: `${sec.centerName} > ${itemTitle}`,
          issueDescription: `Budget amount is negative or invalid (₱${item.budgetAmount}).`,
          explanation: "Appropriation amounts cannot be negative.",
          legalBasis: "Local Government Code & RA 10742",
          suggestion: "Enter a valid positive number for the budget appropriation."
        });
      } else if (item.budgetAmount === 0) {
        findings.push({
          id: `item-budget-zero-${item.id}`,
          category: "financial_formula",
          severity: "warning",
          title: `Zero (₱0.00) Budget for Active PPA "${itemTitle}"`,
          location: `${sec.centerName} > ${itemTitle}`,
          issueDescription: "Project is active but has an appropriation of ₱0.00.",
          explanation: "If a project is unfunded, consider indicating if it relies on partner funding or external counterpart, otherwise budget must be allocated.",
          legalBasis: "DBM Local Budget Circular",
          suggestion: "Assign an appropriate funding amount or note 'Counterpart / No-cost initiative'."
        });
      }

      // Check Person Responsible
      if (!item.personResponsible || item.personResponsible.trim() === "" || item.personResponsible.toLowerCase() === "tbd") {
        findings.push({
          id: `item-person-${item.id}`,
          category: "missing_info",
          severity: "warning",
          title: `Unassigned Person Responsible for "${itemTitle}"`,
          location: `${sec.centerName} > ${itemTitle}`,
          issueDescription: "Person Responsible is blank or unassigned.",
          explanation: "Every PPA must assign an SK Official, committee head, or partner office for operational accountability.",
          legalBasis: "RA 10742 Section 13 (SK Committees)",
          suggestion: "Assign an official such as 'SK Chairperson', 'Committee on Education Head', or 'SK Treasurer'."
        });
      }

      // Check Prohibited non-youth expense
      const prohibitedReason = checkProhibitedKeywords(item.ppas || "");
      if (prohibitedReason) {
        findings.push({
          id: `item-prohibited-${item.id}`,
          category: "statutory_compliance",
          severity: "critical",
          title: `Prohibited Non-Youth Expenditure Detected in "${itemTitle}"`,
          location: `${sec.centerName} > ${itemTitle}`,
          issueDescription: prohibitedReason,
          explanation: "The 10% SK Fund is protected by law and cannot be diverted to regular municipal or barangay operations.",
          legalBasis: "RA 10742 Section 20(a) & COA Circular 2020-004",
          suggestion: "Realign this activity strictly to youth empowerment, or transfer funding to the Barangay Council."
        });
      }

      // Check PPA Alignment & Classification
      const classification = classifyPpaToCenter(`${item.ppas} ${item.concern} ${item.objectives}`);
      const isAligned = classification.center === normCenter || normCenter.includes(classification.center) || classification.confidence < 0.6;
      
      const ppaAnalysis: PpaAnalysisItem = {
        id: item.id,
        name: item.ppas || "Unnamed PPA",
        allocatedCenter: normCenter,
        recommendedCenter: classification.center,
        isAligned: isAligned,
        budget: Number(item.budgetAmount) || 0,
        explanation: isAligned 
          ? `Strongly aligned with the ${normCenter} sector based on program scope and keywords.`
          : `This program focuses on keywords related to "${classification.center}", but is currently located in "${normCenter}".`,
        flags: isAligned ? [] : ["Potential Center Mismatch"]
      };

      ppaAnalyses.push(ppaAnalysis);

      if (!isAligned && classification.confidence >= 0.8) {
        findings.push({
          id: `ppa-mismatch-${item.id}`,
          category: "ppa_classification",
          severity: "warning",
          title: `PPA Center Classification Mismatch: "${itemTitle}"`,
          location: `${sec.centerName} > ${itemTitle}`,
          issueDescription: `Currently placed in "${normCenter}", but thematic content indicates it belongs to "${classification.center}".`,
          explanation: "Accurate sectoral classification allows LYDO and NYC to compile consistent municipal and national youth development statistics.",
          legalBasis: "NYC Philippine Youth Development Plan Thematic Areas",
          suggestion: `Consider moving this PPA under the "${classification.center}" section for clean alignment.`,
          suggestedActionText: `Reclassify to ${classification.center}`
        });
      }
    });
  });

  // 3. Center Coverage Analysis
  const missingCenters: string[] = [];
  NYC_9_CENTERS.forEach(c => {
    let found = false;
    for (const cov of coveredCenters) {
      if (cov.includes(c) || c.includes(cov)) {
        found = true;
        break;
      }
    }
    if (!found) missingCenters.push(c);
  });

  if (missingCenters.length > 0) {
    findings.push({
      id: "centers-missing",
      category: "ppa_alignment",
      severity: missingCenters.length >= 4 ? "warning" : "info",
      title: `${missingCenters.length} NYC Centers of Participation Unrepresented`,
      location: "Sectoral Coverage",
      issueDescription: `The CBYDP does not currently include PPAs under: ${missingCenters.slice(0, 4).join(", ")}${missingCenters.length > 4 ? ` and ${missingCenters.length - 4} others` : ""}.`,
      explanation: "While not every single center must have a huge budget, RA 10742 encourages holistic youth development spanning all 9 NYC priority areas.",
      legalBasis: "NYC 9 Centers of Youth Participation Framework",
      suggestion: `Review if your barangay youth would benefit from initiatives in ${missingCenters[0]} and ${missingCenters[1] || 'Environment'}.`
    });
  }

  // Mandatory statutory checks in CBYDP
  const allPpaNames = doc.sections.flatMap(s => s.items.map(i => (i.ppas || "").toLowerCase())).join(" ");
  const hasLinggoNgKabataan = allPpaNames.includes("linggo ng kabataan") || allPpaNames.includes("youth week");
  const hasMandatoryTraining = allPpaNames.includes("mandatory training") || allPpaNames.includes("skmt") || allPpaNames.includes("capability");
  const hasEnvironmental = allPpaNames.includes("tree") || allPpaNames.includes("clean-up") || allPpaNames.includes("environment") || allPpaNames.includes("waste");

  if (hasLinggoNgKabataan) {
    findings.push({
      id: "statutory-linggo-passed",
      category: "statutory_compliance",
      severity: "compliant",
      title: "Statutory Mandate Compliant: Linggo ng Kabataan Included",
      location: "Youth Development Priorities",
      issueDescription: "The celebration of Linggo ng Kabataan is scheduled in the plan.",
      explanation: "RA 10742 Section 30 mandates every barangay, municipality, and city to celebrate Linggo ng Kabataan every August.",
      legalBasis: "RA 10742 Section 30",
      suggestion: "Maintain proper alignment with Municipal Youth Development Council schedules."
    });
  } else {
    findings.push({
      id: "statutory-linggo-missing",
      category: "statutory_compliance",
      severity: "warning",
      title: "Statutory Notice: Linggo ng Kabataan Not Explicitly Programmed",
      location: "Active Citizenship Sector",
      issueDescription: "No specific PPA found for 'Linggo ng Kabataan' or 'Youth Week'.",
      explanation: "Section 30 of RA 10742 mandates every SK to conduct Linggo ng Kabataan activities every August.",
      legalBasis: "Republic Act No. 10742 Section 30",
      suggestion: "Add a specific program item for 'Linggo ng Kabataan Celebration' under Active Citizenship."
    });
  }

  if (hasMandatoryTraining) {
    findings.push({
      id: "statutory-training-passed",
      category: "statutory_compliance",
      severity: "compliant",
      title: "Statutory Mandate Compliant: SK Capability Building Programmed",
      location: "Governance Sector",
      issueDescription: "SK Mandatory Training / Capability Building for youth council and KK leaders is present.",
      explanation: "Capacity development is mandatory for all youth leaders under RA 10742 and RA 11768.",
      legalBasis: "RA 10742 Section 27 & RA 11768",
      suggestion: "Ensure training is coordinated with accredited training providers (NYC/DILG/LYDO)."
    });
  }

  // Calculate score
  const criticalCount = findings.filter(f => f.severity === "critical").length;
  const warningCount = findings.filter(f => f.severity === "warning").length;
  const compliantCount = findings.filter(f => f.severity === "compliant").length;

  let score = 100 - (criticalCount * 20) - (warningCount * 6) + (compliantCount * 2);
  score = Math.max(25, Math.min(100, Math.round(score)));

  let status: ScanCheckResult["status"] = "Ready for Approval";
  if (criticalCount > 0) {
    status = "Critical Non-Compliance";
  } else if (warningCount > 2) {
    status = "Needs Revision";
  }

  const summaryText = criticalCount > 0
    ? `Scan found ${criticalCount} critical audit issue(s) that must be resolved before submission to the Sangguniang Bayan.`
    : warningCount > 0
      ? `Document is well-structured with ${warningCount} advisory recommendation(s) for enhanced compliance and alignment.`
      : "Document fully complies with all RA 10742 statutory guidelines and NYC 9 Centers standards.";

  return {
    docType: "CBYDP",
    barangayName: doc.barangayName || "Barangay",
    calendarYearOrPeriod: doc.calendarYears || "3-Year Horizon",
    timestamp: new Date().toISOString(),
    overallScore: score,
    status,
    summaryText,
    criticalCount,
    warningCount,
    compliantCount,
    centersCoverage: {
      covered: Array.from(coveredCenters),
      missing: missingCenters,
      total: NYC_9_CENTERS.length
    },
    findings,
    ppaAnalyses,
    financialSummary: {
      totalBudget: totalComputedBudget,
      statutoryNotes: [
        `Total multi-year projected investment: ₱${totalComputedBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        `Covered Centers: ${coveredCenters.size} of 9 NYC Centers of Youth Participation`,
        `Total operational PPAs listed: ${totalItemsCount}`
      ]
    }
  };
}

/**
 * Scans an ABYIP Document (Annual Investment Program).
 */
export function scanAbyipDocument(doc: AbyipDocument): ScanCheckResult {
  const findings: ScanFinding[] = [];
  const ppaAnalyses: PpaAnalysisItem[] = [];
  const coveredCenters = new Set<string>();

  // 1. Header Checks
  if (!doc.barangayName || doc.barangayName.trim() === "") {
    findings.push({
      id: "abyip-hdr-bgy",
      category: "missing_info",
      severity: "critical",
      title: "Missing Barangay Name",
      location: "Document Header",
      issueDescription: "Official Barangay jurisdiction name is missing.",
      explanation: "Annual Investment Programs must clearly state the originating LGU for budget authorization.",
      legalBasis: "DBM Local Budget Circular",
      suggestion: "Enter the complete Barangay name."
    });
  }

  if (!doc.calendarYear || doc.calendarYear.trim() === "") {
    findings.push({
      id: "abyip-hdr-year",
      category: "missing_info",
      severity: "critical",
      title: "Missing Budget Calendar Year",
      location: "Document Header: Calendar Year",
      issueDescription: "No calendar year specified for this annual investment program.",
      explanation: "An ABYIP is tied to a single calendar year budget cycle.",
      legalBasis: "RA 10742 Section 8(b)",
      suggestion: "Specify the current budget year (e.g. '2026')."
    });
  }

  if (!doc.preparedByName || doc.preparedByName.trim() === "") {
    findings.push({
      id: "abyip-hdr-prep",
      category: "missing_info",
      severity: "warning",
      title: "Missing Preparer Signature (SK Secretary)",
      location: "Signatories",
      issueDescription: "Prepared By name is blank.",
      explanation: "The SK Secretary must endorse the prepared investment program.",
      legalBasis: "RA 10742 Section 14",
      suggestion: "Fill in the name of the SK Secretary."
    });
  }

  if (!doc.approvedByName || doc.approvedByName.trim() === "") {
    findings.push({
      id: "abyip-hdr-app",
      category: "missing_info",
      severity: "critical",
      title: "Missing Approval Signature (SK Chairperson)",
      location: "Signatories",
      issueDescription: "Approved By name is blank.",
      explanation: "The SK Chairperson is the chief executive officer of the youth council and must approve all investment plans.",
      legalBasis: "RA 10742 Section 12",
      suggestion: "Fill in the name of the SK Chairperson."
    });
  }

  // 2. Scan Rows & Mathematics
  let totalComputed = 0;
  let totalMooe = 0;
  let totalCo = 0;
  let totalPs = 0;
  let totalRowCount = 0;
  const seenCodes = new Set<string>();

  (doc.sections || []).forEach(sec => {
    const centerUpper = sec.centerName.trim().toUpperCase();
    coveredCenters.add(centerUpper);

    (sec.items || []).forEach((item, idx) => {
      totalRowCount++;
      const ppaLabel = item.ppaName || `Item #${idx + 1}`;

      // Reference Code Check
      if (!item.referenceCode || item.referenceCode.trim() === "") {
        findings.push({
          id: `abyip-code-blank-${item.id}`,
          category: "missing_info",
          severity: "warning",
          title: `Missing DBM Reference Code for "${ppaLabel}"`,
          location: `${sec.centerName} > ${ppaLabel}`,
          issueDescription: "AIP reference code column is blank.",
          explanation: "Reference codes link each line item directly to the annual budget and chart of accounts.",
          legalBasis: "Joint DBM-DILG-NYC Circular on AIP Coding",
          suggestion: `Assign a standardized reference code such as '3000-1-${String(idx + 1).padStart(2, '0')}'.`
        });
      } else if (seenCodes.has(item.referenceCode)) {
        findings.push({
          id: `abyip-code-dup-${item.id}`,
          category: "incorrect_info",
          severity: "warning",
          title: `Duplicate Reference Code "${item.referenceCode}"`,
          location: `${sec.centerName} > ${ppaLabel}`,
          issueDescription: `Code "${item.referenceCode}" is reused across multiple items.`,
          explanation: "Every distinct PPA must have a unique reference code to avoid accounting confusion in liquidation.",
          legalBasis: "COA Chart of Accounts for SK",
          suggestion: "Use a unique sequential code for each item."
        });
      } else {
        seenCodes.add(item.referenceCode);
      }

      // Expected Results & Performance Indicators
      if (!item.expectedResults || item.expectedResults.trim() === "") {
        findings.push({
          id: `abyip-exp-${item.id}`,
          category: "missing_info",
          severity: "warning",
          title: `Missing Expected Results in "${ppaLabel}"`,
          location: `${sec.centerName} > ${ppaLabel}`,
          issueDescription: "Expected Results column is empty.",
          explanation: "Public expenditures require clear expected outcomes for transparency and post-audit evaluation.",
          legalBasis: "COA Circular 2020-004",
          suggestion: "State the concrete outcome (e.g. '50 youth leaders trained in first aid and basic life support')."
        });
      }

      if (!item.performanceIndicator || item.performanceIndicator.trim() === "") {
        findings.push({
          id: `abyip-pi-${item.id}`,
          category: "missing_info",
          severity: "critical",
          title: `Missing Performance Indicator in "${ppaLabel}"`,
          location: `${sec.centerName} > ${ppaLabel}`,
          issueDescription: "Performance indicator is completely blank.",
          explanation: "Audit guidelines strictly mandate quantifiable performance indicators for every item in the ABYIP.",
          legalBasis: "RA 10742 Section 8 & DBM Local Budget Circular",
          suggestion: "Define a verifiable indicator (e.g. 'Number of participants, 100% completion rate')."
        });
      }

      // Implementation Period
      if (!item.periodImplementation || item.periodImplementation.trim() === "") {
        findings.push({
          id: `abyip-period-${item.id}`,
          category: "missing_info",
          severity: "warning",
          title: `Missing Implementation Schedule in "${ppaLabel}"`,
          location: `${sec.centerName} > ${ppaLabel}`,
          issueDescription: "Period of implementation is unassigned.",
          explanation: "Procurement and disbursement require clear scheduling (Month or Quarter).",
          legalBasis: "RA 9184 Government Procurement Reform Act",
          suggestion: "Specify target timeframe (e.g. 'April - May 2026' or 'Quarter 2')."
        });
      }

      // Mathematical Reconciliation: MOOE + CO + PS = Total
      const m = Number(item.mooe) || 0;
      const c = Number(item.co) || 0;
      const p = Number(item.ps) || 0;
      const t = Number(item.total) || 0;
      const expectedTotal = m + c + p;

      totalMooe += m;
      totalCo += c;
      totalPs += p;
      totalComputed += expectedTotal;

      if (Math.abs(expectedTotal - t) > 1) {
        findings.push({
          id: `abyip-math-${item.id}`,
          category: "financial_formula",
          severity: "critical",
          title: `Mathematical Discrepancy in "${ppaLabel}"`,
          location: `${sec.centerName} > ${ppaLabel}`,
          issueDescription: `Sum of MOOE (₱${m.toLocaleString()}) + CO (₱${c.toLocaleString()}) + PS (₱${p.toLocaleString()}) = ₱${expectedTotal.toLocaleString()}, but row total indicates ₱${t.toLocaleString()}.`,
          explanation: "Rows with mathematical calculation errors will cause budget submission disapproval at the municipal budget office.",
          legalBasis: "Local Budget Circular on Arithmetic Consistency",
          suggestion: `Update the row total to exactly ₱${expectedTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`
        });
      }

      if (expectedTotal === 0) {
        findings.push({
          id: `abyip-zero-${item.id}`,
          category: "financial_formula",
          severity: "warning",
          title: `Zero Budget for PPA "${ppaLabel}"`,
          location: `${sec.centerName} > ${ppaLabel}`,
          issueDescription: "Row has ₱0.00 across MOOE, CO, and PS.",
          explanation: "Zero-cost items should either be clarified as non-monetary partnerships or funded accordingly.",
          legalBasis: "DBM Local Budget Guidelines",
          suggestion: "Assign budget or clarify 'Partner Counterpart / Volunteer Initiative'."
        });
      }

      // Prohibited expense check
      const prohibitedReason = checkProhibitedKeywords(item.ppaName || "");
      if (prohibitedReason) {
        findings.push({
          id: `abyip-prohibited-${item.id}`,
          category: "statutory_compliance",
          severity: "critical",
          title: `Prohibited Expense in "${ppaLabel}"`,
          location: `${sec.centerName} > ${ppaLabel}`,
          issueDescription: prohibitedReason,
          explanation: "Ineligible expenses will be issued a Notice of Suspension or Disallowance by the COA auditor.",
          legalBasis: "COA Circular 2020-004 & RA 10742",
          suggestion: "Remove or reclassify this line item."
        });
      }

      // Center Classification
      const classification = classifyPpaToCenter(`${item.ppaName} ${item.description}`);
      const isAligned = classification.center === centerUpper || centerUpper.includes(classification.center) || classification.confidence < 0.6;
      
      ppaAnalyses.push({
        id: item.id,
        name: item.ppaName || "Unnamed PPA",
        allocatedCenter: centerUpper,
        recommendedCenter: classification.center,
        isAligned,
        budget: t,
        explanation: isAligned 
          ? `Correctly filed under ${centerUpper}.`
          : `Recommended center is ${classification.center} based on project description.`,
        flags: isAligned ? [] : ["Sector Alignment Warning"]
      });
    });
  });

  // Missing Centers
  const missingCenters: string[] = [];
  NYC_9_CENTERS.forEach(c => {
    let found = false;
    for (const cov of coveredCenters) {
      if (cov.includes(c) || c.includes(cov)) {
        found = true;
        break;
      }
    }
    if (!found) missingCenters.push(c);
  });

  // Check Grand Total Consistency
  if (doc.grandTotal && Math.abs(doc.grandTotal - totalComputed) > 10) {
    findings.push({
      id: "abyip-grand-total-mismatch",
      category: "financial_formula",
      severity: "critical",
      title: "Document Grand Total Mismatch",
      location: "Summary Row: Grand Total",
      issueDescription: `Stated Grand Total is ₱${doc.grandTotal.toLocaleString()}, but sum of all rows is ₱${totalComputed.toLocaleString()}.`,
      explanation: "Inconsistent grand totals in the official summary sheet block budget ordinance passage.",
      legalBasis: "DBM Local Budget Circular",
      suggestion: "Recalculate and re-save document to sync totals automatically."
    });
  }

  // Scoring
  const criticalCount = findings.filter(f => f.severity === "critical").length;
  const warningCount = findings.filter(f => f.severity === "warning").length;
  const compliantCount = findings.filter(f => f.severity === "compliant").length;

  let score = 100 - (criticalCount * 22) - (warningCount * 6) + (compliantCount * 2);
  score = Math.max(20, Math.min(100, Math.round(score)));

  let status: ScanCheckResult["status"] = "Ready for Approval";
  if (criticalCount > 0) status = "Critical Non-Compliance";
  else if (warningCount > 2) status = "Needs Revision";

  return {
    docType: "ABYIP",
    barangayName: doc.barangayName || "Barangay",
    calendarYearOrPeriod: `CY ${doc.calendarYear || '2026'}`,
    timestamp: new Date().toISOString(),
    overallScore: score,
    status,
    summaryText: criticalCount > 0 
      ? `Identified ${criticalCount} critical discrepancy item(s) preventing municipal budget endorsement.`
      : `ABYIP reflects sound budget allocation with ${warningCount} item(s) flagged for refinement.`,
    criticalCount,
    warningCount,
    compliantCount,
    centersCoverage: {
      covered: Array.from(coveredCenters),
      missing: missingCenters,
      total: NYC_9_CENTERS.length
    },
    findings,
    ppaAnalyses,
    financialSummary: {
      totalBudget: totalComputed,
      statutoryNotes: [
        `MOOE Total: ₱${totalMooe.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        `Capital Outlay (CO) Total: ₱${totalCo.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        `Personal Services (PS) Total: ₱${totalPs.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        `Grand Total Investment: ₱${totalComputed.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
      ]
    }
  };
}

/**
 * Scans an SK Annual Budget Document (Part I & II).
 */
export function scanBudgetDocument(doc: BudgetDocument): ScanCheckResult {
  const findings: ScanFinding[] = [];
  const ppaAnalyses: PpaAnalysisItem[] = [];

  // 1. Funds Available
  const begBal = Number(doc.beginningBalance) || 0;
  const tenPercent = Number(doc.tenPercentFund) || 0;
  const totalFunds = begBal + tenPercent;

  if (tenPercent <= 0) {
    findings.push({
      id: "bgt-ten-percent-zero",
      category: "missing_info",
      severity: "critical",
      title: "Zero or Missing 10% Sangguniang Kabataan Fund",
      location: "Part I: Receipts / Sources of Funds",
      issueDescription: "The 10% statutory share of the barangay general fund is set to ₱0.00.",
      explanation: "By mandate of RA 10742 Section 20(a), ten percent (10%) of the general fund of the barangay shall be appropriated for the SK.",
      legalBasis: "RA 10742 Section 20(a) & DBM-DILG-NYC JMC 2017-1",
      suggestion: "Enter the verified 10% fund certification provided by the Barangay Treasurer."
    });
  }

  // 2. General Administration (PS & MOOE) & 15% Cap
  const psTotal = (doc.gaPersonalServices || []).reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
  const mooeTotal = (doc.gaMOOE || []).reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
  const gaTotal = psTotal + mooeTotal;

  const gaPercentage = tenPercent > 0 ? (gaTotal / tenPercent) * 100 : 0;

  if (gaPercentage > 15.01) {
    findings.push({
      id: "bgt-ga-cap-exceeded",
      category: "statutory_compliance",
      severity: "critical",
      title: `General Administration Exceeds 15% Statutory Cap (${gaPercentage.toFixed(1)}%)`,
      location: "Part II: General Administration Program",
      issueDescription: `Total General Administration is ₱${gaTotal.toLocaleString()}, which is ${gaPercentage.toFixed(2)}% of the 10% SK Fund (₱${tenPercent.toLocaleString()}). The statutory ceiling is 15.00% (₱${(tenPercent * 0.15).toLocaleString()}).`,
      explanation: "Republic Act No. 10742 as amended by RA 11768 strictly mandates that not more than fifteen percent (15%) of the SK fund shall be allocated for administrative expenses.",
      legalBasis: "RA 10742 Section 20(a) as amended by RA 11768",
      suggestion: `Reduce General Administration items by ₱${(gaTotal - (tenPercent * 0.15)).toLocaleString(undefined, { minimumFractionDigits: 2 })} to meet the 15% statutory cap.`,
      suggestedActionText: "Rebalance to 15% Cap"
    });
  } else {
    findings.push({
      id: "bgt-ga-cap-passed",
      category: "statutory_compliance",
      severity: "compliant",
      title: `General Administration Within 15% Statutory Cap (${gaPercentage.toFixed(1)}%)`,
      location: "Part II: General Administration Program",
      issueDescription: `General Administration allocates ₱${gaTotal.toLocaleString()} (${gaPercentage.toFixed(2)}%), within the maximum 15.00% ceiling.`,
      explanation: "Complies with RA 11768 administrative allocation limitation.",
      legalBasis: "RA 10742 Section 20(a)",
      suggestion: "Maintain proper documentation for all honoraria and administrative expenses."
    });
  }

  // 3. SK Youth Development and Empowerment Programs (YDEP)
  let ydepTotal = 0;
  const coveredCenters = new Set<string>();

  (doc.ydepPrograms || []).forEach(prog => {
    const progName = prog.name.trim().toUpperCase();
    coveredCenters.add(progName);

    if (!prog.expectedResults || prog.expectedResults.trim() === "") {
      findings.push({
        id: `bgt-exp-${prog.id}`,
        category: "missing_info",
        severity: "warning",
        title: `Missing Expected Results in Program "${prog.name}"`,
        location: `YDEP Program: ${prog.name}`,
        issueDescription: "Expected Results column is empty.",
        explanation: "Budget accountability requires explicit outputs for every major YDEP program.",
        legalBasis: "DBM Local Budget Circular on Results-Based Budgeting",
        suggestion: "State the expected output."
      });
    }

    if (!prog.performanceIndicator || prog.performanceIndicator.trim() === "") {
      findings.push({
        id: `bgt-pi-${prog.id}`,
        category: "missing_info",
        severity: "critical",
        title: `Missing Performance Indicator in Program "${prog.name}"`,
        location: `YDEP Program: ${prog.name}`,
        issueDescription: "Performance indicator is blank.",
        explanation: "Performance indicators are compulsory under RA 10742 and DBM rules.",
        legalBasis: "RA 10742 Section 8 & DBM Local Budget Circular",
        suggestion: "Specify a measurable indicator (e.g. 'Number of beneficiaries')."
      });
    }

    (prog.subcategories || []).forEach(sub => {
      (sub.items || []).forEach(it => {
        const amt = Number(it.amount) || 0;
        ydepTotal += amt;

        if (amt < 0) {
          findings.push({
            id: `bgt-neg-${it.id}`,
            category: "incorrect_info",
            severity: "critical",
            title: `Negative Expenditure in "${it.name}"`,
            location: `${prog.name} > ${it.name}`,
            issueDescription: `Amount is negative (₱${amt}).`,
            explanation: "Appropriation line items cannot be negative.",
            legalBasis: "COA Chart of Accounts",
            suggestion: "Enter a positive appropriation amount."
          });
        }

        const prohibited = checkProhibitedKeywords(it.name);
        if (prohibited) {
          findings.push({
            id: `bgt-prohibited-${it.id}`,
            category: "statutory_compliance",
            severity: "critical",
            title: `Ineligible Youth Expense: "${it.name}"`,
            location: `${prog.name} > ${it.name}`,
            issueDescription: prohibited,
            explanation: "Disallowed by COA and RA 10742.",
            legalBasis: "COA Circular 2020-004",
            suggestion: "Remove or reassign to an authorized youth program."
          });
        }

        // PPA analysis
        const classification = classifyPpaToCenter(it.name);
        const isAligned = classification.center === progName || progName.includes(classification.center) || classification.confidence < 0.6;
        ppaAnalyses.push({
          id: it.id,
          name: it.name,
          allocatedCenter: progName,
          recommendedCenter: classification.center,
          isAligned,
          budget: amt,
          explanation: isAligned ? `Aligned with ${progName}.` : `Thematic alignment suggests ${classification.center}.`,
          flags: isAligned ? [] : ["Sector Alignment Advisory"]
        });
      });
    });
  });

  // 4. Budget Balancing Check
  const totalExpenditures = gaTotal + ydepTotal;
  const endingBalance = totalFunds - totalExpenditures;

  if (endingBalance < -0.01) {
    findings.push({
      id: "bgt-deficit-critical",
      category: "statutory_compliance",
      severity: "critical",
      title: `Budget Deficit Detected: -₱${Math.abs(endingBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      location: "Ending Cash Balance",
      issueDescription: `Total Expenditures (₱${totalExpenditures.toLocaleString()}) exceed Total Funds Available (₱${totalFunds.toLocaleString()}).`,
      explanation: "Under Philippine local government law and COA regulations, no local budget shall be approved where expenditures exceed estimated income and receipts (Balanced Budget Rule).",
      legalBasis: "Section 314, Local Government Code of 1991 & RA 10742",
      suggestion: `Reduce appropriations or adjust allocations until Total Expenditures equals Total Funds Available.`,
      suggestedActionText: "Rebalance Budget to Zero"
    });
  } else if (endingBalance > 0.01) {
    findings.push({
      id: "bgt-surplus-unallocated",
      category: "statutory_compliance",
      severity: "warning",
      title: `Unappropriated Surplus of ₱${endingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      location: "Ending Cash Balance",
      issueDescription: `There remains ₱${endingBalance.toLocaleString()} in unallocated youth funds.`,
      explanation: "While not a legal violation, DBM recommends zero-based budgeting for SK to ensure all youth funds are actively programmed rather than sitting idle.",
      legalBasis: "DBM Local Budget Circular",
      suggestion: `Program the remaining ₱${endingBalance.toLocaleString()} to education grants, sports clinics, or disaster preparedness.`,
      suggestedActionText: "Allocate Surplus"
    });
  } else {
    findings.push({
      id: "bgt-balanced-passed",
      category: "statutory_compliance",
      severity: "compliant",
      title: "Statutory Balanced Budget Achieved",
      location: "Part I & II Reconciliation",
      issueDescription: "Total Expenditures exactly balance with Total Funds Available (₱0.00 ending balance).",
      explanation: "Fully satisfies DBM and COA Balanced Budget criteria.",
      legalBasis: "Section 314, LGC of 1991",
      suggestion: "Maintain this exact balance upon final council resolution."
    });
  }

  // Scoring
  const criticalCount = findings.filter(f => f.severity === "critical").length;
  const warningCount = findings.filter(f => f.severity === "warning").length;
  const compliantCount = findings.filter(f => f.severity === "compliant").length;

  let score = 100 - (criticalCount * 25) - (warningCount * 6) + (compliantCount * 3);
  score = Math.max(15, Math.min(100, Math.round(score)));

  let status: ScanCheckResult["status"] = "Ready for Approval";
  if (criticalCount > 0) status = "Critical Non-Compliance";
  else if (warningCount > 2) status = "Needs Revision";

  return {
    docType: "Annual Budget",
    barangayName: doc.barangayName || "Barangay",
    calendarYearOrPeriod: `CY ${doc.calendarYear || '2026'}`,
    timestamp: new Date().toISOString(),
    overallScore: score,
    status,
    summaryText: criticalCount > 0 
      ? `Budget audit discovered ${criticalCount} critical violation(s) (such as ${endingBalance < 0 ? 'deficit' : 'statutory cap breach'}) that will cause DBM/Sangguniang Bayan veto.`
      : `Annual budget demonstrates high fiscal discipline with ${gaPercentage.toFixed(1)}% GA and ${((ydepTotal / (totalFunds || 1)) * 100).toFixed(1)}% YDEP allocation.`,
    criticalCount,
    warningCount,
    compliantCount,
    centersCoverage: {
      covered: Array.from(coveredCenters),
      missing: NYC_9_CENTERS.filter(c => !coveredCenters.has(c)),
      total: NYC_9_CENTERS.length
    },
    findings,
    ppaAnalyses,
    financialSummary: {
      totalBudget: totalExpenditures,
      gaTotal,
      gaPercentage,
      ydepTotal,
      ydepPercentage: (ydepTotal / (tenPercent || 1)) * 100,
      isBalanced: Math.abs(endingBalance) < 0.01,
      endingBalance,
      statutoryNotes: [
        `Total Funds Available: ₱${totalFunds.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        `General Administration (PS + MOOE): ₱${gaTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${gaPercentage.toFixed(2)}% of 10% Fund)`,
        `SK YDEP Programs: ₱${ydepTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        `Net Ending Balance: ₱${endingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
      ]
    }
  };
}

/**
 * Scans a generic Editor document or text markdown.
 */
export function scanEditorDocument(title: string, content: string, barangayName = "Barangay"): ScanCheckResult {
  const findings: ScanFinding[] = [];
  const ppaAnalyses: PpaAnalysisItem[] = [];

  const raw = (content || "").trim();
  const lower = raw.toLowerCase();

  // Check Length
  if (raw.length < 50) {
    findings.push({
      id: "doc-too-short",
      category: "missing_info",
      severity: "critical",
      title: "Insufficient Document Content",
      location: "Document Body",
      issueDescription: `Document has only ${raw.length} characters.`,
      explanation: "Official planning documents require substantial narrative, objective setting, and appropriation breakdowns.",
      legalBasis: "RA 10742 Planning Standards",
      suggestion: "Expand the document or use one of the official templates (CBYDP, ABYIP, or Annual Budget)."
    });
  }

  // Check Title
  if (!title || title.trim() === "" || title.toLowerCase().includes("untitled")) {
    findings.push({
      id: "doc-title-placeholder",
      category: "missing_info",
      severity: "warning",
      title: "Document Title Missing or Generic",
      location: "Header: Title",
      issueDescription: "Title is generic or placeholder.",
      explanation: "Clear document titles are required for record keeping and council archiving.",
      legalBasis: "Local Government Records Management",
      suggestion: "Provide an official descriptive title."
    });
  }

  // Check Indicators & Targets
  if (!lower.includes("performance indicator") && !lower.includes("indicator") && !lower.includes("target")) {
    findings.push({
      id: "doc-no-indicators",
      category: "missing_info",
      severity: "critical",
      title: "No Measurable Performance Indicators Found",
      location: "Body Content",
      issueDescription: "Document lacks performance indicators or quantified targets.",
      explanation: "Every public program funded by the SK must have measurable indicators.",
      legalBasis: "RA 10742 Section 8",
      suggestion: "Include specific performance indicators and targets (e.g. 'Target: 100 youth participants')."
    });
  }

  // Check Budget Figures
  const hasCurrencySymbol = raw.includes("₱") || raw.includes("PHP") || raw.includes("Php");
  if (!hasCurrencySymbol) {
    findings.push({
      id: "doc-no-budget",
      category: "missing_info",
      severity: "warning",
      title: "No Explicit Financial Appropriations (₱) Detected",
      location: "Financial Section",
      issueDescription: "Document does not mention monetary appropriations or currency values.",
      explanation: "Investment and development plans should state the financial resources required for implementation.",
      legalBasis: "DBM Local Budget Guidelines",
      suggestion: "Specify financial appropriations for each project activity."
    });
  }

  // PPA and Center Classification Analysis from Text
  const lines = raw.split("\n");
  const coveredCenters = new Set<string>();

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("#") || trimmed.startsWith("-") || trimmed.startsWith("*") || trimmed.includes("Program") || trimmed.includes("Project")) {
      const cls = classifyPpaToCenter(trimmed);
      if (cls.confidence >= 0.6) {
        coveredCenters.add(cls.center);
        ppaAnalyses.push({
          id: `line-${idx}`,
          name: trimmed.replace(/^[#\-*\s]+/, "").slice(0, 60),
          allocatedCenter: cls.center,
          recommendedCenter: cls.center,
          isAligned: true,
          budget: 0,
          explanation: `Identified under ${cls.center} center of youth participation.`,
          flags: []
        });
      }
    }
  });

  // Prohibited Check
  const prohibitedReason = checkProhibitedKeywords(raw);
  if (prohibitedReason) {
    findings.push({
      id: "doc-prohibited-text",
      category: "statutory_compliance",
      severity: "critical",
      title: "Ineligible or Prohibited Expenditure Keyword Detected",
      location: "Body Content",
      issueDescription: prohibitedReason,
      explanation: "Disallowed by COA Circular 2020-004.",
      legalBasis: "COA Circular 2020-004",
      suggestion: "Review document text and remove any non-youth line items."
    });
  }

  // Scoring
  const criticalCount = findings.filter(f => f.severity === "critical").length;
  const warningCount = findings.filter(f => f.severity === "warning").length;
  const compliantCount = findings.filter(f => f.severity === "compliant").length;

  let score = 100 - (criticalCount * 25) - (warningCount * 8) + (compliantCount * 2);
  score = Math.max(25, Math.min(100, Math.round(score)));

  let status: ScanCheckResult["status"] = "Ready for Approval";
  if (criticalCount > 0) status = "Critical Non-Compliance";
  else if (warningCount > 2) status = "Needs Revision";

  return {
    docType: "Editor Document",
    barangayName,
    calendarYearOrPeriod: "Working Draft",
    timestamp: new Date().toISOString(),
    overallScore: score,
    status,
    summaryText: criticalCount > 0
      ? `Discovered ${criticalCount} issue(s) that require attention.`
      : `Text draft demonstrates compliance with standard formatting.`,
    criticalCount,
    warningCount,
    compliantCount,
    centersCoverage: {
      covered: Array.from(coveredCenters),
      missing: NYC_9_CENTERS.filter(c => !coveredCenters.has(c)),
      total: NYC_9_CENTERS.length
    },
    findings,
    ppaAnalyses
  };
}
