import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Coffee, Leaf, Clock, CheckCircle, ChefHat } from "lucide-react"
import type { Slip } from "@/lib/types"

interface SlipCardProps {
  slip: Slip
  showCreatedBy?: boolean
  actions?: React.ReactNode
}

const statusConfig = {
  PENDING: {
    label: "Pending",
    variant: "secondary" as const,
    icon: Clock,
  },
  PREPARING: {
    label: "Preparing",
    variant: "default" as const,
    icon: ChefHat,
  },
  DELIVERED: {
    label: "Delivered",
    variant: "outline" as const,
    icon: CheckCircle,
  },
}

export function SlipCard({ slip, showCreatedBy = false, actions }: SlipCardProps) {
  const config = statusConfig[slip.status]
  const StatusIcon = config.icon

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-medium">{slip.slipNumber}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(slip.createdAt).toLocaleString()}
            </p>
          </div>
          <Badge variant={config.variant} className="flex items-center gap-1">
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Guest</p>
            <p className="font-medium text-foreground">{slip.guestName}</p>
          </div>

          {slip.roomNumber && (
            <div>
              <p className="text-sm text-muted-foreground">Room Number</p>
              <p className="font-medium text-foreground">{slip.roomNumber}</p>
            </div>
          )}

          <div className="flex gap-4">
            {slip.teaCount > 0 && (
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-success" />
                <span className="text-sm">
                  <span className="font-medium">{slip.teaCount}</span> Tea
                </span>
              </div>
            )}
            {slip.coffeeCount > 0 && (
              <div className="flex items-center gap-2">
                <Coffee className="h-4 w-4 text-warning" />
                <span className="text-sm">
                  <span className="font-medium">{slip.coffeeCount}</span> Coffee
                </span>
              </div>
            )}
          </div>

          {slip.instructions && (
            <div>
              <p className="text-sm text-muted-foreground">Instructions</p>
              <p className="text-sm text-foreground">{slip.instructions}</p>
            </div>
          )}

          {slip.authorizedBy && (
            <div>
              <p className="text-sm text-muted-foreground">Authorized By</p>
              <p className="font-medium text-foreground">{slip.authorizedBy}</p>
            </div>
          )}

          {slip.signature && (
            <div>
              <p className="text-sm text-muted-foreground">Signature</p>
              <p className="text-sm text-foreground">{slip.signature}</p>
            </div>
          )}

          {showCreatedBy && slip.createdBy && (
            <div>
              <p className="text-sm text-muted-foreground">Created by</p>
              <p className="text-sm text-foreground">{slip.createdBy.name}</p>
            </div>
          )}

          {actions && <div className="pt-2">{actions}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
