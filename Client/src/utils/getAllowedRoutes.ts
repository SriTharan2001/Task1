// src/utils/getAllowedRoutes.ts
export function getAllowedRoutes(role?: string): string[] {
  switch (role) {
    case "Viewer":
      return ["/dashboard", "/monthly-summary", ];
    case "Admin":
      return ["/dashboard", "/add-expense", "/expenses", "/monthly-summary" ];
    case "Manager":
      return [
        "/dashboard",
        "/add-expense",
        "/expenses",
        "/monthly-summary",
        "/user",
      ];
    default:
      return [];
  }
}
