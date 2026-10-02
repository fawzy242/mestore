/**
 * Central place for user-facing strings.
 */
export const COPY = Object.freeze({
  auth: {
    loginTitle: 'RetailPOS',
    loginSubtitle: 'Sign in to continue',
    loginUsername: 'Username',
    loginPassword: 'Password',
    loginButton: 'Log In',
    loginError: 'Incorrect username or password.',
  },
  errors: {
    network: "Can't reach the server. Check your connection.",
    timeout: 'The server took too long to respond. Please try again.',
    forbidden: "You don't have access to that page.",
    notFound: "That link doesn't lead anywhere in this prototype.",
    server: 'Something went wrong. Please try again.',
    unknown: 'An unexpected error occurred.',
  },
  common: {
    backToDashboard: 'Back to Dashboard',
    cancel: 'Cancel',
    retry: 'Retry',
  },
  empty: {
    noProducts: 'No products found.',
    noTransactions: 'No transactions found.',
    noUsers: 'No users found.',
    noCategories: 'No categories found.',
  },
  shift: {
    openTitle: 'Start Your Shift',
    openSubtitle: 'Enter the starting cash in your drawer to begin.',
    openButton: 'Start Shift',
    closeTitle: 'Close Your Shift',
    closeSubtitle: 'Count your drawer and enter the total.',
    closeButton: 'Confirm & Close Shift',
  },
})