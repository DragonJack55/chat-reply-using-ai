# Chat Reply Using AI

An AI-powered chat reply assistant built with React, Vite, and Google's Generative AI. This app helps you analyze messages, generate replies, and improve your communication.

## Features

- 🤖 AI-powered message analysis (mood, intent, advice)
- 💬 Intelligent reply generation
- 🎨 Modern, beautiful UI with Tailwind CSS
- ⚡ Fast development with Vite
- 🔄 Real-time message processing

## Tech Stack

- **React 19** - UI framework
- **Vite 7** - Build tool & dev server
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations
- **Google Generative AI** - AI capabilities
- **Lucide React** - Icons

## Quick Start

### On This Computer (Windows)

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
# or
npm run s
```

3. Open your browser to the URL shown (typically `http://localhost:5173/`)

### Transferring to MacBook

1. **Copy the entire project folder** to your MacBook (via USB drive, cloud storage, or network transfer)

2. **On your MacBook**, navigate to the project folder and install dependencies:
```bash
cd "path/to/chat reply using ai"
npm install
```

3. **Set up environment variables** (if needed):
   - Copy `.env` file and configure your API keys
   - The `.env.local` file is gitignored for security

4. **Run the dev server**:
```bash
npm run dev
```

## Important Notes for Transfer

- ✅ **DO transfer**: All source files, config files, `package.json`, `.env` (update API keys)
- ❌ **DON'T transfer**: `node_modules`, `dist`, `.netlify`, `.vercel` folders (these are auto-generated)
- 🔑 **API Keys**: Make sure to update your Google Generative AI API key in `.env` on the new machine

## Available Scripts

- `npm run dev` - Start development server
- `npm run s` - Short alias for dev server
- `npm run build` - Build for production
- `npm run b` - Short alias for build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
chat reply using ai/
├── src/
│   ├── components/     # React components
│   ├── App.jsx        # Main app component
│   └── main.jsx       # Entry point
├── public/            # Static assets
├── index.html         # HTML template
├── package.json       # Dependencies
├── vite.config.js     # Vite configuration
├── tailwind.config.js # Tailwind configuration
└── .env              # Environment variables
```

## Development Tips

- The app uses Google's Generative AI - ensure you have a valid API key
- Hot module replacement (HMR) is enabled for instant updates
- Tailwind CSS is configured with JIT mode for optimal performance

## Deployment

The project is configured for deployment on:
- Netlify (see `netlify.toml`)
- Vercel
- Firebase (see `firebase.json`)

Run `npm run build` to create a production build in the `dist` folder.
