import type { IAuthService, UserProfile, AuthSession, LoginCredentials, RegisterPayload, UpdateProfilePayload, AuthResult } from '../interfaces/auth.service'

const STORAGE_KEY = 'trailblazer_user'
const USERS_STORAGE_KEY = 'trailblazer_users'
const DEMO_USER_EMAIL = 'demo@trailblazer.com'
const DEMO_USER_PASSWORD = 'demo123'

interface StoredUser {
  id: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  password: string // base64 encoded (demo only)
  role: 'runner' | 'crew' | 'volunteer' | 'admin'
  bio?: string
  location?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

interface StoredSession {
  userId: string
  token: string
  expiresAt: string
  isAnonymous: boolean
}

function encodePassword(password: string): string {
  return btoa(password)
}

function decodePassword(encoded: string): string {
  return atob(encoded)
}

function generateToken(): string {
  return btoa(Math.random().toString()).substring(0, 32)
}

function generateUserId(email: string): string {
  const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return `user-${hash}-${Date.now()}`
}

function getStoredUsers(): Map<string, StoredUser> {
  if (typeof window === 'undefined') return new Map()

  const stored = localStorage.getItem(USERS_STORAGE_KEY)
  if (!stored) return new Map()

  try {
    const users = JSON.parse(stored) as Record<string, StoredUser>
    return new Map(Object.entries(users))
  } catch {
    return new Map()
  }
}

function saveStoredUsers(users: Map<string, StoredUser>): void {
  if (typeof window === 'undefined') return

  const obj = Object.fromEntries(users)
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(obj))
}

function initDemoUser(): void {
  if (typeof window === 'undefined') return

  const users = getStoredUsers()
  if (users.has(DEMO_USER_EMAIL)) return

  const demoUser: StoredUser = {
    id: 'runner-042',
    email: DEMO_USER_EMAIL,
    firstName: 'Alex',
    lastName: 'Thompson',
    displayName: 'Alex Thompson',
    password: encodePassword(DEMO_USER_PASSWORD),
    role: 'runner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  users.set(DEMO_USER_EMAIL, demoUser)
  saveStoredUsers(users)
}

function userToProfile(user: StoredUser): UserProfile {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    bio: user.bio,
    location: user.location,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

function createSession(userId: string): AuthSession {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  return {
    userId,
    token: generateToken(),
    expiresAt,
    isAnonymous: false,
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export class MockAuthService implements IAuthService {
  constructor() {
    initDemoUser()
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    await delay(50 + Math.random() * 50)

    const users = getStoredUsers()
    const user = users.get(credentials.email)

    if (!user) {
      throw new Error('Invalid email or password')
    }

    const decodedPassword = decodePassword(user.password)
    if (decodedPassword !== credentials.password) {
      throw new Error('Invalid email or password')
    }

    const profile = userToProfile(user)
    const session = createSession(user.id)

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: profile, session }))
    }

    return { user: profile, session }
  }

  async register(payload: RegisterPayload): Promise<AuthResult> {
    await delay(50 + Math.random() * 50)

    const users = getStoredUsers()

    if (users.has(payload.email)) {
      throw new Error('Email already registered')
    }

    const userId = generateUserId(payload.email)
    const now = new Date().toISOString()

    const newUser: StoredUser = {
      id: userId,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      displayName: `${payload.firstName} ${payload.lastName}`,
      password: encodePassword(payload.password),
      role: payload.role || 'runner',
      createdAt: now,
      updatedAt: now,
    }

    users.set(payload.email, newUser)
    saveStoredUsers(users)

    const profile = userToProfile(newUser)
    const session = createSession(userId)

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: profile, session }))
    }

    return { user: profile, session }
  }

  async logout(): Promise<void> {
    await delay(50 + Math.random() * 50)

    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    await delay(30 + Math.random() * 20)

    if (typeof window === 'undefined') return null

    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    try {
      const data = JSON.parse(stored) as { user: UserProfile; session: AuthSession }
      return data.user
    } catch {
      return null
    }
  }

  async updateProfile(userId: string, payload: UpdateProfilePayload): Promise<UserProfile> {
    await delay(50 + Math.random() * 50)

    const users = getStoredUsers()
    let targetUser: StoredUser | null = null

    for (const user of users.values()) {
      if (user.id === userId) {
        targetUser = user
        break
      }
    }

    if (!targetUser) {
      throw new Error('User not found')
    }

    const oldEmail = targetUser.email

    if (payload.firstName !== undefined) targetUser.firstName = payload.firstName
    if (payload.lastName !== undefined) targetUser.lastName = payload.lastName
    if (payload.displayName !== undefined) targetUser.displayName = payload.displayName
    if (payload.bio !== undefined) targetUser.bio = payload.bio
    if (payload.location !== undefined) targetUser.location = payload.location
    if (payload.avatarUrl !== undefined) targetUser.avatarUrl = payload.avatarUrl

    targetUser.updatedAt = new Date().toISOString()

    users.set(oldEmail, targetUser)
    saveStoredUsers(users)

    const profile = userToProfile(targetUser)

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored) as { user: UserProfile; session: AuthSession }
        data.user = profile
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      }
    }

    return profile
  }

  async getSession(): Promise<AuthSession | null> {
    if (typeof window === 'undefined') return null

    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    try {
      const data = JSON.parse(stored) as { user: UserProfile; session: AuthSession }
      return data.session
    } catch {
      return null
    }
  }
}
