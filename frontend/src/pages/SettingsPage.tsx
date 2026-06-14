import { useState, useEffect, useCallback } from 'react';
import PageShell from '../components/common/PageShell';
import SettingsSection from '../components/settings/SettingsSection';
import Badge from '../components/common/Badge';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getUserSettings, updateUserSettings } from '../services/settingsService';
import type { UserSettings, UpdateUserSettingsPayload } from '../types/settings';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [form, setForm] = useState<UpdateUserSettingsPayload>({});
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUserSettings();
      setSettings(data);
      setForm(data);
    } catch {
      setError('Unable to load settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isInvalidSize) return;

    setIsSaving(true);
    setSuccessMessage(null);
    setError(null);
    try {
      const updated = await updateUserSettings(form);
      setSettings(updated);
      setForm(updated);
      setSuccessMessage('Settings saved successfully.');
    } catch {
      setError('Unable to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const fontSize = form.editor_font_size ?? 14;
  const isInvalidSize = fontSize < 12 || fontSize > 22;

  return (
    <PageShell>
      {/* Nav */}
      <nav className="w-full flex items-center justify-between px-8 py-5 border-b border-white/5">
        <Badge variant="muted">CodeMind</Badge>
        <div className="flex items-center gap-4">
          <span className="text-xs text-white/40">{user?.email}</span>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm font-medium text-white/60 hover:text-white px-2 py-2 rounded-lg transition-all duration-200"
          >
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-white/60 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-lg transition-all duration-200"
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-sm text-white/40">Manage your CodeMind preferences.</p>
          <p className="text-xs text-white/30 mt-1">Changes apply to Analyzer and Dashboard after saving. Some pages may need a refresh.</p>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <p className="text-sm text-white/40 animate-pulse">Loading settings...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-6 py-5 flex items-center justify-between">
            <span className="text-sm text-rose-300">{error}</span>
          </div>
        )}

        {!isLoading && successMessage && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-5">
            <span className="text-sm text-emerald-300">{successMessage}</span>
          </div>
        )}

        {!isLoading && settings && (
          <form onSubmit={handleSave} className="space-y-6">
            <SettingsSection title="Editor Preferences" description="Customize your code editing experience.">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/80">Default Language</label>
                <select
                  value={form.default_language}
                  onChange={(e) => setForm({ ...form, default_language: e.target.value as any })}
                  className="w-full max-w-xs bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/80">Editor Font Size</label>
                <input
                  type="number"
                  min={12}
                  max={22}
                  value={form.editor_font_size}
                  onChange={(e) => setForm({ ...form, editor_font_size: parseInt(e.target.value) || 14 })}
                  className="w-full max-w-xs bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                />
                {isInvalidSize && (
                  <p className="text-xs text-rose-400 mt-1">Editor font size must be between 12 and 22.</p>
                )}
              </div>
            </SettingsSection>

            <SettingsSection title="Analyzer Features" description="Enable or disable analysis tools.">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.show_visual_explanations}
                  onChange={(e) => setForm({ ...form, show_visual_explanations: e.target.checked })}
                  className="w-5 h-5 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">Show Visual Explanations</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.show_runtime_trace}
                  onChange={(e) => setForm({ ...form, show_runtime_trace: e.target.checked })}
                  className="w-5 h-5 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">Show Runtime Trace</span>
              </label>
            </SettingsSection>

            <SettingsSection title="Dashboard Layout" description="Personalize your dashboard view.">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/80">Density</label>
                <select
                  value={form.dashboard_density}
                  onChange={(e) => setForm({ ...form, dashboard_density: e.target.value as any })}
                  className="w-full max-w-xs bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="comfortable">Comfortable</option>
                  <option value="compact">Compact</option>
                </select>
              </div>
            </SettingsSection>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSaving || isInvalidSize}
                className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-colors shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500/50"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        )}
      </main>
    </PageShell>
  );
};

export default SettingsPage;
