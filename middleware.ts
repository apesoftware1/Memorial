import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
})

export const config = {
  matcher: [
    "/manufacturers/manufacturers-Profile-Page/:path*",
    "/regan-dashboard/:path*",
  ],
}
