import { useContext } from 'react'

import { AuthContext } from '@contexts/AuthContent'

export function useAuth() {
  const context = useContext(AuthContext)
  return context
}
