import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function Page() {
    return (
        <div className="flex flex-1 justify-center items-center gap-[5%]">
            <Image src='/assets/img/topobre-logon.png' alt="To Pobre" width={500} height={400} />
            <SignIn signUpUrl="/sign-up" />
        </div>
    )
}