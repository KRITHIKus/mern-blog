import { Children, cloneElement, forwardRef, isValidElement, useId } from 'react'
import { cx } from './cx'

/**
 * Field — label + control + hint + error, wired for assistive tech.
 * Pass exactly one control (Input, Textarea, Select, or any element that
 * accepts id/aria props); Field supplies its id, aria-describedby,
 * aria-invalid and required.
 *
 *   <Field label="Email" error={errors.email} required>
 *     <Input type="email" value={email} onChange={…} />
 *   </Field>
 */
export function Field({ label, hint, error, required, id, className, children }) {
  const autoId = useId()
  const child = Children.only(children)
  const controlId = id || (isValidElement(child) && child.props.id) || autoId
  const hintId = hint ? `${controlId}-hint` : undefined
  const errorId = error ? `${controlId}-error` : undefined
  const describedBy = [child.props['aria-describedby'], hintId, errorId]
    .filter(Boolean)
    .join(' ') || undefined

  const control = cloneElement(child, {
    id: controlId,
    'aria-describedby': describedBy,
    'aria-invalid': error ? true : child.props['aria-invalid'],
    required: required ?? child.props.required,
  })

  return (
    <div className={cx('ui-field', className)}>
      {label && (
        <label htmlFor={controlId} className="ui-label">
          {label}
          {required && <span className="ui-label__required" aria-hidden="true">*</span>}
        </label>
      )}
      {control}
      {hint && <p id={hintId} className="ui-field__hint">{hint}</p>}
      {error && <p id={errorId} className="ui-field__error">{error}</p>}
    </div>
  )
}

export const Input = forwardRef(function Input({ className, type = 'text', ...props }, ref) {
  return <input ref={ref} type={type} className={cx('ui-input', className)} {...props} />
})

export const Textarea = forwardRef(function Textarea({ className, rows = 4, ...props }, ref) {
  return <textarea ref={ref} rows={rows} className={cx('ui-textarea', className)} {...props} />
})

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <select ref={ref} className={cx('ui-select', className)} {...props}>
      {children}
    </select>
  )
})
