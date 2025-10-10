import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

export const runtime = "nodejs" // fuerza runtime Node (no Edge)

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
})


const ALLOWED_SECTIONS = ["me", "design", "illustration", "photo-video", "tatto"] as const

export async function POST(req: Request) {
    let section = ""
    try {
        const body = await req.json()
        section = String(body?.section || "")
    } catch { /* si no hay body, section="" */ }

    // Sanitizar/whitelist para evitar carpetas arbitrarias
    const safeSection = ALLOWED_SECTIONS.includes(section as any) ? section : "misc"

    const base = (process.env.CLOUDINARY_FOLDER || "portfolioW").trim()
    const folder = `${base}/${safeSection}`
    const timestamp = Math.floor(Date.now() / 1000)

    // SOLO incluye aquí los mismos params que enviarás al upload
    const paramsToSign = { timestamp, folder }

    const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        process.env.CLOUDINARY_API_SECRET!
    )

    return NextResponse.json({
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
        timestamp,
        signature,
        folder,
    })
}