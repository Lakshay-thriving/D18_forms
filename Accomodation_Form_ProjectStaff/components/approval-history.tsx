'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'

interface Approval {
  id: string
  role: string
  action: string
  remarks: string | null
  signature: string
  createdAt: Date
}

interface ApprovalHistoryProps {
  approvals: Approval[]
  currentStatus: string
}

const roleLabels: Record<string, string> = {
  FACULTY_SUPERVISOR: 'Faculty Supervisor',
  HOD: 'Head of Department',
  JUNIOR_SUPERINTENDENT: 'Junior Superintendent',
  ASSISTANT_REGISTRAR: 'Assistant Registrar',
  CHIEF_WARDEN: 'Chief Warden',
}

const actionLabels: Record<string, string> = {
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  RECOMMENDED: 'Recommended',
  SENT_BACK: 'Sent Back',
  PROCEED_TO_ALLOCATION: 'Proceeded to Allocation',
}

export function ApprovalHistory({ approvals, currentStatus }: ApprovalHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval History</CardTitle>
        <CardDescription>Workflow and stakeholder decisions</CardDescription>
      </CardHeader>
      <CardContent>
        {approvals.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
            <p className="text-muted-foreground">Awaiting stakeholder review...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {approvals.map((approval, index) => (
              <div key={approval.id} className="relative">
                {/* Timeline line */}
                {index < approvals.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-8 bg-border" />
                )}

                {/* Approval item */}
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {approval.action === 'REJECTED' ? (
                      <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                        <XCircle className="h-6 w-6 text-destructive" />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{roleLabels[approval.role] || approval.role}</h4>
                      <Badge
                        variant={
                          approval.action === 'REJECTED'
                            ? 'destructive'
                            : approval.action === 'SENT_BACK'
                              ? 'secondary'
                              : 'default'
                        }
                      >
                        {actionLabels[approval.action] || approval.action}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(approval.createdAt), 'PPP p')}
                    </p>
                    {approval.remarks && (
                      <div className="mt-2 p-3 bg-muted rounded-md">
                        <p className="text-sm">
                          <span className="font-medium">Remarks:</span> {approval.remarks}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
