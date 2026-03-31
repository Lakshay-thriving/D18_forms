'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { CalendarIcon, Clock } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'

interface DateTimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  showTime?: boolean
  placeholder?: string
}

export function DateTimePicker({
  date,
  setDate,
  showTime = false,
  placeholder = 'Pick a date',
}: DateTimePickerProps) {
  const [time, setTime] = React.useState<string>(
    date ? format(date, 'HH:mm') : '12:00'
  )

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const [hours, minutes] = time.split(':').map(Number)
      selectedDate.setHours(hours, minutes)
      setDate(selectedDate)
    } else {
      setDate(undefined)
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setTime(newTime)
    if (date) {
      const [hours, minutes] = newTime.split(':').map(Number)
      const newDate = new Date(date)
      newDate.setHours(hours, minutes)
      setDate(newDate)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            showTime ? (
              format(date, 'PPP HH:mm')
            ) : (
              format(date, 'PPP')
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
        />
        {showTime && (
          <div className="border-t p-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Input
              type="time"
              value={time}
              onChange={handleTimeChange}
              className="w-auto"
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
