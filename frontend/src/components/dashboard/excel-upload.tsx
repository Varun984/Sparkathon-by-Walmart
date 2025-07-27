import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Upload, File, CheckCircle, AlertCircle, X, ArrowDown, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UploadedFile {
  name: string
  size: number
  status: 'uploading' | 'success' | 'error'
  progress: number
}

interface ExcelUploadProps {
  onUploadStart?: (files: File[]) => void
  onUploadProgress?: (progress: { completed: number; total: number }) => void
  onUploadComplete?: (results: Array<{ name: string; status: string }>) => void
  onUploadError?: (error: string) => void
}

export function ExcelUpload({
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError
}: ExcelUploadProps = {}) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const { toast } = useToast()

  // Dynamic badge state
  const [badgeState, setBadgeState] = useState({
    message: "Upload any inventory file that has been untracked yet!",
    highlightTerms: ["inventory", "file", "untracked"],
    isVisible: true,
    status: "default" as "default" | "uploading" | "success" | "warning" | "error",
    icon: ArrowDown,
    animate: true
  })

  const [uploadStats, setUploadStats] = useState({
    totalFiles: 0,
    successfulUploads: 0,
    failedUploads: 0,
    isUploading: false
  })

  // In a real app, this would check user permissions
  const isAdmin = true

  // Dynamic badge message updates
  const updateBadgeForUploadState = useCallback((state: string, stats: any = {}) => {
    const messages = {
      idle: {
        message: "Upload any inventory file that has been untracked yet!",
        highlightTerms: ["inventory", "file", "untracked"],
        status: "default" as const,
        icon: ArrowDown,
        animate: true
      },
      uploading: {
        message: `Processing ${stats.totalFiles} file(s)... Please wait!`,
        highlightTerms: ["Processing", "wait"],
        status: "uploading" as const,
        icon: Loader2,
        animate: true
      },
      success: {
        message: `Successfully uploaded ${stats.successfulUploads} inventory file(s)!`,
        highlightTerms: ["Successfully", "uploaded", "inventory"],
        status: "success" as const,
        icon: CheckCircle,
        animate: false
      },
      partial: {
        message: `${stats.successfulUploads} uploaded, ${stats.failedUploads} failed. Check files!`,
        highlightTerms: ["uploaded", "failed", "Check"],
        status: "warning" as const,
        icon: AlertCircle,
        animate: true
      },
      error: {
        message: "Upload failed! Please check file format and try again.",
        highlightTerms: ["failed", "check", "try again"],
        status: "error" as const,
        icon: AlertCircle,
        animate: true
      }
    }

    setBadgeState(prev => ({
      ...prev,
      ...messages[state as keyof typeof messages]
    }))
  }, [])

  // Enhanced highlighting with multiple colors and animations
  const getHighlightedText = (text: string, highlights: string[]) => {
    if (!highlights.length) return text
    
    const highlightStyles = {
      default: "bg-yellow-200 text-yellow-800 animate-pulse",
      success: "bg-green-200 text-green-800",
      warning: "bg-orange-200 text-orange-800 animate-pulse",
      error: "bg-red-200 text-red-800 animate-pulse",
      uploading: "bg-blue-200 text-blue-800 animate-bounce"
    }
    
    const currentStyle = highlightStyles[badgeState.status] || highlightStyles.default
    
    let processedText = text
    highlights.forEach((term) => {
      const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
      processedText = processedText.replace(regex, (match) => 
        `<span class="${currentStyle} px-1 rounded font-semibold transition-all duration-300">${match}</span>`
      )
    })
    
    return <span dangerouslySetInnerHTML={{ __html: processedText }} />
  }

  // Dynamic badge styling based on status
  const getBadgeStyles = () => {
    const styles = {
      default: "bg-blue-500 text-white border-blue-600",
      uploading: "bg-blue-600 text-white border-blue-700 animate-pulse",
      success: "bg-green-500 text-white border-green-600",
      warning: "bg-yellow-500 text-white border-yellow-600",
      error: "bg-red-500 text-white border-red-600"
    }
    
    return styles[badgeState.status] || styles.default
  }

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  const handleFiles = (fileList: File[]) => {
    const excelFiles = fileList.filter(file =>
      file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel" ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls')
    )

    if (excelFiles.length === 0) {
      toast({
        title: "Invalid file type",
        description: "Please upload Excel files only (.xlsx, .xls)",
        variant: "destructive"
      })
      updateBadgeForUploadState('error')
      onUploadError?.("Invalid file type")
      return
    }

    const newFiles: UploadedFile[] = excelFiles.map(file => ({
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0
    }))

    setFiles(prev => [...prev, ...newFiles])
    
    // Update upload stats and badge
    setUploadStats(prev => ({ 
      ...prev, 
      totalFiles: excelFiles.length, 
      isUploading: true 
    }))
    updateBadgeForUploadState('uploading', { totalFiles: excelFiles.length })
    
    // Trigger upload start callback
    onUploadStart?.(excelFiles)

    // Simulate upload process with progress tracking
    let completedFiles = 0
    newFiles.forEach((file, index) => {
      const interval = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (f.name === file.name) {
            const newProgress = Math.min(f.progress + 10, 100)
            const newStatus = newProgress === 100 ? (Math.random() > 0.8 ? 'error' : 'success') : 'uploading'
            
            // Check if file just completed
            if (newProgress === 100 && f.progress < 100) {
              completedFiles++
              onUploadProgress?.({ completed: completedFiles, total: newFiles.length })
              
              // If all files completed, trigger completion
              if (completedFiles === newFiles.length) {
                setTimeout(() => {
                  const results = newFiles.map(nf => ({ 
                    name: nf.name, 
                    status: Math.random() > 0.8 ? 'error' : 'success' 
                  }))
                  
                  const successful = results.filter(r => r.status === 'success').length
                  const failed = results.filter(r => r.status === 'error').length
                  
                  setUploadStats({
                    totalFiles: results.length,
                    successfulUploads: successful,
                    failedUploads: failed,
                    isUploading: false
                  })

                  if (failed === 0) {
                    updateBadgeForUploadState('success', { successfulUploads: successful })
                  } else if (successful > 0) {
                    updateBadgeForUploadState('partial', { successfulUploads: successful, failedUploads: failed })
                  } else {
                    updateBadgeForUploadState('error')
                  }
                  
                  onUploadComplete?.(results)
                }, 100)
              }
            }
            
            return { ...f, progress: newProgress, status: newStatus }
          }
          return f
        }))
      }, 200)
      
      setTimeout(() => clearInterval(interval), 2000)
    })

    toast({
      title: "Upload started",
      description: `Uploading ${excelFiles.length} file(s)...`
    })
  }

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!isAdmin) {
    return null // Hide component for non-admin users
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Inventory Data</DialogTitle>
        </DialogHeader>
        
        {/* Dynamic Badge Component */}
        <div className="space-y-2 mt-6">
          {badgeState.isVisible && (
            <div className="flex justify-start">
              <div className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium 
                border-2 transition-all duration-300 hover:scale-105 shadow-md
                ${getBadgeStyles()}
              `}>
                <badgeState.icon 
                  className={`h-4 w-4 ${badgeState.animate ? 'animate-bounce' : ''}`} 
                />
                {getHighlightedText(badgeState.message, badgeState.highlightTerms)}
              </div>
            </div>
          )}
          
          {/* Upload Area */}
          <div className="flex items-center gap-3">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drop Excel files here or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supports .xlsx and .xls files up to 10MB
              </p>
              <input
                type="file"
                multiple
                accept=".xlsx,.xls"
                className="hidden"
                id="file-upload"
                onChange={(e) => {
                  if (e.target.files) {
                    handleFiles(Array.from(e.target.files))
                  }
                }}
              />
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Browse Files
              </Button>
            </div>
          </div>
        </div>

        {/* Upload Statistics Display */}
        {uploadStats.totalFiles > 0 && (
          <div className="flex gap-2 text-xs text-muted-foreground mt-2">
            <span>Total: {uploadStats.totalFiles}</span>
            <span>Success: {uploadStats.successfulUploads}</span>
            {uploadStats.failedUploads > 0 && (
              <span className="text-red-500">Failed: {uploadStats.failedUploads}</span>
            )}
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Uploaded Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2 flex-1">
                    <File className="h-4 w-4" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <Badge variant={
                      file.status === 'success' ? 'default' : 
                      file.status === 'error' ? 'destructive' : 'secondary'
                    }>
                      {file.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.status === 'uploading' && (
                      <span className="text-xs text-muted-foreground">
                        • {file.progress}%
                      </span>
                    )}
                    {file.status === 'uploading' && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {file.status === 'success' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.name)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Upload Summary */}
        {files.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">
              {files.filter(f => f.status === 'success').length} of {files.length} files uploaded successfully
            </span>
            <Button 
              disabled={files.some(f => f.status === 'uploading')}
              className="ml-auto"
            >
              Process Data
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-2">
          Supports .xlsx and .xls files up to 10MB
        </p>
      </DialogContent>
    </Dialog>
  )
}
