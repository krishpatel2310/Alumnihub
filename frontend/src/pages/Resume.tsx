import { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { resumeService } from "@/services/ApiServices";
import {
    FileText,
    Sparkles,
    Download,
    PencilLine,
    Loader2,
    ArrowLeft,
    CheckCircle2,
    Plus,
    Trash2
} from "lucide-react";

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
    college?: string;
    field?: string;
    skills?: string[];
    education?: Array<{ school?: string; degree?: string; year?: string }>;
    experience?: Array<{ role?: string; company?: string; startDate?: string; endDate?: string; bullets?: string[] }>;
    projects?: Array<{ name?: string; description?: string; tech?: string[] }>;
};

const templates = [
    { id: "classic", title: "Classic", description: "Single-column, ATS-friendly layout.", accent: "text-sky-500" },
    { id: "modern", title: "Modern", description: "Clean sections with bold headings.", accent: "text-indigo-500" },
    { id: "minimal", title: "Minimal", description: "Tight spacing for fast scanning.", accent: "text-emerald-500" },
    { id: "creative", title: "Creative", description: "Subtle highlights for projects.", accent: "text-rose-500" },
    { id: "tech", title: "Tech Focus", description: "Skills-first, optimized for roles.", accent: "text-amber-500" }
];

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
    projects: "",
    experience: "",
    linkedin: "",
    github: "",
    college: "",
    field: ""
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
            <div className="aspect-[210/297] w-full bg-white rounded-lg shadow-sm overflow-hidden relative border-none">
                <div className="absolute inset-0 origin-top-left transform scale-[0.25] sm:scale-[0.33] md:scale-[0.25] lg:scale-[0.3]">
                    <div className="w-[210mm] min-h-[297mm] bg-white text-black shadow-none pointer-events-none">
                        {template.id === 'classic' && <ClassicLayout resumeContent={dummyResume} isEditing={false} />}
                        {template.id === 'modern' && <ModernLayout resumeContent={dummyResume} isEditing={false} />}
                        {template.id === 'minimal' && <MinimalLayout resumeContent={dummyResume} isEditing={false} />}
                        {template.id === 'creative' && <CreativeLayout resumeContent={dummyResume} isEditing={false} />}
                        {template.id === 'tech' && <TechLayout resumeContent={dummyResume} isEditing={false} />}
                    </div>
                </div>
                {/* Overlay for selection */}
                <div className={`absolute inset-0 bg-black/5 transition-opacity ${selected ? 'opacity-10' : 'opacity-0 hover:opacity-10'}`} />
            </div>
            <div className="mt-3 text-center">
                <h3 className="font-semibold text-sm text-white">{template.title}</h3>
                <p className="text-xs text-muted-foreground">{template.description}</p>
            </div>
        </div>
    );
};

// --- Template Components ---

const ClassicLayout = ({ resumeContent, isEditing, updateContent, updateContact, updateArrayItem, addArrayItem, deleteArrayItem }: any) => (
    <div className="p-8 max-w-[210mm] mx-auto space-y-6 font-serif">
        <div className="text-center border-b-2 border-black pb-4">
            {isEditing ? <Input value={resumeContent.name} onChange={(e) => updateContent("name", e.target.value)} className="text-3xl font-bold text-center border-none focus-visible:ring-0 p-0 h-auto bg-transparent text-black placeholder:text-gray-400" /> : <h1 className="text-3xl font-bold uppercase tracking-widest">{resumeContent.name}</h1>}
            {isEditing ? <Input value={resumeContent.headline} onChange={(e) => updateContent("headline", e.target.value)} className="text-center border-none focus-visible:ring-0 p-0 h-auto bg-transparent text-black placeholder:text-gray-400" /> : <p className="text-lg italic mt-1">{resumeContent.headline}</p>}
            {isEditing ? <div className="flex justify-center gap-2"><Input value={resumeContent.college} onChange={(e) => updateContent("college", e.target.value)} placeholder="College/University" className="text-center bg-transparent text-black placeholder:text-gray-400 border-dashed border-gray-300 w-1/2" /><Input value={resumeContent.field} onChange={(e) => updateContent("field", e.target.value)} placeholder="Field of Study" className="text-center bg-transparent text-black placeholder:text-gray-400 border-dashed border-gray-300 w-1/2" /></div> : (resumeContent.college || resumeContent.field) && <p className="text-md mt-1">{[resumeContent.college, resumeContent.field].filter(Boolean).join(" • ")}</p>}
            <div className="flex flex-wrap justify-center gap-3 text-sm mt-2">
                {resumeContent.contact?.email && <span>{resumeContent.contact.email}</span>}
                {resumeContent.contact?.phone && <span>| {resumeContent.contact.phone}</span>}
                {resumeContent.contact?.location && <span>| {resumeContent.contact.location}</span>}
                {resumeContent.contact?.linkedin && <a href={resumeContent.contact.linkedin} target="_blank" rel="noreferrer" className="hover:underline text-blue-800">| LinkedIn</a>}
                {resumeContent.contact?.github && <a href={resumeContent.contact.github} target="_blank" rel="noreferrer" className="hover:underline text-blue-800">| GitHub</a>}
            </div>
        </div>
        <ResumeSections resumeContent={resumeContent} isEditing={isEditing} updateContent={updateContent} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} deleteArrayItem={deleteArrayItem} layout="classic" />
    </div>
);

const ModernLayout = ({ resumeContent, isEditing, updateContent, updateContact, updateArrayItem, addArrayItem, deleteArrayItem }: any) => (
    <div className="p-0 max-w-[210mm] mx-auto font-sans h-full flex flex-col">
        <div className="bg-slate-800 text-white p-8">
            {isEditing ? <Input value={resumeContent.name} onChange={(e) => updateContent("name", e.target.value)} className="text-4xl font-bold bg-transparent border-none text-white focus-visible:ring-0 p-0 h-auto" /> : <h1 className="text-4xl font-bold">{resumeContent.name}</h1>}
            {isEditing ? <Input value={resumeContent.headline} onChange={(e) => updateContent("headline", e.target.value)} className="text-xl text-white bg-transparent border-dashed border-b border-slate-600 focus:border-white focus-visible:ring-0 p-0 h-auto placeholder:text-slate-400" /> : <p className="text-xl text-slate-300 mt-1">{resumeContent.headline}</p>}
            {isEditing ? <div className="flex gap-2 mt-2"><Input value={resumeContent.college} onChange={(e) => updateContent("college", e.target.value)} placeholder="College" className="bg-transparent text-white placeholder:text-slate-400 border-dashed border-slate-600 focus:border-white" /><Input value={resumeContent.field} onChange={(e) => updateContent("field", e.target.value)} placeholder="Field of Study" className="bg-transparent text-white placeholder:text-slate-400 border-dashed border-slate-600 focus:border-white" /></div> : (resumeContent.college || resumeContent.field) && <p className="text-md text-slate-300 mt-1">{[resumeContent.college, resumeContent.field].filter(Boolean).join(" • ")}</p>}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-400">
                {resumeContent.contact?.email && <span>{resumeContent.contact.email}</span>}
                {resumeContent.contact?.phone && <span>{resumeContent.contact.phone}</span>}
                {resumeContent.contact?.location && <span>{resumeContent.contact.location}</span>}
                {resumeContent.contact?.linkedin && <a href={resumeContent.contact.linkedin} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">LinkedIn</a>}
                {resumeContent.contact?.github && <a href={resumeContent.contact.github} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>}
            </div>
        </div>
        <div className="p-8 space-y-6">
            <ResumeSections resumeContent={resumeContent} isEditing={isEditing} updateContent={updateContent} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} deleteArrayItem={deleteArrayItem} layout="modern" />
        </div>
    </div>
);

const MinimalLayout = ({ resumeContent, isEditing, updateContent, updateContact, updateArrayItem, addArrayItem, deleteArrayItem }: any) => (
    <div className="p-8 max-w-[210mm] mx-auto font-sans text-sm leading-snug">
        <div className="mb-6">
            {isEditing ? <Input value={resumeContent.name} onChange={(e) => updateContent("name", e.target.value)} className="text-2xl font-semibold border-none focus-visible:ring-0 p-0 h-auto bg-transparent text-black placeholder:text-gray-400" /> : <h1 className="text-2xl font-semibold">{resumeContent.name}</h1>}
            {isEditing ? <div className="flex gap-2 my-1"><Input value={resumeContent.college} onChange={(e) => updateContent("college", e.target.value)} placeholder="College" className="bg-transparent text-black placeholder:text-gray-400 border-dashed border-gray-300 h-6 text-sm" /><Input value={resumeContent.field} onChange={(e) => updateContent("field", e.target.value)} placeholder="Field" className="bg-transparent text-black placeholder:text-gray-400 border-dashed border-gray-300 h-6 text-sm" /></div> : (resumeContent.college || resumeContent.field) && <p className="text-sm text-muted-foreground mb-1">{[resumeContent.college, resumeContent.field].filter(Boolean).join(" • ")}</p>}
            <div className="flex flex-wrap gap-x-2 text-muted-foreground">
                {resumeContent.contact?.email && <span>{resumeContent.contact.email}</span>}
                {resumeContent.contact?.phone && <span>· {resumeContent.contact.phone}</span>}
                {resumeContent.contact?.location && <span>· {resumeContent.contact.location}</span>}
                {resumeContent.contact?.linkedin && <a href={resumeContent.contact.linkedin} target="_blank" rel="noreferrer" className="hover:text-black">· LinkedIn</a>}
                {resumeContent.contact?.github && <a href={resumeContent.contact.github} target="_blank" rel="noreferrer" className="hover:text-black">· GitHub</a>}
            </div>
        </div>
        <ResumeSections resumeContent={resumeContent} isEditing={isEditing} updateContent={updateContent} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} deleteArrayItem={deleteArrayItem} layout="minimal" />
    </div>
);

const CreativeLayout = ({ resumeContent, isEditing, updateContent, updateContact, updateArrayItem, addArrayItem, deleteArrayItem }: any) => (
    <div className="grid grid-cols-[35%_65%] min-h-[1100px] max-w-[210mm] mx-auto font-sans">
        <div className="bg-rose-50 p-6 space-y-6 border-r border-rose-100">
            <div className="space-y-1">
                {isEditing ? <Input value={resumeContent.contact?.email} onChange={(e) => updateContact("email", e.target.value)} placeholder="Email" className="bg-transparent text-black placeholder:text-gray-400 border-rose-200" /> : <div className="text-sm"><strong>Email</strong><br />{resumeContent.contact?.email}</div>}
                {isEditing ? <Input value={resumeContent.contact?.phone} onChange={(e) => updateContact("phone", e.target.value)} placeholder="Phone" className="bg-transparent text-black placeholder:text-gray-400 border-rose-200" /> : <div className="text-sm"><strong>Phone</strong><br />{resumeContent.contact?.phone}</div>}
                {isEditing ? <Input value={resumeContent.contact?.location} onChange={(e) => updateContact("location", e.target.value)} placeholder="Location" className="bg-transparent text-black placeholder:text-gray-400 border-rose-200" /> : <div className="text-sm"><strong>Location</strong><br />{resumeContent.contact?.location}</div>}
                {isEditing ? <Input value={resumeContent.contact?.linkedin} onChange={(e) => updateContact("linkedin", e.target.value)} placeholder="LinkedIn" className="bg-transparent text-black placeholder:text-gray-400 border-rose-200" /> : resumeContent.contact?.linkedin && <div className="text-sm"><strong>LinkedIn</strong><br /><a href={resumeContent.contact.linkedin} target="_blank" rel="noreferrer" className="hover:underline break-all">Profile</a></div>}
                {isEditing ? <Input value={resumeContent.contact?.github} onChange={(e) => updateContact("github", e.target.value)} placeholder="GitHub" className="bg-transparent text-black placeholder:text-gray-400 border-rose-200" /> : resumeContent.contact?.github && <div className="text-sm"><strong>GitHub</strong><br /><a href={resumeContent.contact.github} target="_blank" rel="noreferrer" className="hover:underline break-all">Profile</a></div>}
            </div>

            <div>
                <h3 className="uppercase tracking-widest text-rose-500 font-bold text-sm mb-3 border-b border-rose-200 pb-1">Skills</h3>
                {isEditing ? (
                    <Textarea value={resumeContent.skills?.join(", ")} onChange={(e) => updateContent("skills", e.target.value.split(","))} className="bg-transparent text-black placeholder:text-gray-400 border-rose-200" />
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {resumeContent.skills?.map((s: string) => <span key={s} className="bg-white border border-rose-100 px-2 py-1 text-xs rounded-sm">{s}</span>)}
                    </div>
                )}
            </div>

            {(resumeContent.education?.length > 0 || isEditing) && (
                <div>
                    <h3 className="uppercase tracking-widest text-rose-500 font-bold text-sm mb-3 border-b border-rose-200 pb-1">Education</h3>
                    <div className="space-y-4">
                        {resumeContent.education?.map((edu: any, i: number) => (
                            <div key={i} className="text-sm">
                                <div className="font-bold">{edu.school}</div>
                                <div>{edu.degree}</div>
                                <div className="text-muted-foreground text-xs">{edu.year}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
        <div className="p-8 space-y-6">
            <div>
                {isEditing ? <Input value={resumeContent.name} onChange={(e) => updateContent("name", e.target.value)} className="text-4xl font-bold text-rose-600 border-none p-0 bg-transparent placeholder:text-rose-300" /> : <h1 className="text-4xl font-bold text-rose-600">{resumeContent.name}</h1>}
                {isEditing ? <Input value={resumeContent.headline} onChange={(e) => updateContent("headline", e.target.value)} className="text-xl border-none p-0 bg-transparent text-black placeholder:text-gray-400" /> : <p className="text-xl font-light">{resumeContent.headline}</p>}
                {isEditing ? <div className="flex gap-2 mt-2"><Input value={resumeContent.college} onChange={(e) => updateContent("college", e.target.value)} placeholder="College" className="bg-transparent text-black placeholder:text-gray-400 border-rose-200" /><Input value={resumeContent.field} onChange={(e) => updateContent("field", e.target.value)} placeholder="Field" className="bg-transparent text-black placeholder:text-gray-400 border-rose-200" /></div> : (resumeContent.college || resumeContent.field) && <p className="text-sm text-muted-foreground mt-1">{[resumeContent.college, resumeContent.field].filter(Boolean).join(" • ")}</p>}
            </div>
            <ResumeSections resumeContent={resumeContent} isEditing={isEditing} updateContent={updateContent} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} deleteArrayItem={deleteArrayItem} layout="creative" />
        </div>
    </div>
);

const TechLayout = ({ resumeContent, isEditing, updateContent, updateContact, updateArrayItem, addArrayItem, deleteArrayItem }: any) => (
    <div className="p-8 max-w-[210mm] mx-auto font-mono text-sm">
        <div className="border-b-4 border-amber-400 pb-6 mb-6">
            {isEditing ? <Input value={resumeContent.name} onChange={(e) => updateContent("name", e.target.value)} className="text-3xl font-bold border-none p-0 bg-transparent text-black placeholder:text-gray-400" /> : <h1 className="text-3xl font-bold tracking-tighter">{resumeContent.name}</h1>}
            <p className="text-amber-600 font-bold mt-1">
                {">"} {resumeContent.headline}
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1 space-y-6">
                <div>
                    <h3 className="font-bold uppercase border-b border-gray-200 mb-2">Contact</h3>
                    <ul className="space-y-1 text-xs break-all">
                        {resumeContent.contact?.email && <li>{resumeContent.contact.email}</li>}
                        {resumeContent.contact?.phone && <li>{resumeContent.contact.phone}</li>}
                        {resumeContent.contact?.github && <li><a href={resumeContent.contact.github} target="_blank" rel="noreferrer" className="hover:underline text-amber-600">github: {resumeContent.contact.github.replace('https://github.com/', '')}</a></li>}
                        {resumeContent.contact?.linkedin && <li><a href={resumeContent.contact.linkedin} target="_blank" rel="noreferrer" className="hover:underline text-amber-600">linkedin: Profile</a></li>}
                        {(resumeContent.college || resumeContent.field) && <li className="mt-2 text-amber-700">{[resumeContent.college, resumeContent.field].filter(Boolean).join(" • ")}</li>}
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold uppercase border-b border-gray-200 mb-2">Skills</h3>
                    {isEditing ? (
                        <Textarea value={resumeContent.skills?.join(", ")} onChange={(e) => updateContent("skills", e.target.value.split(","))} className="text-xs font-mono" />
                    ) : (
                        <ul className="space-y-1 text-xs">
                            {resumeContent.skills?.map((s: string) => <li key={s} className="before:content-['-'] before:mr-1">{s}</li>)}
                        </ul>
                    )}
                </div>
            </div>
            <div className="md:col-span-3 space-y-6">
                <ResumeSections resumeContent={resumeContent} isEditing={isEditing} updateContent={updateContent} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} deleteArrayItem={deleteArrayItem} layout="tech" />
            </div>
        </div>
    </div>
);


export default function Resume() {
    const { toast } = useToast();
    const [view, setView] = useState<"templates" | "questions" | "preview">("templates");

    // Resume Print Ref
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Resume - ${initialAnswers.fullName || "Draft"}`,
    });
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [answers, setAnswers] = useState(initialAnswers);
    const [resumeContent, setResumeContent] = useState<ResumeContent | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const loadDraft = async () => {
            try {
                const response = await resumeService.getDraft();
                if (response?.success && response?.data?.content) {
                    setResumeContent(response.data.content);
                    setSelectedTemplate(response.data.templateId || null);
                    setAnswers({ ...initialAnswers, ...(response.data.answers || {}) });
                    // setView("preview"); // User requested to always see templates first
                }
            } catch (error) {
                // Ignore missing draft
            }
        };

        loadDraft();
    }, []);

    const handleGenerate = async () => {
        if (!selectedTemplate) {
            toast({ title: "Select a template", description: "Choose a resume template to continue.", variant: "destructive" });
            return;
        }

        if (!answers.fullName || !answers.targetRole) {
            toast({ title: "Missing details", description: "Full name and target role are required.", variant: "destructive" });
            return;
        }

        setIsGenerating(true);
        try {
            const response = await resumeService.generateResume({
                templateId: selectedTemplate,
                answers
            });

            if (response?.success) {
                // Merge manual fields that might be lost by AI generation
                const generatedContent = response.data.content || {};
                setResumeContent({
                    ...generatedContent,
                    college: answers.college,
                    field: answers.field
                });
                setView("preview");
                toast({ title: "Resume generated", description: "AI built your resume draft." });
            }
        } catch (error: any) {
            toast({ title: "Generation failed", description: error?.message || "Try again.", variant: "destructive" });
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
                    <div className="flex items-center gap-2 mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">Choose a template</h2>
                            <p className="text-muted-foreground">Select a style to get started.</p>
                        </div>
                    </div>

                    <div className="grid gap-8 grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
                            <Input placeholder="LinkedIn URL" value={answers.linkedin} onChange={(event) => setAnswers({ ...answers, linkedin: event.target.value })} />
                            <Input placeholder="GitHub URL" value={answers.github} onChange={(event) => setAnswers({ ...answers, github: event.target.value })} />
                            <Input placeholder="College/University" value={answers.college} onChange={(event) => setAnswers({ ...answers, college: event.target.value })} />
                            <Input placeholder="Field of Study/Major" value={answers.field} onChange={(event) => setAnswers({ ...answers, field: event.target.value })} />
                        </div>

                        <Textarea
                            placeholder="Professional summary (2-3 lines)"
                            className="min-h-[90px]"
                            value={answers.summary}
                            onChange={(event) => setAnswers({ ...answers, summary: event.target.value })}
                        />
                        <Textarea
                            placeholder="Education (one per line: School - Degree - Year)"
                            className="min-h-[90px]"
                            value={answers.education}
                            onChange={(event) => setAnswers({ ...answers, education: event.target.value })}
                        />
                        <Textarea
                            placeholder="Skills (comma separated)"
                            className="min-h-[80px]"
                            value={answers.skills}
                            onChange={(event) => setAnswers({ ...answers, skills: event.target.value })}
                        />
                        <Textarea
                            placeholder="Projects (one per line: Name - Description - Tech)"
                            className="min-h-[90px]"
                            value={answers.projects}
                            onChange={(event) => setAnswers({ ...answers, projects: event.target.value })}
                        />
                        <Textarea
                            placeholder="Experience (one per line: Role - Company - Dates - Highlights)"
                            className="min-h-[110px]"
                            value={answers.experience}
                            onChange={(event) => setAnswers({ ...answers, experience: event.target.value })}
                        />
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

// Sub-component to handle common sections to avoid massive duplication
// This ignores specific layouts for simplicity in this artifact, but normally would be customized per layout
// For urgency, I am making a generic section renderer that adapts slightly
function ResumeSections({ resumeContent, isEditing, updateContent, updateArrayItem, addArrayItem, deleteArrayItem, layout }: any) {
    const isCreative = layout === 'creative';
    const isTech = layout === 'tech';

    // Creative template handles education/skills in sidebar, so skip here
    const showEducation = layout !== 'creative';

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className={`${isTech ? 'mb-8' : ''}`}>
                <h3 className={`uppercase font-bold text-sm mb-2 ${layout === 'modern' ? 'text-slate-800 border-b-2 border-slate-800' : ''} ${layout === 'classic' ? 'border-b border-gray-300' : ''} ${layout === 'creative' ? 'text-rose-500' : ''} ${layout === 'tech' ? 'text-amber-600' : ''}`}>
                    {layout === 'tech' ? '// Summary' : 'Summary'}
                </h3>
                {isEditing ? (
                    <Textarea value={resumeContent.summary} onChange={(e) => updateContent("summary", e.target.value)} className="w-full bg-transparent text-black border-dashed border-gray-300 focus:border-solid placeholder:text-gray-400" />
                ) : (
                    <p className="opacity-90 leading-relaxed">{resumeContent.summary}</p>
                )}
            </div>

            {/* Experience */}
            {(resumeContent.experience?.length > 0 || isEditing) && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className={`uppercase font-bold text-sm ${layout === 'modern' ? 'text-slate-800 border-b-2 border-slate-800 w-full' : ''} ${layout === 'classic' ? 'border-b border-gray-300 w-full' : ''} ${layout === 'creative' ? 'text-rose-500' : ''} ${layout === 'tech' ? 'text-amber-600' : ''}`}>
                            {layout === 'tech' ? '// Experience' : 'Experience'}
                        </h3>
                        {isEditing && <Button variant="outline" size="sm" onClick={() => addArrayItem("experience", { role: "", company: "", startDate: "", endDate: "", bullets: [] })}><Plus className="h-3 w-3" /></Button>}
                    </div>
                    <div className="space-y-4">
                        {resumeContent.experience?.map((exp: any, i: number) => (
                            <div key={i} className="relative group">
                                {isEditing && <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 text-destructive" onClick={() => deleteArrayItem("experience", i)}><Trash2 className="h-4 w-4" /></Button>}
                                <div className="flex justify-between items-baseline mb-1">
                                    <div className="font-bold">
                                        {isEditing ? <Input value={exp.role} onChange={(e) => updateArrayItem("experience", i, "role", e.target.value)} placeholder="Role" className="font-bold h-7 bg-transparent text-black border-dashed border-gray-300 focus:border-solid placeholder:text-gray-400" /> : exp.role}
                                    </div>
                                    <div className="text-sm whitespace-nowrap">
                                        {isEditing ? <div className="flex gap-1"><Input value={exp.startDate} onChange={(e) => updateArrayItem("experience", i, "startDate", e.target.value)} className="w-20 h-7 bg-transparent text-black border-dashed border-gray-300 focus:border-solid placeholder:text-gray-400" />-<Input value={exp.endDate} onChange={(e) => updateArrayItem("experience", i, "endDate", e.target.value)} className="w-20 h-7 bg-transparent text-black border-dashed border-gray-300 focus:border-solid placeholder:text-gray-400" /></div> : `${exp.startDate} - ${exp.endDate}`}
                                    </div>
                                </div>
                                <div className={`${layout === 'tech' ? 'text-amber-800' : 'text-muted-foreground'} text-sm mb-2`}>
                                    {isEditing ? <Input value={exp.company} onChange={(e) => updateArrayItem("experience", i, "company", e.target.value)} placeholder="Company" className="h-7 bg-transparent text-black border-dashed border-gray-300 focus:border-solid placeholder:text-gray-400" /> : exp.company}
                                </div>
                                {isEditing ? (
                                    <Textarea value={exp.bullets?.join("\n")} onChange={(e) => updateArrayItem("experience", i, "bullets", e.target.value.split("\n"))} className="bg-transparent text-black border-dashed border-gray-300 focus:border-solid placeholder:text-gray-400" />
                                ) : (
                                    <ul className={`list-disc list-outside ml-4 space-y-1 text-sm ${layout === 'modern' ? 'marker:text-slate-400' : ''}`}>
                                        {exp.bullets?.map((b: string, idx: number) => <li key={idx}>{b}</li>)}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Projects */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className={`uppercase font-bold text-sm ${layout === 'modern' ? 'text-slate-800 border-b-2 border-slate-800 w-full' : ''} ${layout === 'classic' ? 'border-b border-gray-300 w-full' : ''} ${layout === 'creative' ? 'text-rose-500' : ''} ${layout === 'tech' ? 'text-amber-600' : ''}`}>
                        {layout === 'tech' ? '// Projects' : 'Projects'}
                    </h3>
                    {isEditing && <Button variant="outline" size="sm" onClick={() => addArrayItem("projects", { name: "", description: "", tech: [] })}><Plus className="h-3 w-3" /></Button>}
                </div>
                <div className="space-y-4">
                    {resumeContent.projects?.map((proj: any, i: number) => (
                        <div key={i} className="relative group">
                            {isEditing && <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 text-destructive" onClick={() => deleteArrayItem("projects", i)}><Trash2 className="h-4 w-4" /></Button>}
                            <div className="font-bold">
                                {isEditing ? <Input value={proj.name} onChange={(e) => updateArrayItem("projects", i, "name", e.target.value)} placeholder="Project Name" className="font-bold h-7 bg-transparent text-black border-dashed border-gray-300 focus:border-solid placeholder:text-gray-400" /> : proj.name}
                            </div>
                            <div className="text-sm mt-1">
                                {isEditing ? <Textarea value={proj.description} onChange={(e) => updateArrayItem("projects", i, "description", e.target.value)} className="bg-transparent text-black border-dashed border-gray-300 focus:border-solid placeholder:text-gray-400" /> : proj.description}
                            </div>
                            {proj.tech && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {isEditing ? (
                                        <Input value={proj.tech.join(", ")} onChange={(e) => updateArrayItem("projects", i, "tech", e.target.value.split(","))} placeholder="Tech stack" className="h-7 bg-transparent text-black border-dashed border-gray-300 focus:border-solid placeholder:text-gray-400" />
                                    ) : (
                                        proj.tech.map((t: string, idx: number) => <Badge key={idx} variant="outline" className="text-[10px] font-normal">{t}</Badge>)
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Education (if not in sidebar) */}
            {showEducation && (resumeContent.education?.length > 0 || isEditing) && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className={`uppercase font-bold text-sm ${layout === 'modern' ? 'text-slate-800 border-b-2 border-slate-800 w-full' : ''} ${layout === 'classic' ? 'border-b border-gray-300 w-full' : ''} ${layout === 'creative' ? 'text-rose-500' : ''} ${layout === 'tech' ? 'text-amber-600' : ''}`}>
                            {layout === 'tech' ? '// Education' : 'Education'}
                        </h3>
                        {isEditing && <Button variant="outline" size="sm" onClick={() => addArrayItem("education", { school: "", degree: "", year: "" })}><Plus className="h-3 w-3" /></Button>}
                    </div>
                    <div className="space-y-3">
                        {resumeContent.education?.map((edu: any, i: number) => (
                            <div key={i} className="relative group">
                                {isEditing && <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 text-destructive" onClick={() => deleteArrayItem("education", i)}><Trash2 className="h-4 w-4" /></Button>}
                                <div className="flex justify-between font-bold text-sm">
                                    {isEditing ? <Input value={edu.school} onChange={(e) => updateArrayItem("education", i, "school", e.target.value)} className="h-7 bg-transparent text-black border-dashed border-gray-300 focus:border-solid placeholder:text-gray-400" /> : edu.school}
                                    {isEditing ? <Input value={edu.year} onChange={(e) => updateArrayItem("education", i, "year", e.target.value)} className="h-7 w-20 bg-transparent text-black border-dashed border-gray-300 focus:border-solid placeholder:text-gray-400" /> : <span>{edu.year}</span>}
                                </div>
                                <div className="text-sm">
                                    {isEditing ? <Input value={edu.degree} onChange={(e) => updateArrayItem("education", i, "degree", e.target.value)} className="h-7 bg-transparent text-black border-dashed border-gray-300 focus:border-solid placeholder:text-gray-400" /> : edu.degree}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}


        </div>
    );
};

