'use client'

import { useEffect, useState } from 'react'

export type Countdown = {
  days: string
  hours: string
  minutes: string
  seconds: string
  done: boolean
  /** false until it mounts on the client — avoids a hydration mismatch */
  ready: boolean
}

const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0')

function compute(target: number): Omit<Countdown, 'ready'> {
  const diff = target - Date.now()
  if (diff <= 0) {
    return { days: '00', hours: '00', minutes: '00', seconds: '00', done: true }
  }
  const s = Math.floor(diff / 1000)
  return {
    days: pad(Math.floor(s / 86400)),
    hours: pad(Math.floor((s % 86400) / 3600)),
    minutes: pad(Math.floor((s % 3600) / 60)),
    seconds: pad(s % 60),
    done: false,
  }
}

/**
 * Countdown towards an ISO date. It renders zeros on the server
 * and starts on mount, so the server HTML and the client HTML
 * match and there is no hydration flash.
 */
export function useCountdown(iso: string): Countdown {
  const target = new Date(iso).getTime()
  const [state, setState] = useState<Omit<Countdown, 'ready'>>({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
    done: false,
  })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (Number.isNaN(target)) return
    setState(compute(target))
    setReady(true)
    const id = window.setInterval(() => setState(compute(target)), 1000)
    return () => window.clearInterval(id)
  }, [target])

  return { ...state, ready }
}
