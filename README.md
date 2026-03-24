# Anurag Patel — Portfolio

A modern AI-themed portfolio built with pure HTML, CSS, and JavaScript. Features a book-flip page navigation, live neural network animation, and a clean light-themed layout.

## 🚀 Features

- **Book-flip page transitions** — smooth 3D CSS animations between sections
- **Live Neural Network** — animated canvas simulation on the right panel
- **Keyboard Navigation** — use `←` / `→` arrow keys to flip pages
- **Progress Bar** — tracks current position through the portfolio
- **Responsive Sidebar** — click any section to jump directly
- **Typewriter effect** — animated role titles on the home page
- **Downloadable Resume** — one-click CV download from navbar

## 📁 Folder Structure

```
portfolio/
├── index.html              ← Entry point
├── pages/                  ← HTML partials for each section
│   ├── home.html
│   ├── about.html
│   ├── skills.html
│   ├── projects.html
│   ├── certificates.html
│   ├── training.html
│   ├── education.html
│   └── contact.html
├── css/
│   ├── main.css            ← Variables, global styles, fonts
│   ├── layout.css          ← Navbar, sidebar, footer, grid
│   ├── book.css            ← Book flip animations
│   ├── neural.css          ← Neural panel styles
│   └── pages/
│       ├── home.css
│       └── sections.css    ← All section-specific styles
├── js/
│   ├── main.js             ← App init, keyboard nav, typewriter
│   ├── book.js             ← Page flip engine
│   └── neural.js           ← Canvas neural network animation
├── assets/
│   ├── images/
│   │   ├── profile/        ← Add your photo here
│   │   ├── projects/       ← Project screenshots
│   │   └── certificates/   ← Certificate images
│   └── resume/
│       └── resume.pdf      ← ⚠️ Add your CV here
└── vercel.json             ← Vercel deployment config
```

## 🛠️ Setup

### Local Development

```bash
# Option 1: Python server
python3 -m http.server 3000

# Option 2: Node.js
npx serve .

# Option 3: VS Code — use Live Server extension
```

Open `http://localhost:3000` in your browser.

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from portfolio folder
cd portfolio
vercel

# Or deploy to production
vercel --prod
```

## ✏️ Customization

### Add your photo
Place your photo at `assets/images/profile/photo.jpg` and update `pages/home.html`:
```html
<!-- Replace the initials div with: -->
<img src="assets/images/profile/photo.jpg" class="home-avatar" alt="Anurag Patel" />
```

### Add your resume
Place your PDF at `assets/resume/resume.pdf`

### Add project screenshots
Place images in `assets/images/projects/` and reference them in `pages/projects.html`

### Change colors
All colors are CSS variables in `css/main.css`:
```css
:root {
  --accent: #3B3FF0;      /* Primary indigo */
  --accent-2: #00C9B8;    /* Cyan */
  --accent-3: #7B5CF0;    /* Purple */
}
```

## 🎨 Design System

- **Font**: Syne (display) + DM Sans (body) + JetBrains Mono (code)
- **Colors**: Indigo + Cyan on soft off-white (#F4F6FF)
- **Theme**: "Neural Pages" — AI research paper meets modern dashboard

## 📦 Dependencies

Zero runtime dependencies — pure vanilla HTML/CSS/JS. Google Fonts loaded via CDN.

---

Made with ❤️ by Anurag Patel