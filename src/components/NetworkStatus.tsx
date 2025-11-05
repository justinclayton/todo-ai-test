import { useNetworkStatus } from '../hooks/useNetworkStatus';

/**
 * Network status indicator
 * Shows when offline or syncing
 */
export function NetworkStatus() {
  const { isOnline, isSyncing } = useNetworkStatus();

  if (isOnline && !isSyncing) {
    return null;
  }

  return (
    <div
      className={`fixed top-16 right-4 px-4 py-2 rounded-md shadow-lg ${
        isSyncing
          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
          : 'bg-red-100 text-red-800 border border-red-300'
      }`}
      role="status"
      aria-live="polite"
    >
      {isSyncing ? (
        <div className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm font-medium">Syncing...</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <svg
            className="h-4 w-4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" />
          </svg>
          <span className="text-sm font-medium">Offline</span>
        </div>
      )}
    </div>
  );
}
