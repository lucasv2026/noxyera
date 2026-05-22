"use client"

import { useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"

// Convert base64url VAPID public key to ArrayBuffer
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const arr = Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
  return arr.buffer as ArrayBuffer
}

async function savePushSubscription(subscription: PushSubscription) {
  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from("profiles")
      .update({ push_subscription: subscription.toJSON() })
      .eq("user_id", user.id)
  } catch {
    // Non-fatal — push subscriptions are best-effort
  }
}

export function SwRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return

    navigator.serviceWorker
      .register("/sw.js")
      .then(async (registration) => {
        // Check if already subscribed
        const existing = await registration.pushManager.getSubscription()
        if (existing) {
          await savePushSubscription(existing)
          return
        }

        // Request notification permission
        const permission = await Notification.requestPermission()
        if (permission !== "granted") return

        // Subscribe only if VAPID public key is configured
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        if (!vapidPublicKey) return

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        })

        await savePushSubscription(subscription)
      })
      .catch(() => {
        // SW registration failed — silent fail (non-PWA context)
      })
  }, [])

  return null
}
