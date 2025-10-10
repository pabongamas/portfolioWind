"use client"

import { useLanguageContext } from "../context/changeLanguage";

export default function Contact() {
    const { t } = useLanguageContext();
    return <>
        <section className="min-h-screen flex  lg:flex-col w-full contentMainTatto">
            <main className="flex-1 flex flex-col items-center justify-center">
                <div className="p-10 md:p-56">
                    <div className="flex items-center justify-center">
                        <h1 className="text-8xl text-gray-600">{t("contact_title")}</h1>
                    </div>
                    <div className="flex items-center justify-center ">
                        <h5 className="text-center">
                            {t("contact_description")}
                        </h5>
                    </div>
                </div>
            </main>
        </section>
    </>
}