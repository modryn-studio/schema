import Link from 'next/link';
import Image from 'next/image';
import HeaderEmailCapture from '@/components/HeaderEmailCapture';
import FeedbackButton from '@/components/FeedbackButton';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between gap-4">
            <Image 
              src="/specifythat-logo.png" 
              alt="SpecifyThat" 
              width={144} 
              height={32}
              style={{ height: '32px', width: 'auto' }}
              priority
            />
            <HeaderEmailCapture />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 py-20 md:py-32">
        <div className="text-center space-y-10">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#0A2540] tracking-tight leading-[1.15]">
              Turn Ideas Into
              <span className="block bg-gradient-to-r from-[#1E4D8B] to-[#3B82F6] bg-clip-text text-transparent mt-2 pb-2 pr-1"> Build-Ready Specs</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-medium leading-relaxed">
              Stop staring at a blank page. SpecifyThat asks the right questions and fills gaps with <span className="text-[#1E4D8B] font-semibold">top 0.1% thinking</span>. Go from idea to building in under 30 minutes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/interview"
              className="group inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-[#1E4D8B] to-[#3B82F6] text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              Start New Spec 
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
            </Link>
          </div>

          <p className="text-sm text-gray-500 font-medium pt-2">
            No login required • Free to use • Works on mobile
          </p>
        </div>

        {/* How It Works */}
        <div className="mt-32 md:mt-40">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A2540] text-center mb-16">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center space-y-5 group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-200">
                <span className="text-white font-bold text-2xl">1</span>
              </div>
              <h3 className="font-bold text-[#0A2540] text-xl">Answer Questions</h3>
              <p className="text-gray-600 leading-relaxed">
                Walk through 13 targeted questions about your project. No fluff, just what matters.
              </p>
            </div>

            <div className="text-center space-y-5 group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform duration-200">
                <span className="text-white font-bold text-2xl">2</span>
              </div>
              <h3 className="font-bold text-[#0A2540] text-xl">AI Fills Gaps</h3>
              <p className="text-gray-600 leading-relaxed">
                Don&apos;t know an answer? Click &quot;I don&apos;t know&quot; and get expert-level suggestions instantly.
              </p>
            </div>

            <div className="text-center space-y-5 group">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-200">
                <span className="text-white font-bold text-2xl">3</span>
              </div>
              <h3 className="font-bold text-[#0A2540] text-xl">Get Your Spec</h3>
              <p className="text-gray-600 leading-relaxed">
                Copy your finished spec and paste it into ChatGPT, Claude, or Cursor to start building.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 md:mt-40 text-center">
          <div className="bg-gradient-to-br from-[#0A2540] to-[#1E4D8B] rounded-3xl p-10 md:p-16 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to stop overthinking?
            </h2>
            <p className="text-gray-200 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Most developers spend hours planning before writing a single line of code. SpecifyThat gets you building in minutes.
            </p>
            <Link
              href="/interview"
              className="inline-flex items-center justify-center px-10 py-5 bg-white text-[#0A2540] rounded-2xl font-bold text-lg hover:bg-gray-50 hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              Generate My Spec →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-32">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <p className="text-center text-gray-500 text-sm">
            Built with SpecifyThat •{' '}
            <a 
              href="https://github.com/modryn-studio/specifythat" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-gray-700 underline"
            >
              Open source on GitHub
            </a>
          </p>
        </div>
      </footer>

      {/* Floating Feedback Button */}
      <FeedbackButton />
    </div>
  );
}
