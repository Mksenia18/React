export function mapFirebaseAuthError(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code: string }).code)
    switch (code) {
      case 'auth/email-already-in-use':
        return 'User already exists'
      case 'auth/invalid-email':
        return 'Invalid email address'
      case 'auth/weak-password':
        return 'Password is too weak'
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid credentials'
      case 'auth/too-many-requests':
        return 'Too many attempts. Try again later.'
      default:
        break
    }
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return 'Authentication failed'
}
