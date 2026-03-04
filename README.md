# StudyPlannerHub

A production-ready web application for students to plan their studies, track exams, and generate study schedules. Built with Next.js, React, TypeScript, and Tailwind CSS.

## Features

### 🗓️ Timetable Builder
- Weekly grid timetable with drag-and-drop support
- Configurable days (Mon-Sun), time ranges, and slot lengths
- Add classes with name, color, location, and teacher
- Conflict detection for overlapping classes
- Export as PDF (portrait/landscape), image, or shareable link
- Print-friendly view

### ⏰ Exam Countdown
- Track multiple exams with countdown timers
- Sort by soonest exam
- Progress indicators and visual countdowns
- Browser notifications (opt-in)
- Export to .ics calendar file

### 📚 Weekly Study Plan Generator
- Add subjects with difficulty levels and desired hours/week
- Configure availability (days and time blocks)
- Set constraints (max sessions/day, avoid late hours)
- Generate balanced weekly study schedules
- Lock sessions to keep them when regenerating
- Export to calendar or shareable link

### 📝 Blog System
- 30 comprehensive blog posts on study planning
- Search and filter by category
- Markdown-based content with table of contents
- Related posts suggestions
- SEO-optimized

### 🎨 Design & UX
- Apple-inspired minimal design
- Dark/light mode with system preference detection
- 100% responsive (mobile-first)
- Smooth animations (respects prefers-reduced-motion)
- Accessible (keyboard navigation, ARIA labels, focus rings)

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd StudyPlannerHub
```

2. Install dependencies:
```bash
npm install
```

3. Add your logo (optional but recommended):
   - Place `logo.png` in the `public/` directory (recommended size: 512x512px or larger)
   - The logo will be used in header, favicon, and OpenGraph images
   - If no logo is provided, the app will work fine but the logo won't display

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
StudyPlannerHub/
├── app/                    # Next.js App Router pages
│   ├── blog/              # Blog pages
│   ├── timetable/         # Timetable builder
│   ├── countdown/         # Exam countdown
│   ├── study-plan/        # Study plan generator
│   └── dashboard/         # Dashboard
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Header, Footer
│   ├── timetable/         # Timetable-specific components
│   └── blog/              # Blog components
├── content/               # Content files
│   └── blog/              # Markdown blog posts
├── lib/                   # Utility functions
│   ├── storage.ts         # localStorage helpers
│   ├── blog.ts            # Blog post loading
│   └── utils.ts           # General utilities
├── types/                 # TypeScript type definitions
└── public/                # Static assets
    └── logo.png           # Your logo (add this)
```

## Configuration

### Branding & Colors

Colors are defined in `app/globals.css` using CSS variables:
- Primary colors: `--primary`, `--primary-foreground`
- Background: `--background`, `--foreground`
- Muted colors: `--muted`, `--muted-foreground`

To change branding:
1. Update colors in `app/globals.css`
2. Replace logo in `public/logo.png`
3. Update site name in `components/layout/header.tsx` and `components/layout/footer.tsx`

### Data Storage

All data is stored in browser localStorage:
- `timetable-classes`: Timetable class data
- `timetable-config`: Timetable settings
- `countdown-exams`: Exam countdown data
- `countdown-notifications`: Notification preferences
- `study-plan-state`: Study plan data

To reset all data, users can use the "Reset all data" option in Settings (to be implemented) or clear browser localStorage.

### Blog Posts

Blog posts are stored as Markdown files in `content/blog/`:
- Frontmatter: title, slug, description, date, category, readingTime, canonical
- Content: Markdown format with support for GFM
- Auto-generated table of contents
- Related posts based on category

To add a new blog post:
1. Create a new `.md` file in `content/blog/`
2. Add frontmatter with required fields
3. Write content in Markdown
4. The post will automatically appear in the blog index

## Self-Review Checklist

### Core Features
- ✅ Responsive design (mobile-first, 100% responsive)
- ✅ Dark/light mode with system preference detection
- ✅ Timetable conflict detection
- ✅ Drag & drop for timetable (react-dnd)
- ✅ Share links (URL-encoded state)
- ✅ Print view (CSS print styles)
- ✅ Image export (html2canvas)
- ✅ PDF export (jspdf + html2canvas, portrait & landscape)
- ✅ Exam countdown with timers
- ✅ Notifications (opt-in browser notifications)
- ✅ ICS export for exams and study plans
- ✅ Study plan generator with locking
- ✅ Blog index with search and filters
- ✅ Blog posts with markdown rendering
- ✅ Sitemap.xml generation
- ✅ Robots.txt

### Technical
- ✅ TypeScript throughout
- ✅ Next.js App Router
- ✅ Tailwind CSS with custom theme
- ✅ shadcn/ui components
- ✅ localStorage persistence
- ✅ SEO metadata (per page)
- ✅ OpenGraph/Twitter cards
- ✅ Accessible (keyboard nav, ARIA, focus rings)
- ✅ Performance optimized
- ✅ Mobile-first responsive

### Design
- ✅ Apple-inspired minimal design
- ✅ Premium spacing and typography
- ✅ Subtle shadows and borders
- ✅ Smooth micro-interactions
- ✅ Respects prefers-reduced-motion
- ✅ Logo integration (header, favicon, OG image)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Self-hosted with Node.js

## License

This project is open source and available for use.

## Support

For issues or questions, please open an issue on GitHub.

---

**Note:** General information provided. Adapt to your school's requirements.

