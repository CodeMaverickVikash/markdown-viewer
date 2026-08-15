export function getAllowedEmails() {
  return (process.env.ALLOWED_EMAILS ?? '')
    .split(',')
    .map(value => value.trim().toLowerCase())
    .filter(Boolean)
}

export function isAllowedEmail(value: string | undefined) {
  const email = value?.trim().toLowerCase() ?? ''
  const allowedEmails = getAllowedEmails()
  return email.includes('@') && (allowedEmails.length === 0 || allowedEmails.includes(email))
}
