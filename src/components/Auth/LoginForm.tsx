import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { toast } from 'sonner'

export function LoginForm({ onToggle, onSuccess }: { onToggle: () => void; onSuccess?: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(email, password)
    
    if (error) {
      setError(error.message)
      toast.error('Đăng nhập thất bại', {
        description: error.message
      })
      setLoading(false)
    } else {
      toast.success('Đăng nhập thành công!', {
        description: 'Chào mừng bạn quay trở lại'
      })
      
      // Close dialog if callback provided
      if (onSuccess) {
        onSuccess()
      }
      
      // Wait for auth state to update, then check admin status and redirect
      setTimeout(() => {
        // Check email for admin after successful login
        const adminEmail = 'admin@vungtauland.store'
        if (email === adminEmail) {
          navigate('/admin')
        } else {
          navigate('/dashboard')
        }
        setLoading(false)
      }, 800)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Đăng nhập</CardTitle>
        <CardDescription>Đăng nhập vào tài khoản của bạn</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
          <Button type="button" variant="link" onClick={onToggle}>
            Chưa có tài khoản? Đăng ký ngay
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}