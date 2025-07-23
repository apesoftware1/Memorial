// This is a no-op service worker that does nothing
// It's used to prevent automatic service worker registration

self.addEventListener("install", (event) => {
  // Skip over the "waiting" lifecycle state
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  // Claim any clients immediately
  event.waitUntil(self.clients.claim())
})

self.addEventListener("fetch", (event) => {
  // Do nothing with fetch events
  return
})
