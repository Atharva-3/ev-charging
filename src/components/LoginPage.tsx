import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck,
  HardHat,
  Eye,
  CheckCircle2,
  ArrowRight,
  Zap,
  Building2,
  Lock,
  UserCheck,
  KeyRound,
  AlertTriangle,
  Users,
  Plus,
  Search,
  BadgeAlert,
  HelpCircle,
  Database
} from 'lucide-react';
import { UserSession, UserAccount, Site } from '../types';
import {
  loadUserDatabase,
  saveUserDatabase,
  findUserInDatabase,
  authenticateUser,
  registerNewPersonnel,
  INITIAL_USER_ACCOUNTS
} from '../utils/storage';
import { subscribeToUsers, saveUserToCloud } from '../services/firebase';

interface LoginPageProps {
  sites?: Site[];
  onLogin: (session: UserSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ sites = [], onLogin }) => {
  // Authentication form states
  const [identifier, setIdentifier] = useState('controller@vstinfra.in');
  const [pin, setPin] = useState('1234');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Personnel Database & Register modal state
  const [showDatabaseDirectory, setShowDatabaseDirectory] = useState(false);
  const [userDb, setUserDb] = useState<UserAccount[]>(() => loadUserDatabase());
  const [searchQuery, setSearchQuery] = useState('');

  // Register New User form state
  const [isRegistering, setIsRegistering] = useState(false);
  const [newRole, setNewRole] = useState<'manager' | 'worker'>('worker');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newBadge, setNewBadge] = useState('');
  const [newDesignation, setNewDesignation] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newAssignedSiteId, setNewAssignedSiteId] = useState(sites[0]?.id || '');
  const [newPin, setNewPin] = useState('1234');
  const [regSuccessMsg, setRegSuccessMsg] = useState<string | null>(null);

  // Real-time synchronization with Cloud Firestore users collection
  useEffect(() => {
    const unsub = subscribeToUsers((cloudUsers) => {
      if (cloudUsers && cloudUsers.length > 0) {
        setUserDb(cloudUsers);
        saveUserDatabase(cloudUsers);
      }
    });
    return () => unsub();
  }, []);

  // Real-time database lookup as user types identifier
  const matchedUser = useMemo(() => {
    return findUserInDatabase(identifier);
  }, [identifier, userDb]);

  // Handle standard credential form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthenticating(true);

    setTimeout(() => {
      const result = authenticateUser(identifier, pin);
      if (result.success && result.user) {
        onLogin(result.user);
      } else {
        setAuthError(result.error || 'Authentication failed. Check your credentials.');
        setIsAuthenticating(false);
      }
    }, 250);
  };

  // One-click quick login as a specific database user
  const handleQuickLogin = (account: UserAccount) => {
    setIdentifier(account.email);
    setPin(account.passwordPin || '1234');
    setAuthError(null);

    const session: UserSession = {
      ...account,
      loginTime: new Date().toISOString()
    };
    onLogin(session);
  };

  // Handle registering a new user into the database
  const handleRegisterPersonnel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const assignedSite = sites.find(s => s.id === newAssignedSiteId);

    const created = registerNewPersonnel({
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      badgeId: newBadge.trim() || `VST-${newRole === 'manager' ? 'CTRL' : 'WRK'}-${Math.floor(10 + Math.random() * 90)}`,
      passwordPin: newPin.trim() || '1234',
      role: newRole,
      designation: newDesignation.trim() || (newRole === 'manager' ? 'Site Controller' : 'Field Operations Specialist'),
      department: newDept.trim() || (newRole === 'manager' ? 'Supervisory Oversight' : 'Field I&C Execution'),
      assignedSiteId: newRole === 'worker' ? newAssignedSiteId : undefined,
      assignedSiteName: newRole === 'worker' ? assignedSite?.name : undefined
    });

    const refreshed = loadUserDatabase();
    setUserDb(refreshed);
    // Persist to Cloud Firestore
    saveUserToCloud(created);
    setRegSuccessMsg(`Successfully added ${created.name} (${created.role === 'manager' ? 'Site Controller' : 'Field Worker'}) to the database!`);
    setIsRegistering(false);

    // Auto-select the newly created user in form
    setIdentifier(created.email);
    setPin(created.passwordPin);

    // Clear form
    setNewName('');
    setNewEmail('');
    setNewBadge('');
    setNewDesignation('');
    setNewDept('');
  };

  // Filtered users in database explorer
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return userDb;
    const q = searchQuery.toLowerCase();
    return userDb.filter(
      u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.badgeId.toLowerCase().includes(q) ||
        (u.department && u.department.toLowerCase().includes(q)) ||
        (u.assignedSiteName && u.assignedSiteName.toLowerCase().includes(q))
    );
  }, [userDb, searchQuery]);

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Bar */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between pb-5 border-b border-[var(--steel-line)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--ink)] text-white flex items-center justify-center font-bold text-lg font-mono-plex shadow-sm">
            VST
          </div>
          <div>
            <h1 className="font-condensed font-bold text-xl sm:text-2xl text-[var(--ink)] tracking-tight leading-none">
              EV Charging Infrastructure Portal
            </h1>
            <p className="text-xs text-[var(--steel)]">
              Central Personnel Authentication Authority
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="font-mono-plex font-semibold text-[10.5px]">Cloud DB Active</span>
          </div>

          <button
            onClick={() => setShowDatabaseDirectory(prev => !prev)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--steel-line)] bg-white text-xs font-semibold text-[var(--ink)] hover:bg-[var(--paper-raised)] transition-all cursor-pointer shadow-xs"
          >
            <Users className="w-4 h-4 text-[var(--steel)]" />
            <span>Personnel Database ({userDb.length})</span>
          </button>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="max-w-4xl mx-auto w-full my-auto py-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.04] border border-[var(--steel-line)] text-[11px] font-semibold text-[var(--steel)] uppercase tracking-wider mb-3">
            <Lock className="w-3.5 h-3.5 text-[var(--ink)]" />
            <span>Automatic Role Detection Engine</span>
          </div>
          <h2 className="font-condensed font-bold text-3xl sm:text-4xl text-[var(--ink)] tracking-tight">
            Sign In to Your Workspace
          </h2>
          <p className="text-xs sm:text-sm text-[var(--steel)] mt-1.5 leading-relaxed">
            Enter your Email or Employee Badge ID. The database automatically checks whether you are a <strong>Site Controller (Monitoring Manager)</strong> or a <strong>Field Worker (Photo &amp; Checklist Uploads)</strong>.
          </p>
        </div>

        {regSuccessMsg && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>{regSuccessMsg}</span>
            </div>
            <button
              onClick={() => setRegSuccessMsg(null)}
              className="text-green-700 hover:text-green-900 text-xs font-semibold ml-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left: Credential Login Form */}
          <div className="md:col-span-7 bg-[var(--paper-raised)] border border-[var(--steel-line)] rounded-xl p-6 shadow-sm">
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--ink)] uppercase tracking-wider mb-1.5">
                  Email Address or Employee Badge ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={e => {
                      setIdentifier(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    placeholder="e.g. controller@vstinfra.in or VST-WRK-01"
                    className="w-full px-3.5 py-2.5 bg-white border border-[var(--steel-line)] rounded-lg text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] focus:ring-1 focus:ring-[var(--ink)] font-mono-plex"
                  />
                  <div className="absolute right-3 top-3 text-[var(--steel)]">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Automatic Database Match Detection Banner */}
              {matchedUser ? (
                <div
                  className={`p-3 rounded-lg border text-xs transition-all ${
                    matchedUser.role === 'manager'
                      ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
                      : 'bg-amber-50/80 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded bg-white shadow-xs shrink-0 mt-0.5">
                      {matchedUser.role === 'manager' ? (
                        <Eye className="w-4 h-4 text-indigo-700" />
                      ) : (
                        <HardHat className="w-4 h-4 text-amber-700" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">
                          {matchedUser.name}
                        </span>
                        <span
                          className={`font-mono-plex text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            matchedUser.role === 'manager'
                              ? 'bg-indigo-200 text-indigo-900'
                              : 'bg-amber-200 text-amber-900'
                          }`}
                        >
                          {matchedUser.role === 'manager' ? 'Site Controller' : 'Field Worker'}
                        </span>
                      </div>
                      <div className="text-[11px] opacity-80 mt-0.5">
                        {matchedUser.designation}
                        {matchedUser.assignedSiteName && ` • Site: ${matchedUser.assignedSiteName}`}
                      </div>
                      <div className="text-[10px] font-mono-plex opacity-70 mt-0.5">
                        Database Verification: Role automatically identified as{' '}
                        <strong>{matchedUser.role === 'manager' ? 'Site Controller' : 'Field Worker'}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ) : identifier.trim() ? (
                <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[11px] text-[var(--steel)] flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5 shrink-0 text-[var(--steel)]" />
                  <span>
                    No database record matched yet. Try typing <code>controller@vstinfra.in</code> or <code>worker@vstinfra.in</code>
                  </span>
                </div>
              ) : null}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">
                    Security PIN / Password
                  </label>
                  <span className="text-[11px] text-[var(--steel)]">Default PIN: 1234</span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={pin}
                    onChange={e => {
                      setPin(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    placeholder="Enter 4-digit PIN"
                    className="w-full px-3.5 py-2.5 bg-white border border-[var(--steel-line)] rounded-lg text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] focus:ring-1 focus:ring-[var(--ink)] font-mono-plex"
                  />
                  <div className="absolute right-3 top-3 text-[var(--steel)]">
                    <KeyRound className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3 bg-[var(--ink)] text-white text-xs font-semibold rounded-lg hover:bg-[#132029] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isAuthenticating ? (
                  <span>Checking database &amp; authenticating...</span>
                ) : (
                  <>
                    <span>Authenticate &amp; Open Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right: One-Click Quick Login Presets */}
          <div className="md:col-span-5 space-y-4">
            <div className="p-4 bg-white border border-[var(--steel-line)] rounded-xl space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--steel)] flex items-center justify-between">
                <span>1-Click Database Credentials</span>
                <span className="text-[10px] font-mono-plex bg-black/[0.04] px-1.5 py-0.5 rounded text-[var(--steel)]">
                  Instant Test
                </span>
              </div>

              {/* Preset 1: Site Controller */}
              <div
                onClick={() => handleQuickLogin(INITIAL_USER_ACCOUNTS[0])}
                className="p-3 rounded-lg border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-400 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-indigo-700 text-white flex items-center justify-center font-bold text-xs">
                      <Eye className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-indigo-950 group-hover:text-indigo-700 transition-colors">
                        Er. Rakesh Sharma
                      </div>
                      <div className="text-[10px] text-indigo-800/80 font-mono-plex">
                        controller@vstinfra.in • VST-CTRL-01
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold font-mono-plex uppercase px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-900">
                    Controller
                  </span>
                </div>
                <div className="text-[11px] text-indigo-900/80 mt-2 flex items-center justify-between">
                  <span>Monitors workers, approves photos, edits BOQs</span>
                  <span className="font-semibold text-indigo-700 group-hover:underline">Login &rarr;</span>
                </div>
              </div>

              {/* Preset 2: Field Worker */}
              <div
                onClick={() => handleQuickLogin(INITIAL_USER_ACCOUNTS[2])}
                className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-50 hover:border-amber-400 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                      <HardHat className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-amber-950 group-hover:text-amber-800 transition-colors">
                        Sunil Kumar
                      </div>
                      <div className="text-[10px] text-amber-800/80 font-mono-plex">
                        worker@vstinfra.in • VST-WRK-01
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold font-mono-plex uppercase px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                    Worker
                  </span>
                </div>
                <div className="text-[11px] text-amber-900/80 mt-2 flex items-center justify-between">
                  <span>Assigned to Jhotwara EV Hub • Uploads photos</span>
                  <span className="font-semibold text-amber-800 group-hover:underline">Login &rarr;</span>
                </div>
              </div>
            </div>

            {/* Explanatory note */}
            <div className="p-3.5 bg-[var(--paper-raised)] border border-[var(--steel-line)] rounded-xl text-xs text-[var(--steel)] space-y-1.5">
              <div className="font-semibold text-[var(--ink)] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[var(--green)]" />
                <span>Zero-Role-Selection Login</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                The database stores registered staff profiles. When you log in with your email or badge, the backend identifies your role and configures your clearance level automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Database Directory Modal / Section */}
        {showDatabaseDirectory && (
          <div className="mt-8 p-5 bg-white border border-[var(--steel-line)] rounded-xl shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--steel-line)]">
              <div>
                <h3 className="font-condensed font-bold text-lg text-[var(--ink)]">
                  Registered Personnel Database
                </h3>
                <p className="text-xs text-[var(--steel)]">
                  Accounts configured in the database with their respective roles and assigned sites.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[var(--steel)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search personnel..."
                    className="pl-8 pr-3 py-1.5 border border-[var(--steel-line)] rounded-lg text-xs text-[var(--ink)] focus:outline-none"
                  />
                </div>

                <button
                  onClick={() => setIsRegistering(prev => !prev)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--ink)] text-white text-xs font-semibold rounded-lg hover:bg-[#132029] transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Personnel</span>
                </button>
              </div>
            </div>

            {/* Registration Form (Collapsible) */}
            {isRegistering && (
              <form onSubmit={handleRegisterPersonnel} className="p-4 bg-gray-50 border border-[var(--steel-line)] rounded-lg space-y-3">
                <div className="font-semibold text-xs text-[var(--ink)] uppercase tracking-wider">
                  Register New Person into Database
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--steel)] uppercase mb-1">
                      Personnel Role *
                    </label>
                    <select
                      value={newRole}
                      onChange={e => setNewRole(e.target.value as 'manager' | 'worker')}
                      className="w-full px-2.5 py-1.5 bg-white border border-[var(--steel-line)] rounded text-xs text-[var(--ink)] font-semibold"
                    >
                      <option value="worker">Field Worker (Upload photos, mark progress)</option>
                      <option value="manager">Site Controller (Monitor workers, manage BOQ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--steel)] uppercase mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      placeholder="e.g. Rajesh Meena"
                      className="w-full px-2.5 py-1.5 bg-white border border-[var(--steel-line)] rounded text-xs text-[var(--ink)]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--steel)] uppercase mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                      placeholder="e.g. rajesh.meena@vstinfra.in"
                      className="w-full px-2.5 py-1.5 bg-white border border-[var(--steel-line)] rounded text-xs text-[var(--ink)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--steel)] uppercase mb-1">
                      Badge ID
                    </label>
                    <input
                      type="text"
                      value={newBadge}
                      onChange={e => setNewBadge(e.target.value)}
                      placeholder="e.g. VST-WRK-05"
                      className="w-full px-2.5 py-1.5 bg-white border border-[var(--steel-line)] rounded text-xs text-[var(--ink)] font-mono-plex"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--steel)] uppercase mb-1">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={newDesignation}
                      onChange={e => setNewDesignation(e.target.value)}
                      placeholder="e.g. Electrical I&C Specialist"
                      className="w-full px-2.5 py-1.5 bg-white border border-[var(--steel-line)] rounded text-xs text-[var(--ink)]"
                    />
                  </div>

                  {newRole === 'worker' ? (
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--steel)] uppercase mb-1">
                        Assigned Site
                      </label>
                      <select
                        value={newAssignedSiteId}
                        onChange={e => setNewAssignedSiteId(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-[var(--steel-line)] rounded text-xs text-[var(--ink)]"
                      >
                        {sites.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--steel)] uppercase mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        value={newDept}
                        onChange={e => setNewDept(e.target.value)}
                        placeholder="e.g. Commissioning & Quality"
                        className="w-full px-2.5 py-1.5 bg-white border border-[var(--steel-line)] rounded text-xs text-[var(--ink)]"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="px-3 py-1.5 text-xs text-[var(--steel)] hover:text-[var(--ink)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[var(--ink)] text-white text-xs font-semibold rounded hover:bg-[#132029] cursor-pointer"
                  >
                    Save into Personnel Database
                  </button>
                </div>
              </form>
            )}

            {/* Users Table */}
            <div className="overflow-x-auto border border-[var(--steel-line)] rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-black/[0.02] border-b border-[var(--steel-line)]">
                    <th className="p-3 font-semibold text-[var(--steel)] uppercase text-[10px]">Name &amp; Badge</th>
                    <th className="p-3 font-semibold text-[var(--steel)] uppercase text-[10px]">Email / Identifier</th>
                    <th className="p-3 font-semibold text-[var(--steel)] uppercase text-[10px]">Database Role</th>
                    <th className="p-3 font-semibold text-[var(--steel)] uppercase text-[10px]">Designation &amp; Assignment</th>
                    <th className="p-3 font-semibold text-[var(--steel)] uppercase text-[10px] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--steel-line)]">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-black/[0.01] transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-[var(--ink)]">{user.name}</div>
                        <div className="font-mono-plex text-[10px] text-[var(--steel)]">{user.badgeId}</div>
                      </td>
                      <td className="p-3 font-mono-plex text-xs text-[var(--ink)]">
                        {user.email}
                      </td>
                      <td className="p-3">
                        <span
                          className={`font-mono-plex text-[10px] uppercase font-bold px-2 py-0.5 rounded inline-block ${
                            user.role === 'manager'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {user.role === 'manager' ? 'Site Controller' : 'Field Worker'}
                        </span>
                      </td>
                      <td className="p-3 text-[var(--steel)]">
                        <div>{user.designation}</div>
                        {user.assignedSiteName && (
                          <div className="text-[11px] text-[var(--ink)] font-medium">
                            Site: {user.assignedSiteName}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleQuickLogin(user)}
                          className="px-2.5 py-1 rounded bg-[var(--ink)] text-white text-[11px] font-semibold hover:bg-[#132029] transition-colors cursor-pointer"
                        >
                          Sign In As
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full pt-6 border-t border-[var(--steel-line)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--steel)]">
        <div>
          &copy; {new Date().getFullYear()} VST EV Infrastructure Management System • Central Access Control
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)]"></span>
            Role-Based Authorization Engine Active
          </span>
        </div>
      </footer>
    </div>
  );
};
