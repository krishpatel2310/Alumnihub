import { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { resumeService } from "@/services/ApiServices";
import {
    Sparkles,
    Download,
    PencilLine,
    Loader2,
    ArrowLeft,
    Plus,
    Trash2
} from "lucide-react";
import { RESUME_TEMPLATE_CONFIGS, RESUME_THEMES, ATS_ACTION_VERBS, ATS_STOP_WORDS, RESUME_FIELD_LIMITS } from "@/config/resumeConfig";
import {
    parseStrengthsInput,
    parseLanguagesInput,
    normalizeProfileUrl,
    validateLinkedInUrl,
    validateGithubUrl,
    toKeywordSet,
    wordCount
} from "@/utils/resumeUtils";

type ResumeContent = {
    name?: string;
    headline?: string;
    summary?: string;
    contact?: {
        email?: string;
        phone?: string;
        location?: string;
        linkedin?: string;
        github?: string;
    };
    skills?: string[];
    strengths?: Array<{ title?: string; detail?: string }>;
    languages?: Array<{ name?: string; level?: string }>;
    education?: Array<{ school?: string; degree?: string; year?: string }>;
    experience?: Array<{ role?: string; company?: string; startDate?: string; endDate?: string; bullets?: string[] }>;
    projects?: Array<{ name?: string; description?: string; tech?: string[] }>;
};

type AtsBreakdownItem = {
    label: string;
    points: number;
    max: number;
};

type AtsResult = {
    score: number;
    breakdown: AtsBreakdownItem[];
    suggestions: string[];
};

const calculateAtsScore = (resume: ResumeContent, targetRole?: string, rawSkillsInput?: string): AtsResult => {
    const suggestions: string[] = [];
    const breakdown: AtsBreakdownItem[] = [];

    const allBullets = (resume.experience || []).flatMap((exp) => exp.bullets || []).filter(Boolean);
    const bulletText = allBullets.join(" ").toLowerCase();
    const summaryWords = wordCount(resume.summary);
    const skillsCount = (resume.skills || []).filter(Boolean).length;
    const projectCount = (resume.projects || []).filter((project) => project?.name || project?.description).length;
    const experienceCount = (resume.experience || []).filter((exp) => exp?.role || exp?.company).length;
    const hasEducation = (resume.education || []).some((item) => item?.school || item?.degree);

    const resumeText = [
        resume.headline,
        resume.summary,
        (resume.skills || []).join(" "),
        (resume.experience || []).map((exp) => `${exp.role || ""} ${exp.company || ""} ${(exp.bullets || []).join(" ")}`).join(" "),
        (resume.projects || []).map((project) => `${project.name || ""} ${project.description || ""} ${(project.tech || []).join(" ")}`).join(" ")
    ].join(" ").toLowerCase();

    const roleKeywords = toKeywordSet(targetRole || "", ATS_STOP_WORDS);
    const inputSkillKeywords = toKeywordSet(rawSkillsInput || "", ATS_STOP_WORDS);
    const expectedKeywords = new Set([...Array.from(roleKeywords), ...Array.from(inputSkillKeywords)]);
    const matchedKeywords = Array.from(expectedKeywords).filter((keyword) => resumeText.includes(keyword));

    let contactPoints = 0;
    if (resume.contact?.email) contactPoints += 5;
    if (resume.contact?.phone) contactPoints += 3;
    if (resume.contact?.location) contactPoints += 3;
    if (resume.contact?.linkedin || resume.contact?.github) contactPoints += 4;
    if (contactPoints < 12) suggestions.push("Complete contact info with email, phone, location, and at least one profile link.");
    breakdown.push({ label: "Contact completeness", points: contactPoints, max: 15 });

    const headlinePoints = targetRole && resume.headline?.toLowerCase().includes(targetRole.toLowerCase().split(" ")[0]) ? 8 : 4;
    if (headlinePoints < 8) suggestions.push("Align headline more closely with your target role title.");
    breakdown.push({ label: "Role-aligned headline", points: headlinePoints, max: 10 });

    const summaryPoints = summaryWords >= 35 && summaryWords <= 90 ? 10 : summaryWords >= 20 ? 6 : 2;
    if (summaryPoints < 10) suggestions.push("Keep summary between 35-90 words with concrete strengths and domain focus.");
    breakdown.push({ label: "Professional summary", points: summaryPoints, max: 10 });

    const skillsPoints = skillsCount >= 10 ? 10 : skillsCount >= 7 ? 7 : skillsCount >= 4 ? 4 : 1;
    if (skillsPoints < 8) suggestions.push("Add more role-relevant skills (tools, frameworks, cloud, testing, data).");
    breakdown.push({ label: "Relevant skills coverage", points: skillsPoints, max: 10 });

    const experiencePoints = experienceCount >= 2 ? 10 : experienceCount === 1 ? 5 : 0;
    if (experiencePoints < 10) suggestions.push("Add at least 2 experience entries with dates and impact bullets.");
    breakdown.push({ label: "Experience depth", points: experiencePoints, max: 10 });

    const bulletsWithMetrics = allBullets.filter((bullet) => /\d|%|x|kpi|latency|users|revenue|cost|time/i.test(bullet)).length;
    const bulletsWithActionVerbs = allBullets.filter((bullet) => ATS_ACTION_VERBS.some((verb) => bullet.toLowerCase().startsWith(verb))).length;
    const metricRatio = allBullets.length ? bulletsWithMetrics / allBullets.length : 0;
    const actionRatio = allBullets.length ? bulletsWithActionVerbs / allBullets.length : 0;
    const achievementPoints = Math.min(20, Math.round(metricRatio * 12 + actionRatio * 8));
    if (achievementPoints < 14) suggestions.push("Rewrite bullets to start with action verbs and include measurable outcomes (%, time, scale, cost).");
    breakdown.push({ label: "Achievement-driven bullets", points: achievementPoints, max: 20 });

    const projectsWithTech = (resume.projects || []).filter((project) => (project.tech || []).length >= 2).length;
    const projectsPoints = projectCount >= 2 && projectsWithTech >= 1 ? 10 : projectCount >= 1 ? 6 : 0;
    if (projectsPoints < 8) suggestions.push("Include 1-2 strong projects with technologies and business/user impact.");
    breakdown.push({ label: "Project quality", points: projectsPoints, max: 10 });

    const educationPoints = hasEducation ? 5 : 0;
    if (!hasEducation) suggestions.push("Add an education section with degree, school, and year.");
    breakdown.push({ label: "Education section", points: educationPoints, max: 5 });

    const keywordPoints = expectedKeywords.size === 0
        ? 5
        : Math.min(10, Math.round((matchedKeywords.length / expectedKeywords.size) * 10));
    if (keywordPoints < 7) suggestions.push("Add more target-role keywords naturally across headline, summary, skills, and experience.");
    breakdown.push({ label: "Keyword alignment", points: keywordPoints, max: 10 });

    const score = Math.max(0, Math.min(100, breakdown.reduce((sum, item) => sum + item.points, 0)));

    return {
        score,
        breakdown,
        suggestions: Array.from(new Set(suggestions)).slice(0, 5)
    };
};

// Use configuration from resumeConfig
const templates = RESUME_TEMPLATE_CONFIGS;

const initialAnswers = {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    headline: "",
    targetRole: "",
    summary: "",
    education: "",
    skills: "",
    strengths: "",
    languages: "",
    projects: "",
    experience: "",
    linkedin: "",
    github: ""
};

const dummyResume = {
    name: "Alex Morgan",
    headline: "Senior Software Engineer",
    summary: "Full-stack developer with 5+ years of experience building scalable web applications. Passionate about clean code and user-centric design.",
    contact: {
        email: "alex@example.com",
        phone: "+1 (555) 123-4567",
        location: "San Francisco, CA",
        linkedin: "linkedin.com/in/alexmorgan",
        github: "github.com/alexmorgan"
    },
    skills: ["React", "TypeScript", "Node.js", "AWS", "Docker", "GraphQL", "Tailwind CSS"],
    strengths: [
        { title: "Creative Problem Solving", detail: "Solved production bottlenecks and improved reliability." },
        { title: "Strong Leadership", detail: "Mentored junior developers and led sprint execution." },
        { title: "Efficient Delivery", detail: "Shipped core features with measurable performance gains." }
    ],
    languages: [
        { name: "English", level: "Native" },
        { name: "Spanish", level: "Intermediate" }
    ],
    experience: [
        {
            role: "Senior Developer",
            company: "Tech Solutions Inc.",
            startDate: "2021",
            endDate: "Present",
            bullets: ["Led a team of 5 developers", "Reduced load times by 40%"]
        },
        {
            role: "Web Developer",
            company: "Creative Agency",
            startDate: "2018",
            endDate: "2021",
            bullets: ["Built sites for 20+ clients", "Implemented CMS solutions"]
        }
    ],
    education: [
        {
            school: "State University",
            degree: "B.S. Computer Science",
            year: "2018"
        }
    ],
    projects: [
        {
            name: "E-commerce Platform",
            description: "A full-featured shopping platform.",
            tech: ["Next.js", "Stripe"]
        }
    ]
};

const TemplateThumbnail = ({ template, selected, onClick }: { template: any, selected: boolean, onClick: () => void }) => {
    return (
        <div
            className={`cursor-pointer transition-all duration-300 transform hover:scale-[1.02]`}
            onClick={onClick}
        >
            <div 
                className={`w-full bg-white rounded-xl overflow-hidden relative border ${selected ? 'border-primary/70 ring-1 ring-primary/40' : 'border-border/70'}`}
                style={{ aspectRatio: "210/297" }}
            >
                <div className="absolute inset-0 flex items-start justify-center pointer-events-none">
                    <div className="origin-top scale-[0.28] sm:scale-[0.31] lg:scale-[0.30] xl:scale-[0.31] will-change-transform">
                        <div className="w-[794px] h-[1123px] bg-white text-black shadow-none">
                            {template.id === 'classic' && <ClassicLayout resumeContent={dummyResume} isEditing={false} />}
                            {template.id === 'modern' && <ModernLayout resumeContent={dummyResume} isEditing={false} />}
                            {template.id === 'minimal' && <MinimalLayout resumeContent={dummyResume} isEditing={false} />}
                            {template.id === 'creative' && <CreativeLayout resumeContent={dummyResume} isEditing={false} />}
                            {template.id === 'tech' && <TechLayout resumeContent={dummyResume} isEditing={false} />}
                        </div>
                    </div>
                </div>
                {/* Overlay for selection */}
                <div className={`absolute inset-0 bg-black/5 transition-opacity ${selected ? 'opacity-5' : 'opacity-0 hover:opacity-10'}`} />
            </div>
            <div className="mt-4 text-center">
                <h3 className="font-semibold text-sm text-white">{template.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{template.description}</p>
            </div>
        </div>
    );
};

// --- Template Components ---

const resumeThemes = RESUME_THEMES;

const ProfessionalLayout = ({ resumeContent, isEditing, updateContent, updateContact, updateArrayItem, addArrayItem, deleteArrayItem, variant = "classic" }: any) => {
    const theme = resumeThemes[variant] || resumeThemes.classic;
    const strengths = resumeContent.strengths || [];
    const languages = resumeContent.languages || [];
    const contact = resumeContent.contact || {};

    const summaryBlock = (
        <section>
            <h3 className="font-bold text-sm border-b border-gray-400 mb-2">SUMMARY</h3>
            {isEditing ? (
                <Textarea value={resumeContent.summary || ""} onChange={(e) => updateContent("summary", e.target.value)} className="bg-transparent border-dashed text-xs" />
            ) : (
                <p className="text-xs text-slate-700 leading-relaxed">{resumeContent.summary}</p>
            )}
        </section>
    );

    const experienceBlock = (
        <section>
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm border-b border-gray-400 w-full">EXPERIENCE</h3>
                {isEditing && <Button variant="outline" size="sm" onClick={() => addArrayItem("experience", { role: "", company: "", startDate: "", endDate: "", bullets: [] })}><Plus className="h-3 w-3" /></Button>}
            </div>
            <div className="space-y-3">
                {resumeContent.experience?.map((exp: any, i: number) => (
                    <div key={i} className="relative">
                        {isEditing && <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 text-destructive" onClick={() => deleteArrayItem("experience", i)}><Trash2 className="h-4 w-4" /></Button>}
                        <div className="font-semibold text-[13px]">{isEditing ? <Input value={exp.role || ""} onChange={(e) => updateArrayItem("experience", i, "role", e.target.value)} className="h-7 bg-transparent border-dashed" /> : exp.role}</div>
                        <div className={`font-semibold text-xs ${theme.accent}`}>{isEditing ? <Input value={exp.company || ""} onChange={(e) => updateArrayItem("experience", i, "company", e.target.value)} className="h-7 bg-transparent border-dashed" /> : exp.company}</div>
                        <div className="text-[11px] text-slate-600 mb-1">{isEditing ? <div className="flex gap-1"><Input value={exp.startDate || ""} onChange={(e) => updateArrayItem("experience", i, "startDate", e.target.value)} className="h-7 bg-transparent border-dashed" /><Input value={exp.endDate || ""} onChange={(e) => updateArrayItem("experience", i, "endDate", e.target.value)} className="h-7 bg-transparent border-dashed" /></div> : `${exp.startDate || ""} - ${exp.endDate || ""}`}</div>
                        {isEditing ? <Textarea value={(exp.bullets || []).join("\n")} onChange={(e) => updateArrayItem("experience", i, "bullets", e.target.value.split("\n"))} className="bg-transparent border-dashed text-xs" /> : <ul className="list-disc ml-4 text-xs text-slate-700 space-y-1">{(exp.bullets || []).map((b: string, idx: number) => <li key={idx}>{b}</li>)}</ul>}
                    </div>
                ))}
            </div>
        </section>
    );

    const skillsBlock = (
        <section>
            <h3 className="font-bold text-sm border-b border-gray-400 mb-2">SKILLS</h3>
            {isEditing ? (
                <Textarea value={(resumeContent.skills || []).join(", ")} onChange={(e) => updateContent("skills", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))} className="bg-transparent border-dashed text-xs" />
            ) : (
                <div className="flex flex-wrap gap-1.5">{(resumeContent.skills || []).map((s: string, i: number) => <span key={`${s}-${i}`} className={`px-2 py-0.5 rounded text-[10px] font-medium ${theme.chip}`}>{s}</span>)}</div>
            )}
        </section>
    );

    const strengthsBlock = (
        <section>
            <h3 className="font-bold text-sm border-b border-gray-400 mb-2">STRENGTHS</h3>
            {isEditing ? (
                <Textarea value={(strengths || []).map((item: any) => `${item.title || ""}${item.detail ? ` - ${item.detail}` : ""}`).join("\n")} onChange={(e) => updateContent("strengths", parseStrengthsInput(e.target.value))} className="bg-transparent border-dashed text-xs" />
            ) : (
                <div className="space-y-1.5 text-xs">{(strengths || []).map((item: any, i: number) => <div key={`${item.title || "strength"}-${i}`}><p className="font-semibold">{item.title}</p>{item.detail && <p className="text-slate-700">{item.detail}</p>}</div>)}</div>
            )}
        </section>
    );

    const languagesBlock = (
        <section>
            <h3 className="font-bold text-sm border-b border-gray-400 mb-2">LANGUAGES</h3>
            {isEditing ? (
                <Textarea value={(languages || []).map((item: any) => `${item.name || ""}${item.level ? ` - ${item.level}` : ""}`).join("\n")} onChange={(e) => updateContent("languages", parseLanguagesInput(e.target.value))} className="bg-transparent border-dashed text-xs" />
            ) : (
                <div className="flex flex-wrap gap-1.5">{(languages || []).map((item: any, i: number) => (
                    <span key={`${item.name || "language"}-${i}`} className="text-xs font-semibold">{item.name}</span>
                ))}</div>
            )}
        </section>
    );

    const educationBlock = (
        <section>
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm border-b border-gray-400 w-full">EDUCATION</h3>
                {isEditing && <Button variant="outline" size="sm" onClick={() => addArrayItem("education", { school: "", degree: "", year: "" })}><Plus className="h-3 w-3" /></Button>}
            </div>
            <div className="space-y-2">
                {(resumeContent.education || []).map((edu: any, i: number) => (
                    <div key={i} className="relative">
                        {isEditing && <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 text-destructive" onClick={() => deleteArrayItem("education", i)}><Trash2 className="h-4 w-4" /></Button>}
                        <div className="font-semibold text-[13px]">{isEditing ? <Input value={edu.degree || ""} onChange={(e) => updateArrayItem("education", i, "degree", e.target.value)} placeholder="Degree" className="h-7 bg-transparent border-dashed" /> : edu.degree}</div>
                        <div className={`text-xs ${theme.accent}`}>{isEditing ? <Input value={edu.school || ""} onChange={(e) => updateArrayItem("education", i, "school", e.target.value)} placeholder="School" className="h-7 bg-transparent border-dashed" /> : edu.school}</div>
                        <div className="text-[11px] text-slate-600">{isEditing ? <Input value={edu.year || ""} onChange={(e) => updateArrayItem("education", i, "year", e.target.value)} placeholder="Year" className="h-7 bg-transparent border-dashed" /> : edu.year}</div>
                    </div>
                ))}
            </div>
        </section>
    );

    const projectsBlock = (
        <section>
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm border-b border-gray-400 w-full">PROJECTS</h3>
                {isEditing && <Button variant="outline" size="sm" onClick={() => addArrayItem("projects", { name: "", description: "", tech: [] })}><Plus className="h-3 w-3" /></Button>}
            </div>
            <div className="space-y-3">
                {(resumeContent.projects || []).map((proj: any, i: number) => (
                    <div key={i} className="relative">
                        {isEditing && <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 text-destructive" onClick={() => deleteArrayItem("projects", i)}><Trash2 className="h-4 w-4" /></Button>}
                        <div className="font-semibold text-[13px]">{isEditing ? <Input value={proj.name || ""} onChange={(e) => updateArrayItem("projects", i, "name", e.target.value)} placeholder="Project name" className="h-7 bg-transparent border-dashed" /> : proj.name}</div>
                        <div className="text-[11px] text-slate-700 mt-0.5">{isEditing ? <Textarea value={proj.description || ""} onChange={(e) => updateArrayItem("projects", i, "description", e.target.value)} placeholder="Description" className="bg-transparent border-dashed text-xs" /> : proj.description}</div>
                        {isEditing ? (
                            <Input value={(proj.tech || []).join(", ")} onChange={(e) => updateArrayItem("projects", i, "tech", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))} placeholder="Tech (comma separated)" className="h-7 bg-transparent border-dashed mt-1" />
                        ) : (
                            <div className="flex flex-wrap gap-1 mt-1">{(proj.tech || []).map((t: string, ti: number) => <span key={`${t}-${ti}`} className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${theme.chip}`}>{t}</span>)}</div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );

    const headerInfo = (
        <>
            {isEditing ? <Input value={resumeContent.name || ""} onChange={(e) => updateContent("name", e.target.value)} className="text-3xl font-extrabold p-0 border-none h-auto bg-transparent text-black" /> : <h1 className="text-3xl font-extrabold tracking-tight">{resumeContent.name}</h1>}
            {isEditing ? <Input value={resumeContent.headline || ""} onChange={(e) => updateContent("headline", e.target.value)} className={`text-lg p-0 border-none h-auto bg-transparent ${theme.accent}`} /> : <p className={`text-lg font-semibold mt-0.5 ${theme.accent}`}>{resumeContent.headline}</p>}
            <div className="grid grid-cols-2 gap-1 mt-2 text-[11px] text-slate-700">
                {isEditing ? <Input value={contact.phone || ""} onChange={(e) => updateContact("phone", e.target.value)} placeholder="Phone" className="h-7 bg-transparent border-dashed" /> : contact.phone && <span>{contact.phone}</span>}
                {isEditing ? <Input value={contact.email || ""} onChange={(e) => updateContact("email", e.target.value)} placeholder="Email" className="h-7 bg-transparent border-dashed" /> : contact.email && <span>{contact.email}</span>}
                {isEditing ? <Input value={contact.linkedin || ""} onChange={(e) => updateContact("linkedin", e.target.value)} placeholder="LinkedIn URL" className="h-7 bg-transparent border-dashed" /> : contact.linkedin && <a href={normalizeProfileUrl(contact.linkedin)} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70">LinkedIn</a>}
                {isEditing ? <Input value={contact.location || ""} onChange={(e) => updateContact("location", e.target.value)} placeholder="Location" className="h-7 bg-transparent border-dashed" /> : contact.location && <span>{contact.location}</span>}
                {isEditing ? <Input value={contact.github || ""} onChange={(e) => updateContact("github", e.target.value)} placeholder="GitHub URL" className="h-7 bg-transparent border-dashed" /> : contact.github && <a href={normalizeProfileUrl(contact.github)} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70">GitHub</a>}
            </div>
        </>
    );

    if (variant === "classic") {
        return (
            <div className="p-8 max-w-[210mm] mx-auto font-serif text-[12px] leading-snug">
                <div className="border-b-2 border-black pb-3">{headerInfo}</div>
                <div className="space-y-4 mt-4">{summaryBlock}{experienceBlock}{educationBlock}{projectsBlock}{skillsBlock}{strengthsBlock}{languagesBlock}</div>
            </div>
        );
    }

    if (variant === "modern") {
        return (
            <div className="max-w-[210mm] mx-auto font-sans text-[12px] leading-snug">
                <div className="bg-slate-900 text-white p-7">
                    {isEditing ? <Input value={resumeContent.name || ""} onChange={(e) => updateContent("name", e.target.value)} className="text-3xl font-extrabold p-0 border-none h-auto bg-transparent text-white" /> : <h1 className="text-3xl font-extrabold">{resumeContent.name}</h1>}
                    {isEditing ? <Input value={resumeContent.headline || ""} onChange={(e) => updateContent("headline", e.target.value)} className="text-lg p-0 border-none h-auto bg-transparent text-indigo-300" /> : <p className="text-lg text-indigo-300 mt-0.5">{resumeContent.headline}</p>}
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-3 text-[11px] text-slate-300">
                        {contact.email && <span>{contact.email}</span>}{contact.phone && <span>{contact.phone}</span>}{contact.location && <span>{contact.location}</span>}
                        {contact.linkedin && <a href={normalizeProfileUrl(contact.linkedin)} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70">LinkedIn</a>}
                        {contact.github && <a href={normalizeProfileUrl(contact.github)} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70">GitHub</a>}
                    </div>
                </div>
                <div className="p-7 grid grid-cols-[62%_38%] gap-6">
                    <div className="space-y-5">{summaryBlock}{experienceBlock}{projectsBlock}</div>
                    <div className="space-y-5">{educationBlock}{skillsBlock}{strengthsBlock}{languagesBlock}</div>
                </div>
            </div>
        );
    }

    if (variant === "minimal") {
        return (
            <div className="p-7 max-w-[210mm] mx-auto font-sans text-[11px] leading-snug">
                <div className="pb-2 border-b border-slate-300">
                    {isEditing ? <Input value={resumeContent.name || ""} onChange={(e) => updateContent("name", e.target.value)} className="text-2xl font-semibold p-0 border-none h-auto bg-transparent" /> : <h1 className="text-2xl font-semibold">{resumeContent.name}</h1>}
                    {isEditing ? <Input value={resumeContent.headline || ""} onChange={(e) => updateContent("headline", e.target.value)} className="text-sm p-0 border-none h-auto bg-transparent text-slate-600" /> : <p className="text-sm text-slate-600">{resumeContent.headline}</p>}
                    <div className="flex flex-wrap items-center gap-x-1.5 text-[10px] text-slate-500 mt-1">
                        {[contact.email, contact.phone, contact.location].filter(Boolean).map((item, i) => <span key={i}>{i > 0 && <span className="mr-1.5">•</span>}{item}</span>)}
                        {contact.linkedin && <><span>•</span><a href={normalizeProfileUrl(contact.linkedin)} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70">LinkedIn</a></>}
                        {contact.github && <><span>•</span><a href={normalizeProfileUrl(contact.github)} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70">GitHub</a></>}
                    </div>
                </div>
                <div className="space-y-3 mt-3">{summaryBlock}{experienceBlock}{projectsBlock}{educationBlock}<div className="grid grid-cols-2 gap-4">{skillsBlock}{languagesBlock}</div>{strengthsBlock}</div>
            </div>
        );
    }

    if (variant === "creative") {
        return (
            <div className="max-w-[210mm] mx-auto font-sans text-[12px] leading-snug grid grid-cols-[33%_67%] min-h-[1123px]">
                <div className="bg-rose-50 p-6 space-y-4 border-r border-rose-200">
                    <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center text-2xl font-bold text-rose-700 mx-auto">{(resumeContent.name || "A").slice(0, 1).toUpperCase()}</div>
                    <div className="text-center">
                        <h2 className="font-bold text-lg text-rose-700">{resumeContent.name}</h2>
                        <p className="text-xs text-rose-600">{resumeContent.headline}</p>
                    </div>
                    <section className="text-xs space-y-1"><p>{contact.email}</p><p>{contact.phone}</p><p>{contact.location}</p>{contact.linkedin && <p><a href={normalizeProfileUrl(contact.linkedin)} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70">LinkedIn</a></p>}{contact.github && <p><a href={normalizeProfileUrl(contact.github)} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70">GitHub</a></p>}</section>
                    {skillsBlock}
                    {languagesBlock}
                    {educationBlock}
                </div>
                <div className="p-7 space-y-5">{summaryBlock}{experienceBlock}{projectsBlock}{strengthsBlock}</div>
            </div>
        );
    }

    return (
        <div className="p-7 max-w-[210mm] mx-auto font-mono text-[11px] leading-snug">
            <div className="border-b-2 border-amber-500 pb-2">
                <p className="text-xs text-amber-600">// candidate profile</p>
                {isEditing ? <Input value={resumeContent.name || ""} onChange={(e) => updateContent("name", e.target.value)} className="text-2xl font-bold p-0 border-none h-auto bg-transparent" /> : <h1 className="text-2xl font-bold">{resumeContent.name}</h1>}
                <p className="text-amber-700">{resumeContent.headline}</p>
            </div>
            <div className="grid grid-cols-[30%_70%] gap-6 mt-4">
                <div className="space-y-4">
                    <section><h3 className="text-xs font-bold text-amber-700 mb-1">// contact</h3><p className="text-[10px] break-all">{contact.email}</p><p className="text-[10px]">{contact.phone}</p><p className="text-[10px]">{contact.location}</p>{contact.linkedin && <p className="text-[10px]"><a href={normalizeProfileUrl(contact.linkedin)} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70">LinkedIn</a></p>}{contact.github && <p className="text-[10px]"><a href={normalizeProfileUrl(contact.github)} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70">GitHub</a></p>}</section>
                    {educationBlock}
                    {skillsBlock}
                    {languagesBlock}
                </div>
                <div className="space-y-4">{summaryBlock}{experienceBlock}{projectsBlock}{strengthsBlock}</div>
            </div>
        </div>
    );
};

const ClassicLayout = (props: any) => <ProfessionalLayout {...props} variant="classic" />;
const ModernLayout = (props: any) => <ProfessionalLayout {...props} variant="modern" />;
const MinimalLayout = (props: any) => <ProfessionalLayout {...props} variant="minimal" />;
const CreativeLayout = (props: any) => <ProfessionalLayout {...props} variant="creative" />;
const TechLayout = (props: any) => <ProfessionalLayout {...props} variant="tech" />;


export default function Resume() {
    const { toast } = useToast();
    const [view, setView] = useState<"templates" | "questions" | "preview">("templates");

    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [answers, setAnswers] = useState(initialAnswers);
    const [resumeContent, setResumeContent] = useState<ResumeContent | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [urlErrors, setUrlErrors] = useState({ linkedin: "", github: "" });
    const generationAbortController = useRef<AbortController | null>(null);

    // Resume Print Ref
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Resume - ${(answers.fullName || resumeContent?.name || "Resume").trim()}`,
    });

    useEffect(() => {
        const loadDraft = async () => {
            try {
                const response = await resumeService.getDraft();
                if (response?.success && response?.data?.content) {
                    setResumeContent(response.data.content);
                    setSelectedTemplate(response.data.templateId || null);
                    setAnswers({ ...initialAnswers, ...(response.data.answers || {}) });
                }
            } catch (error) {
                // Ignore missing draft
            }
        };

        loadDraft();
    }, []);

    // Cleanup abort controller on unmount
    useEffect(() => {
        return () => {
            generationAbortController.current?.abort();
        };
    }, []);

    const handleGenerate = async () => {
        // Prevent concurrent generation requests
        if (isGenerating) {
            toast({
                title: "Generation in progress",
                description: "Please wait for the current generation to complete.",
                variant: "destructive"
            });
            return;
        }

        if (!selectedTemplate) {
            toast({ title: "Select a template", description: "Choose a resume template to continue.", variant: "destructive" });
            return;
        }

        if (!answers.fullName || !answers.targetRole) {
            toast({ title: "Missing details", description: "Full name and target role are required.", variant: "destructive" });
            return;
        }

        const linkedin = normalizeProfileUrl(answers.linkedin);
        const github = normalizeProfileUrl(answers.github);

        const linkedinError = validateLinkedInUrl(linkedin);
        const githubError = validateGithubUrl(github);

        setUrlErrors({ linkedin: linkedinError, github: githubError });

        if (linkedinError || githubError) {
            toast({
                title: "Invalid profile URLs",
                description: "Please fix LinkedIn/GitHub URL format before generating.",
                variant: "destructive"
            });
            return;
        }

        const normalizedAnswers = {
            ...answers,
            linkedin,
            github
        };

        setAnswers(normalizedAnswers);
        setIsGenerating(true);
        generationAbortController.current = new AbortController();

        try {
            const response = await resumeService.generateResume({
                templateId: selectedTemplate,
                answers: normalizedAnswers
            });

            // Check if request was aborted
            if (generationAbortController.current?.signal.aborted) {
                return;
            }

            if (response?.success) {
                // Merge manual fields that might be lost by AI generation
                const generatedContent = response.data.content || {};
                setResumeContent({
                    ...generatedContent,
                    strengths: generatedContent.strengths?.length ? generatedContent.strengths : parseStrengthsInput(answers.strengths),
                    languages: generatedContent.languages?.length ? generatedContent.languages : parseLanguagesInput(answers.languages)
                });
                setView("preview");
                toast({ title: "Resume generated", description: "AI built your resume draft." });
            }
        } catch (error: any) {
            // Don't show error if request was aborted
            if (error.name !== 'AbortError') {
                toast({
                    title: "Generation failed",
                    description: error?.message || "Try again.",
                    variant: "destructive"
                });
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!selectedTemplate || !resumeContent) return;

        try {
            const response = await resumeService.saveDraft({
                templateId: selectedTemplate,
                answers,
                content: resumeContent,
                status: "draft"
            });

            if (response?.success) {
                toast({ title: "Changes saved", description: "Your resume has been updated." });
                setIsEditing(false);
            }
        } catch (error: any) {
            toast({ title: "Save failed", description: "Could not save changes.", variant: "destructive" });
        }
    };

    const updateContent = (field: string, value: any) => {
        if (!resumeContent) return;
        setResumeContent({ ...resumeContent, [field]: value });
    };

    const updateContact = (field: string, value: string) => {
        if (!resumeContent) return;
        setResumeContent({
            ...resumeContent,
            contact: { ...resumeContent.contact, [field]: value }
        });
    };

    // Helper to update specific item in an array (e.g., education[0].school)
    const updateArrayItem = (section: keyof ResumeContent, index: number, field: string, value: string | string[]) => {
        if (!resumeContent || !Array.isArray(resumeContent[section])) return;
        const newArray = [...(resumeContent[section] as any[])];
        newArray[index] = { ...newArray[index], [field]: value };
        setResumeContent({ ...resumeContent, [section]: newArray });
    };

    const deleteArrayItem = (section: keyof ResumeContent, index: number) => {
        if (!resumeContent || !Array.isArray(resumeContent[section])) return;
        const newArray = [...(resumeContent[section] as any[])];
        newArray.splice(index, 1);
        setResumeContent({ ...resumeContent, [section]: newArray });
    };

    const addArrayItem = (section: keyof ResumeContent, newItem: any) => {
        if (!resumeContent) return;
        const currentArray = Array.isArray(resumeContent[section]) ? (resumeContent[section] as any[]) : [];
        setResumeContent({ ...resumeContent, [section]: [...currentArray, newItem] });
    };

    const handleProfileUrlChange = (field: "linkedin" | "github", value: string) => {
        setAnswers((prev) => ({ ...prev, [field]: value }));

        const error = field === "linkedin" ? validateLinkedInUrl(value) : validateGithubUrl(value);
        setUrlErrors((prev) => ({ ...prev, [field]: error }));
    };

    const handleProfileUrlBlur = (field: "linkedin" | "github", value: string) => {
        const normalizedValue = normalizeProfileUrl(value);
        setAnswers((prev) => ({ ...prev, [field]: normalizedValue }));

        const error = field === "linkedin" ? validateLinkedInUrl(normalizedValue) : validateGithubUrl(normalizedValue);
        setUrlErrors((prev) => ({ ...prev, [field]: error }));
    };

    const atsResult = resumeContent ? calculateAtsScore(resumeContent, answers.targetRole, answers.skills) : null;
    const atsBadgeVariant = atsResult?.score && atsResult.score >= 80 ? "default" : atsResult?.score && atsResult.score >= 60 ? "secondary" : "destructive";

    return (
        <div className="space-y-6 animate-fade-in px-1 sm:px-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-1">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text mb-0.5 sm:mb-1">Resume Builder</h1>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                        Build a polished resume with AI-assisted sections and clean templates.
                    </p>
                </div>




            </div>

            {view === "templates" && (
                <div className="animate-fade-in">
                    <div className="mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">Choose a template</h2>
                            <p className="text-muted-foreground">Select a style to get started.</p>
                        </div>
                    </div>

                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {templates.map((template) => (
                            <TemplateThumbnail
                                key={template.id}
                                template={template}
                                selected={selectedTemplate === template.id}
                                onClick={() => {
                                    setSelectedTemplate(template.id);
                                    setAnswers({ ...initialAnswers }); // Reset answers as per request
                                    setResumeContent(null); // Clear previous content
                                    setView("questions");
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {view === "questions" && (
                <Card className="border-muted/50">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Button variant="ghost" size="sm" className="gap-2" onClick={() => setView("templates")}>
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                        </div>
                        <CardTitle className="text-base">Answer a few questions</CardTitle>
                        <CardDescription>Provide details for the AI resume draft.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Input placeholder="Full name" value={answers.fullName} onChange={(event) => setAnswers({ ...answers, fullName: event.target.value })} />
                            <Input placeholder="Target role" value={answers.targetRole} onChange={(event) => setAnswers({ ...answers, targetRole: event.target.value })} />
                            <Input placeholder="Email" value={answers.email} onChange={(event) => setAnswers({ ...answers, email: event.target.value })} />
                            <Input placeholder="Phone" value={answers.phone} onChange={(event) => setAnswers({ ...answers, phone: event.target.value })} />
                            <Input placeholder="Location" value={answers.location} onChange={(event) => setAnswers({ ...answers, location: event.target.value })} />
                            <Input placeholder="Headline" value={answers.headline} onChange={(event) => setAnswers({ ...answers, headline: event.target.value })} />
                            <Input
                                placeholder="LinkedIn URL"
                                value={answers.linkedin}
                                onChange={(event) => handleProfileUrlChange("linkedin", event.target.value)}
                                onBlur={(event) => handleProfileUrlBlur("linkedin", event.target.value)}
                                className={urlErrors.linkedin ? "border-destructive focus-visible:ring-destructive" : ""}
                            />
                            <Input
                                placeholder="GitHub URL"
                                value={answers.github}
                                onChange={(event) => handleProfileUrlChange("github", event.target.value)}
                                onBlur={(event) => handleProfileUrlBlur("github", event.target.value)}
                                className={urlErrors.github ? "border-destructive focus-visible:ring-destructive" : ""}
                            />
                        </div>

                        {(urlErrors.linkedin || urlErrors.github) && (
                            <div className="space-y-1">
                                {urlErrors.linkedin && <p className="text-xs text-destructive">{urlErrors.linkedin}</p>}
                                {urlErrors.github && <p className="text-xs text-destructive">{urlErrors.github}</p>}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground">Professional Summary <span className="font-normal text-muted-foreground">(2-3 lines)</span></label>
                            <Textarea
                                className="min-h-[90px]"
                                value={answers.summary}
                                onChange={(event) => setAnswers({ ...answers, summary: event.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground">Education <span className="font-normal text-muted-foreground">(one per line: School - Degree - Year)</span></label>
                            <Textarea
                                className="min-h-[90px]"
                                value={answers.education}
                                onChange={(event) => setAnswers({ ...answers, education: event.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground">Skills <span className="font-normal text-muted-foreground">(comma separated)</span></label>
                            <Textarea
                                className="min-h-[80px]"
                                value={answers.skills}
                                onChange={(event) => setAnswers({ ...answers, skills: event.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground">Strengths <span className="font-normal text-muted-foreground">(one per line: Strength Title - Supporting detail)</span></label>
                            <Textarea
                                className="min-h-[90px]"
                                value={answers.strengths}
                                onChange={(event) => setAnswers({ ...answers, strengths: event.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground">Languages</label>
                            <div className="grid grid-cols-2 gap-2 p-3 rounded-md border border-input bg-background">
                                {["English", "Hindi", "Gujarati", "Bengali", "Telugu", "Marathi", "Tamil", "Kannada", "Malayalam", "Punjabi"].map((lang) => {
                                    const selected = answers.languages.split("\n").some((line) => line.trim().toLowerCase().startsWith(lang.toLowerCase()));
                                    return (
                                        <label key={lang} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={selected}
                                                onChange={(e) => {
                                                    const lines = answers.languages.split("\n").filter((l) => l.trim());
                                                    if (e.target.checked) {
                                                        setAnswers({ ...answers, languages: [...lines, `${lang} - Native`].join("\n") });
                                                    } else {
                                                        setAnswers({ ...answers, languages: lines.filter((l) => !l.trim().toLowerCase().startsWith(lang.toLowerCase())).join("\n") });
                                                    }
                                                }}
                                                className="h-4 w-4 rounded border-input accent-primary"
                                            />
                                            {lang}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground">Projects <span className="font-normal text-muted-foreground">(one per line: Name - Description - Tech)</span></label>
                            <Textarea
                                className="min-h-[90px]"
                                value={answers.projects}
                                onChange={(event) => setAnswers({ ...answers, projects: event.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground">Internship Experience <span className="font-normal text-muted-foreground">(one per line: Role - Company - Dates - Highlights)</span></label>
                            <Textarea
                                className="min-h-[110px]"
                                value={answers.experience}
                                onChange={(event) => setAnswers({ ...answers, experience: event.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                            <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2">
                                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                Build Resume with AI
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {view === "preview" && resumeContent && (
                <div className="animate-fade-in pb-20">
                    <div className="flex items-center gap-2 mb-4">
                        <Button variant="ghost" size="sm" className="gap-2" onClick={() => setView("templates")}>
                            <ArrowLeft className="h-4 w-4" />
                            Back to Templates
                        </Button>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold">Your Resume ({templates.find(t => t.id === selectedTemplate)?.title})</h2>
                            <p className="text-muted-foreground text-sm">Review, edit, and export your resume.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {isEditing ? (
                                <>
                                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                                    <Button size="sm" onClick={handleSave} className="gap-2">Save Changes</Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Edit Content</Button>
                                    <Button variant="outline" size="sm" onClick={() => setView("questions")}>Edit Answers</Button>
                                    <Button size="sm" className="gap-2" onClick={() => handlePrint()}>
                                        <Download className="h-4 w-4" />
                                        Export PDF
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {atsResult && (
                        <Card className="mb-6 border-muted/50">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between gap-2">
                                    <CardTitle className="text-base">ATS Readiness</CardTitle>
                                    <Badge variant={atsBadgeVariant as any}>{atsResult.score}/100</Badge>
                                </div>
                                <CardDescription>
                                    {atsResult.score >= 80
                                        ? "Strong ATS structure. Keep tailoring keywords to each job description."
                                        : "Improve the items below to move this resume above 80."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Progress value={atsResult.score} className="h-2" />
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {atsResult.breakdown.map((item) => (
                                        <div key={item.label} className="flex items-center justify-between rounded-md border border-muted/60 px-3 py-2 text-sm">
                                            <span>{item.label}</span>
                                            <span className="font-semibold">{item.points}/{item.max}</span>
                                        </div>
                                    ))}
                                </div>
                                {atsResult.suggestions.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium mb-2">Top improvements</p>
                                        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                            {atsResult.suggestions.map((suggestion, index) => (
                                                <li key={`${suggestion}-${index}`}>{suggestion}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Resume Container - Centered A4 */}
                    <div className="flex justify-center p-4 sm:p-8 rounded-lg overflow-auto">
                        <div className="shadow-2xl print:shadow-none">
                            <style type="text/css" media="print">
                                {`
                                  @page { size: auto;  margin: 0mm; }
                                  @media print {
                                    body { -webkit-print-color-adjust: exact; }
                                  }
                                `}
                            </style>
                            <div
                                ref={componentRef}
                                className={`bg-white text-black min-h-[297mm] w-[210mm] overflow-hidden relative ${selectedTemplate === 'minimal' ? '' : ''}`}
                            >
                                {selectedTemplate === 'classic' && <ClassicLayout resumeContent={resumeContent} isEditing={isEditing} updateContent={updateContent} updateContact={updateContact} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} deleteArrayItem={deleteArrayItem} />}
                                {selectedTemplate === 'modern' && <ModernLayout resumeContent={resumeContent} isEditing={isEditing} updateContent={updateContent} updateContact={updateContact} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} deleteArrayItem={deleteArrayItem} />}
                                {selectedTemplate === 'minimal' && <MinimalLayout resumeContent={resumeContent} isEditing={isEditing} updateContent={updateContent} updateContact={updateContact} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} deleteArrayItem={deleteArrayItem} />}
                                {selectedTemplate === 'creative' && <CreativeLayout resumeContent={resumeContent} isEditing={isEditing} updateContent={updateContent} updateContact={updateContact} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} deleteArrayItem={deleteArrayItem} />}
                                {selectedTemplate === 'tech' && <TechLayout resumeContent={resumeContent} isEditing={isEditing} updateContent={updateContent} updateContact={updateContact} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} deleteArrayItem={deleteArrayItem} />}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

