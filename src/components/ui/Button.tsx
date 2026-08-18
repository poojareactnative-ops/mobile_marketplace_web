import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode }

export default function Button({ children, className = '', ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition ${className}`}
    >
      {children}
    </button>
  )
}
