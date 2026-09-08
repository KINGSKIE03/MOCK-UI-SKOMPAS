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

// Mock Users for Prototype default logins
const MOCK_USERS: Record<string, User> = {
  Chairman: { uid: 'chair-1', email: 'chairman@sk.gov.ph', displayName: 'Hon. Juan Dela Cruz', barangayName: 'Poblacion', status: 'approved' },
  Secretary: { uid: 'sec-1', email: 'secretary@sk.gov.ph', displayName: 'Maria Santos', barangayName: 'Poblacion', status: 'approved' },
  Treasurer: { uid: 'trea-1', email: 'treasurer@sk.gov.ph', displayName: 'Pedro Penduko', barangayName: 'Poblacion', status: 'approved' },
  Admin: { uid: 'admin-1', email: 'dilg@dilg.gov.ph', displayName: 'Dir. Sarah Geronimo', barangayName: 'All', status: 'approved' },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [activeBarangay, setActiveBarangay] = useState<string>("Poblacion");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for persistent session
    const savedUser = localStorage.getItem('sk_mock_user');
    const savedRole = localStorage.getItem('sk_mock_role');
    const savedBarangay = localStorage.getItem('sk_active_barangay');
    
    if (savedUser && savedRole) {
      const parsedUser = JSON.parse(savedUser);
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
    let targetRole: UserRole = "Chairman";
    let targetEmail: string | undefined = undefined;
    let targetPassword: string | undefined = undefined;
    let targetBarangay: string | undefined = undefined;
    let targetDisplayName: string | undefined = undefined;

    if (typeof paramsOrRole === "string" || !paramsOrRole) {
      targetRole = (paramsOrRole as UserRole) || "Chairman";
    } else {
      targetRole = paramsOrRole.role || "Chairman";
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
      }
    }

    // Fallback to default role mock users
    const mockUser = MOCK_USERS[targetRole as keyof typeof MOCK_USERS] || MOCK_USERS.Chairman;
    const finalUser: User = {
      ...mockUser,
      barangayName: targetBarangay || mockUser.barangayName || "Poblacion",
      displayName: targetDisplayName || mockUser.displayName
    };

    setUser(finalUser);
    setRole(targetRole);
    setActiveBarangay(finalUser.barangayName || "Poblacion");
    localStorage.setItem('sk_mock_user', JSON.stringify(finalUser));
    localStorage.setItem('sk_mock_role', targetRole);
    localStorage.setItem('sk_active_barangay', finalUser.barangayName || "Poblacion");
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

