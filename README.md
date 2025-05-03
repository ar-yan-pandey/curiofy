# Curiofy

Curiofy is a modern, interactive learning web app that helps users generate concise explanations and assessments on any topic using Google Gemini AI and Supabase authentication. Users can select a duration for content, listen to AI-generated audio, and track their learning progress.

# Login Credentials

You can even signup but here are login credentials for an ID with data in it.

Email: aryanhth613@gmail.com 
Password: 123456

## Features
- User authentication and profile management (Supabase)
- Generate topic explanations with Gemini AI
- Select content duration (30s, 1, 2, 3, 5 min)
- Audio playback for explanations
- Save and review playlists
- Take and save AI-generated assessments
- Track learning progress with analytics

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd curiofy
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env.local` and fill in your keys:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_GEMINI_API_KEY`
     - (Optional) `GOOGLE_TTS_KEY_PATH`, `STABILITY_API_KEY`
4. **Run the development server:**
   ```bash
   npm run dev
   ```
5. **Open** [http://localhost:3000](http://localhost:3000) **to view the app.**

## List of Dependencies
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Supabase JS](https://supabase.com/)
- [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai)
- [Chart.js](https://www.chartjs.org/)
- [react-markdown](https://github.com/remarkjs/react-markdown)

## Environment Files
- `.env.local`: Main environment variables (see above)
- `.env.example`: Template for required variables

## License
MIT
