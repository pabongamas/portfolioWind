import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "./LoginForm"

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { loginAction } from "./actions"
import { verifyAdminToken } from "./../../../lib/utils"

export default async function LoginAdmin({ searchParams }: { searchParams?: { from?: string,error?: string } }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value

  // 2) veirfy  JWT
  const payload = await verifyAdminToken(token)

  const nameApp=process.env.NEXT_PULIC_NAME_APP

  // 3)  if its already authenticated , redirecto to upload
  if (payload) redirect(searchParams?.from || "/admin/upload")
    return (
        <div className="grid min-h-svh lg:grid-cols-2 bg-white">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <a href="#" className="flex items-center gap-2 font-medium">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <GalleryVerticalEnd className="size-4" />
                        </div>
                        {nameApp}
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <LoginForm formAction={loginAction}
                            defaultFrom={searchParams?.from || "/admin"}
                            error={searchParams?.error} />
                    </div>
                </div>
            </div>
            <div className="relative hidden bg-muted lg:block">
                <img
                    src="/images/cover.png"
                    alt="Image"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>
        </div>
    )
}