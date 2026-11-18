# TechClub Website

A modern, responsive website for the TechClub at NVCC built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Modern UI/UX**: Built with shadcn/ui components and Framer Motion animations
- **Dark/Light Mode**: Theme switching with next-themes
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Database Integration**: Supabase backend for dynamic content
- **Real-time Data**: Events, team members, projects, and resources from database
- **Membership Applications**: Form submission with database storage
- **Performance Optimized**: Next.js 15 with App Router

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Animations**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Supabase account

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd nvcc_techclub_v.3
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Database

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database-schema.sql`
4. Run the SQL to create tables and insert sample data

### 5. Run the Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

## Database Schema

The application uses the following tables:

- **team_members**: Club leadership and team information
- **events**: Upcoming and past events
- **projects**: Club projects by category
- **resources**: Educational resources and tutorials
- **membership_applications**: Member application submissions

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home page
│   ├── about/             # About page
│   ├── events/            # Events page
│   ├── projects/          # Projects page
│   ├── resources/         # Resources page
│   ├── community/         # Community page
│   └── join/              # Join page
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── navbar.tsx        # Navigation
│   └── footer.tsx        # Footer
├── lib/                  # Utility functions
│   ├── supabase.ts       # Supabase client
│   ├── database.ts       # Database operations
│   └── utils.ts          # General utilities
├── hooks/                # Custom React hooks
│   └── use-membership.ts # Membership form hook
└── public/               # Static assets
```

## Key Features

### Dynamic Content
- Team members loaded from database
- Events with real-time updates
- Projects organized by category
- Resources with search functionality

### Membership System
- Application form with validation
- Database storage of applications
- Status tracking (pending/approved/rejected)

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimizations
- Touch-friendly interactions

### Performance
- Next.js 15 optimizations
- Image optimization
- Code splitting
- Lazy loading

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the TechClub team or create an issue in the repository. 