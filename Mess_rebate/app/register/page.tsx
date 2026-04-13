'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { registerSchema, type RegisterInput } from '@/lib/validations'
import { HOSTELS, MESSES } from '@/lib/types'
import { AlertCircle } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      entryNumber: '',
      course: undefined,
      hostelName: '',
      roomNumber: '',
      messName: '',
    },
  })

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed')
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <span className="text-xl font-bold">IIT</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">IIT Ropar</h1>
        <p className="text-muted-foreground">Mess Rebate System</p>
      </div>

      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Register to submit mess rebate requests</CardDescription>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  {...form.register('name')}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="entryNumber">Entry Number</Label>
                <Input
                  id="entryNumber"
                  placeholder="e.g., 2021CSB1001"
                  {...form.register('entryNumber')}
                />
                {form.formState.errors.entryNumber && (
                  <p className="text-sm text-destructive">{form.formState.errors.entryNumber.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@iitrpr.ac.in"
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                {...form.register('password')}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Course</Label>
              <Select onValueChange={(value) => form.setValue('course', value as RegisterInput['course'])}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UG">Undergraduate (UG)</SelectItem>
                  <SelectItem value="PG">Postgraduate (PG)</SelectItem>
                  <SelectItem value="PHD">Ph.D.</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.course && (
                <p className="text-sm text-destructive">{form.formState.errors.course.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Hostel</Label>
                <Select onValueChange={(value) => form.setValue('hostelName', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select hostel" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOSTELS.map((hostel) => (
                      <SelectItem key={hostel} value={hostel}>
                        {hostel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.hostelName && (
                  <p className="text-sm text-destructive">{form.formState.errors.hostelName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomNumber">Room Number</Label>
                <Input
                  id="roomNumber"
                  placeholder="e.g., A-101"
                  {...form.register('roomNumber')}
                />
                {form.formState.errors.roomNumber && (
                  <p className="text-sm text-destructive">{form.formState.errors.roomNumber.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mess</Label>
              <Select onValueChange={(value) => form.setValue('messName', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select mess" />
                </SelectTrigger>
                <SelectContent>
                  {MESSES.map((mess) => (
                    <SelectItem key={mess} value={mess}>
                      {mess}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.messName && (
                <p className="text-sm text-destructive">{form.formState.errors.messName.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Spinner className="mr-2" />}
              Register
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
