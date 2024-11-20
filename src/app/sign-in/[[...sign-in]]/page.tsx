import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function Page() {
    return <div className="flex flex-1 justify-center gap-28">
        <Image src='/assets/img/topobre-logon.png' alt="To Pobre" width={615} height={500} />
        <SignIn signUpUrl="/sign-up" />
    </div>
}