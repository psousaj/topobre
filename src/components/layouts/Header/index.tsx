'use client'

import { SignIn, UserButton, useUser, RedirectToSignIn } from "@clerk/nextjs"

export default function Header() {
    const user = useUser()

    if (!user) return <SignIn />

    return (
        <header className="w-full h-12 justify-between border-b border-slate-500 flex items-center px-8">
            <p className="text-3xl font-bold">LOGO DO APP</p>
            <UserButton />
        </header>
    )
}