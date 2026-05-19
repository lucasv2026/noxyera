export const roles = ["client", "technicien", "admin"] as const;

export type UserRole = (typeof roles)[number];

export type ProtectedRoute = {
  prefix: string;
  role: UserRole;
  loginPath: string;
};

export const protectedRoutes: ProtectedRoute[] = [
  {
    prefix: "/dashboard",
    role: "client",
    loginPath: "/login"
  },
  {
    prefix: "/technicien",
    role: "technicien",
    loginPath: "/espace-technicien"
  },
  {
    prefix: "/admin",
    role: "admin",
    loginPath: "/login"
  }
];

export function getProtectedRoute(pathname: string) {
  return protectedRoutes.find(
    (route) => pathname === route.prefix || pathname.startsWith(`${route.prefix}/`)
  );
}
