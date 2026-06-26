export const userRoles = [
  "super_admin",
  "merchandising_user",
  "design_user",
  "yarn_user",
  "store_user",
  "management_user",
] as const

export type UserRole = (typeof userRoles)[number]

export const appModuleKeys = [
  "dashboard",
  "merchandise",
  "design",
  "yarn",
  "store",
  "reports",
] as const

export type AppModuleKey = (typeof appModuleKeys)[number]

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  department: string
  avatar: string
  permissions: AppModuleKey[]
}

export type Session = {
  accessToken: string
  refreshToken: string
  expiresAt: string
  user: User
}

export type LoginPayload = {
  email: string
  password: string
}

export type ForgotPasswordPayload = {
  email: string
}

export type ResetPasswordPayload = {
  token: string
  password: string
  confirmPassword: string
}
