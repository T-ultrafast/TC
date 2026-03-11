# TCLens - Smart Legal Document Analysis

An AI-powered platform for intelligent contract review and legal document analysis. TCLens helps professionals quickly understand complex legal documents, identify risks, and accelerate negotiations.

## 🎯 Features

- **Deep Clause Extraction**: Automatically isolate indemnities, limitations of liability, termination rights, and other critical clauses
- **Risk Quantification Matrix**: Objective risk scoring based on aggressive language, jurisdiction analysis, and term balance
- **Multi-Format Support**: Process PDF, DOCX, and web-based documents
- **AI-Powered Analysis**: Leverage OpenAI and Google GenAI for comprehensive document understanding
- **Dark Mode Support**: Full theme support with system preference detection
- **Chrome Extension**: Direct integration for document analysis from your browser
- **Professional Dashboard**: Manage cases, templates, and document analysis history

## 📊 Performance Metrics

- **98.5%** Accuracy Rate
- **50k+** Documents Analyzed
- **10x** Faster Review than manual analysis
- Bank-Grade Security

## 🏗️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org) 16.0.7
- **Language**: TypeScript
- **Styling**: Tailwind CSS + PostCSS
- **UI Components**: Custom components with class-variance-authority
- **AI Integration**: 
  - OpenAI API (`@ai-sdk/openai`)
  - Google GenAI (`@google/genai`)
- **Document Processing**: 
  - pdf-parse for PDFs
  - html-to-docx for document generation
  - mammoth for DOCX handling
- **Animation**: Framer Motion
- **Theme Management**: next-themes

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- API keys for OpenAI and Google GenAI (optional, for AI features)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd tclens-web

# Install dependencies
npm install
```

### Environment Setup

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_google_api_key
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Build & Production

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
tclens-web/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── (marketing)/    # Marketing pages (landing, pricing, etc.)
│   │   ├── app/            # Authenticated app pages
│   │   ├── dashboard/      # User dashboard
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Root page (home)
│   ├── components/         # Reusable React components
│   │   ├── ui/            # UI primitives
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── ThemeProvider.tsx
│   ├── lib/               # Utility functions & services
│   │   ├── ai-service.ts
│   │   ├── auth.ts
│   │   ├── extractor.ts   # Document extraction
│   │   ├── prompts.ts     # AI prompts
│   │   ├── risk-scoring.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   └── types/             # TypeScript type definitions
├── extension/             # Chrome extension
├── public/                # Static assets
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS config
├── tsconfig.json          # TypeScript config
└── package.json
```

## 🔧 Configuration

### Next.js Config (`next.config.ts`)
- CORS headers for API routes
- Image optimization
- ESLint integration

### Tailwind Config (`tailwind.config.ts`)
- Custom color scheme
- Extended typography (Playfair Display, Plus Jakarta Sans)
- Dark mode support

## 📝 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 🐛 Recent Fixes & Updates

### Fixed 404 Error on Vercel Deployment
- **Issue**: Root page returning 404 on Vercel
- **Solution**: Added `src/app/page.tsx` to properly export the marketing home page at the root `/` route
- **Impact**: All routes now properly resolve on Vercel deployment
- **File**: [src/app/page.tsx](src/app/page.tsx)

## 🔐 Security Features

- Secure authentication system
- API rate limiting
- CORS protection on API routes
- Bank-grade encryption for sensitive data
- Valid SSL/TLS on all endpoints

## 📚 API Endpoints

Key API routes:

- `POST /api/analyze` - Analyze document
- `POST /api/extract-url` - Extract content from URL
- `GET/POST /api/cases` - Manage legal cases
- `POST /api/ai-lawyer-chat` - AI lawyer chat
- `GET /api/lawyers/search` - Search for lawyers

## 🚢 Deployment to Vercel

### Prerequisites
- Vercel account
- GitHub repository

### Steps

1. Push your code to GitHub:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

2. Go to [Vercel Dashboard](https://vercel.com)
3. Click "Add New → Project"
4. Import your GitHub repository
5. Add environment variables in Settings
6. Click "Deploy"

The app is optimized for Vercel with:
- Proper root page routing (via `src/app/page.tsx`)
- Next.js 16 compatibility
- Automatic builds on push
- Serverless function deployment

## 🔗 Internal Links

- [Homepage](/)
- [Dashboard](/app/dashboard)
- [Upload Document](/upload)
- [Pricing](/pricing)
- [Sign Up](/signup)
- [Sign In](/signin)

## 🐛 Troubleshooting

### 404 Errors on Deployment
- Ensure `src/app/page.tsx` exists
- Check that all route files have proper exports
- Verify Next.js configuration

### Build Failures
```bash
# Clean build cache
rm -rf .next

# Rebuild
npm run build
```

### Missing Dependencies
```bash
# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📦 Dependencies Management

Key dependencies and their purposes:

| Package | Purpose |
|---------|---------|
| `next` | React framework |
| `@ai-sdk/openai` | OpenAI integration |
| `@google/genai` | Google AI integration |
| `pdf-parse` | PDF processing |
| `docx` | Word document generation |
| `framer-motion` | Smooth animations |
| `tailwindcss` | Utility-first CSS |

## 📈 Future Enhancements

- Real-time collaborative editing
- Advanced ML-based risk prediction
- Integration with legal databases
- Multi-language support
- Mobile app (React Native)

## 📧 Support & Issues

For bug reports and feature requests, please create an issue in the repository.

## 📄 License

All rights reserved - Proprietary Software

---

**Last Updated**: March 2026
**Version**: 0.1.0
