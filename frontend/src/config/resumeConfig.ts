// Frontend configuration for Resume feature
export const RESUME_TEMPLATES = {
    CLASSIC: 'classic',
    MODERN: 'modern',
    MINIMAL: 'minimal',
    CREATIVE: 'creative',
    TECH: 'tech'
};

export const VALID_TEMPLATES = Object.values(RESUME_TEMPLATES);

export const RESUME_TEMPLATE_CONFIGS = [
    {
        id: RESUME_TEMPLATES.CLASSIC,
        title: "Classic",
        description: "Single-column, ATS-friendly layout.",
        accent: "text-sky-500"
    },
    {
        id: RESUME_TEMPLATES.MODERN,
        title: "Modern",
        description: "Clean sections with bold headings.",
        accent: "text-indigo-500"
    },
    {
        id: RESUME_TEMPLATES.MINIMAL,
        title: "Minimal",
        description: "Tight spacing for fast scanning.",
        accent: "text-emerald-500"
    },
    {
        id: RESUME_TEMPLATES.CREATIVE,
        title: "Creative",
        description: "Subtle highlights for projects.",
        accent: "text-rose-500"
    },
    {
        id: RESUME_TEMPLATES.TECH,
        title: "Tech Focus",
        description: "Skills-first, optimized for roles.",
        accent: "text-amber-500"
    }
];

export const ATS_ACTION_VERBS = [
    "led", "built", "designed", "developed", "implemented", "optimized", "improved",
    "reduced", "increased", "launched", "delivered", "automated", "created", "managed",
    "coordinated", "established", "initiated", "transformed", "accelerated"
];

export const ATS_STOP_WORDS = new Set([
    "and", "for", "with", "the", "a", "an", "to", "of", "in", "on", "at",
    "role", "engineer", "developer", "job"
]);

export const ATS_THRESHOLDS = {
    EXCELLENT: 80,
    GOOD: 60,
    NEEDS_WORK: 0
};

export const RESUME_FIELD_LIMITS = {
    NAME_MAX: 100,
    NAME_MIN: 2,
    EMAIL_MAX: 254,
    PHONE_MAX: 20,
    LOCATION_MAX: 100,
    HEADLINE_MAX: 150,
    SUMMARY_MAX: 1000,
    ROLE_MAX: 100,
    URL_MAX: 500,
    SKILL_MAX: 50,
    EXPERIENCE_MAX: 5000,
    PROJECT_MAX: 1000
};

export const RESUME_THEMES = {
    classic: { accent: "text-blue-700", chip: "bg-slate-100", sidebarTitle: "text-black" },
    modern: { accent: "text-indigo-700", chip: "bg-indigo-50", sidebarTitle: "text-indigo-800" },
    minimal: { accent: "text-slate-700", chip: "bg-slate-100", sidebarTitle: "text-slate-800" },
    creative: { accent: "text-rose-600", chip: "bg-rose-50", sidebarTitle: "text-rose-700" },
    tech: { accent: "text-amber-600", chip: "bg-amber-50", sidebarTitle: "text-amber-700" }
};
