"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { AuthSession } from "@/lib/auth";
import type { BranchPermission } from "@/lib/branch-permissions";

type UserRoleContextValue = {
  userId: string | null;
  role: AuthSession["role"] | null;
  branchId: string | null;
  branchPermissions: BranchPermission[];
};

const UserRoleContext = createContext<UserRoleContextValue | null>(null);

export function UserRoleProvider({
  initialSession,
  initialPermissions = [],
  children,
}: {
  initialSession: AuthSession | null;
  initialPermissions?: BranchPermission[];
  children: ReactNode;
}) {
  const value = useMemo<UserRoleContextValue>(
    () =>
      initialSession
        ? {
            userId: initialSession.id,
            role: initialSession.role,
            branchId: initialSession.branchId,
            branchPermissions: initialPermissions,
          }
        : { userId: null, role: null, branchId: null, branchPermissions: [] },
    [initialSession, initialPermissions]
  );

  return (
    <UserRoleContext.Provider value={value}>{children}</UserRoleContext.Provider>
  );
}

export function useUserRole(): UserRoleContextValue {
  const ctx = useContext(UserRoleContext);
  if (ctx === null) {
    return { userId: null, role: null, branchId: null, branchPermissions: [] };
  }
  return ctx;
}
