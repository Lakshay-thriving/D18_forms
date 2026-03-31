"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { SlipCard } from "@/components/slip-card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Empty } from "@/components/ui/empty"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Clock, ChefHat, CheckCircle, FileText } from "lucide-react"
import type { Slip } from "@/lib/types"

export default function VendorDashboard() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [slips, setSlips] = useState<Slip[]>([])
  const [isLoadingSlips, setIsLoadingSlips] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [updatingSlipId, setUpdatingSlipId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login")
      } else if (user.role !== "VENDOR" && user.role !== "ADMIN") {
        router.push("/")
      }
    }
  }, [user, authLoading, router])

  const fetchSlips = async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true)
    try {
      const res = await fetch("/api/slips")
      if (res.ok) {
        const data = await res.json()
        setSlips(data.slips)
      }
    } catch {
      console.error("Failed to fetch slips")
    } finally {
      setIsLoadingSlips(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchSlips()
    }
  }, [user])

  const updateSlipStatus = async (slipId: string, newStatus: string) => {
    setUpdatingSlipId(slipId)
    try {
      const res = await fetch(`/api/slips/${slipId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        const data = await res.json()
        setSlips(slips.map((s) => (s.id === slipId ? data.slip : s)))
      }
    } catch {
      console.error("Failed to update slip status")
    } finally {
      setUpdatingSlipId(null)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  const pendingSlips = slips.filter((s) => s.status === "PENDING")
  const preparingSlips = slips.filter((s) => s.status === "PREPARING")
  const deliveredSlips = slips.filter((s) => s.status === "DELIVERED")

  const renderSlipActions = (slip: Slip) => {
    const isUpdating = updatingSlipId === slip.id

    if (slip.status === "PENDING") {
      return (
        <Button
          size="sm"
          className="w-full"
          onClick={() => updateSlipStatus(slip.id, "PREPARING")}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Updating...
            </>
          ) : (
            <>
              <ChefHat className="mr-2 h-4 w-4" />
              Start Preparing
            </>
          )}
        </Button>
      )
    }

    if (slip.status === "PREPARING") {
      return (
        <Button
          size="sm"
          className="w-full"
          onClick={() => updateSlipStatus(slip.id, "DELIVERED")}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Updating...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark Delivered
            </>
          )}
        </Button>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Vendor Dashboard" />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Order Queue</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchSlips(true)}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>

        {isLoadingSlips ? (
          <div className="flex justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : slips.length === 0 ? (
          <Empty
            icon={<FileText className="h-10 w-10" />}
            title="No orders yet"
            description="New orders will appear here when PAs create slips."
          />
        ) : (
          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList className="grid w-full max-w-lg grid-cols-3">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending ({pendingSlips.length})
              </TabsTrigger>
              <TabsTrigger value="preparing" className="flex items-center gap-2">
                <ChefHat className="h-4 w-4" />
                Preparing ({preparingSlips.length})
              </TabsTrigger>
              <TabsTrigger value="delivered" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Delivered ({deliveredSlips.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {pendingSlips.length === 0 ? (
                <Empty
                  icon={<Clock className="h-10 w-10" />}
                  title="No pending orders"
                  description="All caught up! New orders will appear here."
                />
              ) : (
                <div className="w-full grid gap-4 grid-cols-1 auto-rows-max">
                  {pendingSlips.map((slip) => (
                    <SlipCard
                      key={slip.id}
                      slip={slip}
                      showCreatedBy
                      actions={renderSlipActions(slip)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="preparing">
              {preparingSlips.length === 0 ? (
                <Empty
                  icon={<ChefHat className="h-10 w-10" />}
                  title="Nothing preparing"
                  description="Start preparing orders from the Pending tab."
                />
              ) : (
                <div className="w-full grid gap-4 grid-cols-1 auto-rows-max">
                  {preparingSlips.map((slip) => (
                    <SlipCard
                      key={slip.id}
                      slip={slip}
                      showCreatedBy
                      actions={renderSlipActions(slip)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="delivered">
              {deliveredSlips.length === 0 ? (
                <Empty
                  icon={<CheckCircle className="h-10 w-10" />}
                  title="No delivered orders"
                  description="Completed orders will appear here."
                />
              ) : (
                <div className="w-full grid gap-4 grid-cols-1 auto-rows-max">
                  {deliveredSlips.map((slip) => (
                    <SlipCard key={slip.id} slip={slip} showCreatedBy />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
