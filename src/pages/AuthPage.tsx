import React, { useState } from 'react';
import { useNexus } from '../context/NexusContext';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const { navigate, login, registerUser } = useNexus();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Clean empty inputs (no auto-prefills)
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Participant registration fields
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
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
                placeholder="e.g. organizer@drmcitclub.org or student ID"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-800">
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
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
                  placeholder="student@drmc.edu.bd"
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
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create a password for your participant account"
                  className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
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
