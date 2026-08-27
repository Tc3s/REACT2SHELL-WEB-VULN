import LoginForm from "@/components/auth/login/LoginForm"
import OAuthButtons from "@/components/auth/login/OAuthButtons"

import Link from "next/link"

export default function LoginPage() {

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">

            <main className="w-full max-w-[480px]">

                {/* header */}

                <div className="mb-10 text-center">

                    <div className="inline-flex items-center justify-center p-3 mb-6 bg-white rounded-xl shadow-sm">
                        🎓
                    </div>

                    <h1 className="text-3xl font-bold text-gray-700">
                        Welcome Back
                    </h1>

                    <p className="text-gray-500">
                        Resume your curated learning journey
                    </p>

                </div>

                {/* card */}

                <div className="bg-white rounded-2xl p-10 shadow-lg">

                    <LoginForm />

                    <div className="relative my-8 border-t">
                        <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-3 text-xs text-gray-400">
                            Or continue with
                        </span>
                    </div>

                    <OAuthButtons />

                </div>

                <p className="mt-8 text-center text-sm text-gray-600">

                    Don&apos;t have an account?

                    <Link
                        href="/register"
                        className="text-indigo-600 font-semibold ml-1"
                    >
                        Create an account
                    </Link>

                </p>

            </main>

        </div>
    )
}