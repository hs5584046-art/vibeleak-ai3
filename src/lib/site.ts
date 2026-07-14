export const siteConfig = {
  name: "VibeLytix",
  tagline: "Understand yourself. Improve your relationships. Make better decisions.",
  description: "Premium self-discovery assessments for personality, relationships, career, communication, leadership and growth.",
  navigation: [
    { label: "Assessments", href: "/#discover" },
    { label: "Products", href: "/#products" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "Learning", href: "/#learning" },
    { label: "Trust", href: "/#trust" }
  ],
  footer: {
    product: [
      { label: "Personality DNA", href: "/assessments/personality-dna" },
      { label: "Relationship Intelligence", href: "/assessments/relationship-intelligence" },
      { label: "Attachment Style", href: "/assessments/attachment-style" },
      { label: "Career Alignment", href: "/assessments/career-alignment" },
      { label: "Emotional Intelligence", href: "/assessments/emotional-intelligence" },
      { label: "Communication Style", href: "/assessments/communication-style" },
      { label: "Leadership Style", href: "/assessments/leadership-style" },
      { label: "Growth Systems", href: "/assessments/growth-systems" },
      { label: "Career Accelerator", href: "/products/career-accelerator" },
      { label: "Personal Life OS", href: "/products/personal-life-os" },
      { label: "Founder OS", href: "/products/founder-os" },
      { label: "Couple Compatibility", href: "/products/couple-compatibility" }
    ],
    company: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" }
    ],
    legal: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Refunds", href: "/refunds" }
    ]
  }
} as const;

export const assessmentCategories = [
  {
    id:"personality-dna", eyebrow:"Flagship assessment", title:"Personality DNA",
    description:"Map emotional depth, agency, connection and adaptability into a practical personal profile.",
    meta:"About 8 minutes", price:"Free preview · ₹149 full", status:"Most popular", featured:true, accent:"violet"
  },
  {
    id:"relationship-intelligence", eyebrow:"Relationships", title:"Relationship Intelligence",
    description:"Understand communication, boundaries, security and conflict-repair patterns.",
    meta:"About 6 minutes", price:"Free preview · ₹99 full", status:"Available now", featured:false, accent:"rose"
  },
  {
    id:"career-alignment", eyebrow:"Career", title:"Career Alignment",
    description:"Identify the work environment and motivation pattern that support sustainable performance.",
    meta:"About 6 minutes", price:"Free preview · ₹99 full", status:"Available now", featured:false, accent:"cyan"
  },
  {
    id:"growth-systems", eyebrow:"Self growth", title:"Growth Systems",
    description:"Measure consistency, awareness, recovery and environment design behind lasting change.",
    meta:"About 6 minutes", price:"Free preview · ₹99 full", status:"Available now", featured:false, accent:"amber"
  },
  {
    id:"attachment-style", eyebrow:"Relationships", title:"Attachment Style",
    description:"Explore how you respond to closeness, distance, reassurance and emotional risk.",
    meta:"About 5 minutes", price:"Free preview · ₹79 full", status:"New", featured:false, accent:"rose"
  },
  {
    id:"emotional-intelligence", eyebrow:"Self awareness", title:"Emotional Intelligence",
    description:"Assess emotional recognition, regulation, empathy and constructive expression.",
    meta:"About 5 minutes", price:"Free preview · ₹79 full", status:"New", featured:false, accent:"violet"
  },
  {
    id:"communication-style", eyebrow:"Communication", title:"Communication Style",
    description:"Discover your balance of directness, listening, context and assertiveness.",
    meta:"About 5 minutes", price:"Free preview · ₹79 full", status:"New", featured:false, accent:"cyan"
  },
  {
    id:"leadership-style", eyebrow:"Leadership", title:"Leadership Style",
    description:"Explore direction-setting, coaching, decision ownership and team trust.",
    meta:"About 5 minutes", price:"Free preview · ₹79 full", status:"New", featured:false, accent:"amber"
  }
] as const;

export const faqItems = [
  {
    question:"Is VibeLytix a clinical or diagnostic tool?",
    answer:"No. VibeLytix is for education and structured self-reflection. It does not diagnose mental-health conditions or replace qualified professional advice."
  },
  {
    question:"How are reports generated?",
    answer:"Answers are scored through transparent weighted models and converted into themes, strengths, cautions and practical next actions. Reports do not claim certainty."
  },
  {
    question:"What is free and what is paid?",
    answer:"Every assessment is free to complete and includes a meaningful preview. Detailed reports are optional one-time purchases priced from ₹79 to ₹149, with no subscription required."
  },
  {
    question:"Will my answers remain private?",
    answer:"Unfinished answers stay in your browser. Completed reports are generated server-side, and cloud saving is optional after sign-in. Sensitive credentials remain server-only."
  },
  {
    question:"Can a result predict my future or another person’s behaviour?",
    answer:"No. Results are reflection prompts based on your answers, not guaranteed predictions, mind reading or permanent identity labels."
  }
] as const;
