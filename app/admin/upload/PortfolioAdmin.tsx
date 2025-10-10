"use client";

import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"
import { Upload, Eye, Settings, LogOut, Loader2, Delete, CircleCheck } from "lucide-react";
import { FileUploadZone } from "./FileUploadZone";
import { FileList } from "./FileList"


interface UploadedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    uploadDate: Date;
    url: string;
    publicId: string;        // ← key to delete 
    resourceType: 'image' | 'video' | 'raw'; // saccording to the asset
    inCloudinary: boolean;   // true if came/is in Cloudinary
}

interface SectionFiles {
    [key: string]: UploadedFile[];
}

const portfolioSections = [
    {
        id: "me",
        name: "Me",
        description: "Personal information and bio content",
        icon: "👤",
    },
    {
        id: "design",
        name: "Design",
        description: "UI/UX design projects and mockups",
        icon: "🎨",
    },
    {
        id: "illustration",
        name: "Illustration / Animation",
        description: "Digital art and motion graphics",
        icon: "✨",
    },
    {
        id: "photo-video",
        name: "Photo & Video",
        description: "Photography and videography work",
        icon: "📸",
    },
    {
        id: "tatto",
        name: "Tatto",
        description: "Tattoo designs and artwork",
        icon: "🖋️",
    },
];

export default function PortfolioAdmin({ nameApp }: { nameApp: string | undefined }) {
    const [activeSection, setActiveSection] = useState<string>("me");
    const [sectionFiles, setSectionFiles] = useState<SectionFiles>({});
    const [isUploading, setIsUploading] = useState(false);
    const [loadingCloud, setLoadingCloud] = useState(true)
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

    function markDeleting(id: string, on: boolean) {
        setDeletingIds(prev => {
            const next = new Set(prev)
            on ? next.add(id) : next.delete(id)
            return next
        })
    }

    useEffect(() => {
        (async () => {
            try {
                setLoadingCloud(true)

                const results = await Promise.all(
                    portfolioSections.map(async (section) => {
                        const res = await fetch(`/api/getData?folder=${encodeURIComponent(section.id)}`, {
                        })
                        if (!res.ok) return [section.id, []] as const

                        const data = await res.json()

                        const files: UploadedFile[] = (data.resources || []).map((r: any) => ({
                            id: r.asset_id,
                            name: r.display_name ?? r.public_id?.split("/").pop() ?? "file",
                            size: r.bytes,
                            type: r.resource_type,
                            uploadDate: new Date(r.created_at),
                            url: r.secure_url,
                            inCloudinary: true,
                            publicId: r.public_id,      
                            resourceType: r.resource_type,
                        }))

                        return [section.id, files] as const
                    })
                )

                const next: SectionFiles = Object.fromEntries(results)
                setSectionFiles(next)
            } catch (e) {
                toast("No se pudieron cargar los recursos.")
            } finally {
                setLoadingCloud(false)
            }
        })()
    }, [])


    const handleFileUpload = async (sectionId: string, files: File[]) => {
        if (!files.length) return
        setIsUploading(true)

        try {
            const sig = await fetch('/api/uploads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section: activeSection }),
            }).then(r => r.json())

            const newFiles: UploadedFile[] = []
            let okCount = 0, errCount = 0

            for (const f of files) {
                const form = new FormData()
                form.append('file', f)
                form.append('api_key', sig.apiKey)
                form.append('timestamp', String(sig.timestamp))
                form.append('signature', sig.signature)
                form.append('folder', sig.folder)

                const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
                    method: 'POST',
                    body: form,
                })

                if (!res.ok) {
                    errCount++
                    continue
                }

                const rta = await res.json()
                okCount++

                newFiles.push({
                    id: Math.random().toString(36).substr(2, 9),
                    name: rta.original_filename ?? f.name,
                    size: f.size,
                    type: rta.resource_type,
                    uploadDate: new Date(),
                    url: rta.secure_url,
                    publicId: rta.public_id,
                    resourceType: (rta.resource_type as any) ?? 'image',
                    inCloudinary: true,
                })
            }

            if (newFiles.length) {
                setSectionFiles(prev => ({
                    ...prev,
                    [sectionId]: [...(prev[sectionId] || []), ...newFiles],
                }))
            }

            if (errCount === 0) {
                toast(`${okCount} file(s) were uploaded successfully.`)
            } else if (okCount > 0) {
                toast(`Uploaded ${okCount}, with ${errCount} error.`)

            } else {
                toast(`No files could be uploaded`)
            }
        } catch (e) {
            toast(`Unexpected error while uploading. Please try again.`)

        } finally {
            setIsUploading(false)

        }
    }

    const handleFileDelete = async (sectionId: string, file: UploadedFile) => {
        markDeleting(file.id, true)
        try {
            if (file.inCloudinary) {
                const res = await fetch("/api/cloudinary/delete", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ publicId: file.publicId, resourceType: file.resourceType }),
                })
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}))
                    throw new Error(err?.error || `HTTP ${res.status}`)
                }
                toast.success("File deleted")
                setSectionFiles(prev => ({
                    ...prev,
                    [sectionId]: (prev[sectionId] || []).filter(f => f.id !== file.id),
                }))
            }
        }
        catch (e: any) {
            toast.error("Could not be deleted Error: "+e?.message || "Could not be deleted")
        }
        finally {
            markDeleting(file.id, false)
        }
    }

    const getTotalFiles = () => {
        return Object.values(sectionFiles).reduce((total, files) => total + files.length, 0)
    }



    return (
        <>
            <div className="min-h-screen bg-background">
                {/* Header */}
                <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                    <Settings className="w-4 h-4 text-primary-foreground" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-semibold text-foreground">
                                        {nameApp}
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        Manage your creative content
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge variant="secondary" className="text-xs">
                                    {getTotalFiles()}  files uploaded
                                </Badge>
                                {/* <Button variant="outline" size="sm">
                                    <Eye className="w-4 h-4 mr-2" />
                                    Preview Site
                                </Button> */}
                                <Button variant="ghost" size="sm">
                                    <LogOut className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar Navigation */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-24">
                                <CardHeader>
                                    <CardTitle className="text-lg">Portfolio Sections</CardTitle>
                                    <CardDescription>Select a section to manage its content</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <nav className="space-y-1">
                                        {portfolioSections.map((section) => (
                                            <button
                                                key={section.id}
                                                onClick={() => setActiveSection(section.id)}
                                                className={`w-full text-left px-4 py-3 rounded-none border-0 transition-colors ${activeSection === section.id
                                                    ? "bg-primary text-primary-foreground"
                                                    : "hover:bg-muted text-foreground"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg">{section.icon}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate">{section.name}</p>
                                                        <p
                                                            className={`text-xs truncate ${activeSection === section.id ? "text-primary-foreground/80" : "text-muted-foreground"
                                                                }`}
                                                        >
                                                            {sectionFiles[section.id]?.length || 0} files
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </nav>
                                </CardContent>
                            </Card>
                        </div>
                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            {portfolioSections.map((section) => (
                                <div key={section.id} className={activeSection === section.id ? "block" : "hidden"}>
                                    <div className="space-y-6">
                                        {/* Section Header */}
                                        <div className="flex items-center gap-4 pb-4 border-b border-border">
                                            <span className="text-3xl">{section.icon}</span>
                                            <div>
                                                <h2 className="text-2xl font-semibold text-foreground text-balance">{section.name}</h2>
                                                <p className="text-muted-foreground text-pretty">{section.description}</p>
                                            </div>
                                        </div>

                                        {/* Upload Zone */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Upload className="w-5 h-5" />
                                                    Upload Files
                                                </CardTitle>
                                                <CardDescription>
                                                    Drag and drop files or click to browse. Supports images, videos, and documents.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <FileUploadZone
                                                    onFilesUploaded={(files) => handleFileUpload(section.id, files)}
                                                    acceptedTypes={section.id === "photo-video" ? "image/*,video/*" : "*"}
                                                />
                                            </CardContent>
                                        </Card>

                                        {/* File List */}
                                        {sectionFiles[section.id] && sectionFiles[section.id].length > 0 && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Uploaded Files</CardTitle>
                                                    <CardDescription>{sectionFiles[section.id].length} file(s) in this section</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <FileList
                                                        files={sectionFiles[section.id]}
                                                        onFileDelete={(fileId) => {
                                                            const file = sectionFiles[section.id].find(f => f.id === fileId)
                                                            if (file) handleFileDelete(section.id, file)
                                                        }}
                                                        isDeleting={(id) => deletingIds.has(id)}
                                                    />
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Overlay de carga */}
                        {isUploading && (
                            <div className="fixed inset-0 z-[60] grid place-items-center bg-black/30 backdrop-blur-sm">
                                <div className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-lg dark:bg-neutral-900">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span className="text-sm">Uploading files…</span>
                                </div>
                            </div>
                        )}

                        {loadingCloud && (
                            <div className="fixed inset-0 z-[60] grid place-items-center bg-black/30 backdrop-blur-sm">
                                <div className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-lg dark:bg-neutral-900">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span className="text-sm">Loading files from Cloudinary…</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
