# Buildera - Task Management Application

Buildera is a modern task management application built with React, TypeScript, and Supabase. The application features AI-assisted project generation powered by OpenAI.

![Buildera Screenshot](src/assets/screenshot.png)

## Features

- **Project Management**: Create, edit, and organize projects
- **Task Management**: Track tasks with priorities, status, and deadlines
- **AI-Assisted Project Creation**: Generate project plans with AI
- **Dark/Light Theme**: Customizable UI theme
- **Responsive Design**: Works on desktop and mobile devices
- **User Authentication**: Secure login and account management

## Technology Stack

- **Frontend**: React, TypeScript, Material UI
- **State Management**: Redux Toolkit
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Emotion, Material UI
- **API Integration**: OpenAI for AI project generation
- **Routing**: React Router
- **Form Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/project_timeline_tracker.git
   project_timeline_tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Add your API keys and configuration to the `.env` file:
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:prod` - Build for production with additional optimizations
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally
- `npm run start` - Alias for preview command
- `npm run deploy:vercel` - Deploy to Vercel (requires Vercel CLI)

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Project Structure

```
src/
├── assets/         # Images, icons, and other static assets
├── components/     # Reusable UI components
├── contexts/       # React context providers
├── hooks/          # Custom React hooks
├── lib/            # Utility libraries and helpers
├── pages/          # Page components
├── providers/      # Provider components
├── services/       # API and service integrations
├── store/          # Redux store configuration
├── styles/         # Global styles and theme
├── types/          # TypeScript type definitions
├── App.tsx         # Main application component
└── main.tsx        # Application entry point
```

## AI Project Generation

Buildera includes AI-assisted project generation powered by OpenAI. This feature allows users to:

1. Describe a project in natural language
2. Specify the number of tasks and timeline
3. Generate a complete project structure with tasks

Users are limited to 10 AI-generated projects per week to manage API usage costs.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [OpenAI](https://openai.com/) for their powerful AI models
- [Supabase](https://supabase.com/) for backend services
- [Material UI](https://mui.com/) for the UI components
- [Vite](https://vitejs.dev/) for the build system
