'use client'
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { SignIn, useUser } from "@clerk/nextjs";

export function WelcomeUserNotification() {
    const { user } = useUser()

    if (!user) return <SignIn />

    return (
        // {/* Notification Banner */ }
        < div className="mt-4 flex items-center justify-between rounded-lg bg-pink-100 p-3" >
            <div className="flex items-center gap-2">
                <span className="text-sm text-pink-600">💝 Olá de novo, {user!.firstName}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-pink-600">
                <X className="h-4 w-4" />
            </Button>
        </ div >
    )
}