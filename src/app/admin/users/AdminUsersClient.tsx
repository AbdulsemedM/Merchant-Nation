"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUsersForAdmin, getTeamsForAdmin, getBranchesForAdmin, createUser, updateUserRole, updateUser, resetUserPassword, transferPlayerBranch, getTransferBlockers } from "@/app/actions/users";
import { grantDelegation, revokeDelegation, getDelegationGrantsForUser } from "@/app/actions/delegation";
import { BRANCH_PERMISSIONS, BRANCH_PERMISSION_LABELS, type BranchPermission } from "@/lib/branch-permissions";
import type { CreateUserData } from "@/app/actions/users";
import type { Role } from "@/lib/auth";
import { PortalLoadingInline } from "@/components/ui/portal-loading";
import { ErrorAlert } from "@/components/ui/error-alert";
import { getUserFacingErrorMessage } from "@/lib/errors";

type UserRow = {
  id: string;
  name: string;
  role: string;
  teamName: string | null;
  branchName: string | null;
  teamId?: string | null;
  branchId?: string | null;
};

type TeamOption = {
  id: string;
  name: string;
  branchId: string | null;
  branchName: string | null;
};

type BranchOption = {
  id: string;
  branchCode: string | null;
  companyName: string;
};

export function AdminUsersClient({
  initialUsers,
  totalUsers: initialTotal,
  usersLimit = 20,
  callerRole,
  callerBranchId,
  branchIdFromUrl,
}: {
  initialUsers: UserRow[];
  totalUsers: number;
  usersLimit?: number;
  callerRole: Role;
  callerBranchId?: string | null;
  branchIdFromUrl?: string | null;
}) {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [totalUsers, setTotalUsers] = useState(initialTotal);
  const [page, setPage] = useState(0);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<Role | "">("");
  const [editProfileUserId, setEditProfileUserId] = useState<string | null>(null);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [delegateUserId, setDelegateUserId] = useState<string | null>(null);
  const [transferUserId, setTransferUserId] = useState<string | null>(null);

  const refetch = async (pageOffset = 0) => {
    setLoading(true);
    try {
      const result = await getUsersForAdmin(branchIdFromUrl ?? undefined, {
        limit: usersLimit,
        offset: pageOffset,
      });
      setUsers(result.users);
      setTotalUsers(result.total);
      setPage(Math.floor(pageOffset / usersLimit));
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (newPage: number) => {
    if (newPage < 0 || newPage >= Math.ceil(totalUsers / usersLimit)) return;
    refetch(newPage * usersLimit);
  };

  useEffect(() => {
    setUsers(initialUsers);
    setTotalUsers(initialTotal);
    setPage(0);
  }, [branchIdFromUrl]);

  useEffect(() => {
    getTeamsForAdmin(branchIdFromUrl ?? undefined, { limit: 500, offset: 0 }).then((r) => setTeams(r.teams)).catch(() => setTeams([]));
    getBranchesForAdmin().then(setBranches).catch(() => setBranches([]));
  }, [branchIdFromUrl]);

  const isAdmin = callerRole === "ADMIN";
  const canManageUsers =
    callerRole === "ADMIN" || callerRole === "BRANCH_MANAGER" || callerRole === "TEAM_LEAD";
  const canDelegate = callerRole === "ADMIN" || callerRole === "BRANCH_MANAGER";
  const canTransfer = callerRole === "ADMIN" || callerRole === "BRANCH_MANAGER";
  const effectiveBranchId = branchIdFromUrl ?? callerBranchId ?? null;

  return (
    <div className="flex flex-col gap-6 p-4">
      {callerRole === "ADMIN" && branchIdFromUrl && (
        <p className="text-sm text-muted-foreground">
          <Link href="/admin/users" className="hover:text-foreground">← Back to branch list</Link>
        </p>
      )}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="font-mono">Users</CardTitle>
          {canManageUsers && (
            <Button onClick={() => setCreateOpen(true)} className="font-mono">
              Create User
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="min-h-[120px]">
              <PortalLoadingInline className="min-h-[120px]" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground text-sm">No users found.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {users.map((u) => (
                <div key={u.id} className="flex flex-col gap-2">
                <div
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card/50 p-3 font-mono text-sm"
                >
                  <div>
                    <span className="text-foreground">{u.name}</span>
                    <span className="ml-2 text-primary">{u.role}</span>
                    {(u.teamName || u.branchName) && (
                      <span className="ml-2 text-muted-foreground">
                        · {[u.teamName, u.branchName].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      {editUserId === u.id ? (
                        <>
                          <Select
                            value={editRole}
                            onValueChange={(v) => setEditRole(v as Role)}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PLAYER">PLAYER</SelectItem>
                              <SelectItem value="BRANCH_MANAGER">BRANCH_MANAGER</SelectItem>
                              <SelectItem value="ADMIN">ADMIN</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            disabled={!editRole || editRole === u.role}
                            onClick={async () => {
                              if (!editRole || editRole === u.role) return;
                              try {
                                await updateUserRole(u.id, editRole);
                                setEditUserId(null);
                                setEditRole("");
                                await refetch(page * usersLimit);
                              } catch (e) {
                                console.error(e);
                              }
                            }}
                          >
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setEditUserId(null); setEditRole(""); }}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setEditUserId(u.id); setEditRole(u.role as Role); }}
                        >
                          Edit Role
                        </Button>
                      )}
                    </div>
                  )}
                  {canManageUsers && editUserId !== u.id && editProfileUserId !== u.id && resetPasswordUserId !== u.id && delegateUserId !== u.id && transferUserId !== u.id && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditProfileUserId(u.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setResetPasswordUserId(u.id)}
                      >
                        Reset password
                      </Button>
                      {canDelegate && (u.role === "PLAYER" || u.role === "TEAM_LEAD") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDelegateUserId(u.id)}
                        >
                          {u.role === "TEAM_LEAD" ? "Delegation" : "Make team lead"}
                        </Button>
                      )}
                      {canTransfer && (u.role === "PLAYER" || u.role === "TEAM_LEAD") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setTransferUserId(u.id)}
                        >
                          Transfer
                        </Button>
                      )}
                    </div>
                  )}
                  </div>
                </div>
                {editProfileUserId === u.id && (
                  <EditProfileForm
                    user={u}
                    teams={teams}
                    onSave={async () => {
                      setEditProfileUserId(null);
                      await refetch(page * usersLimit);
                    }}
                    onCancel={() => setEditProfileUserId(null)}
                  />
                )}
                {resetPasswordUserId === u.id && (
                  <ResetPasswordForm
                    userId={u.id}
                    userName={u.name}
                    onSuccess={async () => {
                      setResetPasswordUserId(null);
                      await refetch(page * usersLimit);
                    }}
                    onCancel={() => setResetPasswordUserId(null)}
                  />
                )}
                {delegateUserId === u.id && effectiveBranchId && (
                  <DelegationForm
                    user={u}
                    branchId={effectiveBranchId}
                    teams={teams}
                    onSuccess={async () => {
                      setDelegateUserId(null);
                      await refetch(page * usersLimit);
                    }}
                    onCancel={() => setDelegateUserId(null)}
                  />
                )}
                {transferUserId === u.id && (
                  <TransferPlayerForm
                    user={u}
                    branches={branches}
                    teams={teams}
                    currentBranchId={u.branchId ?? effectiveBranchId}
                    onSuccess={async () => {
                      setTransferUserId(null);
                      await refetch(page * usersLimit);
                    }}
                    onCancel={() => setTransferUserId(null)}
                  />
                )}
                </div>
              ))}
            </div>
          )}
          {totalUsers > usersLimit && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
              <span className="font-mono text-xs text-muted-foreground">
                Page {page + 1} of {Math.ceil(totalUsers / usersLimit)} ({totalUsers} total)
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 0 || loading}
                  onClick={() => goToPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= Math.ceil(totalUsers / usersLimit) - 1 || loading}
                  onClick={() => goToPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {createOpen && (
        <CreateUserForm
          callerRole={callerRole}
          teams={teams}
          branches={branches}
          branchIdFromUrl={branchIdFromUrl}
          onClose={() => setCreateOpen(false)}
          onSuccess={async () => {
            setCreateOpen(false);
            await refetch(page * usersLimit);
          }}
        />
      )}
    </div>
  );
}

function EditProfileForm({
  user,
  teams,
  onSave,
  onCancel,
}: {
  user: UserRow;
  teams: TeamOption[];
  onSave: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = teams.find((x) => x.name === user.teamName);
    setTeamId(t?.id ?? null);
  }, [teams, user.teamName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await updateUser(user.id, { name: name.trim(), teamId });
      onSave();
    } catch (e) {
      setError(getUserFacingErrorMessage(e, "Failed to update user."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2 rounded-lg border border-border bg-muted/30 p-3">
      <ErrorAlert message={error} />
      <div className="grid gap-1">
        <Label className="text-xs">Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9 font-mono" required />
      </div>
      {teams.length > 0 && (
        <div className="grid gap-1">
          <Label className="text-xs">Team</Label>
          <Select value={teamId ?? ""} onValueChange={(v) => setTeamId(v || null)}>
            <SelectTrigger className="h-9 w-40">
              <SelectValue placeholder="Team" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <Button size="sm" type="submit" disabled={submitting}>Save</Button>
      <Button size="sm" type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
    </form>
  );
}

function ResetPasswordForm({
  userId,
  userName,
  onSuccess,
  onCancel,
}: {
  userId: string;
  userName: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await resetUserPassword(userId, password);
      if (!res.ok) throw new Error(res.error);
      onSuccess();
    } catch (e) {
      setError(getUserFacingErrorMessage(e, "Failed to reset password."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2 rounded-lg border border-border bg-muted/30 p-3">
      <ErrorAlert message={error} />
      <div className="grid gap-1">
        <Label className="text-xs">New password for {userName}</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-9 font-mono"
          placeholder="New password"
          required
          minLength={6}
        />
      </div>
      <Button size="sm" type="submit" disabled={submitting || !password}>Reset password</Button>
      <Button size="sm" type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
    </form>
  );
}

function CreateUserForm({
  callerRole,
  teams,
  branches,
  branchIdFromUrl,
  onClose,
  onSuccess,
}: {
  callerRole: Role;
  teams: TeamOption[];
  branches: BranchOption[];
  branchIdFromUrl?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("PLAYER");
  const [teamId, setTeamId] = useState<string | null>(null);
  const [branchId, setBranchId] = useState<string | null>(branchIdFromUrl ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [branchSearch, setBranchSearch] = useState("");

  useEffect(() => {
    if (branchIdFromUrl != null) setBranchId(branchIdFromUrl);
  }, [branchIdFromUrl]);

  const filteredBranches = useMemo(() => {
    const q = branchSearch.trim().toLowerCase();
    if (!q) return branches;
    return branches.filter(
      (b) =>
        b.companyName.toLowerCase().includes(q) ||
        (b.branchCode?.toLowerCase().includes(q) ?? false)
    );
  }, [branches, branchSearch]);

  const contextBranch = useMemo(
    () => (branchIdFromUrl ? branches.find((b) => b.id === branchIdFromUrl) : null),
    [branches, branchIdFromUrl]
  );

  const isAdmin = callerRole === "ADMIN";
  const showBranchPicker =
    role === "BRANCH_MANAGER" && isAdmin && !branchIdFromUrl && branches.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const data: CreateUserData = {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        teamId: teamId || undefined,
      };
      if (isAdmin && role !== "ADMIN") {
        data.branchId = branchIdFromUrl ?? branchId ?? undefined;
      }
      await createUser(data);
      onSuccess();
    } catch (e) {
      setError(getUserFacingErrorMessage(e, "Failed to create user."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-mono">Create User</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <ErrorAlert message={error} />
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="User name"
              required
              className="font-mono"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              className="font-mono"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters (user must change on first login)"
              required
              minLength={6}
              className="font-mono"
              autoComplete="new-password"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as Role)}
            >
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLAYER">PLAYER</SelectItem>
                {isAdmin && (
                  <>
                    <SelectItem value="BRANCH_MANAGER">BRANCH_MANAGER</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          {teams.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="team">Team (optional)</Label>
              <Select value={teamId ?? ""} onValueChange={(v) => setTeamId(v || null)}>
                <SelectTrigger id="team">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} {t.branchName ? `· ${t.branchName}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {role === "BRANCH_MANAGER" && isAdmin && branchIdFromUrl && contextBranch && (
            <div className="grid gap-2">
              <Label>Branch</Label>
              <p className="font-mono text-sm text-muted-foreground">
                {contextBranch.companyName}
                {contextBranch.branchCode ? ` (${contextBranch.branchCode})` : ""}
              </p>
            </div>
          )}
          {showBranchPicker && (
            <div className="grid gap-2">
              <Label htmlFor="branch-search">Search branch</Label>
              <Input
                id="branch-search"
                type="search"
                placeholder="Type to filter by name or code…"
                value={branchSearch}
                onChange={(e) => setBranchSearch(e.target.value)}
                className="font-mono"
              />
              <Label htmlFor="branch">Branch</Label>
              <Select value={branchId ?? ""} onValueChange={(v) => setBranchId(v || null)}>
                <SelectTrigger id="branch">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {filteredBranches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.companyName} {b.branchCode ? `(${b.branchCode})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting || !name.trim() || !email.trim() || password.length < 6}>
              {submitting ? "Creating…" : "Create"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function DelegationForm({
  user,
  branchId,
  teams,
  onSuccess,
  onCancel,
}: {
  user: UserRow;
  branchId: string;
  teams: TeamOption[];
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [permissions, setPermissions] = useState<BranchPermission[]>([]);
  const [teamId, setTeamId] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loadingGrants, setLoadingGrants] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadingGrants(true);
    getDelegationGrantsForUser(user.id, branchId)
      .then((grants) => {
        if (cancelled) return;
        setPermissions(grants.map((g) => g.permission));
        const scoped = grants.find((g) => g.teamScopeKey)?.teamScopeKey;
        if (scoped) setTeamId(scoped);
      })
      .catch(() => {
        if (!cancelled) setPermissions([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingGrants(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user.id, branchId]);

  const togglePermission = (p: BranchPermission) => {
    setPermissions((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleSave = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await grantDelegation({
        userId: user.id,
        permissions,
        teamId: teamId || null,
        expiresAt: expiresAt || null,
      });
      if (!res.ok) throw new Error(res.error);
      onSuccess();
    } catch (e) {
      setError(getUserFacingErrorMessage(e, "Failed to save delegation."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await revokeDelegation(user.id);
      if (!res.ok) throw new Error(res.error);
      onSuccess();
    } catch (e) {
      setError(getUserFacingErrorMessage(e, "Failed to revoke delegation."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="mb-3 font-mono text-sm text-foreground">
        Delegation for <span className="text-primary">{user.name}</span>
      </p>
      <ErrorAlert message={error} />
      {loadingGrants ? (
        <PortalLoadingInline className="min-h-[60px]" />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            {BRANCH_PERMISSIONS.map((p) => (
              <label key={p} className="flex cursor-pointer items-center gap-2 font-mono text-sm">
                <input
                  type="checkbox"
                  checked={permissions.includes(p)}
                  onChange={() => togglePermission(p)}
                  className="rounded border-border"
                />
                {BRANCH_PERMISSION_LABELS[p]}
              </label>
            ))}
          </div>
          {teams.length > 0 && (
            <div className="grid gap-1">
              <Label className="text-xs">Team scope (optional)</Label>
              <Select value={teamId || "__all__"} onValueChange={(v) => setTeamId(v === "__all__" ? "" : v)}>
                <SelectTrigger className="h-9 w-full max-w-xs">
                  <SelectValue placeholder="Whole branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Whole branch</SelectItem>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid gap-1">
            <Label className="text-xs">Expires (optional)</Label>
            <Input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="h-9 max-w-xs font-mono"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={submitting || permissions.length === 0} onClick={handleSave}>
              Save delegation
            </Button>
            {user.role === "TEAM_LEAD" && (
              <Button size="sm" variant="destructive" disabled={submitting} onClick={handleRevoke}>
                Revoke all
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function TransferPlayerForm({
  user,
  branches,
  teams,
  currentBranchId,
  onSuccess,
  onCancel,
}: {
  user: UserRow;
  branches: BranchOption[];
  teams: TeamOption[];
  currentBranchId?: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [toBranchId, setToBranchId] = useState("");
  const [toTeamId, setToTeamId] = useState("");
  const [reason, setReason] = useState("");
  const [blockers, setBlockers] = useState<{ openTaskCount: number; ownedZoneCount: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTransferBlockers(user.id).then(setBlockers).catch(() => setBlockers(null));
  }, [user.id]);

  const destBranches = branches.filter((b) => b.id !== currentBranchId);
  const destTeams = teams.filter((t) => t.branchId === toBranchId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toBranchId) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await transferPlayerBranch({
        userId: user.id,
        toBranchId,
        toTeamId: toTeamId || null,
        reason: reason.trim() || null,
      });
      if (!res.ok) throw new Error(res.error);
      onSuccess();
    } catch (err) {
      setError(getUserFacingErrorMessage(err, "Transfer failed."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="mb-2 font-mono text-sm">
        Transfer <span className="text-primary">{user.name}</span> to another branch (XP preserved)
      </p>
      <ErrorAlert message={error} />
      {blockers && (blockers.openTaskCount > 0 || blockers.ownedZoneCount > 0) && (
        <p className="mb-2 text-xs text-amber-600 dark:text-amber-400">
          {blockers.openTaskCount > 0 && `${blockers.openTaskCount} open task(s). `}
          {blockers.ownedZoneCount > 0 && `${blockers.ownedZoneCount} owned zone(s) will be released. `}
          Open tasks block transfer.
        </p>
      )}
      <div className="flex flex-col gap-3">
        <div className="grid gap-1">
          <Label className="text-xs">Destination branch</Label>
          <Select value={toBranchId} onValueChange={(v) => { setToBranchId(v); setToTeamId(""); }}>
            <SelectTrigger className="h-9 max-w-md">
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              {destBranches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.companyName} {b.branchCode ? `(${b.branchCode})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {destTeams.length > 0 && (
          <div className="grid gap-1">
            <Label className="text-xs">Destination team (optional)</Label>
            <Select value={toTeamId || "__none__"} onValueChange={(v) => setToTeamId(v === "__none__" ? "" : v)}>
              <SelectTrigger className="h-9 max-w-md">
                <SelectValue placeholder="No team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No team</SelectItem>
                {destTeams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="grid gap-1">
          <Label className="text-xs">Reason (optional)</Label>
          <Input value={reason} onChange={(e) => setReason(e.target.value)} className="h-9 max-w-md font-mono" />
        </div>
        <p className="text-xs text-muted-foreground">Player should sign out and back in to see their new branch.</p>
        <div className="flex gap-2">
          <Button
            size="sm"
            type="submit"
            disabled={submitting || !toBranchId || (blockers?.openTaskCount ?? 0) > 0}
          >
            Transfer
          </Button>
          <Button size="sm" type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </form>
  );
}
