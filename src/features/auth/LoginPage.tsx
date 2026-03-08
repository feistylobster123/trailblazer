import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    clearError()
    const success = await login(email, password)
    if (success) {
      navigate('/')
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #fafaf5 50%, #fff7ed 100%)' }}
    >
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-white text-2xl font-extrabold mb-4 shadow-md">
            T
          </div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">TrailBlazer</h1>
          <p className="text-text-secondary mt-1 text-sm">Track every step. Own every finish.</p>
        </div>

        <Card variant="elevated" padding="lg">
          <h2 className="text-xl font-bold text-text mb-6">Sign in to your account</h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-5 pt-5 border-t border-border">
            <p className="text-xs text-text-secondary text-center">
              Demo credentials: <span className="font-mono text-text">demo@trailblazer.com</span> /{' '}
              <span className="font-mono text-text">demo123</span>
            </p>
          </div>

          <p className="text-sm text-center text-text-secondary mt-4">
            No account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage
