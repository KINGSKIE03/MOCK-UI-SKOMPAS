import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserRole } from '../../types';
import { getBarangayAccounts } from '../../lib/barangayStore';

export interface User {
  id?: string;
  uid: string;
  email: string | null;
  displayName: string | null;
  barangayName?: string;
  status?: string;
}

interface SignInParams {
  role?: UserRole;
  email?: string;
  password?: string;
  barangayName?: string;
  displayName?: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
  signIn: (paramsOrRole?: UserRole | SignInParams) => Promise<void>;
  logout: () => Promise<void>;
  updateRole: (role: UserRole) => Promise<void>;
  activeBarangay: string;
  setActiveBarangay: (bgy: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock Users for Prototype default logins: Only LYDO remains active
const MOCK_USERS: Record<string, User> = {
  Admin: { 
    uid: 'admin-1', 
    email: 'dilg@dilg.gov.ph', 
    displayName: 'Municipal LYDO Officer', 
    barangayName: 'All', 
    status: 'approved' 
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [activeBarangay, setActiveBarangay] = useState<string>("Laak / Laac (Poblacion)");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for persistent session
    const savedUser = localStorage.getItem('sk_mock_user');
    const savedRole = localStorage.getItem('sk_mock_role');
    const savedBarangay = localStorage.getItem('sk_active_barangay');
    
    if (savedUser && savedRole) {
      const parsedUser = JSON.parse(savedUser);
      // If the saved user is a non-admin whose barangay is not registered, logout
      if (savedRole !== "Admin") {
        const accounts = getBarangayAccounts();
        const accountValid = accounts.some(a => a.id === parsedUser.uid && a.status === "approved");
        if (!accountValid) {
          localStorage.removeItem('sk_mock_user');
          localStorage.removeItem('sk_mock_role');
          localStorage.removeItem('sk_active_barangay');
          setUser(null);
          setRole(null);
          setLoading(false);
          return;
        }
      }

      setUser(parsedUser);
      setRole(savedRole as UserRole);
      if (parsedUser.barangayName) {
        setActiveBarangay(parsedUser.barangayName);
      } else if (savedBarangay) {
        setActiveBarangay(savedBarangay);
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (paramsOrRole?: UserRole | SignInParams) => {
    // Determine if argument is string role or object
    let targetRole: UserRole = "Admin";
    let targetEmail: string | undefined = undefined;
    let targetPassword: string | undefined = undefined;
    let targetBarangay: string | undefined = undefined;
    let targetDisplayName: string | undefined = undefined;

    if (typeof paramsOrRole === "string" || !paramsOrRole) {
      targetRole = (paramsOrRole as UserRole) || "Admin";
    } else {
      targetRole = paramsOrRole.role || "Admin";
      targetEmail = paramsOrRole.email;
      targetPassword = paramsOrRole.password;
      targetBarangay = paramsOrRole.barangayName;
      targetDisplayName = paramsOrRole.displayName;
    }

    // Check if email was provided and search in registered barangay accounts
    if (targetEmail && targetRole !== "Admin") {
      const accounts = getBarangayAccounts();
      const matched = accounts.find(a => a.email.toLowerCase() === targetEmail.toLowerCase());

      if (matched) {
        if (targetPassword && matched.password && matched.password !== targetPassword) {
          throw new Error("Incorrect passcode for this barangay account.");
        }

        if (matched.status === "pending") {
          throw new Error(`Your account for Barangay ${matched.barangayName} is currently awaiting approval by the Municipal LYDO Officer before you can log in.`);
        }

        if (matched.status === "rejected") {
          throw new Error(`Your account registration was rejected by LYDO. Reason: ${matched.rejectionReason || "Incomplete verification"}. Please contact the municipal office.`);
        }

        // Account is approved!
        const customUser: User = {
          uid: matched.id,
          email: matched.email,
          displayName: matched.officerName,
          barangayName: matched.barangayName,
          status: matched.status
        };

        setUser(customUser);
        setRole(matched.role);
        setActiveBarangay(matched.barangayName);
        localStorage.setItem('sk_mock_user', JSON.stringify(customUser));
        localStorage.setItem('sk_mock_role', matched.role);
        localStorage.setItem('sk_active_barangay', matched.barangayName);
        return;
      } else {
        throw new Error(`No approved account found for ${targetEmail}. All barangay accounts have been reset. Please register your account for your barangay in Laak, Davao de Oro.`);
      }
    }

    // Admin (LYDO) Login
    if (targetRole === "Admin") {
      const adminUser: User = {
        uid: 'admin-1',
        email: targetEmail || 'dilg@dilg.gov.ph',
        displayName: 'Municipal LYDO Officer',
        barangayName: 'All',
        status: 'approved'
      };
      setUser(adminUser);
      setRole("Admin");
      setActiveBarangay("All");
      localStorage.setItem('sk_mock_user', JSON.stringify(adminUser));
      localStorage.setItem('sk_mock_role', 'Admin');
      localStorage.setItem('sk_active_barangay', 'All');
      return;
    }

    // Non-admin without matched account cannot log in
    throw new Error("All barangay accounts have been reset. Only the Municipal LYDO Officer is currently active. Please use the Register Account tab to submit your barangay credentials.");
  };

  const logout = async () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('sk_mock_user');
    localStorage.removeItem('sk_mock_role');
    localStorage.removeItem('sk_active_barangay');
  };

  const updateRole = async (newRole: UserRole) => {
    if (!newRole) return;
    const mockUser = MOCK_USERS[newRole as keyof typeof MOCK_USERS];
    const updatedUser = {
      ...mockUser,
      barangayName: activeBarangay
    };
    setUser(updatedUser);
    setRole(newRole);
    localStorage.setItem('sk_mock_user', JSON.stringify(updatedUser));
    localStorage.setItem('sk_mock_role', newRole);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      role, 
      loading, 
      signIn, 
      logout, 
      updateRole, 
      activeBarangay, 
      setActiveBarangay: (bgy: string) => {
        setActiveBarangay(bgy);
        localStorage.setItem('sk_active_barangay', bgy);
      }
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

