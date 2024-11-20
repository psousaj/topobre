'use client'

import { SignIn, UserButton, UserProfile, useUser } from "@clerk/nextjs"

export default function Header() {
    const user = useUser()

    if (!user) return <SignIn />

    return <header className="w-full h-12 justify-between border-b-2 border-white flex items-center">
        <p>dale</p>
        <UserButton />
    </header>
}