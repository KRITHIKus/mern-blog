import { useDispatch, useSelector } from 'react-redux'
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi'
import { toggleTheme } from '../../redux/theme/themeSlice'
import { Button } from '../ui'

export default function ThemeToggle() {
  const dispatch = useDispatch()
  const { theme } = useSelector(state => state.theme)
  const next = theme === 'dark' ? 'light' : 'dark'

  return (
    <Button
      variant="ghost"
      icon
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      onClick={() => dispatch(toggleTheme())}
    >
      {theme === 'dark' ? <HiOutlineSun /> : <HiOutlineMoon />}
    </Button>
  )
}
