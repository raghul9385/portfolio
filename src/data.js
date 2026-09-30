// ─────────────────────────────────────────────────────────────
//  All site content lives here. Edit this file to make it yours.
//  Any link set to null shows a "add your link" toast when clicked.
// ─────────────────────────────────────────────────────────────

export const profile = {
  firstName: 'Raghul',
  lastName: 'Babu J',
  handle: 'raghul-babu',
  role: 'React / React Native developer crafting',
  rotatingWords: ['smooth mobile apps', 'web experiences', 'clean interfaces', 'scalable back ends'],
  lede:
    'UI engineer and Software Developer at Cennest Technologies. I build fast, reliable web and mobile products with React, React Native and ASP.NET, from the SQL Server schema to the last screen transition.',
  availability: 'Open to work · on-site, hybrid, remote',
  location: 'Nagercoil, Tamil Nadu',
  timeZone: 'Asia/Kolkata',
  dailyStack: 'React · React Native · .NET',
  email: 'raghulbabuj@gmail.com',
  linkedin: 'https://www.linkedin.com/in/raghul-babu/',
  github: 'https://github.com/raghul9385',
  // Your number in international format, digits only (e.g. '919442987687').
  // Leave null and the WhatsApp button explains what to add.
  whatsapp: 9600843709,
  resume: null, // e.g. '/raghul-babu-resume.pdf' (file in /public)
};

export const socials = [
  { label: 'LinkedIn', meta: 'in/raghul-babu', href: 'https://www.linkedin.com/in/raghul-babu/' },
  { label: 'GitHub', meta: '@raghul9385', href: 'https://github.com/raghul9385' },
  { label: 'Email', meta: 'direct', href: `mailto:${profile.email}`, cursor: 'Write' },
  { label: 'Résumé', meta: 'PDF', href: profile.resume, placeholder: 'Add your résumé PDF link' },
];

export const marquee = ['React Native', 'React.js', 'TypeScript', 'Expo', 'Redux Toolkit', 'JavaScript', 'ASP.NET Core', 'C#', 'SQL Server', 'REST APIs', 'CSS', 'Clean Architecture'];

export const about = {
  paragraphs: [
    "I'm Raghul, a Software Developer at Cennest Technologies since June 2024, after a year as a Web Developer at Wikpolt Softwares. With 3+ years of experience, I specialise in React, React Native and ASP.NET, and I build scalable, high-performance web and mobile applications. I work across the whole stack: C#, .NET Core and SQL Server on the back end; JavaScript, Redux and REST APIs connecting it all to the interface.",
    "I like hard problems, fast apps and interfaces that feel effortless to use. I care about clean architecture and efficient code, so the app still makes sense to the next developer. I'm always picking up new technologies and enjoy working with teams on products that move a business forward.",
  ],
  principles: [
    'Smooth first: every tap, scroll and transition should feel instant.',
    'Clean architecture: clear layers, small components, obvious data flow.',
    'Measure performance before optimising it.',
    'One component system shared across web and mobile.',
  ],
  stats: [
    { value: 3, suffix: '+ yrs', label: 'Building for the web and mobile, at Wikpolt Softwares and Cennest Technologies' },
    { value: 2, suffix: ' apps', label: 'Production mobile apps: Mountain Rose Herbs and KidCheck' },
    { value: 3, suffix: ' layers', label: 'UI, API and database, all in my daily work' },
  ],
};

export const skills = [
  { title: 'Web frontend', tag: 'react', note: 'Responsive, component-driven interfaces with predictable state.', items: ['React.js', 'Redux', 'JavaScript', 'HTML5', 'CSS3', 'Responsive design'] },
  { title: 'Mobile', tag: 'react native', note: 'Cross-platform apps that feel native on Android and iOS.', items: ['React Native', 'Expo', 'TypeScript', 'Redux Toolkit', 'Reanimated', 'SQLite offline', 'Push notifications'] },
  { title: 'UI engineering', tag: 'craft', note: 'Turning designs into pixel-accurate, reusable components.', items: ['Design to code', 'Component libraries', 'Micro-interactions', 'Accessibility'] },
  { title: 'Backend', tag: '.net', note: 'Clean, layered APIs that front ends can rely on.', items: ['C#', '.NET Core', 'ASP.NET', 'REST APIs'] },
  { title: 'Data', tag: 'sql', note: 'Relational data modelled for the queries the app actually runs.', items: ['SQL Server', 'SQL', 'Database design', 'Query optimisation'] },
];

// Real projects from Cennest Technologies.
// `shot`: phone screenshot file name in src/assets/shots (e.g. mountain-rose-herbs.png) — replaces the drawn mock when present.
// `mock`: placeholder art when there is no image: shop | checkin | ledger | chart | calendar | chat
export const projects = [
  {
    title: "Mountain Rose Herbs", year: "iOS · Android", kind: "E-commerce · React Native", mock: "shop", theme: "m-herbs", url: "mountainroseherbs · shop", shot: "mountain-rose-herbs",
    problem: "An organic herbs and botanicals retailer needed a native shopping app that stays fast and dependable, even on a patchy connection.",
    role: "React Native app developer. I created the app UI: screens, reusable components and the theme system, connected to the store API.",
    result: "Full storefront app: shop, search, cart, wishlist, loyalty, gifts and checkout, with offline support and push notifications.",
    tech: ["React Native", "Expo Router", "TypeScript", "Redux Toolkit", "Reanimated", "SQLite", "Firebase", "BigCommerce", "Azure Functions", "Jest", "Maestro"],
    links: [{ label: "mountainroseherbs.com ↗", href: "https://mountainroseherbs.com/" }],
  },
  {
    title: "KidCheck", year: "iOS · Android", kind: "Child check-in · Web & mobile", mock: "checkin", theme: "m-kid", url: "kidcheck · sunday check-in", shot: "kidcheck", shot2: "kidcheck-kids",
    problem: "Churches and childcare programs need to check children in fast and make sure each child goes home only with an authorised adult.",
    role: "I fix front-end issues raised by the client across the check-in app, reports and the React web app, and work on the .NET application.",
    result: "Client-reported issues resolved across check-in, reporting and the web app, keeping check-in dependable for families and staff.",
    tech: ["React Native", "React.js", "ASP.NET", ".NET", "SQL", "Reports"],
    links: [{ label: "App Store ↗", href: "https://apps.apple.com/us/app/kidcheck/id617474663" }, { label: "kidcheck.com ↗", href: "https://www.kidcheck.com/" }],
  },
];

// Client websites built at Wikpolt Softwares. `shot` = file in src/assets/shots; tech detected from each live site.
export const websites = [
  {
    name: "Zonduo", kind: "PhD & research services", href: "https://zonduo.com/", shot: "site-zonduo",
    summary: "PhD assistance site with review badges, service mega-menus, code-booking and publication pages.",
    tech: ["HTML5", "Bootstrap", "jQuery", "Owl Carousel", "Isotope", "Animate.css", "PHP"],
  },
  {
    name: "Help for Thesis", kind: "Academic consulting", href: "https://helpforthesis.com/", shot: "site-helpforthesis",
    summary: "Lead-generation landing page with an inline “Book your papers” order form, live chat and service menus.",
    tech: ["Bootstrap", "jQuery UI", "AOS", "Owl Carousel", "Nice Select", "PHP"],
  },
  {
    name: "Wikpolt Softwares", kind: "Company website", href: "https://wikpoltsoftwares.com/", shot: "site-wikpolt",
    summary: "Site for an AI and software company, with a hexagon photo-grid hero plus courses, internship and careers pages.",
    tech: ["HTML5", "CSS3", "JavaScript", "Font Awesome", "PHP"],
  },
  {
    name: "Precise Global Technologies", kind: "Corporate website", href: "http://preciseglobaltechnologiies.com/", shot: "site-precise",
    summary: "Corporate site with a full-screen hero, animated fun-fact counters, a filterable portfolio grid and tilt effects.",
    tech: ["Bootstrap", "jQuery", "Swiper", "Slick", "AOS", "Isotope", "Tilt.js"],
  },
  {
    name: "eFurm Solution", kind: "Research support services", href: "https://efurmsolution.com/", shot: "site-efurm",
    summary: "Research-support site with animated stat counters, a lightbox gallery, sliders and a PHP enquiry form.",
    tech: ["Bootstrap 5", "AOS", "Swiper", "GLightbox", "PureCounter", "PHP"],
  },
];

// Add real dates and bullet points where you have them.
export const experience = [
  {
    hash: 'HEAD → a3f9c21', dates: 'Jun 2024 — Present', role: 'Software Developer', org: 'Cennest Technologies',
    summary: 'Full-time · Remote. Building scalable, high-performance web and mobile applications with React, React Native and ASP.NET.',
    points: [
      'Mountain Rose Herbs: React Native app developer. Created the UI for the storefront app (Expo, TypeScript, Redux Toolkit): shop, search, cart, wishlist, loyalty and checkout.',
      'KidCheck: fix client-raised front-end issues in the check-in app, reports and React app, and work on the ASP.NET application.',
      'Add offline storage with SQLite, push notifications and Firebase Analytics, and cover login, cart and wishlist flows with Jest and Maestro tests.',
          ],
  },
  {
    hash: '9d2b7e4', dates: '2023 — 2024', role: 'Web Developer', org: 'Wikpolt Softwares',
    summary: 'Based in Nagercoil. Built and shipped client websites for businesses and academic-services brands, from first layout to live launch.',
    points: [
      'Delivered websites for Zonduo, Help for Thesis, Precise Global Technologies and eFurm Solution, plus the company site.',
      'Built responsive layouts, enquiry and booking forms, testimonial carousels and scroll animations.',
    ],
  },
  {
    hash: 'init 0f00d1e', dates: 'Jun 2020 — Jun 2023', role: 'BE, Computer Science', org: "Stella Mary's College of Engineering",
    summary: 'Bachelor of Engineering in Computer Science. The foundation I built on for full-stack web and mobile development.',
    points: [],
  },
];
