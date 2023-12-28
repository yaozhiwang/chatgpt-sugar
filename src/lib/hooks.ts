import { MutableRefObject, useEffect, useState } from "react"

export function useOutsideAlerter(
  ref: MutableRefObject<HTMLElement | null>,
  onClickOutside: () => void
) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside()
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [ref, onClickOutside])
}

export function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">()

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)")
    const listener = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? "dark" : "light")
    }
    query.addEventListener("change", listener)
    return () => {
      query.removeEventListener("change", listener)
    }
  }, [])

  return theme
}
