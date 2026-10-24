// Eigen, strakke icoontjes (lijnstijl, ronde uiteinden). Kleur volgt de tekstkleur.
import type { ReactNode } from 'react'

function Icoon({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`icoon ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const IcoonHuis = () => (
  <Icoon>
    <path d="M3.5 11.2 12 4l8.5 7.2" />
    <path d="M6 9.5V19a1 1 0 0 0 1 1h3.5v-5.5h3V20H17a1 1 0 0 0 1-1V9.5" />
  </Icoon>
)

export const IcoonLuidspreker = () => (
  <Icoon>
    <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" />
    <path d="M15.5 9.2a4 4 0 0 1 0 5.6" />
    <path d="M18.2 6.6a7.6 7.6 0 0 1 0 10.8" />
  </Icoon>
)

export const IcoonSlot = () => (
  <Icoon>
    <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
  </Icoon>
)

export const IcoonTerug = () => (
  <Icoon>
    <path d="M15 5.5 8.5 12l6.5 6.5" />
  </Icoon>
)

export const IcoonShirt = () => (
  <Icoon>
    <path d="M8.5 4 4 6.5l1.8 4L8 9.6V20h8V9.6l2.2.9 1.8-4L15.5 4a3.5 3.5 0 0 1-7 0z" />
  </Icoon>
)

export const IcoonMix = () => (
  <Icoon>
    <path d="M4 7h3.5c2 0 3 1 4 2.8l1 1.9c1 1.9 2 2.8 4 2.8H20" />
    <path d="M4 17h3.5c1.4 0 2.3-.5 3-1.4" />
    <path d="M13.5 8.4c.7-.9 1.6-1.4 3-1.4H20" />
    <path d="m17.5 4.5 2.5 2.5-2.5 2.5" />
    <path d="m17.5 12 2.5 2.5-2.5 2.5" />
  </Icoon>
)

export const IcoonOpnieuw = () => (
  <Icoon>
    <path d="M5 12a7 7 0 1 0 2.1-5" />
    <path d="M5 4.5V8h3.5" />
  </Icoon>
)
