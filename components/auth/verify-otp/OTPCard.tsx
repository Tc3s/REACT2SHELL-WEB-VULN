"use client"

import { useRouter } from "next/navigation"
import OTPInput from "./OTPInput"

export default function OTPCard() {

  const router = useRouter()

  const handleVerify = (otp: string) => {

    console.log("OTP:", otp)

    // sau này call API verify OTP
    router.push("/auth/reset-password")
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg space-y-8">

      <OTPInput onComplete={handleVerify} />

      <button
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-full transition"
      >
        Verify Identity
      </button>

      <div className="flex flex-col items-center gap-2">

        <span className="text-xs text-gray-400 uppercase font-bold tracking-widest">
          Didn&apos;t receive a code?
        </span>

        <button
          type="button"
          className="text-indigo-600 font-semibold hover:underline"
        >
          Resend Code (0:59)
        </button>

      </div>

    </div>
  )
}