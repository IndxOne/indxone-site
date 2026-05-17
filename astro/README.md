# INDXONE Site - Astro Version

This is the Astro-based version of the INDXONE website. It provides better maintainability, performance, and developer experience compared to the static HTML version.

## 🚀 Quick Start

```bash
# Install dependencies
cd astro
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Netlify
npm run deploy
```

## 📁 Project Structure

```
astro/
├── public/              # Static assets (images, CSS, JS, fonts)
│   ├── img/            # All images
│   ├── css/            # Global CSS files
│   ├── js/             # JavaScript files
│   ├── favicon.svg     # Favicon
│   ├── robots.txt      # Robots configuration
│   └── sitemap.xml     # Sitemap
│
├── src/
│   ├── components/     # Astro components
│   │   ├── Nav.astro
│   │   ├── Footer.astro
│   │   └── ServiceCard.astro
│   │
│   ├── layouts/        # Layout templates
│   │   └── Base.astro
│   │
│   ├── pages/          # Page routes
│   │   ├── index.astro
│   │   ├── collectivites.astro
│   │   ├── projets.astro
│   │   ├── mentions-legales.astro
│   │   ├── politique-confidentialite.astro
│   │   └── 404.astro
│   │
│   └── styles/         # CSS styles (imported in Base.astro)
│       ├── variables.css
│       ├── components.css
│       └── main.css
│
├── package.json        # Dependencies and scripts
├── astro.config.mjs    # Astro configuration
└── postcss.config.js   # PostCSS configuration
```

## 🎯 Migration Status

- [ ] Home page (index.astro)
- [ ] Collectivites page
- [ ] Projets page
- [ ] Merci page
- [ ] 404 page
- [ ] Legal pages
- [ ] All components
- [ ] CSS migration
- [ ] JavaScript migration

## 📦 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run check` | Check Astro configuration |
| `npm run lint` | Lint CSS and Astro files |
| `npm run format` | Format all files |
| `npm run deploy` | Deploy to Netlify (production) |
| `npm run deploy:staging` | Deploy to Netlify (staging) |

## 🔧 Configuration

### Netlify

The site is configured for Netlify deployment:
- Static site generation
- Redirects support
- Environment variables support

### Analytics

- **Plausible Analytics**: Lightweight, privacy-friendly analytics
- **Cloudflare Web Analytics**: Backup analytics option

### Theme System

- **Dark Mode**: Automatic detection + manual toggle
- **Light Mode**: Default theme
- **System Preference**: Respects user's OS theme preference
- **Local Storage**: Saves user preference

## 🎨 Features

### Built-in

- ✅ Dark mode support
- ✅ Responsive design
- ✅ Accessibility (ARIA labels, keyboard navigation)
- ✅ SEO optimized (Open Graph, Twitter Cards)
- ✅ Analytics ready
- ✅ PWA ready (manifest included)

### To Add

- [ ] Blog system
- [ ] Contact form processing
- [ ] Image optimization
- [ ] Search functionality
- [ ] Internationalization (if needed)

## 🔄 Sync with Static Site

To sync changes from the static site to Astro:

```bash
# Copy assets
cp -r ../img/* public/img/
cp -r ../css/* public/css/
cp -r ../js/* public/js/
cp ../favicon.svg public/
cp ../_redirects public/
cp ../robots.txt public/
cp ../sitemap.xml public/

# Copy styles
cp ../css/*.css src/styles/
```

## 📝 Notes

### Why Astro?

1. **Performance**: Astro generates static HTML with zero JavaScript by default
2. **Maintainability**: Component-based architecture
3. **Flexibility**: Supports multiple template languages
4. **Ecosystem**: Rich plugin ecosystem
5. **SEO**: Built-in SEO support
6. **TypeScript**: First-class TypeScript support

### CSS Strategy

- Global styles are imported in `Base.astro`
- Component-specific styles can be scoped or global
- Uses CSS custom properties (variables) for theming
- Supports both light and dark modes

### JavaScript Strategy

- Minimal client-side JavaScript
- Progressive enhancement
- Respects user preferences
- No jQuery or heavy frameworks

## 🤝 Contributing

1. Create a new branch
2. Make your changes
3. Test locally
4. Commit and push
5. Create a merge request

## 📄 License

MIT
