'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function AuthorizePage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  const clientId = searchParams.get('client_id') || 'mock-client-id'
  const redirectUri = searchParams.get('redirect_uri') || ''
  const state = searchParams.get('state') || ''

  const handleApprove = async () => {
    setLoading(true)

    // Generate authorization code
    const code = `auth_code_${Date.now()}_${Math.random().toString(36).substring(2)}`

    // Redirect back to callback with code
    const callbackUrl = new URL(redirectUri)
    callbackUrl.searchParams.set('code', code)
    callbackUrl.searchParams.set('state', state)

    console.log('callbackUrl', callbackUrl.href)

    window.location.href = callbackUrl.href
  }

  const handleDeny = () => {
    window.location.href = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-2">Authorization Request</div>
          <p className="text-gray-600 text-sm">
            An application is requesting access to your account
          </p>
        </div>

        {/* Authorization Details */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Application
            </label>
            <p className="text-gray-800 font-medium mt-1">Mock OAuth2 App</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Client ID
            </label>
            <p className="text-gray-800 font-mono text-sm mt-1 break-all">{clientId}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleApprove}
            disabled={loading}
            className="cursor-pointer w-full bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Approving...
              </span>
            ) : (
              'Approve'
            )}
          </button>

          <button
            onClick={handleDeny}
            disabled={loading}
            className="cursor-pointer w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-200 border-2 border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Deny
          </button>
        </div>
      </div>
    </div>
  )
}
