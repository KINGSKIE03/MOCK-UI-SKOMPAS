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

