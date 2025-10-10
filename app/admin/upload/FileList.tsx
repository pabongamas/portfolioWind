"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Download, Eye, ImageIcon, Video, FileText, Loader2 } from "lucide-react"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  uploadDate: Date
  url: string
}

interface FileListProps {
  files: UploadedFile[]
  onFileDelete: (fileId: string) => void,
  isDeleting?: (id: string) => boolean
}

export function FileList({ files, onFileDelete, isDeleting }: FileListProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-4 h-4" />
    if (type.startsWith("video/")) return <Video className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  const getFileTypeColor = (type: string) => {
    if (type.startsWith("image/")) return "bg-green-100 text-green-800"
    if (type.startsWith("video/")) return "bg-blue-100 text-blue-800"
    return "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-3">
      {files.map((file) => {
        const deleting = isDeleting?.(file.id) ?? false
        const date = file.uploadDate instanceof Date ? file.uploadDate : new Date(file.uploadDate)
        return (
          <div
            key={file.id}
             className={`flex items-center gap-4 p-4 border border-border rounded-lg transition-colors
              ${deleting ? "opacity-60 pointer-events-none" : "hover:bg-muted/50"}`}
          >
            <div className="flex-shrink-0 text-muted-foreground">{getFileIcon(file.type)}</div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-foreground truncate">{file.name}</p>
                <Badge variant="secondary" className={`text-xs ${getFileTypeColor(file.type)}`}>
                  {file.type?.split("/")[0] ?? "file"}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{formatFileSize(file.size)}</span>
                <span>•</span>
                 <span>{isNaN(date.getTime()) ? "-" : date.toLocaleDateString()}</span>
                {deleting && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Eliminando…
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="ghost" size="sm" asChild disabled={deleting}>
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  <Eye className="w-4 h-4" />
                </a>
              </Button>
              <Button variant="ghost" size="sm" asChild disabled={deleting}>
                <a href={file.url} download={file.name}>
                  <Download className="w-4 h-4" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFileDelete(file.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={deleting}
                aria-label="Eliminar"
                title="Eliminar"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}