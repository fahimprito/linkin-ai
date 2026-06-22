export type UserRole =
  | "super_admin"
  | "merchandise_user"
  | "yarn_control_user"
  | "store_control_user"
  | "knitting_user"
  | "linking_user"
  | "finishing_user"
  | "management_user"

export type AppModuleKey =
  | "dashboard"
  | "merchandise"
  | "yarn"
  | "store"
  | "knitting"
  | "linking"
  | "finishing"
  | "reports"

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
