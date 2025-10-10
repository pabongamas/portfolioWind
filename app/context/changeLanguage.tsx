"use client";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { dict, type Lang } from "@/app/i18n/dictionaries";

interface languageContext {
    isSidebarOpen: boolean;
    placement: SidebarPlacement;
    sidebarContent: ReactNode | null;
    openSidebar: (content?: ReactNode, placement?: SidebarPlacement) => void;
    language: Lang;
    setLanguage: (lang: Lang) => void;
    t: (key: keyof typeof dict["en"], params?: Record<string, string | number>) => string;
}
type SidebarPlacement = "right" | "left";

const LanguageContext = createContext<languageContext | undefined>(
    undefined
);

const STORAGE_KEY = "app_lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [sidebarContent, setSidebarContent] = useState<ReactNode | null>(null);
    const [placement, setPlacement] = useState<SidebarPlacement>("right");
    const closeSidebar = () => setIsSidebarOpen(false);
    const [languageSelected, setLanguageSelected] = useState<string>("english");

    const openSidebar = useCallback((content?: ReactNode, place: SidebarPlacement = "right") => {
        console.log(content)
        if (content !== undefined) setSidebarContent(content);
        setPlacement(place);
        setIsSidebarOpen(true);
    }, []);

    // Language state + persistencia
    const [language, setLanguageState] = useState<Lang>("en");

    useEffect(() => {
        // Rehidrata preferencia
        const stored = typeof window !== "undefined" ? (localStorage.getItem(STORAGE_KEY) as Lang | null) : null;
        if (stored === "en" || stored === "es") setLanguageState(stored);
    }, []);

    const setLanguage = useCallback((lang: Lang) => {
        setLanguageState(lang);
        try {
            localStorage.setItem(STORAGE_KEY, lang);
            // Opcional: setear cookie si quieres leer en server components/middleware
            document.cookie = `lang=${lang}; path=/; max-age=31536000`;
        } catch { }
    }, []);

    // Función de traducción con params simples: "Hello {name}"
    const t = useCallback(
        (key: keyof typeof dict["en"], params?: Record<string, string | number>) => {
            const raw = (dict[language][key] ?? String(key)) as string; // 👈 cast a string
            if (!params) return raw;

            return Object.entries(params).reduce<string>(
                (acc, [k, v]) => acc.replace(new RegExp(`{${k}}`, "g"), String(v)),
                raw
            );
        },
        [language]
    );
    const value: languageContext = {
        isSidebarOpen,
        placement,
        sidebarContent,
        openSidebar,
        language,
        setLanguage,
        t,
    };
    return (
        <LanguageContext.Provider
            value={value}
        >
            {children}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 120, damping: 20 }}
                        className="fixed top-0 right-0 z-50 h-full w-[80vw] sm:w-[400px] overflow-hidden"
                    >
                        <div className="absolute inset-0 backdrop-blur-[10px] bg-black/30 text-white font-serif flex flex-col items-center justify-between py-10 px-0">

                            <div className="text-center space-y-4">
                                <h2 className="text-2xl font-light">{t("app_title")}</h2>
                            </div>
                            <div className="w-full">
                                <div className="space-y-2 mt-10">
                                    <Button onClick={() => setLanguage("en")} className={` ${languageSelected === 'english' ? " bg-amber-200" : ""} w-full bg-white/10 hover:bg-white/20 py-2 rounded-xl backdrop-blur-md transition-all`}>
                                        {t("english")}
                                    </Button>
                                    <Button onClick={() => setLanguage("es")} className={` ${languageSelected === 'spanish' ? " bg-amber-900" : ""}w-full bg-white/5 hover:bg-white/15 py-2 rounded-xl transition-all`}>
                                        {t("spanish")}
                                    </Button>
                                </div>
                            </div>
                            {sidebarContent}
                            <div className="flex flex-col items-center space-y-3">

                                <div className="flex items-center space-x-2">
                                    <Switch id="honest-switch" />
                                    <Label htmlFor="honest-switch">{t("honest")}</Label>
                                </div>
                                <button
                                    onClick={closeSidebar}
                                    className="text-xs mt-6 bg-white/10 hover:bg-white/20 rounded-lg px-4 py-1 transition"
                                >
                                    {t("close")}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </LanguageContext.Provider>
    );
}


export function useLanguageContext() {
    const context = useContext(LanguageContext);
    if (!context)
        throw new Error(
            "language context must be used within LanguageProvider"
        );
    return context;
}
