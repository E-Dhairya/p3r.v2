// Persona 3 Reload Personal Profile & Portfolio Data
// Edit this file to customize your profile details, skills, projects, and achievements!

export const PROFILE_DATA = {
  character: {
    name: "DHAIRYA",
    title: "FULL STACK ARCHITECT & UI SPECIALIST",
    arcana: "0 // THE FOOL",
    level: 99,
    hp: { current: 999, max: 999 },
    sp: { current: 999, max: 999 },
    status: "ACTIVE // READY FOR DEPLOYMENT",
    location: "GEKKOUMKAN DISTRICT // EARTH",
    bio: "Passionate engineer and creative developer specializing in highly responsive, visually stunning web applications and robust cloud architectures. Driven by precision, kinetic user interfaces, and clean code craftsmanship.",
    socialStats: [
      { name: "ACADEMICS", level: 6, max: 6, title: "Genius", desc: "Algorithms, Data Structures, System Design" },
      { name: "CHARM", level: 6, max: 6, title: "Charismatic", desc: "UI/UX Aesthetic, Kinetic Motion, Typography" },
      { name: "COURAGE", level: 6, max: 6, title: "Badass", desc: "Production Deployments, Debugging, High Stakes" }
    ],
    parameters: [
      { name: "FRONTEND", value: 98, label: "React / Vue / Canvas" },
      { name: "BACKEND", value: 92, label: "Node.js / Python / APIs" },
      { name: "SYSTEM DESIGN", value: 89, label: "Scalability & Microservices" },
      { name: "CREATIVE MOTION", value: 96, label: "CSS Physics / Shaders" },
      { name: "DEV OPS", value: 85, label: "Docker / CI/CD / Cloud" },
      { name: "AGILITY", value: 95, label: "Rapid Delivery & Iteration" }
    ]
  },

  skills: [
    {
      category: "SLASH // CORE JAVASCRIPT",
      element: "slash",
      elementColor: "#FF595E",
      cost: "18 SP",
      name: "TypeScript Mastery",
      tier: "Severe",
      description: "Inflicts massive type-safe architecture on complex enterprise codebases. Negates runtime errors."
    },
    {
      category: "AGI // REACT & COMPONENT ARCHITECTURE",
      element: "fire",
      elementColor: "#FF6B35",
      cost: "24 SP",
      name: "React & Next.js Tempest",
      tier: "Heavy",
      description: "Channels high-performance component trees with server-side rendering and state orchestration."
    },
    {
      category: "BUFU // BACKEND & DATABASES",
      element: "ice",
      elementColor: "#00E5FF",
      cost: "20 SP",
      name: "Node & Python Cryosphere",
      tier: "Heavy",
      description: "Constructs cold, resilient microservices, RESTful endpoints, and asynchronous event pipelines."
    },
    {
      category: "ZIO // GRAPHICS & MOTION",
      element: "elec",
      elementColor: "#FFD166",
      cost: "32 SP",
      name: "WebGL & Canvas Volt",
      tier: "Severe",
      description: "Discharges high-framerate 2D/3D procedural particle simulations, custom shaders, and interactive liquid canvases."
    },
    {
      category: "GARU // RESPONSIVE STYLING",
      element: "wind",
      elementColor: "#06D6A0",
      cost: "14 SP",
      name: "Tailwind & Fluid CSS Gale",
      tier: "Medium",
      description: "Generates swift, bespoke layout designs adhering to modern web guidance and kinetic spring animations."
    },
    {
      category: "HAMA // CLOUD & DEV OPS",
      element: "light",
      elementColor: "#F4F1DE",
      cost: "28 SP",
      name: "Containerized Judgement",
      tier: "Heavy",
      description: "Instantly containerizes and purifies application builds across distributed Kubernetes and Cloud providers."
    },
    {
      category: "MUDO // SECURITY & PERFORMANCE",
      element: "dark",
      elementColor: "#8338EC",
      cost: "22 SP",
      name: "Deadly Optimization",
      tier: "Medium",
      description: "Eradicates memory leaks, bottlenecks, and security vulnerabilities with surgical precision."
    },
    {
      category: "SUPPORT // PASSIVE",
      element: "support",
      elementColor: "#3A86FF",
      cost: "Auto",
      name: "Arms Master (Clean Code)",
      tier: "Passive",
      description: "Halves cognitive debt and doubles maintainability through clean architectural patterns and rigorous testing."
    }
  ],

  projects: [
    {
      id: "proj-1",
      title: "P3R Camp Interface System",
      category: "UNIQUE EQUIPMENT",
      rarity: "★★★★★",
      icon: "⚔️",
      tech: ["HTML5 Canvas", "Web Audio API", "Vanilla JS", "Modern CSS"],
      summary: "A 1:1 kinetic recreation of the Persona 3 Reload pause menu adapted into an interactive developer portfolio.",
      stats: { ATK: 999, DEF: 850, SPEED: "+100%" },
      liveUrl: "#",
      githubUrl: "https://github.com"
    },
    {
      id: "proj-2",
      title: "Aegis Cloud Monitoring Hub",
      category: "LEGENDARY RELIC",
      rarity: "★★★★★",
      icon: "🛡️",
      tech: ["Next.js", "TypeScript", "Go", "Prometheus", "Docker"],
      summary: "Autonomous infrastructure telemetry dashboard with real-time anomaly detection and WebSocket broadcast.",
      stats: { ATK: 740, DEF: 990, STABILITY: "+99%" },
      liveUrl: "#",
      githubUrl: "https://github.com"
    },
    {
      id: "proj-3",
      title: "Evoker Shader Engine",
      category: "RARE ARTIFACT",
      rarity: "★★★★☆",
      icon: "💎",
      tech: ["WebGL 2.0", "GLSL", "Three.js"],
      summary: "Procedural fluid simulations, caustic light refractive optics, and post-processing comic halftone passes.",
      stats: { ATK: 890, DEF: 600, FRAMERATE: "144 FPS" },
      liveUrl: "#",
      githubUrl: "https://github.com"
    },
    {
      id: "proj-4",
      title: "Nyx Distributed Task Queue",
      category: "SPECIAL ACCESSORY",
      rarity: "★★★★☆",
      icon: "🔮",
      tech: ["Python", "Redis", "FastAPI", "RabbitMQ"],
      summary: "High-throughput asynchronous job broker processing millions of distributed message events with zero loss.",
      stats: { ATK: 820, DEF: 910, LATENCY: "< 2ms" },
      liveUrl: "#",
      githubUrl: "https://github.com"
    }
  ],

  achievements: [
    {
      id: "REQ-01",
      title: "Request: Construct a Flawless Persona Interface",
      client: "Elizabeth",
      deadline: "End of the Tartarus Cycle",
      reward: "Infinite Rep & Developer Pride",
      status: "COMPLETED",
      date: "2026.09",
      description: "Elizabeth has requested an immaculate recreation of the S.E.E.S. terminal pause screen with real liquid physics."
    },
    {
      id: "REQ-02",
      title: "Request: Conquer Full-Stack Enterprise Deployment",
      client: "Igor",
      deadline: "No Limit",
      reward: "Philosopher's Stone (Senior Architect)",
      status: "COMPLETED",
      date: "2025.11",
      description: "Successfully fused frontend elegance with backend durability across high-traffic cloud infrastructure."
    },
    {
      id: "REQ-03",
      title: "Request: Tame the Open Source Shadows",
      client: "Officer Kurosawa",
      deadline: "Ongoing",
      reward: "Community Kudos x 10,000",
      status: "COMPLETED",
      date: "2025.04",
      description: "Contributed critical patches, UI animations, and documentation to widely adopted community software tools."
    },
    {
      id: "REQ-04",
      title: "Request: Hackathon Championship Trophy",
      client: "Kirijo Group R&D",
      deadline: "Past Milestone",
      reward: "First Place Grand Honor",
      status: "COMPLETED",
      date: "2024.08",
      description: "Architected and presented a real-time collaborative workspace within a grueling 48-hour development trial."
    }
  ],

  experience: [
    {
      role: "Lead Full-Stack Architect",
      organization: "Specialized Extracurricular Systems (S.E.E.S.)",
      period: "2024 — PRESENT",
      rank: "RANK 10 // MAX",
      points: [
        "Spearheaded architectural redesign of core web applications, slashing initial page loads by 45%.",
        "Engineered scalable component design system adopted across multi-functional development units.",
        "Championed accessibility, keyboard-first navigation standards, and fluid 60FPS UI motion."
      ]
    },
    {
      role: "Senior UI/UX Creative Engineer",
      organization: "Velvet Interactive Labs",
      period: "2022 — 2024",
      rank: "RANK 8",
      points: [
        "Built bespoke WebGL, Canvas, and CSS animations for high-profile client launches.",
        "Integrated Web Audio soundscapes and responsive micro-interactions into flagship consumer apps."
      ]
    },
    {
      role: "Software Engineering Scholar",
      organization: "Gekkukan Institute of Technology",
      period: "2019 — 2022",
      rank: "RANK 6",
      points: [
        "Earned top honors in Distributed Systems, Computer Graphics, and Software Engineering Principles.",
        "Led university hackathon organization and open-source development club."
      ]
    }
  ],

  system: {
    musicTrack: "Color Your Night (Persona 3 Reload)",
    soundEffects: true,
    contacts: [
      { name: "EMAIL ARCHIVE", value: "dhairya.dev@example.com", link: "mailto:dhairya.dev@example.com", icon: "✉️" },
      { name: "GITHUB REPOSITORY", value: "github.com/dhairya", link: "https://github.com", icon: "🐙" },
      { name: "LINKEDIN NETWORK", value: "linkedin.com/in/dhairya", link: "https://linkedin.com", icon: "💼" },
      { name: "DISCORD FREQUENCY", value: "@dhairya#0001", link: "#", icon: "🎮" }
    ]
  }
};
