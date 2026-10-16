import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { siginInSuccess } from '../redux/user/userSlice'
import { Alert, Button, Field, Input } from '../components/ui'
import AuthLayout, { AuthDivider, PasswordInput } from '../components/auth/AuthLayout'
import OAuth from '../components/OAuth'
import { requestJSON } from '../utils/http'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SignIn() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const from = location.state?.from
  const redirectTo = from ? `${from.pathname}${from.search || ''}` : '/'
  const justRegistered = Boolean(location.state?.registered)

  const [values, setValues] = useState({ email: location.state?.email || '', password: '' })
  const [errors, setErrors] = useState({})
  const { currentUser } = useSelector(state => state.user)
  const [formError, setFormError] = useState(null)
  const [loading, setLoading] = useState(false)

  const update = field => event => {
    setValues(v => ({ ...v, [field]: event.target.value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!values.email.trim()) next.email = 'Enter your email address.'
    else if (!EMAIL.test(values.email.trim())) next.email = 'Enter a valid email address.'
    if (!values.password) next.password = 'Enter your password.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async event => {
    event.preventDefault()
    setFormError(null)
    if (!validate()) return
    setLoading(true)
    try {
      const user = await requestJSON('/api/auth/signin', {
        method: 'POST',
        body: { email: values.email.trim(), password: values.password },
      })
      dispatch(siginInSuccess(user))
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setFormError(error.status === 404 || error.status === 401
        ? 'That email and password combination didn’t match an account.'
        : error.message)
      setLoading(false)
    }
  }

  // Already signed in (e.g. via the back button) → go where they were heading.
  if (currentUser && !loading) return <Navigate to={redirectTo} replace />

  return (
    <AuthLayout
      kicker="Welcome back"
      title={<>Sign in to <em>A2D</em></>}
      intro="Save articles for later and join the discussion."
      footer={<>New to A2D? <Link to="/signup" state={location.state} className="text-link text-link--inline">Create an account</Link></>}
    >
      {justRegistered && !formError && (
        <Alert variant="success" title="Account created">Sign in with your new account to continue.</Alert>
      )}
      {formError && <Alert variant="danger">{formError}</Alert>}

      <form className="auth__form" onSubmit={submit} noValidate>
        <Field label="Email" error={errors.email}>
          <Input type="email" autoComplete="email" inputMode="email" value={values.email} onChange={update('email')} autoFocus={!values.email} />
        </Field>
        <Field label="Password" error={errors.password}>
          <PasswordInput autoComplete="current-password" value={values.password} onChange={update('password')} autoFocus={Boolean(values.email)} />
        </Field>
        <Button type="submit" size="lg" block loading={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <AuthDivider />
      <OAuth redirectTo={redirectTo} onError={setFormError} />
    </AuthLayout>
  )
}
