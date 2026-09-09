export type UserRole = "Chairman" | "Secretary" | "Treasurer" | "Admin" | null;

export interface BarangayAccount {
  id: string;
  barangayName: string;
  officerName: string;
  officialName?: string;
  role: "Chairman" | "Secretary" | "Treasurer";
  email: string;
  password?: string;
  contactNumber?: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  registeredAt: string;
  createdAt?: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface DocumentArchiveItem {
  id: string;
  docType: "CBYDP" | "ABYIP" | "Annual Budget";
  barangayName: string;
  yearOrPeriod: string;
  title: string;
  status: "archived" | "approved_historical";
  archivedAt: string;
  approvedBy: string;
  totalBudget?: number;
  remarks?: string;
  summaryData?: Record<string, any>;
}

export type ArchiveDocument = DocumentArchiveItem;

export interface AppNotification {
  id: string;
  targetType: "broadcast" | "private";
  targetBarangay: string; // "All" or specific Barangay name
  title: string;
  message: string;
  sender: string;
  priority: "normal" | "urgent" | "announcement";
  createdAt: string;
  readBy: string[]; // List of user IDs or Barangay names who read this
}

export interface DocumentSubmissionItem {
  id: string;
  barangayName: string;
  docCode: string;
  docType: "CBYDP" | "ABYIP" | "Annual Budget" | "Table 1 Compliance";
  title: string;
  yearOrPeriod: string;
  submittedBy: string;
  officerRole: UserRole;
  submittedAt: string;
  status: "pending_review" | "approved" | "rejected";
  reviewedAt?: string;
  reviewedBy?: string;
  remarks?: string;
  reviewNotes?: string;
  totalBudget?: number;
  contentSnapshot?: any;
}

export type DocumentSubmission = DocumentSubmissionItem;

export interface Violation {
  section: string;
  violation: string;
  legalCitations: string[];
  suggestion: string;
}

export interface ComplianceReport {
  status: string;
  score: number;
  violations: Violation[];
  strengths: string[];
  alignmentCheck: {
    aligned: boolean;
    feedback: string;
  };
}

export interface CbydpRowItem {
  id: string;
  concern: string; // Youth Development Concern
  objectives: string; // Objectives
  performanceIndicator: string; // Performance Indicator
  targetYear1: string; // e.g. "12" or "250" or "10% increase"
  targetYear2: string;
  targetYear3: string;
  targetYear4?: string; // Optional 4th target
  ppas: string; // Programs, Projects and Activities (PPA'S)
  budgetCategory: string; // "MOOE" | "CO" | "PS"
  budgetAmount: number;
  personResponsible: string;
}

export interface CbydpCenterSection {
  id: string;
  centerName: string; // e.g. "GOVERNANCE", "ACTIVE CITIZENSHIP"
  agendaStatement: string;
  items: CbydpRowItem[];
}

export interface CbydpDocument {
  id: string;
  barangayName: string;
  municipality: string;
  province: string;
  calendarYears: string; // e.g. "2026-2028"
  targetYearLabels: [string, string, string, string?]; // ["2026", "2027", "2028"]
  preparedByName: string;
  preparedByTitle: string;
  approvedByName: string;
  approvedByTitle: string;
  attestedByName?: string;
  attestedByTitle?: string;
  leftLogoUrl?: string; // Official Barangay Seal
  rightLogoUrl?: string; // Sangguniang Kabataan Emblem
  sections: CbydpCenterSection[];
  totalAppropriation: number;
  updatedAt?: string;
  createdAt?: string;
  status: "Draft" | "Pending Review" | "Approved";
}

export interface AbyipRowItem {
  id: string;
  referenceCode: string;
  ppaName: string;
  subItems?: string[];
  description: string;
  expectedResults: string;
  performanceIndicator: string;
  periodImplementation: string;
  mooe: number;
  co: number;
  ps: number;
  total: number;
  personResponsible: string;
}

export interface AbyipCenterSection {
  id: string;
  centerName: string; // e.g. "GOVERNANCE", "ACTIVE CITIZENSHIP"
  programHeader?: string; // e.g. "GENERAL ADMINISTRATIVE PROGRAM", "GOVERNANCE PROGRAM"
  items: AbyipRowItem[];
}

export interface AbyipReceiptItem {
  id: string;
  particular: string;
  amount: number;
}

export interface AbyipExpenditureItem {
  id: string;
  programGroup: string;
  category?: string;
  subCategory?: string;
  objective: string;
  accountCode: string;
  budgetAmount: number;
  expectedResult: string;
  performanceIndicator: string;
}

export interface AbyipDocument {
  id: string;
  barangayName: string;
  municipality: string;
  province: string;
  calendarYear: string; // e.g. "2026"
  leftLogoUrl?: string;
  rightLogoUrl?: string;
  preparedByName: string;
  preparedByTitle: string;
  approvedByName: string;
  approvedByTitle: string;
  treasurerName?: string;
  treasurerTitle?: string;
  sections: AbyipCenterSection[];
  receipts?: AbyipReceiptItem[];
  expenditures?: AbyipExpenditureItem[];
  grandTotal: number;
  updatedAt?: string;
  createdAt?: string;
  status: "Draft" | "Pending Review" | "Approved";
}

export interface BudgetLineItem {
  id: string;
  name: string;
  amount: number;
}

export interface BudgetSubcategory {
  id: string;
  label?: string; // e.g. "*BASIC LIFE SUPPORT WITH FIRST AND TRAINING"
  expectedResults?: string;
  performanceIndicator?: string;
  items: BudgetLineItem[];
}

export interface BudgetYdepProgram {
  id: string;
  name: string; // e.g. "HEALTH", "GOVERNANCE", "ACTIVE CITIZENSHIP", "EDUCATION", "ENVIRONMENT"
  expectedResults: string;
  performanceIndicator: string;
  subcategories: BudgetSubcategory[];
}

export interface BudgetDocument {
  id: string;
  barangayName: string;
  municipality: string;
  province: string;
  calendarYear: string; // "2026"
  leftLogoUrl?: string; // Barangay seal
  rightLogoUrl?: string; // Sangguniang Kabataan Emblem
  preparedByName: string;
  preparedByTitle: string;
  approvedByName: string;
  approvedByTitle: string;
  beginningBalance: number;
  tenPercentFund: number;
  // General Administration Program
  gaPersonalServices: BudgetLineItem[];
  gaExpected: string;
  gaIndicator: string;
  gaMOOE: BudgetLineItem[];
  gaMooeExpected?: string;
  gaMooeIndicator?: string;
  // SK Youth Development and Empowerment Programs (YDEP)
  ydepPrograms: BudgetYdepProgram[];
  status: "Draft" | "Pending Review" | "Approved";
  updatedAt?: string;
  createdAt?: string;
}



