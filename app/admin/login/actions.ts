"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT } from "jose"

const key = () => new TextEncoder().encode(process.env.SESSION_SECRET)

export async function loginAction(formData: FormData) {
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");


    const valid =
        email === process.env.ADMIN_EMAIL &&
        password === process.env.ADMIN_PASSWORD;
    if (!valid) {
        redirect("/admin/login?error=1");
    }

    // set cookie session 

    const token = await new SignJWT({ sub: email, role: "admin" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(key())


    const cookieStore = await cookies();
    cookieStore.set("admin_token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    })

    // Redirige al panel o a la ruta de retorno
    const from = String(formData.get("from") || "/admin/upload");
    redirect(from);
}