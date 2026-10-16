// Engineering projects shown on /projects (and previewed on Home).
// Text comes from the original Projects page; `summary` is the first sentence
// (what it is), `built` the rest (how it was built).
export const PROJECTS = [
  {
    id: 'bullseye',
    name: 'Bullseye Scanner',
    area: 'Security · Full stack',
    summary:
      'A full-stack URL security scanner that analyzes links using the VirusTotal API and a custom crawler.',
    built:
      'The backend workflow processes scans, stores results in MongoDB, captures screenshots via Cloudinary, and serves filtered scan history with real-time results.',
    stack: ['React', 'Node.js', 'MongoDB', 'Cloudinary', 'VirusTotal API', 'Crawler'],
    links: [
      { label: 'Live demo', href: 'https://bullseye-n9jz.onrender.com/' },
      { label: 'Source', href: 'https://github.com/KRITHIKus/safelink' },
    ],
  },
  {
    id: 'a2d',
    name: 'A2D',
    area: 'Publishing · Full stack',
    summary:
      'The platform behind this publication: admin-controlled publishing with authentication, comments and likes.',
    built:
      'REST APIs with role-based access and MongoDB queries tuned for content management, with a React + Redux front end.',
    stack: ['React', 'Node.js', 'MongoDB', 'Express', 'Firebase', 'Redux', 'Vite'],
    links: [
      { label: "You're reading it", to: '/' },
      { label: 'Source', href: 'https://github.com/KRITHIKus/mern-blog' },
    ],
  },
  {
    id: 'farming-ai',
    name: 'AI Farming Web Service',
    area: 'Machine learning · Data',
    summary:
      'An AI-powered web application that recommends crops using a trained Random Forest model based on soil and weather inputs.',
    built:
      'It integrates real-time weather APIs and visualises market price trends to support data-driven farming decisions.',
    stack: ['React', 'Flask', 'TensorFlow', 'Chart.js', 'OpenWeather', 'Kaggle data'],
    links: [
      { label: 'Live demo', href: 'https://farmer-ai-x2hw.onrender.com/' },
      { label: 'Source', href: 'https://github.com/KRITHIKus/project24' },
    ],
  },
  {
    id: 'portfolio',
    name: 'Developer Portfolio',
    area: 'Front end',
    summary: 'A responsive developer portfolio built with React, focused on performance and clean UI.',
    built: 'Structured component design, deployed on Render with optimized loading.',
    stack: ['React', 'CSS', 'Render'],
    links: [
      { label: 'Visit site', href: 'https://krithik01.onrender.com' },
      { label: 'Source', href: 'https://github.com/KRITHIKus' },
    ],
  },
]
