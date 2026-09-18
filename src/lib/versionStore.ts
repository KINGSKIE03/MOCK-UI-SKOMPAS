import { DocumentVersion, VersionDocType, CbydpDocument, AbyipDocument, BudgetDocument } from "../types";
import { loadCbydpDocument, saveCbydpDocument, calculateCbydpGrandTotal } from "./cbydpStore";
import { loadAbyipDocument, saveAbyipDocument, calculateAbyipGrandTotals } from "./abyipStore";
import { loadBudgetDocument, saveBudgetDocument, calculateBudgetGrandTotals } from "./budgetStore";

const STORAGE_KEY = "skompas_document_versions_laak_v3";

/**
 * Builds realistic default historical versions for a barangay
 * so users can immediately test viewing and restoring snapshots.
 */
function createDefaultHistoricalVersions(barangayName: string = "Kapatagan"): DocumentVersion[] {
  const cbydpCurrent = loadCbydpDocument(barangayName);
  const abyipCurrent = loadAbyipDocument(barangayName);
  const budgetCurrent = loadBudgetDocument(barangayName);

  const cbydpTotal = calculateCbydpGrandTotal(cbydpCurrent);
  const abyipTotal = calculateAbyipGrandTotals(abyipCurrent).total;
  const budgetTotal = calculateBudgetGrandTotals(budgetCurrent).grandTotal;

  // Historical CBYDP versions
  const cbydpV1Doc: CbydpDocument = JSON.parse(JSON.stringify(cbydpCurrent));
  cbydpV1Doc.calendarYears = "2026-2029";
  // Simulate slightly lower initial allocation in v1
  if (cbydpV1Doc.sections && cbydpV1Doc.sections[0] && cbydpV1Doc.sections[0].items[0]) {
    cbydpV1Doc.sections[0].items[0].budgetAmount = 10000000;
  }
  cbydpV1Doc.totalAppropriation = calculateCbydpGrandTotal(cbydpV1Doc);

  const cbydpV2Doc: CbydpDocument = JSON.parse(JSON.stringify(cbydpCurrent));
  if (cbydpV2Doc.sections && cbydpV2Doc.sections[0] && cbydpV2Doc.sections[0].items[1]) {
    cbydpV2Doc.sections[0].items[1].budgetAmount = 3500000;
  }
  cbydpV2Doc.totalAppropriation = calculateCbydpGrandTotal(cbydpV2Doc);

  // Historical ABYIP versions
  const abyipV1Doc: AbyipDocument = JSON.parse(JSON.stringify(abyipCurrent));
  if (abyipV1Doc.sections && abyipV1Doc.sections[0] && abyipV1Doc.sections[0].items[0]) {
    abyipV1Doc.sections[0].items[0].ps = 80000;
    abyipV1Doc.sections[0].items[0].total = 80000;
  }
  abyipV1Doc.grandTotal = calculateAbyipGrandTotals(abyipV1Doc).total;

  const abyipV2Doc: AbyipDocument = JSON.parse(JSON.stringify(abyipCurrent));
  if (abyipV2Doc.sections && abyipV2Doc.sections[0] && abyipV2Doc.sections[0].items[1]) {
    abyipV2Doc.sections[0].items[1].mooe = 90000;
    abyipV2Doc.sections[0].items[1].total = 90000;
  }
  abyipV2Doc.grandTotal = calculateAbyipGrandTotals(abyipV2Doc).total;

  // Historical Budget versions
  const budgetV1Doc: BudgetDocument = JSON.parse(JSON.stringify(budgetCurrent));
  budgetV1Doc.gaPersonalServices = [
    { id: "ps-1", name: "Honorarium", amount: 200000.00 }
  ];
  budgetV1Doc.gaMOOE = [
    { id: "mooe-1", name: "Office Supply Expenses", amount: 18000.00 },
    { id: "mooe-2", name: "Representation Expenses", amount: 15000.00 },
    { id: "mooe-3", name: "Fidelity Bond Premium", amount: 3000.00 },
    { id: "mooe-4", name: "Other supplies & Materials", amount: 80000.00 }
  ];

  const budgetV2Doc: BudgetDocument = JSON.parse(JSON.stringify(budgetCurrent));
  budgetV2Doc.gaPersonalServices = [
    { id: "ps-1", name: "Honorarium", amount: 225000.00 }
  ];

  const now = Date.now();
  const oneHour = 3600000;
  const oneDay = 86400000;

  return [
    // --- CBYDP Versions ---
    {
      id: `ver-cbydp-v3-${barangayName}`,
      docType: "CBYDP",
      barangayName,
      versionNumber: 3,
      versionTag: "v3.0 - Current Working Copy",
      authorName: cbydpCurrent.approvedByName || "Hon. James John G. Catubay",
      authorRole: "Chairman",
      timestamp: new Date(now - 30 * 60000).toISOString(),
      summaryNote: "Comprehensive 9 Centers alignment with NYC & RA 11768 mandates. Fully populated statutory PPAs.",
      changes: [
        "Updated Administrative Logistical support to ₱14,000,000 MOOE",
        "Incorporated Linggo ng Kabataan statutory compliance",
        "Refined 3-year performance metrics across Governance & Health"
      ],
      totalBudget: cbydpTotal,
      itemsCount: cbydpCurrent.sections.reduce((acc, s) => acc + (s.items?.length || 0), 0),
      isCurrent: true,
      status: "Approved",
      snapshot: cbydpCurrent
    },
    {
      id: `ver-cbydp-v2-${barangayName}`,
      docType: "CBYDP",
      barangayName,
      versionNumber: 2,
      versionTag: "v2.0 - Council Deliberation Draft",
      authorName: "Maria Santos",
      authorRole: "Secretary",
      timestamp: new Date(now - oneDay * 2).toISOString(),
      summaryNote: "Revisions following Katipunan ng Kabataan (KK) general assembly youth consultation.",
      changes: [
        "Added youth leadership capability training workshops",
        "Recalibrated multi-year targets for 2027 and 2028",
        "Adjusted MOOE travel and training allocations"
      ],
      totalBudget: cbydpV2Doc.totalAppropriation,
      itemsCount: cbydpV2Doc.sections.reduce((acc, s) => acc + (s.items?.length || 0), 0),
      isCurrent: false,
      status: "Pending Review",
      snapshot: cbydpV2Doc
    },
    {
      id: `ver-cbydp-v1-${barangayName}`,
      docType: "CBYDP",
      barangayName,
      versionNumber: 1,
      versionTag: "v1.0 - Initial Baseline Formulation",
      authorName: cbydpCurrent.approvedByName || "Hon. James John G. Catubay",
      authorRole: "Chairman",
      timestamp: new Date(now - oneDay * 5).toISOString(),
      summaryNote: "Initial draft formulated during the SK term inaugural planning session.",
      changes: [
        "Initial 5 Centers of Participation established",
        "Baseline budget ceiling estimations set"
      ],
      totalBudget: cbydpV1Doc.totalAppropriation,
      itemsCount: cbydpV1Doc.sections.reduce((acc, s) => acc + (s.items?.length || 0), 0),
      isCurrent: false,
      status: "Draft",
      snapshot: cbydpV1Doc
    },

    // --- ABYIP Versions ---
    {
      id: `ver-abyip-v3-${barangayName}`,
      docType: "ABYIP",
      barangayName,
      versionNumber: 3,
      versionTag: "v3.0 - Current Working Copy",
      authorName: abyipCurrent.approvedByName || "Hon. James John G. Catubay",
      authorRole: "Chairman",
      timestamp: new Date(now - 45 * 60000).toISOString(),
      summaryNote: "Annual program matrix balanced across PS, MOOE, and Capital Outlay per DILG Memo.",
      changes: [
        "Honorarium for 9 council officials balanced at ₱100,000 PS",
        "Finalized Q1-Q4 quarterly implementation timeline",
        "Assigned designated SK Committee Chairpersons"
      ],
      totalBudget: abyipTotal,
      itemsCount: abyipCurrent.sections.reduce((acc, s) => acc + (s.items?.length || 0), 0),
      isCurrent: true,
      status: "Approved",
      snapshot: abyipCurrent
    },
    {
      id: `ver-abyip-v2-${barangayName}`,
      docType: "ABYIP",
      barangayName,
      versionNumber: 2,
      versionTag: "v2.0 - Mid-Year Schedule Adjustment",
      authorName: "Flory Ann A. Jakosalem",
      authorRole: "Treasurer",
      timestamp: new Date(now - oneDay * 3).toISOString(),
      summaryNote: "Realigned supplies and materials schedule to match procurement calendar.",
      changes: [
        "Shifted representation expenses disbursement to Q2",
        "Updated performance indicators for Linggo ng Kabataan"
      ],
      totalBudget: abyipV2Doc.grandTotal,
      itemsCount: abyipV2Doc.sections.reduce((acc, s) => acc + (s.items?.length || 0), 0),
      isCurrent: false,
      status: "Pending Review",
      snapshot: abyipV2Doc
    },
    {
      id: `ver-abyip-v1-${barangayName}`,
      docType: "ABYIP",
      barangayName,
      versionNumber: 1,
      versionTag: "v1.0 - Preliminary CY 2026 Matrix",
      authorName: "Maria Santos",
      authorRole: "Secretary",
      timestamp: new Date(now - oneDay * 7).toISOString(),
      summaryNote: "Preliminary annual matrix drafted from approved CBYDP objectives.",
      changes: [
        "Drafted primary governance and administrative line items"
      ],
      totalBudget: abyipV1Doc.grandTotal,
      itemsCount: abyipV1Doc.sections.reduce((acc, s) => acc + (s.items?.length || 0), 0),
      isCurrent: false,
      status: "Draft",
      snapshot: abyipV1Doc
    },

    // --- Annual Budget Versions ---
    {
      id: `ver-budget-v3-${barangayName}`,
      docType: "Annual Budget",
      barangayName,
      versionNumber: 3,
      versionTag: "v3.0 - Current Statutory Budget",
      authorName: budgetCurrent.preparedByName || "Flory Ann A. Jakosalem",
      authorRole: "Treasurer",
      timestamp: new Date(now - 15 * 60000).toISOString(),
      summaryNote: "Full CY 2026 Appropriation Ordinance conforming to 10% SK Fund (₱954,653.30).",
      changes: [
        "PS Honorarium calibrated to ₱238,572.00 (under 25% statutory cap)",
        "Balanced MOOE at ₱144,000.30",
        "Allocated youth development programs in Health, Education, Active Citizenship"
      ],
      totalBudget: budgetTotal,
      itemsCount: budgetCurrent.gaPersonalServices.length + budgetCurrent.gaMOOE.length + budgetCurrent.ydepPrograms.length,
      isCurrent: true,
      status: "Approved",
      snapshot: budgetCurrent
    },
    {
      id: `ver-budget-v2-${barangayName}`,
      docType: "Annual Budget",
      barangayName,
      versionNumber: 2,
      versionTag: "v2.0 - Appropriation Committee Review",
      authorName: "Flory Ann A. Jakosalem",
      authorRole: "Treasurer",
      timestamp: new Date(now - oneDay * 1.5).toISOString(),
      summaryNote: "Refined Personnel Services ceiling per Local Budget Circular guidelines.",
      changes: [
        "Adjusted Honorarium ceiling calculation",
        "Added Fidelity Bond premium line item"
      ],
      totalBudget: calculateBudgetGrandTotals(budgetV2Doc).grandTotal,
      itemsCount: budgetV2Doc.gaPersonalServices.length + budgetV2Doc.gaMOOE.length + budgetV2Doc.ydepPrograms.length,
      isCurrent: false,
      status: "Pending Review",
      snapshot: budgetV2Doc
    },
    {
      id: `ver-budget-v1-${barangayName}`,
      docType: "Annual Budget",
      barangayName,
      versionNumber: 1,
      versionTag: "v1.0 - Initial Fund Allocation Draft",
      authorName: budgetCurrent.preparedByName || "Flory Ann A. Jakosalem",
      authorRole: "Treasurer",
      timestamp: new Date(now - oneDay * 6).toISOString(),
      summaryNote: "First draft allocation based on certification of 10% Barangay youth fund.",
      changes: [
        "Calculated base 10% fund estimate",
        "Preliminary MOOE breakdown"
      ],
      totalBudget: calculateBudgetGrandTotals(budgetV1Doc).grandTotal,
      itemsCount: budgetV1Doc.gaPersonalServices.length + budgetV1Doc.gaMOOE.length + budgetV1Doc.ydepPrograms.length,
      isCurrent: false,
      status: "Draft",
      snapshot: budgetV1Doc
    },

    // --- Editor Document Versions ---
    {
      id: `ver-editor-v2-${barangayName}`,
      docType: "Editor Document",
      barangayName,
      versionNumber: 2,
      versionTag: "v2.0 - Verified Compliance Draft",
      authorName: cbydpCurrent.approvedByName || "Hon. James John G. Catubay",
      authorRole: "Chairman",
      timestamp: new Date(now - 2 * oneHour).toISOString(),
      summaryNote: "Synchronized with LYDO recommendations and verified legal citations under RA 10742.",
      changes: [
        "Verified Section 20 mandatory allocations",
        "Updated justification narrative"
      ],
      totalBudget: 954653.30,
      itemsCount: 14,
      isCurrent: true,
      status: "Pending Review",
      snapshot: {
        title: "Annual Youth Investment Program (CY 2026) - Statutory Compliance Working File",
        docType: "budget",
        status: "pending",
        content: `## CY 2026 Annual Youth Development Plan & Budget\n\n### 1. Statutory Mandate & Legal Basis\nPursuant to Republic Act No. 10742 (Sangguniang Kabataan Reform Act of 2015) as amended by Republic Act No. 11768, the Sangguniang Kabataan of Barangay ${barangayName} hereby enacts this working program.\n\n### 2. General Administration Allocation (PS & MOOE)\n- **Personnel Services (Honoraria):** ₱238,572.00 (compliant with statutory 25% limit)\n- **Maintenance and Other Operating Expenses:** ₱144,000.30\n- **Mandatory Fidelity Bond & Operations:** ₱3,000.00\n\n### 3. Priority Youth Development Programs (YDEP)\n- **Basic Life Support & First Aid Training:** ₱8,000.00\n- **Katipunan ng Kabataan Assemblies (Semestral):** ₱30,000.00\n- **Youth Leadership & SKMT Continuing Capacity:** ₱100,000.00\n- **Linggo ng Kabataan Observance:** ₱100,000.00\n- **Grassroots Sports & Wellness Tournament:** ₱281,081.00\n- **Educational Grant Support:** ₱50,000.00\n\n**Total Certified Youth Fund:** ₱954,653.30\n\nApproved for council deliberation and LYDO transmission.`
      }
    },
    {
      id: `ver-editor-v1-${barangayName}`,
      docType: "Editor Document",
      barangayName,
      versionNumber: 1,
      versionTag: "v1.0 - Initial Working Draft",
      authorName: "Maria Santos",
      authorRole: "Secretary",
      timestamp: new Date(now - oneDay * 4).toISOString(),
      summaryNote: "Initial text notes compiled from SK Council committee meeting.",
      changes: [
        "Drafted baseline narrative notes"
      ],
      totalBudget: 950000.00,
      itemsCount: 8,
      isCurrent: false,
      status: "Draft",
      snapshot: {
        title: "Annual Youth Investment Program (CY 2026) - Preliminary Draft",
        docType: "budget",
        status: "pending",
        content: `## Preliminary Draft: CY 2026 Sangguniang Kabataan Plan\n\nInitial consultation notes for Barangay ${barangayName}.\n\nTotal target fund: ₱950,000.00.\nFocus areas: Education, Health clinics, Environmental tree planting.`
      }
    }
  ];
}

/**
 * Retrieves all stored versions, optionally filtered by docType and barangayName.
 */
export function getDocumentVersions(
  docType?: VersionDocType | "all",
  barangayName?: string
): DocumentVersion[] {
  const effectiveBarangay = barangayName || "Kapatagan";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let versions: DocumentVersion[] = raw ? JSON.parse(raw) : [];

    if (!versions || versions.length === 0) {
      // Seed default versions
      versions = createDefaultHistoricalVersions(effectiveBarangay);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(versions));
    }

    // Filter by barangay if given
    let filtered = versions;
    if (barangayName && barangayName.toLowerCase() !== "all") {
      filtered = filtered.filter(v => v.barangayName.toLowerCase() === barangayName.toLowerCase());
      if (filtered.length === 0) {
        // Seed for this specific barangay
        const seeded = createDefaultHistoricalVersions(barangayName);
        versions = [...versions, ...seeded];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(versions));
        filtered = seeded;
      }
    }

    // Filter by docType if given
    if (docType && docType !== "all") {
      filtered = filtered.filter(v => v.docType === docType);
    }

    // Sort newest first
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (e) {
    console.error("Error loading document versions:", e);
    return createDefaultHistoricalVersions(effectiveBarangay);
  }
}

/**
 * Saves a new version snapshot into the version history.
 */
export function saveDocumentVersion(params: {
  docType: VersionDocType;
  barangayName: string;
  authorName: string;
  authorRole?: string;
  summaryNote: string;
  changes?: string[];
  totalBudget?: number;
  itemsCount?: number;
  snapshot: any;
  status?: "Draft" | "Pending Review" | "Approved";
  isCurrent?: boolean;
}): DocumentVersion {
  const all = getDocumentVersions("all");

  // Determine next version number for this docType and barangay
  const docVersions = all.filter(
    v => v.docType === params.docType && v.barangayName.toLowerCase() === params.barangayName.toLowerCase()
  );
  const nextVerNum = docVersions.length > 0 ? Math.max(...docVersions.map(v => v.versionNumber || 1)) + 1 : 1;

  // Mark other versions of this type as not current if this one is current
  const updatedAll = all.map(v => {
    if (v.docType === params.docType && v.barangayName.toLowerCase() === params.barangayName.toLowerCase()) {
      return { ...v, isCurrent: false };
    }
    return v;
  });

  const newVersion: DocumentVersion = {
    id: `ver-${params.docType.toLowerCase().replace(/\s+/g, "_")}-${Date.now()}`,
    docType: params.docType,
    barangayName: params.barangayName,
    versionNumber: nextVerNum,
    versionTag: `v${nextVerNum}.0`,
    authorName: params.authorName,
    authorRole: params.authorRole || "Chairman",
    timestamp: new Date().toISOString(),
    summaryNote: params.summaryNote,
    changes: params.changes || [],
    totalBudget: params.totalBudget,
    itemsCount: params.itemsCount,
    isCurrent: params.isCurrent !== undefined ? params.isCurrent : true,
    status: params.status || "Draft",
    snapshot: params.snapshot
  };

  updatedAll.unshift(newVersion);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAll));

  // Trigger reactivity
  window.dispatchEvent(new CustomEvent("skompas_versions_updated", { detail: newVersion }));

  return newVersion;
}

/**
 * Restores a selected version snapshot back into active working state.
 * Returns the restored document data and details.
 */
export function restoreDocumentVersion(
  versionId: string,
  restorerName: string = "Current User",
  restorerRole: string = "Chairman"
): { success: boolean; version?: DocumentVersion; restoredDoc?: any; error?: string } {
  try {
    const all = getDocumentVersions("all");
    const target = all.find(v => v.id === versionId);

    if (!target) {
      return { success: false, error: "Version snapshot not found in registry." };
    }

    const { docType, snapshot, barangayName, versionTag, summaryNote } = target;

    // Apply snapshot to target store based on document type
    let restoredDoc: any = null;

    if (docType === "CBYDP") {
      const cbydp = snapshot as CbydpDocument;
      cbydp.updatedAt = new Date().toISOString();
      saveCbydpDocument(cbydp);
      restoredDoc = cbydp;
    } else if (docType === "ABYIP") {
      const abyip = snapshot as AbyipDocument;
      abyip.updatedAt = new Date().toISOString();
      saveAbyipDocument(abyip);
      restoredDoc = abyip;
    } else if (docType === "Annual Budget") {
      const budget = snapshot as BudgetDocument;
      budget.updatedAt = new Date().toISOString();
      saveBudgetDocument(budget);
      restoredDoc = budget;
    } else {
      // Editor Document
      restoredDoc = snapshot;
    }

    // Create an audit trail version noting that a rollback occurred
    saveDocumentVersion({
      docType,
      barangayName,
      authorName: restorerName,
      authorRole: restorerRole,
      summaryNote: `Rollback: Restored to ${versionTag} ("${summaryNote}")`,
      changes: [`Rolled back entire active document state to ${versionTag}`],
      totalBudget: target.totalBudget,
      itemsCount: target.itemsCount,
      snapshot,
      status: target.status,
      isCurrent: true
    });

    // Notify listeners
    window.dispatchEvent(new CustomEvent("skompas_version_restored", { 
      detail: { versionId, docType, restoredDoc } 
    }));

    return { success: true, version: target, restoredDoc };
  } catch (e: any) {
    console.error("Error restoring version:", e);
    return { success: false, error: e?.message || "Failed to restore version snapshot." };
  }
}

/**
 * Deletes a historical version snapshot (excluding currently active version).
 */
export function deleteDocumentVersion(versionId: string): boolean {
  try {
    const all = getDocumentVersions("all");
    const filtered = all.filter(v => v.id !== versionId || v.isCurrent);
    if (filtered.length !== all.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      window.dispatchEvent(new CustomEvent("skompas_versions_updated"));
      return true;
    }
    return false;
  } catch (e) {
    console.error("Error deleting version:", e);
    return false;
  }
}

/**
 * Returns summary stats of versions for a barangay.
 */
export function getVersionsSummary(barangayName: string = "Kapatagan") {
  const versions = getDocumentVersions("all", barangayName);
  return {
    total: versions.length,
    cbydpCount: versions.filter(v => v.docType === "CBYDP").length,
    abyipCount: versions.filter(v => v.docType === "ABYIP").length,
    budgetCount: versions.filter(v => v.docType === "Annual Budget").length,
    editorCount: versions.filter(v => v.docType === "Editor Document").length,
    latestTimestamp: versions[0]?.timestamp || null
  };
}

export function cbydpToMarkdown(doc: CbydpDocument): string {
  const lines: string[] = [];
  lines.push(`# Comprehensive Barangay Youth Development Plan (CBYDP) CY ${doc.calendarYears}`);
  lines.push(`**Barangay:** ${doc.barangayName}, Municipality of ${doc.municipality || "Laak"}, Province of ${doc.province || "Davao de Oro"}`);
  lines.push(`**Prepared By:** ${doc.preparedByName} (${doc.preparedByTitle})`);
  lines.push(`**Approved By:** ${doc.approvedByName} (${doc.approvedByTitle})`);
  lines.push(`**Total Multi-Year Appropriation:** ₱${(doc.totalAppropriation || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## Centers of Youth Participation & Statutory Programs");
  lines.push("");

  (doc.sections || []).forEach((sec, idx) => {
    lines.push(`### ${idx + 1}. Center of Participation: ${sec.centerName}`);
    lines.push(`*Agenda Statement:* ${sec.agendaStatement}`);
    lines.push("");
    if (sec.items && sec.items.length > 0) {
      lines.push("| Youth Concern | Objectives | Indicator | Target Y1 | Target Y2 | Target Y3 | Target Y4 | Programs, Projects & Activities (PPAs) | Cat. | Budget (₱) | Responsible |");
      lines.push("|---|---|---|---|---|---|---|---|---|---|---|");
      sec.items.forEach(it => {
        lines.push(`| ${it.concern} | ${it.objectives} | ${it.performanceIndicator} | ${it.targetYear1} | ${it.targetYear2} | ${it.targetYear3} | ${it.targetYear4 || "-"} | ${it.ppas} | ${it.budgetCategory} | ₱${Number(it.budgetAmount || 0).toLocaleString()} | ${it.personResponsible} |`);
      });
      lines.push("");
    }
  });

  return lines.join("\n");
}

export function abyipToMarkdown(doc: AbyipDocument): string {
  const lines: string[] = [];
  lines.push(`# Annual Barangay Youth Investment Program (ABYIP) CY ${doc.calendarYear}`);
  lines.push(`**Barangay:** ${doc.barangayName}, Municipality of ${doc.municipality || "Laak"}, Province of ${doc.province || "Davao de Oro"}`);
  lines.push(`**Prepared By:** ${doc.preparedByName} (${doc.preparedByTitle})`);
  lines.push(`**Approved By:** ${doc.approvedByName} (${doc.approvedByTitle})`);
  lines.push(`**Grand Total Annual Investment:** ₱${(doc.grandTotal || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## Annual Program Matrix & Implementation Schedule");
  lines.push("");

  (doc.sections || []).forEach((sec, idx) => {
    lines.push(`### ${idx + 1}. ${sec.centerName} ${sec.programHeader ? `• ${sec.programHeader}` : ""}`);
    if (sec.items && sec.items.length > 0) {
      lines.push("| Ref Code | PPA Name & Description | Expected Results | Indicator | Period | MOOE (₱) | CO (₱) | PS (₱) | Total (₱) | Responsible |");
      lines.push("|---|---|---|---|---|---|---|---|---|---|");
      sec.items.forEach(it => {
        lines.push(`| ${it.referenceCode} | ${it.ppaName} | ${it.expectedResults} | ${it.performanceIndicator} | ${it.periodImplementation} | ₱${(it.mooe || 0).toLocaleString()} | ₱${(it.co || 0).toLocaleString()} | ₱${(it.ps || 0).toLocaleString()} | ₱${(it.total || 0).toLocaleString()} | ${it.personResponsible} |`);
      });
      lines.push("");
    }
  });

  return lines.join("\n");
}

export function budgetToMarkdown(doc: BudgetDocument): string {
  const lines: string[] = [];
  lines.push(`# Annual Sangguniang Kabataan Budget - CY ${doc.calendarYear}`);
  lines.push(`**Barangay:** ${doc.barangayName}, Municipality of ${doc.municipality || "Laak"}, Province of ${doc.province || "Davao de Oro"}`);
  lines.push(`**Prepared By:** ${doc.preparedByName} (${doc.preparedByTitle})`);
  lines.push(`**Approved By:** ${doc.approvedByName} (${doc.approvedByTitle})`);
  lines.push(`**Certified 10% SK Fund Allocation:** ₱${(doc.tenPercentFund || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## I. General Administration Program");
  lines.push("");
  lines.push("### Personal Services (Honoraria)");
  (doc.gaPersonalServices || []).forEach(ps => {
    lines.push(`- **${ps.name}:** ₱${ps.amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`);
  });
  lines.push(`*Expected Results:* ${doc.gaExpected || "Honorarium for SK Council"}`);
  lines.push(`*Performance Indicator:* ${doc.gaIndicator || "Disbursed to officials"}`);
  lines.push("");
  lines.push("### Maintenance and Other Operating Expenses (MOOE)");
  (doc.gaMOOE || []).forEach(m => {
    lines.push(`- **${m.name}:** ₱${m.amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`);
  });
  lines.push(`*Expected Results:* ${doc.gaMooeExpected || "Operational support to SK Council"}`);
  lines.push(`*Performance Indicator:* ${doc.gaMooeIndicator || "Utilized by SK Officials"}`);
  lines.push("");
  lines.push("## II. SK Youth Development and Empowerment Programs (YDEP)");
  (doc.ydepPrograms || []).forEach(prog => {
    lines.push(`### Program: ${prog.name}`);
    lines.push(`*Expected Results:* ${prog.expectedResults}`);
    lines.push(`*Performance Indicator:* ${prog.performanceIndicator}`);
    (prog.subcategories || []).forEach(sub => {
      if (sub.label) lines.push(`#### ${sub.label}`);
      (sub.items || []).forEach(it => {
        lines.push(`- ${it.name}: ₱${it.amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`);
      });
    });
    lines.push("");
  });

  return lines.join("\n");
}

