import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, Copy, Check, KeyRound } from 'lucide-react';
import { useNexus } from '../context/NexusContext';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const { navigate, login, registerUser, signInWithGoogle, users } = useNexus();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Clean empty inputs (no auto-prefills)
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Organizer test credentials
  const organizerUser = users.find((u) => u.role === 'organizer');
  const organizerEmail = organizerUser?.email || 'organizer@drmcitclub.org';
  const organizerPassword = organizerUser?.password || 'NexusAdmin2026!';
  const [copiedKey, setCopiedKey] = useState<'email' | 'password' | null>(null);

  const handleCopy = (text: string, key: 'email' | 'password') => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleApplyOrganizer = () => {
    setMode('login');
    setEmailOrId(organizerEmail);
    setPassword(organizerPassword);
    setError(null);
  };

  // Participant registration fields
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [phone, setPhone] = useState('+880 17');
  const [studentId, setStudentId] = useState('DRMC-26-');
  const [institution, setInstitution] = useState('Dhaka Residential Model College');
  const [department, setDepartment] = useState('Class XII · Science');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!emailOrId.trim()) {
      setError('Please provide your email address or account ID.');
      return;
    }
    if (!password) {
      setError('Please enter your account password.');
      return;
    }
    const res = login(emailOrId.trim(), password);
    if (!res.ok) {
      setError(res.error || 'Invalid credentials. Please verify your email/ID and password.');
      return;
    }
    if (res.user?.role === 'organizer') {
      navigate('/admin');
    } else {
      navigate('/my-registrations');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !regEmail.trim() || !studentId.trim()) {
      setError('Please complete all required participant profile fields.');
      return;
    }
    const res = registerUser({
      fullName: fullName.trim(),
      email: regEmail.trim(),
      password: regPassword.trim() || undefined,
      phone: phone.trim(),
      studentId: studentId.trim().toUpperCase(),
      institution: institution.trim(),
      department: department.trim(),
      role: 'participant',
    });
    if (!res.ok) {
      setError(res.error || 'Could not create participant account.');
      return;
    }
    navigate('/my-registrations');
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Centered Login / Register Card */}
      <div className="w-full max-w-lg bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div>
            <p className="font-display text-lg font-bold text-zinc-950">NEXUS</p>
            <p className="text-xs text-zinc-500">Smart Club Operations · DRMC IT Club</p>
          </div>
          <div className="inline-flex p-1 bg-zinc-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                mode === 'login' ? 'bg-white text-zinc-950 shadow-2xs' : 'text-zinc-600'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                mode === 'register' ? 'bg-white text-zinc-950 shadow-2xs' : 'text-zinc-600'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-medium">
            {error}
          </div>
        )}

        {/* Organizer Credentials Box - Only for test purpose */}
        <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-800 shrink-0" />
              <span className="text-xs font-bold text-zinc-900">
                Organizer Test Credentials
              </span>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wide bg-amber-200 text-amber-950 border border-amber-300/80 shadow-2xs">
              only for test purpose
            </span>
          </div>

          <p className="text-xs text-zinc-600">
            Use this organizer account to access the administrative control desks, fest management, and operations workspace.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="bg-white/95 border border-amber-200 rounded-lg p-2.5 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-zinc-500">Organizer Email</span>
                <button
                  type="button"
                  onClick={() => handleCopy(organizerEmail, 'email')}
                  className="text-[11px] text-amber-800 hover:text-amber-950 font-medium cursor-pointer inline-flex items-center gap-1 transition-colors"
                  title="Copy email"
                >
                  {copiedKey === 'email' ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Copied
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5">
                      <Copy className="w-3 h-3" /> Copy
                    </span>
                  )}
                </button>
              </div>
              <code className="font-mono text-xs font-semibold text-zinc-900 select-all break-all">
                {organizerEmail}
              </code>
            </div>

            <div className="bg-white/95 border border-amber-200 rounded-lg p-2.5 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-zinc-500">Organizer Password</span>
                <button
                  type="button"
                  onClick={() => handleCopy(organizerPassword, 'password')}
                  className="text-[11px] text-amber-800 hover:text-amber-950 font-medium cursor-pointer inline-flex items-center gap-1 transition-colors"
                  title="Copy password"
                >
                  {copiedKey === 'password' ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Copied
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5">
                      <Copy className="w-3 h-3" /> Copy
                    </span>
                  )}
                </button>
              </div>
              <code className="font-mono text-xs font-semibold text-zinc-900 select-all">
                {organizerPassword}
              </code>
            </div>
          </div>

          <div className="pt-0.5">
            <button
              type="button"
              onClick={handleApplyOrganizer}
              className="w-full py-1.5 px-3 text-xs font-semibold text-amber-950 bg-amber-200 hover:bg-amber-300 border border-amber-300 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Fill Organizer Credentials</span>
            </button>
          </div>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-zinc-950">
                Sign in to NEXUS
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                Enter your credentials below. Organizers unlock administrative desks; participants access personal passes.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
                Email Address or Account ID
              </label>
              <input
                type="text"
                required
                autoFocus
                value={emailOrId}
                onChange={(e) => setEmailOrId(e.target.value)}
                placeholder="Enter your email address or account ID"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-800">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 pr-10 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors p-1 cursor-pointer focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 text-sm font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            >
              Sign In
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-zinc-500">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                setError(null);
                const res = await signInWithGoogle();
                if (!res.ok) {
                  setError(res.error || 'Failed to sign in with Google');
                } else {
                  navigate('/fests');
                }
              }}
              className="w-full py-2.5 px-4 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-300 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-zinc-950">
                Create Participant Profile
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                Register as a competition participant to manage event registrations and digital passes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Raihan Kabir"
                  className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Student ID *
                </label>
                <input
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-zinc-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-zinc-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Institution *
                </label>
                <input
                  type="text"
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Class / Department
                </label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Account Password (Optional)
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a password for your participant account"
                    className="w-full px-3 py-2 pr-10 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors p-1 cursor-pointer focus:outline-none"
                    aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                    title={showRegPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors cursor-pointer"
            >
              Create Participant Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
