import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const folder = new URL(req.url).searchParams.get("folder") || "photo-video";

    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!;
    const apiSecret = process.env.CLOUDINARY_API_SECRET!;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
    const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || "portfolioW";
    const auth = "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

    try {
        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/resources/by_asset_folder?asset_folder=${CLOUDINARY_FOLDER}/${folder}`,
            {
                method: "GET",
                headers: { Authorization: auth },
                cache: "no-store",
            }
        );

        if (!res.ok) {
            const err = await res.text();
            return NextResponse.json({ error: err }, { status: res.status });
        }

        const data = await res.json();

        // Filter only images
        const images = data.resources?.filter(
            (resource: any) => resource.resource_type === "image"
        ) || [];

        if (images.length === 0) {
            return NextResponse.json(
                { error: "No images found" },
                { status: 404 }
            );
        }

        // Pick a random image
        const randomIndex = Math.floor(Math.random() * images.length);
        const randomImage = images[randomIndex];

        // Return only the random image
        return NextResponse.json({
            secure_url: randomImage.secure_url,
            url: randomImage.url,
            public_id: randomImage.public_id,
            width: randomImage.width,
            height: randomImage.height,
            format: randomImage.format,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch random image" },
            { status: 500 }
        );
    }
}
