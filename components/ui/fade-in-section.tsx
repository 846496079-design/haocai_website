'use client'

import { useEffect, useRef, useState } from 'react'

interface FadeInSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  visibleOnLoad?: boolean
}

export default function FadeInSection({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  visibleOnLoad = false,
}: FadeInSectionProps) {
  const [isVisible, setIsVisible] = useState(visibleOnLoad)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (visibleOnLoad) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [visibleOnLoad])

  const directionStyles = {
    up: 'translate-y-8',
    down: '-translate-y-8',
    left: 'translate-x-8',
    right: '-translate-x-8',
    none: '',
  }

  return (
    <div
      ref={ref}
      className={`${visibleOnLoad ? '' : 'transition-all duration-700 ease-out'} ${
        isVisible ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${directionStyles[direction]}`
      } ${className}`}
      style={visibleOnLoad ? undefined : { transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
