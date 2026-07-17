'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    pharmacyName: '',
    address: '',
    phone: '',
    email: '',
    gstNumber: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(prev => ({ ...prev, ...data }));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load settings:', err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (res.ok) {
        setMessage('Settings saved successfully!');
      } else {
        setMessage('Failed to save settings.');
      }
    } catch (err) {
      setMessage('Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading settings...</p>;

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 className="page-title">Pharmacy Settings</h1>
      
      <div className="card">
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>Print Details</h2>
        <p style={{ marginBottom: '1.5rem', color: 'var(--foreground)', opacity: 0.7 }}>
          These details will appear on the printed bill header.
        </p>

        {message && (
          <div style={{ 
            padding: '1rem', 
            marginBottom: '1rem', 
            borderRadius: '8px', 
            backgroundColor: message.includes('success') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: message.includes('success') ? 'var(--success)' : 'var(--danger)',
            fontWeight: 500
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Pharmacy Name</label>
            <input 
              type="text" 
              name="pharmacyName"
              className="input-field" 
              value={settings.pharmacyName} 
              onChange={handleChange}
              placeholder="e.g. Apollo Pharmacy"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Address</label>
            <input 
              type="text" 
              name="address"
              className="input-field" 
              value={settings.address} 
              onChange={handleChange}
              placeholder="e.g. 123 Health Street, City"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Phone Number</label>
            <input 
              type="text" 
              name="phone"
              className="input-field" 
              value={settings.phone} 
              onChange={handleChange}
              placeholder="e.g. +1 234 567 890"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email (Optional)</label>
            <input 
              type="email" 
              name="email"
              className="input-field" 
              value={settings.email} 
              onChange={handleChange}
              placeholder="e.g. contact@pharmacy.com"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>GST / Tax Number (Optional)</label>
            <input 
              type="text" 
              name="gstNumber"
              className="input-field" 
              value={settings.gstNumber} 
              onChange={handleChange}
              placeholder="e.g. GSTIN12345678"
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
