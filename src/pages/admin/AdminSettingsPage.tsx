import React, { useState } from 'react';
import {
  RotateCcw,
  Save,
  ShieldCheck,
  Check,
  Key,
  AlertCircle,
  Eye,
  EyeOff,
  Mail,
  Edit2,
  X,
} from 'lucide-react';
import { useNexus } from '../../context/NexusContext';
import { AdminLayout } from './AdminLayout';

export const AdminSettingsPage: React.FC = () => {
  const {
    organization,
    resetToSeedData,
    currentUser,
    updateOrganizerPassword,
    updateOrganizerEmail,
    updateOrganization,
  } = useNexus();
  const [savedMessage, setSavedMessage] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Editable settings fields
  const [orgName, setOrgName] = useState(organization.name);
  const [shortName, setShortName] = useState(organization.shortName);
  const [tagline, setTagline] = useState(organization.tagline || organization.subtitle);
  const [contactEmail, setContactEmail] = useState(organization.contactEmail);
  const [institution, setInstitution] = useState(organization.institution || organization.campus);

  // Official email update fields
  const currentOfficialEmail = currentUser?.email || 'organizer@drmcitclub.org';
  const [newOfficialEmail, setNewOfficialEmail] = useState('');
  const [syncWithOrgContact, setSyncWithOrgContact] = useState(true);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Password update fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrganization({
      name: orgName.trim(),
      shortName: shortName.trim(),
      tagline: tagline.trim(),
      contactEmail: contactEmail.trim(),
      institution: institution.trim(),
    });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleEmailUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailFeedback(null);
    const clean = newOfficialEmail.trim().toLowerCase();
    if (!clean) {
      setEmailFeedback({
        type: 'error',
        message: 'Please provide a valid official email address.',
      });
      return;
    }
    if (clean === currentOfficialEmail.toLowerCase()) {
      setEmailFeedback({
        type: 'error',
        message: 'The new email must be different from your current official email.',
      });
      return;
    }
    const res = updateOrganizerEmail(clean);
    if (!res.ok) {
      setEmailFeedback({
        type: 'error',
        message: res.error || 'Failed to update official email.',
      });
      return;
    }
    if (syncWithOrgContact) {
      updateOrganization({ contactEmail: clean });
      setContactEmail(clean);
    }
    setEmailFeedback({
      type: 'success',
      message: `Official email successfully updated to "${clean}". You can now use this email to sign in to the organizer workspace.`,
    });
    setNewOfficialEmail('');
    setShowEmailForm(false);
    setTimeout(() => setEmailFeedback(null), 5000);
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);
    if (!newPassword || newPassword.trim().length < 6) {
      setPasswordFeedback({
        type: 'error',
        message: 'Password must be at least 6 characters long.',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        type: 'error',
        message: 'Password confirmation does not match.',
      });
      return;
    }
    const res = updateOrganizerPassword(newPassword);
    if (!res.ok) {
      setPasswordFeedback({
        type: 'error',
        message: res.error || 'Failed to update organizer password.',
      });
      return;
    }
    setPasswordFeedback({
      type: 'success',
      message: 'Organizer password updated successfully. Use this password for future logins.',
    });
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordFeedback(null), 4000);
  };

  const handleReset = () => {
    resetToSeedData();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3500);
  };

  return (
    <AdminLayout
      activeTab="settings"
      title="Club & System Configuration"
      subtitle="Organization profile, operational defaults, and organizer account security"
    >
      <div className="max-w-3xl space-y-6">
        {savedMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Organization profile saved successfully.</span>
          </div>
        )}

        {resetSuccess && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-blue-600" />
            <span>NEXUS database has been restored to factory seed data.</span>
          </div>
        )}

        {/* Organizer Account Security */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-display text-base font-bold text-zinc-950">
              Organizer Account & Security
            </h3>
          </div>
          <p className="text-xs text-zinc-500">
            Active credentials for the authorized organizer account. Only logins matching this account ID/email and password are granted access to the Operations Workspace.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 text-xs">
            <div>
              <p className="text-zinc-500">Account ID</p>
              <p className="font-mono font-semibold text-zinc-900">
                {currentUser?.id || 'usr-organizer-1'}
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <p className="text-zinc-500">Official Email</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailForm((prev) => !prev);
                    if (!showEmailForm) setNewOfficialEmail(currentOfficialEmail);
                  }}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  {showEmailForm ? 'Cancel' : 'Change'}
                </button>
              </div>
              <p className="font-semibold text-zinc-900 truncate" title={currentOfficialEmail}>
                {currentOfficialEmail}
              </p>
            </div>
            <div>
              <p className="text-zinc-500">Executive Name</p>
              <p className="font-semibold text-zinc-900">
                {currentUser?.fullName || 'Farhan Sadik'}
              </p>
            </div>
          </div>

          {/* Change Official Email Section */}
          <div className="border border-blue-100 bg-blue-50/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Change Official Email</span>
              </h4>
              <span className="text-[11px] text-zinc-500 font-mono">
                Current: {currentOfficialEmail}
              </span>
            </div>

            <p className="text-xs text-zinc-600">
              Update the official organizer email address. This email will be used for signing in to the organizer workspace and for official festival correspondence.
            </p>

            {emailFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  emailFeedback.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {emailFeedback.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{emailFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleEmailUpdate} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    New Official Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newOfficialEmail}
                    onChange={(e) => setNewOfficialEmail(e.target.value)}
                    placeholder="e.g. president@drmcitclub.org"
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Update Official Email</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="syncWithOrgContact"
                  checked={syncWithOrgContact}
                  onChange={(e) => setSyncWithOrgContact(e.target.checked)}
                  className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label
                  htmlFor="syncWithOrgContact"
                  className="text-xs text-zinc-600 cursor-pointer select-none"
                >
                  Also synchronize and update Host Organization Contact Email with this new address
                </label>
              </div>
            </form>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-4 pt-3 border-t border-zinc-200">
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-zinc-500" />
              <span>Change Organizer Password</span>
            </h4>

            {passwordFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  passwordFeedback.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {passwordFeedback.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{passwordFeedback.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3 py-2 pr-10 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors p-1 cursor-pointer focus:outline-none"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2 pr-10 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors p-1 cursor-pointer focus:outline-none"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Update Organizer Password</span>
              </button>
            </div>
          </form>
        </div>

        {/* Organization Profile */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-display text-base font-bold text-zinc-950">
            Host Organization Profile
          </h3>
          <p className="text-xs text-zinc-500">
            This information is displayed across festival listings, registration passes, and export manifests.
          </p>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Short Code / Acronym
                </label>
                <input
                  type="text"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg font-mono focus:outline-none focus:border-zinc-950"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">
                Parent Institution / Campus
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">
                Official Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Organization Settings</span>
              </button>
            </div>
          </form>
        </div>

        {/* Database Reset Section */}
        <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-xs space-y-3">
          <h3 className="font-display text-base font-bold text-red-950">
            Database Maintenance
          </h3>
          <p className="text-xs text-zinc-600">
            Reset all changes back to factory club data (3 official festivals, 8 events, initial registrations).
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Factory Club Data</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
