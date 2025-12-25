"use client"
import Image from "next/image";
import Header from "./components/header";
import { useState, useEffect } from "react";

async function getRandomImage() {
  const res = await fetch(`/api/getRandomImage?folder=photo-video`, {});
  if (!res.ok) {
    return null;
  }
  return await res.json();
}

export default function Home() {
  const [activeSection, setActiveSection] = useState("hero");
  const [randomImage, setRandomImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRandomImage() {
      try {
        const data = await getRandomImage();
        if (data && data.secure_url) {
          setRandomImage(data.secure_url);
        }
      } catch (error) {
        console.error("Error fetching image:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRandomImage();
  }, []);

  return (
    <div className="relative w-full">
      <div className="relative w-full h-screen overflow-hidden">
        {isLoading ? (
          <div className="w-full h-full bg-gray-200 animate-pulse" />
        ) : randomImage ? (
          <Image
            src={randomImage}
            alt="Main Visualizer"
            fill
            className="object-cover object-center"
            priority
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">No image available</p>
          </div>
        )}
      </div>
    </div>
  );
}
