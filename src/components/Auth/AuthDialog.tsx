import { useState } from 'react'
import { Dialog, DialogContent } from '../ui/dialog'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {isLogin ? (
          <LoginForm onToggle={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onToggle={() => setIsLogin(true)} />
        )}
      </DialogContent>
    </Dialog>
  )
}