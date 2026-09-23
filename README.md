# UrbanBike Hub — Motorbike Showroom Landing Page

A responsive landing page for a motorbike showroom, featuring a bike carousel, the latest models, customer reviews and a rider FAQ. It's built with **Tailwind CSS** and **DaisyUI**.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20site-E76F51?style=for-the-badge&logo=githubpages&logoColor=white)](https://shayan-abrar.github.io/UrbanBike-Hub/) <!-- live-demo -->

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![DaisyUI](https://img.shields.io/badge/DaisyUI-5A0EF8?style=flat-square&logo=daisyui&logoColor=white)

![UrbanBike Hub landing page](screenshots/preview.png)

## Sections

- **Navbar** with shop, news, contact and login links
- **Hero carousel:** four bike slides with previous/next controls and a *Purchase* button
- **Latest bikes:** a gallery of new arrivals
- **Featured bike:** a spotlight card with a *Buy Now* call to action
- **Client reviews:** testimonials with DaisyUI star ratings
- **Rider FAQ:** a collapsible accordion with road-safety tips
- **Footer** with company info and social links

## Tech Stack

| Layer | Technology |
| --- | --- |
| Markup | HTML5 |
| Styling | Tailwind CSS (Play CDN) with a custom brand color, DaisyUI 4 (carousel, rating, collapse, cards) |
| Typography | Google Fonts (Poppins) |
| Hosting | GitHub Pages |

The brand accent (`bike-primary: #E76F51`) is added through an inline Tailwind config:

```html
<script>
  tailwind.config = {
    theme: { extend: { colors: { 'bike-primary': '#E76F51' } } }
  }
</script>
```

## Run Locally

```bash
git clone https://github.com/SHAYAN-ABRAR/UrbanBike-Hub.git
cd UrbanBike-Hub
# Open index.html in a browser
```

## What I Learned

- Extending Tailwind's theme with custom brand colors
- Using DaisyUI's carousel, rating and collapse components
- Designing a product-focused landing page for all screen sizes

## Author

**Shayan Abrar** · [GitHub](https://github.com/SHAYAN-ABRAR) · [LinkedIn](https://www.linkedin.com/in/shayan-abrar/) · [Portfolio](https://shayan-abrar.vercel.app)
