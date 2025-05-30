"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

interface CountdownTimerProps {
  endDate: string | Date
  compact?: boolean
}

export default function CountdownTimer({ endDate, compact = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(endDate) - +new Date()

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true })
        return
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        expired: false,
      })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  if (compact) {
    return (
      <div className="flex items-center text-red-600">
        <Clock className="h-3 w-3 mr-1" />
        {timeLeft.expired ? (
          <span className="text-xs">Offer expired</span>
        ) : (
          <span className="text-xs">
            {timeLeft.days > 0 && `${timeLeft.days}d `}
            {timeLeft.hours}h {timeLeft.minutes}m
          </span>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center mb-1">
        <Clock className="h-4 w-4 mr-1 text-red-600" />
        <span className="font-medium text-red-600">
          {timeLeft.expired ? "Offer expired" : "Special offer ends in:"}
        </span>
      </div>

      {!timeLeft.expired && (
        <div className="flex gap-2 text-center">
          <div className="bg-gray-100 rounded px-2 py-1">
            <div className="text-lg font-bold text-red-600">{timeLeft.days}</div>
            <div className="text-xs text-gray-600">Days</div>
          </div>
          <div className="bg-gray-100 rounded px-2 py-1">
            <div className="text-lg font-bold text-red-600">{timeLeft.hours}</div>
            <div className="text-xs text-gray-600">Hours</div>
          </div>
          <div className="bg-gray-100 rounded px-2 py-1">
            <div className="text-lg font-bold text-red-600">{timeLeft.minutes}</div>
            <div className="text-xs text-gray-600">Mins</div>
          </div>
          <div className="bg-gray-100 rounded px-2 py-1">
            <div className="text-lg font-bold text-red-600">{timeLeft.seconds}</div>
            <div className="text-xs text-gray-600">Secs</div>
          </div>
        </div>
      )}
    </div>
  )
}
