// Post categories. `value` is what the backend stores on Post.category —
// never rename a value; only the label may change.
export const CATEGORIES = [
  { value: 'uncategorized', label: 'Uncategorized' },
  { value: 'software', label: 'Software Engineering' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'reactjs', label: 'React' },
  { value: 'backend', label: 'Backend / APIs' },
  { value: 'system-design', label: 'System Design' },
  { value: 'ai-ml', label: 'AI & Machine Learning' },
  { value: 'devops', label: 'DevOps & Cloud' },
  { value: 'tech', label: 'Technology' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'space-tech', label: 'Space Tech' },
  { value: 'philosophy', label: 'Tech Philosophy' },
  { value: 'history', label: 'Tech History' },
  { value: 'career', label: 'Career & Learning' },
  { value: 'projects', label: 'Projects & Builds' },
]

export const getCategoryLabel = value =>
  CATEGORIES.find(c => c.value === value)?.label || value || 'Uncategorized'
