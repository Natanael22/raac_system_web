import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, File, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploaderProps {
    onUpload: (files: File[]) => void
    maxFiles?: number
    accept?: Record<string, string[]>
}

export function FileUploader({ onUpload, maxFiles = 5, accept }: FileUploaderProps) {
    const [files, setFiles] = useState<File[]>([])

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles)
        setFiles(newFiles)
        onUpload(newFiles)
    }, [files, maxFiles, onUpload])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles,
        accept
    })

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index)
        setFiles(newFiles)
        onUpload(newFiles)
    }

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    isDragActive ? "border-primary bg-primary/5" : "border-neutral-300 hover:border-primary/50"
                )}
            >
                <input {...getInputProps()} />
                <UploadCloud className="mx-auto h-12 w-12 text-neutral-dark opacity-50 mb-4" />
                {isDragActive ? (
                    <p className="text-primary font-medium">Solte os arquivos aqui...</p>
                ) : (
                    <div>
                        <p className="text-primary font-medium">Arraste e solte arquivos aqui, ou clique para selecionar</p>
                        <p className="text-xs text-neutral-dark mt-2">PDF, JPG, PNG (máx. 10MB)</p>
                    </div>
                )}
            </div>

            {files.length > 0 && (
                <ul className="mt-4 space-y-2">
                    {files.map((file, i) => (
                        <li key={i} className="flex items-center justify-between p-3 border rounded-md bg-white shadow-sm">
                            <div className="flex items-center overflow-hidden">
                                <File className="h-5 w-5 text-secondary mr-3 flex-shrink-0" />
                                <span className="text-sm font-medium text-primary truncate max-w-[200px] sm:max-w-xs">{file.name}</span>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                                className="p-1 text-neutral-dark hover:text-danger rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-danger"
                                aria-label="Remove file"
                            >
                                <X size={16} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
