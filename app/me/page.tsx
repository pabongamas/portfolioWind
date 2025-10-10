"use client"
import Image from "next/image";
import { useLanguageContext } from "../context/changeLanguage";

export default function Me() {
   const{t}=useLanguageContext();
  return (
    <div className="min-h-screen flex  lg:flex-col w-full contentMainMe">
      <main className="flex-1 flex flex-col">
        <section>
          {/* Row */}
          <div className="md:flex flex-row px-12 py-12   gap-8">
            {/* Col foto */}
            <div className="basis-4/4 md:basis-2/4 lg:basis-2/4 xl:basis-1/4 shrink-0 flex justify-center items-center  containerPic">
              <div className="relative h-full w-full rounded overflow-hidden sm:flex sm:items-center sm:justify-center xl:block">
                <Image
                  src="/images/faces.png"
                  alt="descr"
                  priority={false}
                  loading="lazy"
                  className="object-cover"
                  width={500}
                  height={500}
                />
              </div>
            </div>

            <div className="basis-4/4  md:basis-2/4 lg:basis-2/4 xl:basis-3/4 containerInfoMe">
              <div className="flex pt-5 h-full flex-col justify-between lg:p-12 md:p-0">
                <div className="items-center flex">
                  <h1 className="header1Main justify-start">{t("navbar_me")}</h1>
                </div>

                <div className="my-4">
                  <p className="pMainDescMe">
                   {t("me_description")}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 w-full">
                  {Array.from({ length: 9 }).map((_, i) => (
                    
                    <div key={i} className="circleMe bg-gray-400 " />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
