'use client';

import { useState } from 'react';
import { PartyPopper } from 'lucide-react';

export default function EmailCapture() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email');
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
      setMessage('Thanks! We\'ll notify you about new features');
      setEmail('');
      
      // Store email locally for now (you can send to your backend)
      if (typeof window !== 'undefined') {
        const emails = JSON.parse(localStorage.getItem('email_signups') || '[]');
        emails.push({ email, timestamp: new Date().toISOString() });
        localStorage.setItem('email_signups', JSON.stringify(emails));
      }
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
      console.error('Email signup error:', error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-[#0A2540] mb-2">
            Get notified about new features
          </h3>
          <p className="text-sm text-gray-600">
            Be the first to know when we ship something awesome
          </p>
        </div>

        {status === 'success' ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <PartyPopper className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-green-700 font-medium">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-3 bg-gradient-to-r from-[#1E4D8B] to-[#3B82F6] text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {status === 'loading' ? 'Signing up...' : 'Notify Me'}
              </button>
            </div>
            
            {status === 'error' && (
              <p className="text-red-600 text-sm text-center">{message}</p>
            )}
          </form>
        )}

        <p className="text-xs text-gray-500 text-center mt-3">
          No spam, ever. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}
