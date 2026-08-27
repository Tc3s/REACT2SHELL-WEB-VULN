import OTPCard from "@/components/auth/verify-otp/OTPCard"

export default function VerifyOTPPage() {

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 px-6">

      <div className="w-full max-w-md">

        {/* Header */}
        <div className="flex flex-col items-center mb-10">

          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">

            <span className="material-symbols-outlined text-white text-3xl">
              shield_lock
            </span>

          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Two-Factor Authentication
          </h1>

          <p className="text-gray-500 text-center max-w-sm">
            We&apos;ve sent a 6-digit verification code to your email.
          </p>

        </div>

        <OTPCard />

      </div>

    </main>
  )
}