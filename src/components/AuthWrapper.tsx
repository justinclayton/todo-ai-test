import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

interface AuthWrapperProps {
  children: React.ReactNode;
}

/**
 * Authentication wrapper using Amplify UI
 * Handles sign-up, sign-in, and email verification
 */
export function AuthWrapper({ children }: AuthWrapperProps) {
  return (
    <Authenticator
      signUpAttributes={['email']}
      socialProviders={[]}
      variation="modal"
    >
      {({ signOut, user }) => (
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  Todo App
                </h1>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {user?.signInDetails?.loginId}
                  </span>
                  <button
                    onClick={signOut}
                    className="btn btn-secondary text-sm"
                    aria-label="Sign out"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      )}
    </Authenticator>
  );
}
