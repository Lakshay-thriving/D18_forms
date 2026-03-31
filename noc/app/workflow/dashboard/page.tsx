'use client'

import { useAuth } from '@/hooks/useAuth'
import { Loader, CheckCircle, XCircle, PenTool, FileCheck, Printer } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'

interface Signature {
  id: string
  stage: string
  signedAt: string
  signer: {
    email: string
    role: string
  }
}

interface NOCRequest {
  id: string
  requestId: string
  status: string
  purpose: string
  certificateType: string
  applicantType: string
  passportType: string
  designation: string
  department: string
  presentAddress: string
  createdAt: string
  submittedAt: string | null
  currentStage: string | null
  applicant: {
    email: string
  }
  signatures: Signature[]
}

// Check if status requires digital signature
const isSignatureRequired = (status: string) => {
  return ['PENDING_ESTABLISHMENT', 'REPLY_JOINT_REGISTRAR', 'REPLY_REGISTRAR'].includes(status)
}

// Check if this is a reply stage (going backward with signatures)
const isReplyStage = (status: string) => {
  return status.startsWith('REPLY_') || status === 'PENDING_ESTABLISHMENT'
}

export default function WorkflowDashboard() {
  const { user, loading } = useAuth()
  const [requests, setRequests] = useState<NOCRequest[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<NOCRequest | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [comments, setComments] = useState('')
  const [signatureData, setSignatureData] = useState<string>('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/noc/workflow')
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    if (!loading && user) {
      fetchRequests()
    }
  }, [loading, user])

  // Signature canvas functions
  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }
    setSignatureData('')
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.beginPath()
        const rect = canvas.getBoundingClientRect()
        const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
        const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top
        ctx.moveTo(x, y)
      }
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const rect = canvas.getBoundingClientRect()
        const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
        const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top
        ctx.lineTo(x, y)
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.stroke()
      }
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      setSignatureData(canvas.toDataURL('image/png'))
    }
  }

  // Initialize canvas with white background when modal opens
  useEffect(() => {
    if (selectedRequest && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }
  }, [selectedRequest])

  const handleApprove = async (requestId: string) => {
    // Check if signature is required for this stage
    if (selectedRequest && isSignatureRequired(selectedRequest.status) && !signatureData) {
      toast.error('Please add your digital signature before approving')
      return
    }
    
    setActionLoading(true)
    try {
      const response = await fetch('/api/noc/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          requestId, 
          action: 'approve', 
          comments,
          ...(signatureData && { signatureData }),
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        toast.success(data.message || 'Request approved successfully')
        setSelectedRequest(null)
        setComments('')
        setSignatureData('')
        clearCanvas()
        fetchRequests()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to approve')
      }
    } catch (error) {
      toast.error('Failed to approve request')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (requestId: string) => {
    if (!comments.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }
    setActionLoading(true)
    try {
      const response = await fetch('/api/noc/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action: 'reject', comments }),
      })
      
      if (response.ok) {
        toast.success('Request rejected')
        setSelectedRequest(null)
        setComments('')
        setSignatureData('')
        clearCanvas()
        fetchRequests()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to reject')
      }
    } catch (error) {
      toast.error('Failed to reject request')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-secondary font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  const roleDescriptions: Record<string, string> = {
    REGISTRAR: 'Registrar - First level approval of NOC requests',
    JOINT_REGISTRAR: 'Joint Registrar - Second level approval',
    ESTABLISHMENT_1: 'Establishment (Faculty) - Final approval for faculty NOCs',
    ESTABLISHMENT_2: 'Establishment (Staff) - Final approval for staff NOCs',
    ADMIN: 'Administrator - System management',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Workflow Dashboard</h1>
        <p className="text-secondary font-medium">
          {roleDescriptions[user?.role as keyof typeof roleDescriptions] || 'Manage NOC requests'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="border border-black/10 dark:border-white/10 rounded-lg p-4">
          <p className="text-xs text-black/50 dark:text-white/50 mb-1 font-medium font-mono">Pending for Review</p>
          <p className="text-2xl font-semibold font-mono">{requests.length}</p>
        </div>
      </div>

      {/* Pending Requests */}
      {requests.length === 0 ? (
        <div className="border border-black/10 dark:border-white/10 rounded-lg p-8 text-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-4">No Pending Requests</h2>
            <p className="text-secondary mb-6 font-medium">
              No pending requests for your approval at this moment.
            </p>
            <p className="text-xs text-secondary font-medium">
              New requests will appear here when they reach your workflow stage.
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-black/10 dark:border-white/10 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-black/10 dark:border-white/10">
            <h2 className="text-lg font-semibold">Pending Requests ({requests.length})</h2>
          </div>
          <div className="divide-y divide-black/10 dark:divide-white/10">
            {requests.map((request) => (
              <div key={request.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <p className="font-semibold font-mono">{request.requestId}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-mono border ${
                        isReplyStage(request.status)
                          ? 'bg-black dark:bg-white text-white dark:text-black border-transparent'
                          : 'bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 border-black/10 dark:border-white/10'
                      }`}>
                        {request.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full font-mono">
                        {request.applicantType}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-mono border ${
                        request.passportType === 'PASSPORT'
                          ? 'bg-black dark:bg-white text-white dark:text-black border-transparent'
                          : 'bg-transparent text-black/50 dark:text-white/50 border-black/10 dark:border-white/10'
                      }`}>
                        {request.passportType}
                      </span>
                      {isSignatureRequired(request.status) && (
                        <span className="text-xs px-2 py-0.5 bg-black/10 dark:bg-white/10 border border-black/20 dark:border-white/20 rounded-full flex items-center gap-1 font-mono">
                          <PenTool className="w-3 h-3" />
                          Signature Required
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-secondary mb-1">{request.applicant.email}</p>
                    <p className="text-sm mb-1"><strong>Purpose:</strong> {request.purpose}</p>
                    <p className="text-sm text-secondary">
                      {request.designation} - {request.department}
                    </p>
                    {request.signatures && request.signatures.length > 0 && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-secondary">
                        <FileCheck className="w-3 h-3" />
                        {request.signatures.length} signature(s) collected
                      </div>
                    )}
                    <p className="text-xs text-secondary mt-2">
                      Submitted: {request.submittedAt ? new Date(request.submittedAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/noc/print?id=${request.requestId}`}
                      className="px-3 py-2 text-sm border border-black/10 dark:border-white/10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1"
                    >
                      <Printer className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="px-4 py-2 text-sm border border-black/10 dark:border-white/10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      {isSignatureRequired(request.status) ? 'Sign & Approve' : 'Review'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-black/10 dark:border-white/10 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Review Request</h2>
                <button
                  onClick={() => { setSelectedRequest(null); setComments(''); setSignatureData(''); }}
                  className="text-secondary hover:text-foreground"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-secondary">Request ID</p>
                  <p className="font-medium">{selectedRequest.requestId}</p>
                </div>
                <div>
                  <p className="text-secondary">Applicant</p>
                  <p className="font-medium">{selectedRequest.applicant.email}</p>
                </div>
                <div>
                  <p className="text-secondary">Type</p>
                  <p className="font-medium">{selectedRequest.certificateType.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-secondary">Applicant Type</p>
                  <p className="font-medium">{selectedRequest.applicantType}</p>
                </div>
                <div>
                  <p className="text-secondary">Passport Type</p>
                  <p className={`font-medium font-mono ${selectedRequest.passportType === 'PASSPORT' ? 'underline' : ''}`}>
                    {selectedRequest.passportType}
                    {selectedRequest.passportType === 'PASSPORT' && ' (Full signature chain required)'}
                  </p>
                </div>
                <div>
                  <p className="text-secondary">Current Status</p>
                  <p className="font-medium">{selectedRequest.status.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-secondary">Designation</p>
                  <p className="font-medium">{selectedRequest.designation}</p>
                </div>
                <div>
                  <p className="text-secondary">Department</p>
                  <p className="font-medium">{selectedRequest.department}</p>
                </div>
              </div>
              <div>
                <p className="text-secondary text-sm">Purpose</p>
                <p className="font-medium">{selectedRequest.purpose}</p>
              </div>
              <div>
                <p className="text-secondary text-sm">Present Address</p>
                <p className="font-medium">{selectedRequest.presentAddress}</p>
              </div>
              
              {/* Existing Signatures */}
              {selectedRequest.signatures && selectedRequest.signatures.length > 0 && (
                <div className="border border-black/20 dark:border-white/20 rounded-2xl p-4 bg-black/5 dark:bg-white/5">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <FileCheck className="w-4 h-4" />
                    Collected Signatures ({selectedRequest.signatures.length})
                  </p>
                  <div className="space-y-1 text-sm font-mono">
                    {selectedRequest.signatures.map((sig) => (
                      <div key={sig.id} className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" />
                        <span className="font-medium">{sig.stage}</span>
                        <span className="text-black/50 dark:text-white/50">- {sig.signer.email}</span>
                        <span className="text-xs text-black/40 dark:text-white/40">
                          ({new Date(sig.signedAt).toLocaleDateString()})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Signature Canvas - only shown when required */}
              {isSignatureRequired(selectedRequest.status) && (
                <div className="border border-black/20 dark:border-white/20 rounded-2xl p-4 bg-black/5 dark:bg-white/5">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <PenTool className="w-4 h-4" />
                    Your Digital Signature (Required)
                  </p>
                  <p className="text-xs text-black/50 dark:text-white/50 mb-3">
                    Draw your signature below to approve this request. Your signature will be recorded with timestamp.
                  </p>
                  <div className="border border-black/10 dark:border-white/10 rounded bg-white">
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={150}
                      className="cursor-crosshair touch-none"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-xs text-secondary hover:text-foreground"
                    >
                      Clear Signature
                    </button>
                    {signatureData && (
                      <span className="text-xs text-black/70 dark:text-white/70 flex items-center gap-1 font-mono">
                        <CheckCircle className="w-3 h-3" />
                        Signature captured
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium block mb-2">Comments (required for rejection)</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add any comments..."
                  className="w-full bg-background border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 min-h-20"
                />
              </div>
            </div>
            <div className="p-6 border-t border-black/10 dark:border-white/10 flex gap-3 justify-between">
              <Link
                href={`/noc/print?id=${selectedRequest.requestId}`}
                className="flex items-center gap-2 px-4 py-2 border border-black/10 dark:border-white/10 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
              >
                <Printer className="w-4 h-4" />
                Print
              </Link>
              <div className="flex gap-3">
                <button
                  onClick={() => handleReject(selectedRequest.requestId)}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 border border-black/20 dark:border-white/20 text-black/70 dark:text-white/70 rounded-full hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedRequest.requestId)}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full hover:opacity-90 disabled:opacity-50"
                >
                  {isSignatureRequired(selectedRequest.status) ? (
                    <>
                      <PenTool className="w-4 h-4" />
                      Sign &amp; Approve
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Information */}
      <div className="mt-8 border border-black/10 dark:border-white/10 rounded-lg p-6 bg-black/2 dark:bg-white/2">
        <h3 className="text-lg font-semibold mb-4">Workflow Process</h3>
        
        {/* Forward Workflow */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-black/70 dark:text-white/70 mb-3">Forward Workflow (Verification)</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-xs font-mono bg-black dark:bg-white text-white dark:text-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">1</span>
              <div>
                <p className="font-medium">Applicant submits request</p>
                <p className="text-secondary font-medium">Faculty/Staff fills NOC form with all details</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xs font-mono bg-black dark:bg-white text-white dark:text-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">2</span>
              <div>
                <p className="font-medium">Registrar reviews</p>
                <p className="text-secondary font-medium">Initial verification and approval</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xs font-mono bg-black dark:bg-white text-white dark:text-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">3</span>
              <div>
                <p className="font-medium">Joint Registrar reviews</p>
                <p className="text-secondary font-medium">Second level verification</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xs font-mono bg-black dark:bg-white text-white dark:text-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">4</span>
              <div>
                <p className="font-medium">Establishment verifies</p>
                <p className="text-secondary font-medium">Faculty → Establishment 1, Staff → Establishment 2</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reply Workflow */}
        <div>
          <h4 className="text-sm font-semibold text-black/70 dark:text-white/70 mb-3">Reply Workflow (Digital Signatures)</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-xs font-mono bg-black/80 dark:bg-white/80 text-white dark:text-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">5</span>
              <div>
                <p className="font-medium">Establishment signs</p>
                <p className="text-secondary font-medium">First signature on the NOC document</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xs font-mono bg-black/80 dark:bg-white/80 text-white dark:text-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">6</span>
              <div>
                <p className="font-medium">Joint Registrar signs</p>
                <p className="text-secondary font-medium">Counter-signature on the document</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xs font-mono bg-black/80 dark:bg-white/80 text-white dark:text-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">7</span>
              <div>
                <p className="font-medium">Registrar signs (Passport NOC only)</p>
                <p className="text-secondary font-medium">Final signature for Passport NOC. Skipped for non-passport requests.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xs font-mono bg-black dark:bg-white text-white dark:text-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">✓</span>
              <div>
                <p className="font-medium">NOC Completed</p>
                <p className="text-secondary font-medium">Document with all signatures sent to applicant</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
