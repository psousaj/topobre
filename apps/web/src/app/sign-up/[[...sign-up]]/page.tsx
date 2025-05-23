import { SignUp } from "@clerk/nextjs";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
    title: "Crie sua conta | ToPobre"
}


export default function Page() {
    return (
        <div className="min-h-screen w-full flex flex-1 justify-center items-center gap-[5%]">
            <Image loading="lazy" src='/assets/img/topobre-logon.png' alt="To Pobre" width={500} height={400} />
            <SignUp signInUrl="/sign-in" />
        </div>
    )
}