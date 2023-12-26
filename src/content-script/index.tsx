import { renderJourney } from "./chatgpt-journey/welcome"

if (location.pathname === "/") {
  renderJourney()
}
let prevPathname = location.pathname
const observer = new MutationObserver(function () {
  if (location.pathname !== prevPathname) {
    if (location.pathname === "/") {
      renderJourney()
    }
    prevPathname = location.pathname
  }
})
const config = { subtree: true, childList: true }
observer.observe(document, config)
