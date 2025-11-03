import { defineAuth } from '@aws-amplify/backend';

/**
 * Auth Configuration for Todo App
 * - Email and password authentication
 * - Email verification required
 * - User attributes include email
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    email: {
      required: true,
      mutable: true,
    },
  },
  accountRecovery: 'EMAIL',
});
