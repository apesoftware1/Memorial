import arcjet, { createMiddleware, detectBot, shield, slidingWindow } from "@arcjet/next";

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  characteristics: ["ip.src"], // Track requests by IP
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
      ],
    }),
    // Create a sliding window rate limit
    slidingWindow({
      mode: "LIVE",
      interval: 60, // 1 minute
      max: 100, // 100 requests per IP per minute
    }),
  ],
});

// Pass existing middleware if you have one, or just export the arcjet one
export default createMiddleware(aj);
