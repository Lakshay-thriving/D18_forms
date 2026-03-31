'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Eye } from 'lucide-react'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface DocumentViewerProps {
  documents: {
    name: string
    url: string
    type: 'pdf' | 'image' | 'document'
  }[]
}

export function DocumentViewer({ documents }: DocumentViewerProps) {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Uploaded Documents
        </CardTitle>
        <CardDescription>View all application documents</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {documents.map((doc) => (
            <div
              key={doc.url}
              className="relative group rounded-lg border border-dashed border-muted-foreground/25 p-4 hover:border-muted-foreground/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <FileText className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm break-words">{doc.name}</h4>
                    <Badge variant="outline" className="mt-2">
                      {doc.type === 'pdf' ? 'PDF' : doc.type === 'image' ? 'Image' : 'Document'}
                    </Badge>
                  </div>
                </div>
                <Dialog open={selectedDoc === doc.url} onOpenChange={(open) => {
                  if (!open) setSelectedDoc(null)
                }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDoc(doc.url)}
                    className="flex-shrink-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <DialogContent className="max-w-4xl h-[90vh]">
                    <DialogHeader>
                      <DialogTitle>{doc.name}</DialogTitle>
                    </DialogHeader>
                    <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg overflow-auto">
                      {doc.type === 'pdf' ? (
                        <iframe
                          src={`${doc.url}#toolbar=0`}
                          className="w-full h-full"
                          title={doc.name}
                        />
                      ) : doc.type === 'image' ? (
                        <img
                          src={doc.url}
                          alt={doc.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="text-center text-muted-foreground">
                          <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Document preview not available</p>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary underline mt-2 block">
                            Open in new tab
                          </a>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
