export type User = {
  id: string
  email: string
  displayName: string
  firstName: string
  lastName: string
  avatar: string
  role: 'runner' | 'crew' | 'admin' | 'spectator'
  runnerId?: string
  crewForRunners?: string[]
  createdAt: string
}

export type AuthCredentials = {
  email: string
  password: string
}

export type RegisterData = {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'runner' | 'crew' | 'admin' | 'spectator'
}

export type AuthSession = {
  user: User
  token: string
  expiresAt: string
}
