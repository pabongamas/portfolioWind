import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"


const key = () => new TextEncoder().encode(process.env.SESSION_SECRET!)

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

async function requireAuth() {
const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value
  if (!token) return false
  try { await jwtVerify(token, key(), { algorithms: ["HS256"] }); return true } catch { return false }
}

export async function DELETE(req: Request) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const publicId: string = body.publicId
    const resourceType: "image" | "video" | "raw" = body.resourceType ?? "image"

    if (!publicId) {
      return NextResponse.json({ error: "publicId is required" }, { status: 400 })
    }

    // Borra el recurso; invalidate limpia el CDN
    const result = await cloudinary.api.delete_resources(
      [publicId],
      { resource_type: resourceType, invalidate: true }
    )

    return NextResponse.json({ ok: true, result })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Delete failed" }, { status: 500 })
  }
}