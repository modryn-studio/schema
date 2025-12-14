<p align="left">
  <img src="./public/specifythat-logo.png" height="36" />
</p>

**Turn ideas into build-ready specs in under 30 minutes.**

SpecifyThat is a conversational spec generator for developers who struggle to turn ideas into executable build instructions. It conducts a targeted interview, asking specific questions about your project. When you don't know an answer, SpecifyThat provides "top 0.1% thinking" to fill gaps.

## Features

- 🎯 **13 targeted questions** mapped to a proven spec structure
- 🤖 **AI-powered gap filling** - click "I don't know" for expert suggestions
- 📋 **Copy-ready output** - paste into ChatGPT, Claude, or Cursor
- 📱 **Mobile-responsive** - works on any device
- 🔒 **No login required** - just start building
- 💾 **Browser-only** - no data stored on servers

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Claude (Anthropic API)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/modryn-studio/specifythat.git
   cd specifythat
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and create a new project
3. Import your GitHub repository
4. Add environment variable:
   - `ANTHROPIC_API_KEY`: Your Anthropic API key
5. Deploy

The app will be live at your Vercel URL.

## Usage

1. Click "Start New Spec" on the homepage
2. Answer each question about your project
3. If you're unsure, click "I don't know" for AI suggestions
4. Review and edit AI suggestions as needed
5. Complete all 13 questions
6. Click "Generate My Spec"
7. Copy the spec and paste it into your favorite AI tool to start building

## Project Structure

```
specifythat/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Homepage
│   │   ├── interview/
│   │   │   └── page.tsx          # Interview flow
│   │   └── api/
│   │       ├── generate-answer/  # AI gap-filling
│   │       └── generate-spec/    # Final spec generation
│   ├── components/               # UI components
│   ├── hooks/                    # React hooks
│   └── lib/                      # Utilities & config
├── public/                       # Static assets
├── BUILD_LOG.md                  # Development log
├── ROADMAP.md                    # Feature roadmap
├── specifythat-spec.md           # Spec template
└── README.md                     # This file
```

## Known Limitations

- **No session persistence**: Refreshing the page loses all progress
- **Single session**: Can only work on one spec at a time
- **Limited export options**: Markdown download and clipboard only (no PDF/Word)
- **API dependency**: Requires working Anthropic API key

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Yes |

## License

MIT

---

Built with ❤️ using SpecifyThat's own spec format.
