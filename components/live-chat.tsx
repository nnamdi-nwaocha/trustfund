"use client"

import { useEffect } from "react"

export function LiveChat() {
  useEffect(() => {
    // Initialize LiveChat
    window._lc = window._lc || {}
    window.__lc = window.__lc || {}
    window.__lc.license = 19142116
    window.__lc.integration_name = "manual_channels"
    window.__lc.product_name = "livechat"

    // Load the LiveChat script
    const script = document.createElement("script")
    script.async = true
    script.type = "text/javascript"
    script.src = "https://cdn.livechatinc.com/tracking.js"
    document.head.appendChild(script)

    // Initialize LiveChat
    window.LiveChatWidget = window.LiveChatWidget || {
      _q: [],
      _h: null,
      _v: "2.0",
      on: (...args) => {
        window.LiveChatWidget._q.push(["on", ...args])
      },
      once: (...args) => {
        window.LiveChatWidget._q.push(["once", ...args])
      },
      off: (...args) => {
        window.LiveChatWidget._q.push(["off", ...args])
      },
      get: (...args) => {
        if (!window.LiveChatWidget._h) throw new Error("[LiveChatWidget] You can't use getters before load.")
        return window.LiveChatWidget._q.push(["get", ...args])
      },
      call: (...args) => {
        window.LiveChatWidget._q.push(["call", ...args])
      },
      init: () => {},
    }

    // Clean up
    return () => {
      // Remove the script when component unmounts
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  return null
}
