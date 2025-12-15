'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.trim()) return;

    setStatus('sending');

    try {
      // Submit directly to FormSubmit (works better from client-side)
      const formData = new FormData();
      formData.append('message', feedback);
      formData.append('page_url', window.location.href);
      formData.append('user_agent', navigator.userAgent);
      formData.append('timestamp', new Date().toLocaleString());
      formData.append('_subject', 'New SpecifyThat Feedback');
      formData.append('_template', 'table');
      formData.append('_captcha', 'false');

      const response = await fetch('https://formsubmit.co/luke@modrynstudio.com', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      // FormSubmit returns JSON when Accept header is set
      const result = await response.json();

      if (result.success !== 'true' && !response.ok) {
        throw new Error('Failed to send feedback');
      }

      // Store locally as backup
      if (typeof window !== 'undefined') {
        const allFeedback = JSON.parse(localStorage.getItem('user_feedback') || '[]');
        allFeedback.push({ 
          feedback,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString() 
        });
        localStorage.setItem('user_feedback', JSON.stringify(allFeedback));
      }

      setStatus('sent');
      setTimeout(() => {
        setIsOpen(false);
        setFeedback('');
        setStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Feedback error:', error);
      setStatus('idle');
      alert('Failed to send feedback. Please try the email button instead.');
    }
  };

  const handleMailto = () => {
    const subject = encodeURIComponent('SpecifyThat Feedback');
    const body = encodeURIComponent(`Hi SpecifyThat team,\n\nI have some feedback:\n\n`);
    window.location.href = `mailto:luke@modrynstudio.com?subject=${subject}&body=${body}`;
  };

  return (
    <>
      {/* Floating Feedback Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-[#1E4D8B] to-[#3B82F6] text-white px-5 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex items-center gap-2 z-50"
        aria-label="Send feedback"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth={2} 
          stroke="currentColor" 
          className="w-5 h-5"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" 
          />
        </svg>
        <span className="hidden sm:inline">Feedback</span>
      </button>

      {/* Feedback Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="currentColor" 
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-2xl font-bold text-[#0A2540] mb-2">
              Send Feedback
            </h3>
            <p className="text-gray-600 mb-6">
              Found a bug? Have an idea? Let us know!
            </p>

            {status === 'sent' ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-3" />
                <p className="text-green-700 font-semibold">Thanks for your feedback!</p>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="What's on your mind?"
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
                    disabled={status === 'sending'}
                  />
                  
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={status === 'sending' || !feedback.trim()}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-[#1E4D8B] to-[#3B82F6] text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {status === 'sending' ? 'Sending...' : 'Send Feedback'}
                    </button>
                    <button
                      type="button"
                      onClick={handleMailto}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                      title="Send via email"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={2} 
                        stroke="currentColor" 
                        className="w-5 h-5"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" 
                        />
                      </svg>
                    </button>
                  </div>
                </form>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Or email us directly at{' '}
                  <a 
                    href="mailto:luke@modrynstudio.com" 
                    className="text-blue-600 hover:underline"
                  >
                    luke@modrynstudio.com
                  </a>
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
