import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useNexus } from '../context/NexusContext';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const { navigate, login, registerUser, switchDemoRole, currentUser } = useNexus();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  const [email, setEmail] = useState('organizer@drmcitclub.org');
  const [password, setPassword] = useState('NexusAdmin2026!');
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [phone, setPhone] = useState('+880 1711-');
  const [studentId, setStudentId] = useState('DRMC-26-');
  const [institution, setInstitution] = useState('Dhaka Residential Model College');
  const [department, setDepartment] = useState('Class XII · Science');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = login(email, password);
    if (!res.ok) {
      setError(res.error || 'Invalid credentials.');
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
      phone: phone.trim(),
      studentId: studentId.trim().toUpperCase(),
      institution: institution.trim(),
      department: department.trim(),
      role: 'participant',
    });
    if (!res.ok) {
      setError(res.error || 'Could not create account.');
      return;
    }
    navigate('/fests');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 space-y-6">
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

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-zinc-950">
                  Sign in to your account
                </h1>
                <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                  Access your registered event passes or manage club operations.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 text-sm font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-zinc-950">
                  Create Participant Profile
                </h1>
                <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                  Pre-save your student ID and institution for one-click event registrations.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Raihan Kabir"
                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="student@drmc.edu.bd"
                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono border border-zinc-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    Student ID
                  </label>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono border border-zinc-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    Institution
                  </label>
                  <input
                    type="text"
                    required
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg"
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
                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors cursor-pointer"
              >
                Create Account & Continue
              </button>
            </form>
          )}
        </div>

        {/* Demo Credentials Box */}
        <div className="lg:col-span-5 bg-zinc-950 text-white border border-zinc-800 rounded-2xl p-6 sm:p-7 space-y-6">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-emerald-400">
              Competition Evaluation Mode
            </p>
            <h2 className="font-display text-xl font-bold text-white">
              Instant Demo Accounts
            </h2>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Use the seeded accounts below to test both the Participant experience and the
              protected Organizer administration suite.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Organizer / Admin Account</span>
                </span>
                {currentUser?.role === 'organizer' && (
                  <span className="text-[11px] font-semibold text-emerald-400">Active</span>
                )}
              </div>
              <div className="text-xs font-mono text-zinc-300 space-y-0.5">
                <p>Email: organizer@drmcitclub.org</p>
                <p>Pass: NexusAdmin2026!</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  switchDemoRole('organizer');
                  navigate('/admin');
                }}
                className="w-full py-2 px-3 text-xs font-semibold text-zinc-950 bg-white hover:bg-zinc-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Launch Organizer Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Participant Account</span>
                </span>
                {currentUser?.role === 'participant' && (
                  <span className="text-[11px] font-semibold text-emerald-400">Active</span>
                )}
              </div>
              <div className="text-xs font-mono text-zinc-300 space-y-0.5">
                <p>Email: tahmid.hasan@drmc.edu.bd</p>
                <p>Pass: NexusStudent2026!</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  switchDemoRole('participant');
                  navigate('/my-registrations');
                }}
                className="w-full py-2 px-3 text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Switch to Participant Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
