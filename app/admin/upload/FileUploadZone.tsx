"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Upload, File, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadZoneProps {
  onFilesUploaded: (files: File[]) => void
  acceptedTypes?: string
  maxFiles?: number
  maxSize?: number
}

export function FileUploadZone({
  onFilesUploaded,
  acceptedTypes = "*",
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
}: FileUploadZoneProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles((prev) => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedTypes === "*" ? undefined : { [acceptedTypes]: [] },
    maxFiles,
    maxSize,
    multiple: true,
  })

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onFilesUploaded(selectedFiles)
      setSelectedFiles([])
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive && !isDragReject && "border-primary bg-primary/5",
          isDragReject && "border-destructive bg-destructive/5",
          !isDragActive && "border-border hover:border-primary/50 hover:bg-muted/50",
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              isDragActive && !isDragReject && "bg-primary text-primary-foreground",
              isDragReject && "bg-destructive text-destructive-foreground",
              !isDragActive && "bg-muted text-muted-foreground",
            )}
          >
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-lg font-medium text-foreground">
              {isDragActive ? (isDragReject ? "File type not supported" : "Drop files here") : "Drag & drop files here"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">or click to browse files</p>
            <p className="text-xs text-muted-foreground mt-2">
              Max {maxFiles} files, {formatFileSize(maxSize)} each
            </p>
          </div>
        </div>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Selected Files ({selectedFiles.length})</h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <File className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="flex-shrink-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button onClick={handleUpload} className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            Upload {selectedFiles.length} file(s)
          </Button>
        </div>
      )}
    </div>
  )
}
