import { useEffect, useState } from 'react'

export default function useActiveSection(sectionIds) {
  const [activeSection, setActiveSection] = useState(sectionIds[0] ?? '')

  useEffect(() => {
    const elements = sectionIds
      .map((sectionId) => document.getElementById(sectionId))
      .filter(Boolean)

    if (!elements.length) {
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((entryA, entryB) => entryB.intersectionRatio - entryA.intersectionRatio)

        if (visibleEntries[0]) {
          setActiveSection(visibleEntries[0].target.id)
        }
      },
      {
        rootMargin: '-34% 0px -48% 0px',
        threshold: [0.15, 0.3, 0.5, 0.75],
      },
    )

    elements.forEach((element) => observer.observe(element))

    return () => {
      observer.disconnect()
    }
  }, [sectionIds])

  return activeSection
}
