import type { Session, User } from "@/types/auth"

const rolePermissions: Record<User["role"], User["permissions"]> = {
  super_admin: [
    "dashboard",
    "merchandise",
    "design",
    "yarn",
    "store",
    "reports",
  ],
  merchandising_user: ["dashboard", "merchandise"],
  design_user: ["dashboard", "design"],
  yarn_user: ["dashboard", "yarn"],
  store_user: ["dashboard", "store"],
  management_user: ["dashboard", "reports"],
}

export const mockUsers: Array<User & { password: string }> = [
  {
    id: "usr-001",
    name: "Rafid Hasan",
    email: "admin@linkin.ai",
    password: "password123",
    role: "super_admin",
    department: "Platform Administration",
    avatar: "RA",
    permissions: rolePermissions.super_admin,
  },
  {
    id: "usr-002",
    name: "Sharmeen Akter",
    email: "merch@linkin.ai",
    password: "password123",
    role: "merchandising_user",
    department: "Merchandising",
    avatar: "SA",
    permissions: rolePermissions.merchandising_user,
  },
  {
    id: "usr-003",
    name: "Ishrat Rahman",
    email: "design@linkin.ai",
    password: "password123",
    role: "design_user",
    department: "Design",
    avatar: "IR",
    permissions: rolePermissions.design_user,
  },
  {
    id: "usr-004",
    name: "Nusrat Jahan",
    email: "yarn@linkin.ai",
    password: "password123",
    role: "yarn_user",
    department: "Yarn",
    avatar: "NJ",
    permissions: rolePermissions.yarn_user,
  },
  {
    id: "usr-005",
    name: "Tanzim Karim",
    email: "store@linkin.ai",
    password: "password123",
    role: "store_user",
    department: "Store",
    avatar: "TK",
    permissions: rolePermissions.store_user,
  },
  {
    id: "usr-006",
    name: "Mahin Chowdhury",
    email: "management@linkin.ai",
    password: "password123",
    role: "management_user",
    department: "Management",
    avatar: "MC",
    permissions: rolePermissions.management_user,
  },
]

export function buildMockSession(user: User): Session {
  return {
    accessToken: `token-${user.id}`,
    refreshToken: `refresh-${user.id}`,
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    user,
  }
}
