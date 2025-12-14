import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Image 
            src="/specifythat-logo.png" 
            alt="SpecifyThat" 
            width={120} 
            height={32}
            className="h-8 w-auto"
          />
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
              Turn Ideas Into
              <span className="text-blue-600"> Build-Ready Specs</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Stop staring at a blank page. SpecifyThat asks the right questions and fills gaps with top 0.1% thinking. Go from idea to building in under 30 minutes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/interview"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
            >
              Start New Spec →
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            No login required • Free to use • Works on mobile
          </p>
        </div>

        {/* How It Works */}
        <div className="mt-24 md:mt-32">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-blue-600 font-bold text-xl">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">Answer Questions</h3>
              <p className="text-gray-600">
                Walk through 13 targeted questions about your project. No fluff, just what matters.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-purple-600 font-bold text-xl">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">AI Fills Gaps</h3>
              <p className="text-gray-600">
                Don&apos;t know an answer? Click &quot;I don&apos;t know&quot; and get expert-level suggestions instantly.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-green-600 font-bold text-xl">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">Get Your Spec</h3>
              <p className="text-gray-600">
                Copy your finished spec and paste it into ChatGPT, Claude, or Cursor to start building.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 md:mt-32 text-center">
          <div className="bg-gray-900 rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to stop overthinking?
            </h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Most developers spend hours planning before writing a single line of code. SpecifyThat gets you building in minutes.
            </p>
            <Link
              href="/interview"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Generate My Spec →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-24">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-center text-gray-500 text-sm">
            Built with SpecifyThat • Open source on GitHub
          </p>
        </div>
      </footer>
    </div>
  );
}
