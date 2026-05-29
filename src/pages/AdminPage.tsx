import React, { useMemo, useState } from 'react';
import JSZip from 'jszip';
import { PageFrame } from '../components/ui/PageFrame';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { FormField, TextInput } from '../components/ui/FormField';

const ENABLE_CODE_EXPORT = import.meta.env.VITE_ENABLE_CODE_EXPORT === 'true';

// Dynamically import source files at build time
const sourceFiles = import.meta.glob('/src/**/*.{ts,tsx,css,json}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export function AdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('jakaroo_admin_ok') === 'true');
  const [selected, setSelected] = useState(Object.keys(sourceFiles)[0] || '');
  const [query, setQuery] = useState('');
  const [downloading, setDownloading] = useState(false);

  const files = useMemo(
    () =>
      Object.keys(sourceFiles)
        .sort()
        .filter((p) => p.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  if (!ENABLE_CODE_EXPORT) {
    return (
      <PageFrame variant="marketing">
        <Panel className="text-center">
          <h2 className="text-xl font-bold text-gold-300 mb-2">Code Export Disabled</h2>
          <p className="text-cream-200/70">
            Set <code className="bg-black/40 px-2 py-1 rounded text-sm">VITE_ENABLE_CODE_EXPORT=true</code> only in development.
          </p>
        </Panel>
      </PageFrame>
    );
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple in-memory auth for development only
    if (email && password) {
      sessionStorage.setItem('jakaroo_admin_ok', 'true');
      setAuthed(true);
    } else {
      alert('Please enter email and password');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('jakaroo_admin_ok');
    setAuthed(false);
    setEmail('');
    setPassword('');
  };

  const handleDownloadZip = async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();
      Object.entries(sourceFiles).forEach(([path, content]) => {
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        zip.file(cleanPath, content as string);
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `jakaroo-online-source-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(url);
      link.remove();
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
      alert('Failed to generate ZIP file');
    } finally {
      setDownloading(false);
    }
  };

  if (!authed) {
    return (
      <PageFrame variant="marketing">
        <Panel title="Admin Access" className="max-w-md mx-auto">
            <Alert variant="warn" className="mb-4 text-xs">
              Development-only tool. This page must be disabled before production deployment.
            </Alert>
          <form onSubmit={handleLogin} className="space-y-4">
            <FormField label="Email">
              <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </FormField>
            <FormField label="Password">
              <TextInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </FormField>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </Panel>
      </PageFrame>
    );
  }

  const currentFileContent = sourceFiles[selected] || 'No file selected.';

  return (
    <PageFrame variant="marketing">
      <div className="admin-page grid grid-cols-1 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <Panel className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gold-300">Code Files</h2>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>

            <TextInput
              placeholder="Search files..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="text-sm"
            />

            <Button
              onClick={handleDownloadZip}
              disabled={downloading}
              className="w-full"
            >
              {downloading ? 'Generating...' : 'Download ZIP'}
            </Button>

            <Alert variant="warn" className="text-xs">
              Development-only tool. Disable before production.
            </Alert>

            <div className="space-y-1 max-h-96 overflow-y-auto border border-gold-500/25 rounded-lg p-2">
              {files.length === 0 ? (
                <p className="text-xs text-cream-200/50 p-2">No files found</p>
              ) : (
                files.map((file) => (
                  <button
                    key={file}
                    onClick={() => setSelected(file)}
                    className={`w-full text-left px-2 py-1 text-xs rounded transition-colors ${
                      selected === file
                        ? 'bg-gold-500/30 text-gold-200'
                        : 'text-cream-200/70 hover:bg-wood-800/40'
                    }`}
                  >
                    {file.replace(/^\//, '')}
                  </button>
                ))
              )}
            </div>
          </Panel>
        </aside>

        {/* Main content */}
        <main className="lg:col-span-3">
          <Panel className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-gold-500/25">
              <code className="text-xs text-gold-300 break-all">{selected}</code>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(currentFileContent);
                  alert('File copied to clipboard');
                }}
              >
                Copy
              </Button>
            </div>

            <pre className="bg-black/40 rounded-lg p-4 text-xs overflow-auto max-h-96 text-cream-100 font-mono leading-relaxed">
              {currentFileContent}
            </pre>
          </Panel>
        </main>
      </div>
    </PageFrame>
  );
}
