import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <VisuallyHidden>
          <DialogTitle>{isLogin ? 'Đăng nhập' : 'Đăng ký'}</DialogTitle>
          <DialogDescription>
            {isLogin ? 'Đăng nhập vào tài khoản của bạn' : 'Tạo tài khoản mới'}
          </DialogDescription>
        </VisuallyHidden>
        {isLogin ? (
          <LoginForm onToggle={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onToggle={() => setIsLogin(true)} />
        )}
      </DialogContent>
    </Dialog>
  )
}