"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import TodoApp from "./components/TodoApp";

export default function Home() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  Todo App
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Welcome, {user?.signInDetails?.loginId}!
                </p>
              </div>
              <button
                onClick={signOut}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
            <TodoApp />
          </div>
        </main>
      )}
    </Authenticator>
  );
}
