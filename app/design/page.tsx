"use client";
import { useEffect, useState } from "react";
import {
    CloudinaryResource,
    CloudinaryResponse,
} from "../types/responseCloudinary";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { classifyAspect, getRowSpan } from "@/lib/utils";
import { useVisualizerContext } from "../context/visualizer";
import { useLanguageContext } from "../context/changeLanguage";

async function getMedia() {
    const res = await fetch(`/api/getData?folder=design`, {});
    if (!res.ok) {
        return false;
    }
    return await res.json();
}

export default function Design() {
    const { t } = useLanguageContext();
    const { visualizerImage, updateImagesToVisualizer } = useVisualizerContext();
    const [images, setImages] = useState<CloudinaryResource[]>([]);
    const [isDownloadingImages, setIsDownloadingImages] = useState<boolean>(true);
    useEffect(() => {
        (async () => {
            const media: CloudinaryResponse = await getMedia();
            if (media) {
                const withAspect = (media.resources || []).map((r) => ({
                    ...r,
                    aspect: classifyAspect(r.width, r.height),
                }));
                setImages(withAspect);
                setIsDownloadingImages(false);
                updateImagesToVisualizer(media.resources)
            }
        })();
    }, []);

    return (
        <>
            <div className="min-h-screen flex  lg:flex-col w-full contentMainIllustration">
                <main className="flex-1 flex flex-col">
                    <section>
                        {/* Row */}
                        <div className="md:flex flex-row px-12 py-12   gap-8">
                            {/* Col foto */}
                            <div className="basis-4/4 md:basis-2/4 lg:basis-2/4 xl:basis-1/4 shrink-0 flex justify-center items-center  containerPic">
                                <div className="relative h-full w-full rounded overflow-hidden sm:flex sm:items-center sm:justify-center xl:block">
                                    <Image
                                        src="/images/mainIllustration2.png"
                                        alt="descr"
                                        priority={false}
                                        loading="lazy"
                                        className="object-cover"
                                        width={1000}
                                        height={1000}
                                    />
                                </div>
                            </div>

                            <div className="basis-4/4  md:basis-2/4 lg:basis-2/4 xl:basis-3/4 containerInfoMe">
                                <div className="flex pt-5 h-full flex-col justify-between lg:p-12 md:p-0">
                                    <div className="items-center flex">
                                        <h1 className="header1Main justify-start">
                                            {t("design_title")}
                                        </h1>
                                    </div>

                                    <div className="my-4">
                                        <p className="pMainIllust">
                                            {t("design_description")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    {isDownloadingImages && (
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 px-12 py-12">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="aspect-square rounded-sm overflow-hidden"
                                >
                                    <Skeleton className="w-full h-full" />
                                </div>
                            ))}
                        </div>
                    )}
                    <section>
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[10px] px-12 py-12">
                            {images.map((image, index) => (
                                <div
                                    key={index}
                                    className={`${getRowSpan(
                                        image.aspect || "square"
                                    )} overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer group`}
                                >
                                    <img
                                        onClick={() => visualizerImage(image)}
                                        src={image.secure_url || "/placeholder.svg"}
                                        alt={`Gallery image ${index + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
