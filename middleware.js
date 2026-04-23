export { default } from "next-auth/middleware";

export const config = {
  // Protect the dashboard and profile routes
  // Add any other routes you want to protect here
  matcher: [
    "/",
    "/profile",
    // Add sub-routes if you add more pages like /simulations/:id
  ],
};
