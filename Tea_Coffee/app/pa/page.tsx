"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { SlipCard } from "@/components/slip-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Empty } from "@/components/ui/empty"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, History, Minus, FileText } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Slip, AuthRole } from "@/lib/types"

export default function PADashboard() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [slips, setSlips] = useState<Slip[]>([])
  const [isLoadingSlips, setIsLoadingSlips] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Form state
  const [guestName, setGuestName] = useState("")
  const [roomNumber, setRoomNumber] = useState("")
  const [teaCount, setTeaCount] = useState(0)
  const [coffeeCount, setCoffeeCount] = useState(0)
  const [instructions, setInstructions] = useState("")
  const [authorizedBy, setAuthorizedBy] = useState<AuthRole | "">("")
  const [signature, setSignature] = useState("")

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login")
      } else if (user.role !== "PA" && user.role !== "ADMIN") {
        router.push("/")
      }
    }
  }, [user, authLoading, router])

  const fetchSlips = async () => {
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
    }
  }

  useEffect(() => {
    if (user) {
      fetchSlips()
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (teaCount === 0 && coffeeCount === 0) {
      setError("Please add at least one tea or coffee")
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch("/api/slips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName,
          roomNumber: roomNumber || undefined,
          teaCount,
          coffeeCount,
          instructions: instructions || undefined,
          authorizedBy: authorizedBy || undefined,
          signature: signature || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to create slip")
        return
      }

      const data = await res.json()
      setSlips([data.slip, ...slips])
      setSuccess(`Slip ${data.slip.slipNumber} created successfully!`)

      // Reset form
      setGuestName("")
      setRoomNumber("")
      setTeaCount(0)
      setCoffeeCount(0)
      setInstructions("")
      setAuthorizedBy("")
      setSignature("")
    } catch {
      setError("Failed to create slip")
    } finally {
      setIsSubmitting(false)
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

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="PA Dashboard" />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Slip
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              My Slips
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <div>
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>New Tea/Coffee Slip</CardTitle>
                  <CardDescription>
                    Create a slip for guest refreshments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit}>
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="guestName">Guest Name</FieldLabel>
                        <Input
                          id="guestName"
                          placeholder="Enter guest name"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          required
                          className="bg-background"
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="roomNumber">Room Number</FieldLabel>
                        <Input
                          id="roomNumber"
                          placeholder="Enter room number"
                          value={roomNumber}
                          onChange={(e) => setRoomNumber(e.target.value)}
                          className="bg-background"
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="date">Date</FieldLabel>
                        <Input
                          id="date"
                          type="text"
                          value={new Date().toLocaleDateString()}
                          disabled
                          className="bg-muted"
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="authorizedBy">Authorized By</FieldLabel>
                        <Select value={authorizedBy} onValueChange={(value) => setAuthorizedBy(value as AuthRole)}>
                          <SelectTrigger id="authorizedBy" className="bg-background">
                            <SelectValue placeholder="Select authorizer" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PS">PS</SelectItem>
                            <SelectItem value="PA">PA</SelectItem>
                            <SelectItem value="REGISTRAR">Registrar</SelectItem>
                            <SelectItem value="DEAN">Dean</SelectItem>
                            <SelectItem value="HOD">HOD</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>

                      <div className="grid grid-cols-2 gap-4">
                        <Field>
                          <FieldLabel>Tea</FieldLabel>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => setTeaCount(Math.max(0, teaCount - 1))}
                              disabled={teaCount === 0}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              value={teaCount}
                              onChange={(e) => setTeaCount(Math.max(0, parseInt(e.target.value) || 0))}
                              min={0}
                              className="text-center bg-background"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => setTeaCount(teaCount + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </Field>

                        <Field>
                          <FieldLabel>Coffee</FieldLabel>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => setCoffeeCount(Math.max(0, coffeeCount - 1))}
                              disabled={coffeeCount === 0}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              value={coffeeCount}
                              onChange={(e) => setCoffeeCount(Math.max(0, parseInt(e.target.value) || 0))}
                              min={0}
                              className="text-center bg-background"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => setCoffeeCount(coffeeCount + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </Field>
                      </div>

                      <Field>
                        <FieldLabel htmlFor="instructions">
                          Special Instructions (Optional)
                        </FieldLabel>
                        <Textarea
                          id="instructions"
                          placeholder="e.g., Less sugar, extra hot"
                          value={instructions}
                          onChange={(e) => setInstructions(e.target.value)}
                          rows={3}
                          className="bg-background resize-none"
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="signature">
                          Approval / Signature (Optional)
                        </FieldLabel>
                        <Input
                          id="signature"
                          placeholder="Enter approval or digital signature"
                          value={signature}
                          onChange={(e) => setSignature(e.target.value)}
                          className="bg-background"
                        />
                      </Field>

                      {error && (
                        <p className="text-sm text-destructive">{error}</p>
                      )}

                      {success && (
                        <p className="text-sm text-success">{success}</p>
                      )}

                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Spinner className="mr-2 h-4 w-4" />
                            Creating...
                          </>
                        ) : (
                          "Create Slip"
                        )}
                      </Button>
                    </FieldGroup>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            {isLoadingSlips ? (
              <div className="flex justify-center py-12">
                <Spinner className="h-8 w-8" />
              </div>
            ) : slips.length === 0 ? (
              <Empty
                icon={<FileText className="h-10 w-10" />}
                title="No slips yet"
                description="Create your first tea/coffee slip to get started."
              />
            ) : (
              <div className="space-y-8">
                {pendingSlips.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4 text-foreground">
                      Pending ({pendingSlips.length})
                    </h2>
                    <div className="w-full grid gap-4 grid-cols-1 auto-rows-max">
                      {pendingSlips.map((slip) => (
                        <SlipCard key={slip.id} slip={slip} />
                      ))}
                    </div>
                  </div>
                )}

                {preparingSlips.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4 text-foreground">
                      Preparing ({preparingSlips.length})
                    </h2>
                    <div className="w-full grid gap-4 grid-cols-1 auto-rows-max">
                      {preparingSlips.map((slip) => (
                        <SlipCard key={slip.id} slip={slip} />
                      ))}
                    </div>
                  </div>
                )}

                {deliveredSlips.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4 text-foreground">
                      Delivered ({deliveredSlips.length})
                    </h2>
                    <div className="w-full grid gap-4 grid-cols-1 auto-rows-max">
                      {deliveredSlips.map((slip) => (
                        <SlipCard key={slip.id} slip={slip} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
