'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';

export default function HeaderEmailCapture() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
      return;
    }

    setStatus('loading');

    try {
      // Submit to Google Form
      const formData = new FormData();
      formData.append('entry.1826763262', email);
      
      await fetch('https://docs.google.com/forms/u/0/d/1nalHADY0DobC-MA6hzHJJRIU5dKUnhqWiH8qbFB2N_M/formResponse', {
        method: 'POST',
        body: formData,
        mode: 'no-cors',
      });
      
      setStatus('success');
      setEmail('');
      
      // Store email locally as backup
      if (typeof window !== 'undefined') {
        const emails = JSON.parse(localStorage.getItem('email_signups') || '[]');
        emails.push({ email, timestamp: new Date().toISOString() });
        localStorage.setItem('email_signups', JSON.stringify(emails));
      }

      // Reset after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      setStatus('error');
      console.error('Email signup error:', error);
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
        <Bell className="w-4 h-4 text-green-600" />
        <span className="text-sm font-medium text-green-700">You're on the list!</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
        <Bell className="w-4 h-4" />
        <span className="font-medium">Get updates:</span>
      </div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className={`px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          status === 'error' 
            ? 'border-red-300 focus:ring-red-500' 
            : 'border-gray-300'
        } w-44`}
        disabled={status === 'loading'}
      />
      <button
        type="submit"
        disabled={status === 'loading' || !email}
        className="px-4 py-2 bg-gradient-to-r from-[#1E4D8B] to-[#3B82F6] text-white text-sm font-semibold rounded-lg hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {status === 'loading' ? 'Saving...' : 'Notify Me'}
      </button>
    </form>
  );
}
