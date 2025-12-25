"use client";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { dict, type Lang } from "@/app/i18n/dictionaries";

interface LanguageContext {
  isSidebarOpen: boolean;
  placement: SidebarPlacement;
  sidebarContent: ReactNode | null;
  openSidebar: (content?: ReactNode, placement?: SidebarPlacement) => void;
  closeSidebar: () => void;
  isFloatElement: boolean;
  setIsFloatElement: (param: boolean) => void;
  language: Lang;
  setLanguage: (lang: Lang) => void;
  t: (
    key: keyof (typeof dict)["en"],
    params?: Record<string, string | number>
  ) => string;
  isHonest: boolean;
  toggleHonest: () => void;
}
type SidebarPlacement = "right" | "left";

const LanguageContextInstance = createContext<LanguageContext | undefined>(undefined);

const STORAGE_KEY_LANG = "app_lang";
const STORAGE_KEY_HONEST = "app_honest";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFloatElement, setIsFloatElement] = useState(false);
  const [isHonest, setIsHonest] = useState(false);
  const [sidebarContent, setSidebarContent] = useState<ReactNode | null>(null);
  const [placement, setPlacement] = useState<SidebarPlacement>("right");
  const [language, setLanguageState] = useState<Lang>("en");

  // Rehidrata preferencias desde localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedLang = localStorage.getItem(STORAGE_KEY_LANG) as Lang | null;
    if (storedLang === "en" || storedLang === "es") {
      setLanguageState(storedLang);
    }

    const storedHonest = localStorage.getItem(STORAGE_KEY_HONEST);
    if (storedHonest !== null) {
      setIsHonest(storedHonest === "true");
    }
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const openSidebar = useCallback(
    (content?: ReactNode, place: SidebarPlacement = "right") => {
      if (content !== undefined) setSidebarContent(content);
      setPlacement(place);
      setIsSidebarOpen(true);
    },
    []
  );

  const setLanguage = useCallback((lang: Lang) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY_LANG, lang);
      document.cookie = `lang=${lang}; path=/; max-age=31536000`;
    } catch {}
  }, []);

  const toggleHonest = useCallback(() => {
    setIsHonest((prev) => {
      const newValue = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_HONEST, String(newValue));
      } catch {}
      return newValue;
    });
  }, []);

  // Función de traducción con params simples: "Hello {name}"
  const t = useCallback(
    (
      key: keyof (typeof dict)["en"],
      params?: Record<string, string | number>
    ) => {
      const raw = (dict[language][key] ?? String(key)) as string;
      if (!params) return raw;

      return Object.entries(params).reduce<string>(
        (acc, [k, v]) => acc.replace(new RegExp(`{${k}}`, "g"), String(v)),
        raw
      );
    },
    [language]
  );

  // Memoiza el value para evitar re-renders innecesarios
  const value = useMemo<LanguageContext>(
    () => ({
      isSidebarOpen,
      placement,
      sidebarContent,
      openSidebar,
      closeSidebar,
      language,
      setLanguage,
      t,
      isFloatElement,
      setIsFloatElement,
      isHonest,
      toggleHonest,
    }),
    [
      isSidebarOpen,
      placement,
      sidebarContent,
      openSidebar,
      closeSidebar,
      language,
      setLanguage,
      t,
      isFloatElement,
      isHonest,
      toggleHonest,
    ]
  );
  return (
    <LanguageContextInstance.Provider value={value}>
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
                  <Button
                    onClick={() => setLanguage("en")}
                    className={`${
                      language === "en" ? "bg-amber-200 text-black" : "bg-white/10"
                    } w-full hover:bg-white/20 py-2 rounded-xl backdrop-blur-md transition-all`}
                  >
                    {t("english")}
                  </Button>
                  <Button
                    onClick={() => setLanguage("es")}
                    className={`${
                      language === "es" ? "bg-amber-900 text-white" : "bg-white/5"
                    } w-full hover:bg-white/15 py-2 rounded-xl transition-all`}
                  >
                    {t("spanish")}
                  </Button>
                </div>
              </div>
              {sidebarContent}
              <div className="flex flex-col items-center space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="honest-switch"
                    checked={isHonest}
                    onCheckedChange={toggleHonest}
                  />
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

        {isFloatElement && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="fixed bottom-[120px] md:bottom-[140px] lg:bottom-[160px] xl:bottom-[180px] left-1/2 -translate-x-1/2 z-50 flex flex-row items-center gap-3 md:gap-4"
          >
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
              <Switch
                id="honest-switch-float"
                checked={isHonest}
                onCheckedChange={toggleHonest}
              />
              <Label
                htmlFor="honest-switch-float"
                className="text-white text-sm md:text-base cursor-pointer"
              >
                {t("honest")}
              </Label>
            </div>
            <button
              onClick={() => openSidebar(null, "right")}
              className="text-white text-sm md:text-base bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full px-5 py-2 border border-white/20 transition-all duration-300"
            >
              {t("language_selector")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </LanguageContextInstance.Provider>
  );
}

export function useLanguageContext() {
  const context = useContext(LanguageContextInstance);
  if (!context)
    throw new Error("language context must be used within LanguageProvider");
  return context;
}
