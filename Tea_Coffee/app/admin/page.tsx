"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Empty } from "@/components/ui/empty"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Pencil, Trash2, Users, Shield, Coffee as CoffeeIcon, Store } from "lucide-react"
import type { User, Role } from "@/lib/types"

const roleConfig: Record<Role, { label: string; variant: "default" | "secondary" | "outline"; icon: React.ElementType }> = {
  ADMIN: { label: "Admin", variant: "default", icon: Shield },
  PA: { label: "PA", variant: "secondary", icon: CoffeeIcon },
  VENDOR: { label: "Vendor", variant: "outline", icon: Store },
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user: currentUser, isLoading: authLoading } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Form state
  const [formEmail, setFormEmail] = useState("")
  const [formName, setFormName] = useState("")
  const [formRole, setFormRole] = useState<Role>("PA")

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        router.push("/login")
      } else if (currentUser.role !== "ADMIN") {
        router.push("/")
      }
    }
  }, [currentUser, authLoading, router])

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users")
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      }
    } catch {
      console.error("Failed to fetch users")
    } finally {
      setIsLoadingUsers(false)
    }
  }

  useEffect(() => {
    if (currentUser?.role === "ADMIN") {
      fetchUsers()
    }
  }, [currentUser])

  const resetForm = () => {
    setFormEmail("")
    setFormName("")
    setFormRole("PA")
    setError("")
  }

  const handleCreateUser = async () => {
    setError("")
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formEmail,
          name: formName,
          role: formRole,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to create user")
        return
      }

      setUsers([data.user, ...users])
      setIsCreateDialogOpen(false)
      resetForm()
    } catch {
      setError("Failed to create user")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser) return
    setError("")
    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          role: formRole,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to update user")
        return
      }

      setUsers(users.map((u) => (u.id === selectedUser.id ? data.user : u)))
      setIsEditDialogOpen(false)
      setSelectedUser(null)
      resetForm()
    } catch {
      setError("Failed to update user")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to delete user")
        return
      }

      setUsers(users.filter((u) => u.id !== selectedUser.id))
      setIsDeleteDialogOpen(false)
      setSelectedUser(null)
    } catch {
      setError("Failed to delete user")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setFormName(user.name)
    setFormRole(user.role)
    setError("")
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user)
    setError("")
    setIsDeleteDialogOpen(true)
  }

  if (authLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Admin Dashboard" />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Create and manage user accounts for PAs and vendors
                </CardDescription>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
                setIsCreateDialogOpen(open)
                if (!open) resetForm()
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                      Add a new user to the system. They will be able to log in using email OTP.
                    </DialogDescription>
                  </DialogHeader>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="create-email">Email</FieldLabel>
                      <Input
                        id="create-email"
                        type="email"
                        placeholder="user@iitrpr.ac.in"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="bg-background"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="create-name">Name</FieldLabel>
                      <Input
                        id="create-name"
                        placeholder="Full name"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="bg-background"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="create-role">Role</FieldLabel>
                      <Select value={formRole} onValueChange={(value: Role) => setFormRole(value)}>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PA">PA (Personal Assistant)</SelectItem>
                          <SelectItem value="VENDOR">Vendor</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                  </FieldGroup>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateUser} disabled={isSubmitting || !formEmail || !formName}>
                      {isSubmitting ? (
                        <>
                          <Spinner className="mr-2 h-4 w-4" />
                          Creating...
                        </>
                      ) : (
                        "Create User"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <div className="flex justify-center py-12">
                <Spinner className="h-8 w-8" />
              </div>
            ) : users.length === 0 ? (
              <Empty
                icon={<Users className="h-10 w-10" />}
                title="No users yet"
                description="Add users to allow them to access the system."
              />
            ) : (
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => {
                      const config = roleConfig[user.role]
                      const RoleIcon = config.icon
                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
                              <RoleIcon className="h-3 w-3" />
                              {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(user)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog(user)}
                                disabled={user.id === currentUser?.id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            setSelectedUser(null)
            resetForm()
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user details. Email cannot be changed.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  value={selectedUser?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-name">Name</FieldLabel>
                <Input
                  id="edit-name"
                  placeholder="Full name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="bg-background"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-role">Role</FieldLabel>
                <Select value={formRole} onValueChange={(value: Role) => setFormRole(value)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PA">PA (Personal Assistant)</SelectItem>
                    <SelectItem value="VENDOR">Vendor</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </FieldGroup>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditUser} disabled={isSubmitting || !formName}>
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
          setIsDeleteDialogOpen(open)
          if (!open) {
            setSelectedUser(null)
            setError("")
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Deleting...
                  </>
                ) : (
                  "Delete User"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
