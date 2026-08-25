"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ResetPasswordCard() {

  const router = useRouter()

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (password !== confirm) {
      setError("Passwords do not match")
      return
    }

    console.log("New password:", password)

    // sau này gọi API reset password
    // await fetch("/auth/reset-password")

    router.push("/login")
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg space-y-6">

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* New Password */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            New Password
          </label>

          <input
            type="password"
            placeholder="Enter new password"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-indigo-600 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Confirm Password
          </label>

          <input
            type="password"
            placeholder="Confirm password"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-indigo-600 outline-none"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="text-red-500 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-full transition"
        >
          Reset Password
        </button>

      </form>

    </div>
  )
}