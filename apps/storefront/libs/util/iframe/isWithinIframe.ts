import { isBrowser } from "@libs/utils-to-merge/browser"

export const isWithinIframe = () => {
  if (!isBrowser()) return false

  try {
    return window.self !== window.top
  } catch (e) {
    return true
  }
}
