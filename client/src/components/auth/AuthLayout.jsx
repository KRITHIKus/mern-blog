import { forwardRef, useState } from 'react'
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'
import { Input } from '../ui'

/** Focused single-column frame for Sign in / Sign up. */
export default function AuthLayout({ kicker, title, intro, children, footer }) {
  return (
    <div className="auth">
      <div className="auth__panel">
        <header className="auth__head">
          <p className="auth__kicker">{kicker}</p>
          <h1 className="auth__title">{title}</h1>
          {intro && <p className="auth__intro">{intro}</p>}
        </header>
        <div className="auth__body">{children}</div>
        {footer && <p className="auth__footer">{footer}</p>}
      </div>
    </div>
  )
}

export function AuthDivider() {
  return <div className="auth__divider" role="separator"><span>or</span></div>
}

/** Password input with an accessible show/hide toggle. Works inside <Field>. */
export const PasswordInput = forwardRef(function PasswordInput(props, ref) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="password-input">
      <Input ref={ref} {...props} type={visible ? 'text' : 'password'} />
      <button
        type="button"
        className="password-input__toggle"
        onClick={() => setVisible(v => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        {visible ? <HiOutlineEyeOff aria-hidden="true" /> : <HiOutlineEye aria-hidden="true" />}
      </button>
    </div>
  )
})
