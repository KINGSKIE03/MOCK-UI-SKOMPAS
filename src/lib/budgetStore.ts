import { 
  BudgetDocument, 
  BudgetLineItem, 
  BudgetSubcategory, 
  BudgetYdepProgram 
} from "../types";

export const DEFAULT_BUDGET_YEAR = "2026";

/**
 * Creates the default Annual Budget document matching the official
 * reference sheets for Barangay Kapatagan, Municipality of Laak,
 * Province of Davao de Oro for Calendar Year 2026.
 */
export function createDefaultBudgetDocument(
  barangayName: string = "Kapatagan",
  treasurerName: string = "FLORY ANN A. JAKOSALEM",
  chairpersonName: string = "HON. JAMES JOHN G. CATUBAY"
): BudgetDocument {
  return {
    id: `budget-cy2026-${barangayName.toLowerCase().replace(/\s+/g, "-")}`,
    barangayName,
    municipality: "LAAK",
    province: "DAVAO DE ORO",
    calendarYear: DEFAULT_BUDGET_YEAR,
    preparedByName: treasurerName,
    preparedByTitle: "SK TREASURER",
    approvedByName: chairpersonName,
    approvedByTitle: "SK CHAIRPERSON",
    beginningBalance: 0.00,
    tenPercentFund: 954653.30,
    
    // General Administration Program
    gaPersonalServices: [
      { id: "ps-1", name: "Honorarium", amount: 238572.00 }
    ],
    gaExpected: "To provide honorarium for SK Officials",
    gaIndicator: "Received and Used by the SK Officials",
    
    gaMOOE: [
      { id: "mooe-1", name: "Office Supply Expenses", amount: 21000.00 },
      { id: "mooe-2", name: "Representation Expenses", amount: 20000.30 },
      { id: "mooe-3", name: "Fidelity Bond Premium", amount: 3000.00 },
      { id: "mooe-4", name: "Other supplies & Materials", amount: 100000.00 }
    ],
    gaMooeExpected: "Support operational and administrative activities of SK officials",
    gaMooeIndicator: "Received and Used by the SK Officials",

    // SK Youth Development and Empowerment Programs (YDEP)
    ydepPrograms: [
      {
        id: "ydep-health",
        name: "HEALTH",
        expectedResults: "Help the youth enhance their knowledge about first aid.",
        performanceIndicator: "Number of KK Members, SK Officials, and Youth participated on the Program and Activities.",
        subcategories: [
          {
            id: "health-sub-1",
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
        expectedResults: "To plan and discuss various programs and activities. Educating the SK officials and other youth volunteers to become effective leaders through trainings and",
        performanceIndicator: "Number of KK Members, SK Officials, and Youth participated on the Program and Activities.",
        subcategories: [
          {
            id: "gov-sub-1",
            label: "KK ASSEMBLY",
            expectedResults: "To plan and discuss various programs and activities.",
            items: [
              { id: "gov-item-1", name: "*Representation Expenses", amount: 30000.00 }
            ]
          },
          {
            id: "gov-sub-2",
            label: "LEADERSHIP & SKILLS CAPACITY",
            expectedResults: "Educating the SK officials and other youth volunteers to become effective leaders through trainings and",
            items: [
              { id: "gov-item-2", name: "Travelling Expenses", amount: 50000.00 },
              { id: "gov-item-3", name: "Training & Seminar Expenses", amount: 50000.00 }
            ]
          },
          {
            id: "gov-sub-3",
            label: "LINGGO NG KABATAAN",
            expectedResults: "Educating the SK officials and other youth volunteers to become effective leaders through trainings and",
            items: [
              { id: "gov-item-4", name: "*Prizes", amount: 100000.00 }
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
            id: "cite-sub-1",
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
            id: "edu-sub-1",
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
            id: "env-sub-1",
            items: [
              { id: "env-item-1", name: "*Installation of trash cans", amount: 23000.00 }
            ]
          }
        ]
      }
    ],
    status: "Draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export interface BudgetCalculations {
  beginningBalance: number;
  tenPercentFund: number;
  totalFundsAvailable: number;
  totalPS: number;
  totalMOOE: number;
  totalGeneralAdministration: number;
  ydepSubtotals: Record<string, number>;
  totalYDEP: number;
  totalExpenditures: number;
  endingBalance: number;
}

/**
 * Calculates all totals and statutory balance for an Annual Budget document.
 */
export function calculateBudgetCalculations(doc: BudgetDocument): BudgetCalculations {
  const beginningBalance = Number(doc.beginningBalance) || 0;
  const tenPercentFund = Number(doc.tenPercentFund) || 0;
  const totalFundsAvailable = beginningBalance + tenPercentFund;

  const totalPS = (doc.gaPersonalServices || []).reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  const totalMOOE = (doc.gaMOOE || []).reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  const totalGeneralAdministration = totalPS + totalMOOE;

  const ydepSubtotals: Record<string, number> = {};
  let totalYDEP = 0;

  (doc.ydepPrograms || []).forEach((prog) => {
    let progSum = 0;
    (prog.subcategories || []).forEach((sub) => {
      (sub.items || []).forEach((itm) => {
        progSum += Number(itm.amount) || 0;
      });
    });
    ydepSubtotals[prog.id] = progSum;
    totalYDEP += progSum;
  });

  const totalExpenditures = totalGeneralAdministration + totalYDEP;
  const endingBalance = totalFundsAvailable - totalExpenditures;

  return {
    beginningBalance,
    tenPercentFund,
    totalFundsAvailable,
    totalPS,
    totalMOOE,
    totalGeneralAdministration,
    ydepSubtotals,
    totalYDEP,
    totalExpenditures,
    endingBalance
  };
}

/**
 * Storage key for persisting budget documents by barangay.
 */
function getStorageKey(barangayName: string): string {
  const sanitized = barangayName.trim().toLowerCase().replace(/\s+/g, "_");
  return `skompas_budget_document_${sanitized}`;
}

/**
 * Loads the Budget document from localStorage, or creates default if not found.
 */
export function loadBudgetDocument(
  barangayName: string = "Kapatagan",
  treasurerName?: string,
  chairpersonName?: string
): BudgetDocument {
  const key = getStorageKey(barangayName);
  const stored = localStorage.getItem(key);

  if (stored) {
    try {
      const parsed: BudgetDocument = JSON.parse(stored);
      // Ensure barangay name is updated
      parsed.barangayName = barangayName;
      return parsed;
    } catch (e) {
      console.warn("Failed to parse stored budget document, restoring default:", e);
    }
  }

  // Fallback check legacy store
  const legacySaved = localStorage.getItem("skompas_budget_reference_state");
  if (legacySaved) {
    try {
      const parsed = JSON.parse(legacySaved);
      if (parsed.barangay?.toLowerCase() === barangayName.toLowerCase()) {
        const doc: BudgetDocument = {
          ...createDefaultBudgetDocument(barangayName, parsed.preparedBy, parsed.approvedBy),
          province: parsed.province || "DAVAO DE ORO",
          municipality: parsed.municipality || "LAAK",
          calendarYear: String(parsed.calendarYear || DEFAULT_BUDGET_YEAR),
          beginningBalance: Number(parsed.beginningBalance) || 0,
          tenPercentFund: Number(parsed.tenPercentFund) || 954653.30,
          gaPersonalServices: parsed.gaPersonalServices || [{ id: "ps-1", name: "Honorarium", amount: 238572.00 }],
          gaMOOE: parsed.gaMOOE || [
            { id: "mooe-1", name: "Office Supply Expenses", amount: 21000.00 },
            { id: "mooe-2", name: "Representation Expenses", amount: 20000.30 },
            { id: "mooe-3", name: "Fidelity Bond Premium", amount: 3000.00 },
            { id: "mooe-4", name: "Other supplies & Materials", amount: 100000.00 }
          ],
          gaExpected: parsed.gaExpected || "To provide honorarium for SK Officials",
          gaIndicator: parsed.gaIndicator || "Received and Used by the SK Officials",
          ydepPrograms: parsed.ydepPrograms || createDefaultBudgetDocument(barangayName).ydepPrograms
        };
        return doc;
      }
    } catch (e) {
      console.warn("Legacy migration ignored:", e);
    }
  }

  return createDefaultBudgetDocument(barangayName, treasurerName, chairpersonName);
}

/**
 * Saves the Budget document to localStorage.
 */
export function saveBudgetDocument(doc: BudgetDocument): void {
  const key = getStorageKey(doc.barangayName);
  const updatedDoc: BudgetDocument = {
    ...doc,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(key, JSON.stringify(updatedDoc));
  
  // Also keep legacy sync for backwards compatibility
  localStorage.setItem("skompas_budget_reference_state", JSON.stringify({
    province: updatedDoc.province,
    municipality: updatedDoc.municipality,
    barangay: updatedDoc.barangayName,
    calendarYear: Number(updatedDoc.calendarYear) || 2026,
    preparedBy: updatedDoc.preparedByName,
    preparedRole: updatedDoc.preparedByTitle,
    approvedBy: updatedDoc.approvedByName,
    approvedRole: updatedDoc.approvedByTitle,
    beginningBalance: updatedDoc.beginningBalance,
    tenPercentFund: updatedDoc.tenPercentFund,
    gaPersonalServices: updatedDoc.gaPersonalServices,
    gaMOOE: updatedDoc.gaMOOE,
    gaExpected: updatedDoc.gaExpected,
    gaIndicator: updatedDoc.gaIndicator,
    ydepPrograms: updatedDoc.ydepPrograms
  }));
}

/**
 * Calculates grand totals for an Annual Budget document.
 */
export function calculateBudgetGrandTotals(doc: BudgetDocument) {
  const psTotal = (doc.gaPersonalServices || []).reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
  const mooeTotal = (doc.gaMOOE || []).reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
  const gaTotal = psTotal + mooeTotal;

  let ydepTotal = 0;
  (doc.ydepPrograms || []).forEach(prog => {
    (prog.subcategories || []).forEach(sub => {
      (sub.items || []).forEach(it => {
        ydepTotal += Number(it.amount) || 0;
      });
    });
  });

  const totalFunds = (Number(doc.beginningBalance) || 0) + (Number(doc.tenPercentFund) || 0);
  const totalExpenditures = gaTotal + ydepTotal;
  const endingBalance = totalFunds - totalExpenditures;

  return {
    psTotal,
    mooeTotal,
    gaTotal,
    ydepTotal,
    totalFunds,
    totalExpenditures,
    grandTotal: totalExpenditures,
    endingBalance
  };
}

/**
 * Resets the Budget document for a barangay back to official reference default.
 */
export function resetBudgetToDefault(
  barangayName: string = "Kapatagan",
  treasurerName?: string,
  chairpersonName?: string
): BudgetDocument {
  const key = getStorageKey(barangayName);
  localStorage.removeItem(key);
  const defaultDoc = createDefaultBudgetDocument(barangayName, treasurerName, chairpersonName);
  saveBudgetDocument(defaultDoc);
  return defaultDoc;
}
