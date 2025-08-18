"use client";

import { useKeycloakAuth } from "@/providers/KeycloakProvider";

export default function DashboardPage() {
  const { initialized, authenticated, login, logout, token, hasRole } = useKeycloakAuth();

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {authenticated ? (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Logout
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Authentication Status</h2>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`h-4 w-4 rounded-full ${hasRole("admin") ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Admin Role</p>
                        <p className="text-sm text-gray-500">{hasRole("admin") ? "You have admin privileges" : "You don't have admin privileges"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Authentication Token</h2>
                  <div className="bg-gray-100 p-4 rounded-md">
                    <p className="text-sm font-mono text-gray-600 break-all">{token}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <button
            onClick={login}
            className="px-8 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Login to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
