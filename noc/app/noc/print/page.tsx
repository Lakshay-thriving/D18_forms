'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader, Printer, CheckCircle, XCircle, Shield, Clock, FileText } from 'lucide-react'

interface Signature {
  stage: string
  signerEmail: string
  signerRole: string
  signedAt: string
  signatureHash: string
  isVerified: boolean
  signatureData: string
}

interface Approval {
  approverRole: string
  approverEmail: string
  status: string
  comments: string | null
  approvedAt: string | null
  rejectedAt: string | null
}

interface DocumentData {
  requestId: string
  status: string
  currentStage: string | null
  applicant: string
  purpose: string
  certificateType: string
  applicantType: string
  passportType: string
  designation: string
  department: string
  employeeCode: string | null
  presentAddress: string
  permanentAddress: string | null
  submittedAt: string
  createdAt: string
  signatures: Signature[]
  approvals: Approval[]
}

interface PrintHistory {
  version: number
  statusAtPrint: string
  stageAtPrint: string | null
  printedAt: string
}

export default function PrintDocumentPage() {
  const searchParams = useSearchParams()
  const requestId = searchParams.get('id')
  const [document, setDocument] = useState<DocumentData | null>(null)
  const [printHistory, setPrintHistory] = useState<PrintHistory[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (requestId) {
      fetchDocument()
    }
  }, [requestId])

  const fetchDocument = async () => {
    try {
      const response = await fetch(`/api/noc/document?requestId=${requestId}&action=view`)
      if (response.ok) {
        const data = await response.json()
        setDocument(data.document)
        setPrintHistory(data.printHistory || [])
        setIsComplete(data.isComplete)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to fetch document')
      }
    } catch (err) {
      setError('Failed to fetch document')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = async () => {
    // Record print in history
    await fetch(`/api/noc/document?requestId=${requestId}&action=print`)
    // Then print
    window.print()
    // Refresh to show new print history
    fetchDocument()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-black/50 dark:text-white/50 mx-auto mb-4" />
          <p className="text-lg font-medium">{error || 'Document not found'}</p>
        </div>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    SUBMITTED: 'bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70',
    PENDING_REGISTRAR: 'bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 border border-black/10 dark:border-white/10',
    PENDING_JOINT_REGISTRAR: 'bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 border border-black/10 dark:border-white/10',
    PENDING_ESTABLISHMENT: 'bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 border border-black/10 dark:border-white/10',
    REPLY_JOINT_REGISTRAR: 'bg-black/10 dark:bg-white/10 text-black/70 dark:text-white/70',
    REPLY_REGISTRAR: 'bg-black/10 dark:bg-white/10 text-black/70 dark:text-white/70',
    COMPLETED: 'bg-black dark:bg-white text-white dark:text-black',
    REJECTED: 'bg-black/5 dark:bg-white/5 text-black/50 dark:text-white/50 line-through',
  }

  return (
    <div className="print-page max-w-4xl mx-auto p-8">
      {/* Print Controls - Hidden when printing */}
      <div className="no-print mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="text-sm text-secondary hover:text-foreground"
          >
            ← Back
          </button>
          <h1 className="text-xl font-semibold">NOC Document</h1>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90"
        >
          <Printer className="w-4 h-4" />
          Print Document
        </button>
      </div>

      {/* Print History - Hidden when printing */}
      {printHistory.length > 0 && (
        <div className="no-print mb-6 p-4 border border-black/10 dark:border-white/10 rounded-lg bg-black/5 dark:bg-white/5">
          <p className="text-sm font-medium mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Print History ({printHistory.length} versions)
          </p>
          <div className="space-y-1 text-xs">
            {printHistory.slice(0, 5).map((ph) => (
              <div key={ph.version} className="flex items-center gap-2 text-secondary">
                <span>v{ph.version}</span>
                <span>•</span>
                <span>{ph.statusAtPrint.replace(/_/g, ' ')}</span>
                <span>•</span>
                <span>{new Date(ph.printedAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Content - Printable */}
      <div className="print-document border border-black/20 dark:border-white/20 rounded-lg p-8 bg-white dark:bg-black">
        {/* Header */}
        <div className="text-center mb-8 border-b pb-6">
          <h1 className="text-2xl font-bold mb-2">INDIAN INSTITUTE OF TECHNOLOGY ROPAR</h1>
          <h2 className="text-lg font-semibold mb-1">No Objection Certificate</h2>
          <p className="text-sm text-secondary">Request ID: {document.requestId}</p>
        </div>

        {/* Status Banner */}
        <div className="mb-6 p-3 border rounded-lg text-center">
          <span className={`text-sm font-medium px-3 py-1 rounded ${statusColors[document.status] || 'bg-black/5'}`}>
            Current Status: {document.status.replace(/_/g, ' ')}
          </span>
          {document.currentStage && (
            <p className="text-xs text-secondary mt-1">
              Stage: {document.currentStage.replace(/_/g, ' ')}
            </p>
          )}
        </div>

        {/* Applicant Details */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold border-b pb-1 mb-3">APPLICANT DETAILS</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-secondary">Email</p>
              <p className="font-medium">{document.applicant}</p>
            </div>
            <div>
              <p className="text-secondary">Type</p>
              <p className="font-medium">{document.applicantType} / {document.passportType}</p>
            </div>
            <div>
              <p className="text-secondary">Designation</p>
              <p className="font-medium">{document.designation}</p>
            </div>
            <div>
              <p className="text-secondary">Department</p>
              <p className="font-medium">{document.department}</p>
            </div>
            {document.employeeCode && (
              <div>
                <p className="text-secondary">Employee Code</p>
                <p className="font-medium">{document.employeeCode}</p>
              </div>
            )}
            <div>
              <p className="text-secondary">Submitted On</p>
              <p className="font-medium">
                {document.submittedAt ? new Date(document.submittedAt).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Purpose & Address */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold border-b pb-1 mb-3">REQUEST DETAILS</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-secondary">Certificate Type</p>
              <p className="font-medium">{document.certificateType.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-secondary">Purpose</p>
              <p className="font-medium">{document.purpose}</p>
            </div>
            <div>
              <p className="text-secondary">Present Address</p>
              <p className="font-medium">{document.presentAddress}</p>
            </div>
            {document.permanentAddress && (
              <div>
                <p className="text-secondary">Permanent Address</p>
                <p className="font-medium">{document.permanentAddress}</p>
              </div>
            )}
          </div>
        </div>

        {/* Approval History */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold border-b pb-1 mb-3">APPROVAL HISTORY</h3>
          {document.approvals.length === 0 ? (
            <p className="text-sm text-secondary">No approvals yet</p>
          ) : (
            <div className="space-y-2">
              {document.approvals.map((approval, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm p-2 bg-black/5 dark:bg-white/5 rounded">
                  {approval.status === 'approved' || approval.status === 'signed' ? (
                    <CheckCircle className="w-4 h-4 text-black dark:text-white mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-black/50 dark:text-white/50 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p className="font-medium">
                      {approval.approverRole.replace(/_/g, ' ')} - {approval.status.toUpperCase()}
                    </p>
                    <p className="text-secondary text-xs">{approval.approverEmail}</p>
                    {approval.comments && (
                      <p className="text-xs mt-1 italic">"{approval.comments}"</p>
                    )}
                    <p className="text-xs text-secondary">
                      {approval.approvedAt
                        ? new Date(approval.approvedAt).toLocaleString()
                        : approval.rejectedAt
                        ? new Date(approval.rejectedAt).toLocaleString()
                        : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Digital Signatures Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold border-b pb-1 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            DIGITAL SIGNATURES
          </h3>
          {document.signatures.length === 0 ? (
            <p className="text-sm text-secondary">No signatures collected yet</p>
          ) : (
            <div className="space-y-4">
              {document.signatures.map((sig, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">
                        {idx + 1}. {sig.stage.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-secondary">{sig.signerEmail}</p>
                      <p className="text-xs text-secondary">
                        Role: {sig.signerRole.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div className="text-right">
                      {sig.isVerified ? (
                        <span className="flex items-center gap-1 text-xs text-black dark:text-white font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-black/50 dark:text-white/50">
                          <XCircle className="w-3 h-3" />
                          Invalid
                        </span>
                      )}
                      <p className="text-xs text-secondary mt-1">
                        {new Date(sig.signedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {/* Signature Image */}
                  <div className="border rounded bg-white p-2 h-20 flex items-center justify-center">
                    <img
                      src={sig.signatureData}
                      alt={`Signature by ${sig.signerEmail}`}
                      className="max-h-16 max-w-full object-contain"
                    />
                  </div>
                  <p className="text-xs text-secondary mt-1 font-mono break-all">
                    Hash: {sig.signatureHash.substring(0, 32)}...
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completion Status */}
        {isComplete && (
          <div className="bg-black dark:bg-white border border-black/20 dark:border-white/20 rounded-lg p-4 text-center">
            <CheckCircle className="w-8 h-8 text-white dark:text-black mx-auto mb-2" />
            <p className="font-semibold text-white dark:text-black">
              NOC COMPLETED
            </p>
            <p className="text-sm text-white/80 dark:text-black/80">
              All required signatures have been collected
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-center text-xs text-secondary">
          <p>This is a computer-generated document.</p>
          <p>Generated on: {new Date().toLocaleString()}</p>
          <p className="mt-1">
            <FileText className="w-3 h-3 inline mr-1" />
            Document integrity can be verified using the signature hashes above.
          </p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:border-black {
            border-color: black !important;
          }
          .print\\:p-6 {
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  )
}
