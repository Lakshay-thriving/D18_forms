'use client'

import * as React from 'react'
import { Upload, X, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface FileUploadProps {
  label: string
  accept?: string
  value: File | null
  onChange: (file: File | null) => void
  error?: string
}

export function FileUpload({
  label,
  accept = '.pdf,.jpg,.jpeg,.png',
  value,
  onChange,
  error,
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onChange(file)
    }
  }

  const handleRemove = () => {
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      
      {!value ? (
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed p-4 transition-colors',
            'hover:border-primary hover:bg-muted/50',
            error ? 'border-destructive' : 'border-muted-foreground/25'
          )}
        >
          <Upload className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Click to upload {label}
          </span>
        </button>
      ) : (
        <div className="flex items-center justify-between rounded-md border bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-sm truncate max-w-[200px]">{value.name}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
