import { NextResponse } from "next/server";


export async function GET(req: Request) {
    const folder = new URL(req.url).searchParams.get("folder") || "me"

    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!
    const apiSecret = process.env.CLOUDINARY_API_SECRET!
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
    const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || "portfolioW"
    const auth = "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/resources/by_asset_folder?asset_folder=${CLOUDINARY_FOLDER}/${folder}`,
        {
            method: "GET",
            headers: { Authorization: auth },
            cache: "no-store",
        }
    )

    if (!res.ok) {
        const err = await res.text()
        return NextResponse.json({ error: err }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
}