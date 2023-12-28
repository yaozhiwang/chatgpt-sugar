export function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ")
}

export function detectTheme() {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark"
  }
  return "light"
}
