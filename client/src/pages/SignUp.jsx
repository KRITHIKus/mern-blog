import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Alert, Button, Field, Input } from '../components/ui'
import AuthLayout, { AuthDivider, PasswordInput } from '../components/auth/AuthLayout'
import OAuth from '../components/OAuth'
import { requestJSON } from '../utils/http'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Same rule the profile editor enforces, so new usernames stay editable.
const USERNAME = /^[a-z0-9]{7,20}$/

export default function SignUp() {
  const location = useLocation()
  const navigate = useNavigate()
  const from = location.state?.from
  const redirectTo = from ? `${from.pathname}${from.search || ''}` : '/'

  const [values, setValues] = useState({ username: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const { currentUser } = useSelector(state => state.user)
  const [formError, setFormError] = useState(null)
  const [loading, setLoading] = useState(false)

  const update = field => event => {
    const value = field === 'username' ? event.target.value.toLowerCase() : event.target.value
    setValues(v => ({ ...v, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!values.username.trim()) next.username = 'Choose a username.'
    else if (!USERNAME.test(values.username.trim())) next.username = 'Use 7–20 lowercase letters or numbers.'
    if (!values.email.trim()) next.email = 'Enter your email address.'
    else if (!EMAIL.test(values.email.trim())) next.email = 'Enter a valid email address.'
    if (!values.password) next.password = 'Choose a password.'
    else if (values.password.length < 6) next.password = 'Use at least 6 characters.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async event => {
    event.preventDefault()
    setFormError(null)
    if (!validate()) return
    setLoading(true)
    try {
      await requestJSON('/api/auth/signup', {
        method: 'POST',
        body: { username: values.username.trim(), email: values.email.trim(), password: values.password },
      })
      navigate('/signin', { replace: true, state: { registered: true, email: values.email.trim(), from } })
    } catch (error) {
      setFormError(error.message)
      setLoading(false)
    }
  }

  // Already signed in (e.g. via the back button) → go where they were heading.
  if (currentUser && !loading) return <Navigate to={redirectTo} replace />

  return (
    <AuthLayout
      kicker="Join the publication"
      title={<>Create your <em>account</em></>}
      intro="An account lets you save articles and take part in the discussion. It’s free."
      footer={<>Already have an account? <Link to="/signin" state={location.state} className="text-link text-link--inline">Sign in</Link></>}
    >
      {formError && <Alert variant="danger">{formError}</Alert>}

      <form className="auth__form" onSubmit={submit} noValidate>
        <Field label="Username" hint="7–20 lowercase letters or numbers." error={errors.username}>
          <Input autoComplete="username" autoCapitalize="none" spellCheck={false} value={values.username} onChange={update('username')} autoFocus />
        </Field>
        <Field label="Email" error={errors.email}>
          <Input type="email" autoComplete="email" inputMode="email" value={values.email} onChange={update('email')} />
        </Field>
        <Field label="Password" hint="At least 6 characters." error={errors.password}>
          <PasswordInput autoComplete="new-password" value={values.password} onChange={update('password')} />
        </Field>
        <Button type="submit" size="lg" block loading={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <AuthDivider />
      <OAuth redirectTo={redirectTo} onError={setFormError} />
    </AuthLayout>
  )
}
