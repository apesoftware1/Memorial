import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const path = req.nextUrl.pathname;

      // Define protected paths
      // 1. Exact match for owner profile dashboard
      const isOwnerPage = path === "/manufacturers/manufacturers-Profile-Page";
      
      // 2. Specific protected sub-routes
      const isAdvertCreator = path.startsWith("/manufacturers/manufacturers-Profile-Page/advert-creator");
      const isUpdateListing = path.startsWith("/manufacturers/manufacturers-Profile-Page/update-listing");

      // Check if it matches any protected route
      if (isOwnerPage || isAdvertCreator || isUpdateListing) {
        return !!token;
      }

      // Allow access to public profile pages (e.g. /manufacturers/manufacturers-Profile-Page/some-id)
      return true;
    },
  },
})

export const config = {
  matcher: [
    "/manufacturers/manufacturers-Profile-Page",
    "/manufacturers/manufacturers-Profile-Page/advert-creator/:path*",
    "/manufacturers/manufacturers-Profile-Page/update-listing/:path*",
    "/regan-dashboard/:path*",
  ],
}
