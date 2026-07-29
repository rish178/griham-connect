import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
}

export default function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base = 'rounded-lg px-5 py-2.5 text-sm font-medium transition-colors'
  const variants = {
    primary: 'bg-gray-900 text-white hover:bg-gray-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}
