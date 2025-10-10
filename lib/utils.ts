import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { jwtVerify } from "jose"

const key = () => new TextEncoder().encode(process.env.SESSION_SECRET!)


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export async function verifyAdminToken(token?: string) {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] })
    return payload // { sub, role, iat, exp, ... }
  } catch {
    return null
  }
}

export function classifyAspect(w?: number, h?: number): "tall" | "wide" | "square" | "short" | "medium" {
    if (!w || !h) return "square"
    const r = h / w
    // ajusta umbrales a tu gusto
    if (r >= 1.35) return "tall"       // mucho más alto que ancho
    if (r <= 0.75) return "wide"       // mucho más ancho que alto
    // entre medio, diferenciamos square vs medium vs short
    if (r >= 0.95 && r <= 1.05) return "square"
    if (r < 0.95 && r >= 0.80) return "short"   // un poquito más ancho
    return "medium"                              // un poquito más alto
}

export function getRowSpan(aspect: string) {
    // Recuerda que tu grid usa auto-rows-[10px]
    switch (aspect) {
        case "tall": return "row-span-[45]"  // ≈ 450px
        case "wide": return "row-span-[25]"  // ≈ 250px
        case "square": return "row-span-[30]"  // ≈ 300px
        case "short": return "row-span-[20]"  // ≈ 200px
        case "medium": return "row-span-[35]"  // ≈ 350px
        default: return "row-span-[30]"
    }
}