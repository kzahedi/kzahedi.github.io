# Keyan Ghazi-Zahedi - Academic Homepage

A modern, responsive academic portfolio website.

## Structure

```
keyan-homepage/
├── index.html          # Home/About page
├── publications.html   # Publications list (auto-generated from BibTeX)
├── cv.html            # Curriculum Vitae
├── css/
│   └── style.css      # Main stylesheet
├── js/
│   ├── bibtex-parser.js  # BibTeX parser
│   └── main.js           # Site functionality
├── data/
│   └── zahedi.bib     # Publications in BibTeX format
└── assets/
    └── images/
        └── profile.jpg
```

## Deployment to GitHub Pages

1. Create a new repository on GitHub (e.g., `yourusername.github.io` or `homepage`)
2. Initialize git and push:
   ```bash
   cd keyan-homepage
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/repository.git
   git push -u origin main
   ```
3. Go to repository Settings > Pages
4. Set source to "Deploy from a branch" and select "main" branch
5. Your site will be available at `https://yourusername.github.io/repository/`

## Customization

- **Publications**: Update `data/zahedi.bib` with your BibTeX entries
- **Profile image**: Replace `assets/images/profile.jpg`
- **Content**: Edit HTML files directly
- **Styling**: Modify `css/style.css` (uses CSS variables for easy theming)

## Features

- Responsive design
- Automatic BibTeX parsing
- Publication filtering by year and type
- Modern, clean aesthetic
- No build step required
