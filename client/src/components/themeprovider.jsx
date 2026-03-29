import { useSelector } from 'react-redux'
import { useEffect } from 'react'

export default function ThemeProvider({ children }) {
  const { theme } = useSelector(state => state.theme)

  // Apply data-theme to <html> so CSS variables resolve correctly
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return <>{children}</>
}
