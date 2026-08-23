'use client'

import { useEffect, useState } from 'react'

export type Countdown = {
  days: string
  hours: string
  minutes: string
  seconds: string
  done: boolean
  /** false hasta que monta en el cliente — evita desajuste de hidratación */
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
 * Contador hacia una fecha ISO. Renderiza ceros en el servidor y
 * arranca al montar, así el HTML del servidor y el del cliente
 * coinciden y no hay parpadeo de hidratación.
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
