"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useLanguageContext } from "../context/changeLanguage";
import { Span } from "next/dist/trace";

export default function Header() {
  const { openSidebar } = useLanguageContext();
  const { t } = useLanguageContext();

  const content = (
    ""
  );


  const navigationItems = [
    { id: "me", label: t("navbar_me"), href: "/me" },
    { id: "design", label: t("navbar_design"), href: "/design" },
    {
      id: "IllustrationAnimation",
      label: t("navbar_ilustration"),
      href: "/illustration",
    },
    { id: "photo&video", label:t("navbar_photography_video"), href: "/photo" },
    { id: "tatto", label:t("navbar_tattoo") , href: "/tatto" },
    { id: "contact", label: t("navbar_contact"), href: "/contact" },

  ];
  const [activeSection, setActiveSection] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  function PhotoMainScreen() {
    const sectionRef = useRef<HTMLElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const lastScrollY = useRef<number>(-1);
    const durationRef = useRef<number>(0);

    useEffect(() => {
      const video = videoRef.current!;
      const section = sectionRef.current!;
      let start = 0;
      let end = 0;

      const calcBounds = () => {
        const rect = section.getBoundingClientRect();
        const scrollTop = window.scrollY || window.pageYOffset;
        // Inicio y fin del tramo donde el video progresa
        start = scrollTop + rect.top; // comienzo de la sección
        end = start + section.offsetHeight - window.innerHeight; // fin “visible”
        if (end <= start) end = start + 1; // evita división por cero
      };

      const onMeta = () => {
        durationRef.current = video.duration || 0;
      };

      const tick = () => {
        const y = window.scrollY || window.pageYOffset;
        if (y !== lastScrollY.current) {
          lastScrollY.current = y;
          // progreso del 0 al 1 según el tramo [start, end]
          const progress = Math.min(1, Math.max(0, (y - start) / (end - start)));
          // mapea progreso a tiempo del video
          if (durationRef.current > 0) {
            video.currentTime = progress * durationRef.current;
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };

      // Configuración
      video.addEventListener("loadedmetadata", onMeta, { passive: true });
      calcBounds();
      onMeta();
      rafRef.current = requestAnimationFrame(tick);
      window.addEventListener("resize", calcBounds, { passive: true });

      return () => {
        video.removeEventListener("loadedmetadata", onMeta);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        window.removeEventListener("resize", calcBounds);


      };
    }, []);

    return (
      <>
        <section ref={sectionRef} className="MainScreenImg">
          <div className="MainScreenImg_div">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              muted
              playsInline
              preload="metadata"
              src={"/videos/MeCover.mp4"}
            >
            </video>
          </div>
        </section>
      </>
    );
  }
  function MeMainScreen() {
    return (
      <>
        <section className="MainScreenImgMe">
          <div className="MainScreenImgMe_div">
            <Image
              loading="lazy"
              priority={false}
              className="MainScreenImgMe_div_Img"
              alt="Picture of the wind"
              src={"/images/cover2.png"}
              fill
              sizes="100vw"
            />
          </div>
        </section>
      </>
    );
  }
  function IllustrationMainScreen() {
    return (
      <>
        <section className="MainScreenImgMe">
          <div className="MainScreenImgMe_div">
            <Image
              loading="lazy"
              priority={false}
              className="MainScreenImgMe_div_Img"
              alt="Picture of the wind"
              src={"/images/mainIllustration.png"}
              fill
              sizes="100vw"
            />
          </div>
        </section>
      </>
    );
  }
  function DesignMainScreen() {
    return (
      <>
        <section className="MainScreenImgMe">
          <div className="MainScreenImgMe_div">
            <Image
              loading="lazy"
              priority={false}
              className="MainScreenImgMe_div_Img"
              alt="Picture of the wind"
              src={"/images/designIllustration.png"}
              fill
              sizes="100vw"
            />
          </div>
        </section>
      </>
    );
  }

  const ComponentMobileHeader = () => {
    return (
      <>
        <header className="lg:hidden ">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="asideLayout_options text-sm">{t("app_title")}</div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex flex-col gap-1 p-2 hover:bg-gray-800 rounded transition-colors"
              aria-label="Toggle menu"
            >
              <span
                className={`w-5 h-0.5 bg-white transition-transform ${isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
                  }`}
              ></span>
              <span
                className={`w-5 h-0.5 bg-white transition-opacity ${isMobileMenuOpen ? "opacity-0" : ""
                  }`}
              ></span>
              <span
                className={`w-5 h-0.5 bg-white transition-transform ${isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                  }`}
              ></span>
            </button>
          </div>
          <div
            className={`overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
          >
            <nav className="px-4 py-2  ">
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`block py-3 px-2 text-sm asideLayout_options optionLink rounded transition-colors ${isActive ? "optionActive" : ""
                        }`}
                      onClick={() => {
                        setActiveSection(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </header>
      </>
    )
  }

  function HeaderPhoto() {
    return (
      <>
        <ComponentMobileHeader />
        <aside className="asideLayout">
          <div className="p-6 ">
            <div className="asideLayout_options ">
              <Link href="/" className="asideLayout_options optionLink ">
                {t("app_title")}
              </Link>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center px-6 items-center">
            <nav className="space-y-6">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`block asideLayout_options optionLink  ${isActive ? "optionActive" : ""
                      }`}
                    onClick={() => setActiveSection(item.id)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="p-6 ">
            <span onClick={() => openSidebar(content, "left")} className="asideLayout_options optionLink ">
              Language
            </span>
          </div>
        </aside>
        <PhotoMainScreen />
      </>
    );
  }
  function HeaderMe() {
    return (
      <>
        <MeMainScreen />
        <ComponentMobileHeader />
        <header className="headerMe">
          <div className="flex items-center justify-between px-12 ">
            <div className="asideLayout_options optionLink ">
             {t("app_title")}
            </div>
            <div className="asideLayout_options ">
              <nav className=" flex lg:space-x-6 md:space-x-4  justify-center items-center">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`block asideLayout_options optionLink  ${isActive ? "optionActiveNoBt" : ""
                        }`}
                      onClick={() => setActiveSection(item.id)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                {/* <Link
                  href="/contact"
                  className="asideLayout_options optionLink transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link> */}
              </nav>
            </div>
            <span onClick={() => openSidebar(content, "left")} className="asideLayout_options optionLink ">
              Language
            </span>
          </div>
        </header>
      </>
    );
  }
  function HeaderIllustration() {
    return (
      <>
        <ComponentMobileHeader />
        <header className="headerMe">
          <div className="flex items-center justify-between px-12 ">
            <div className="asideLayout_options optionLink ">
             {t("app_title")}
            </div>
            <div className="asideLayout_options ">
              <nav className=" flex lg:space-x-6 md:space-x-4  justify-center items-center">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`block asideLayout_options optionLink  ${isActive ? "optionActiveNoBt" : ""
                        }`}
                      onClick={() => setActiveSection(item.id)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                {/* <Link
                  href="/contact"
                  className="asideLayout_options optionLink transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link> */}
              </nav>
            </div>
             <span onClick={() => openSidebar(content, "left")} className="asideLayout_options optionLink ">
              Language
            </span>
          </div>
        </header>

        <IllustrationMainScreen />
      </>
    );
  }
  function HeaderDesign() {
    return (
      <>
        <ComponentMobileHeader />
        <header className="headerMe">
          <div className="flex items-center justify-between px-12 ">
            <div className="asideLayout_options optionLink ">
              {t("app_title")}
            </div>
            <div className="asideLayout_options ">
              <nav className=" flex lg:space-x-6 md:space-x-4  justify-center items-center">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`block asideLayout_options optionLink  ${isActive ? "optionActiveNoBt" : ""
                        }`}
                      onClick={() => setActiveSection(item.id)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
             <span onClick={() => openSidebar(content, "left")} className="asideLayout_options optionLink ">
              Language
            </span>
          </div>
        </header>

        <DesignMainScreen />
      </>
    );
  }
  function HeaderTatto() {
    return (
      <>
        <ComponentMobileHeader />
        <header className="headerMe">
          <div className="flex items-center justify-between px-12 ">
            <div className="asideLayout_options optionLink ">
             {t("app_title")}
            </div>
            <div className="asideLayout_options ">
              <nav className=" flex lg:space-x-6 md:space-x-4  justify-center items-center">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`block asideLayout_options optionLink  ${isActive ? "optionActiveNoBt" : ""
                        }`}
                      onClick={() => setActiveSection(item.id)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
             <span onClick={() => openSidebar(content, "left")} className="asideLayout_options optionLink ">
              Language
            </span>
          </div>
        </header>
      </>
    );
  }

  function HeaderContact() {
    return (
      <>
        <ComponentMobileHeader />
        <header className="headerMe">
          <div className="flex items-center justify-between px-12 ">
            <div className="asideLayout_options optionLink ">
              {t("app_title")}
            </div>
            <div className="asideLayout_options ">
              <nav className=" flex lg:space-x-6 md:space-x-4  justify-center items-center">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`block asideLayout_options optionLink  ${isActive ? "optionActiveNoBt" : ""
                        }`}
                      onClick={() => setActiveSection(item.id)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
             <span onClick={() => openSidebar(content, "left")} className="asideLayout_options optionLink ">
              Language
            </span>
          </div>
        </header>
      </>
    );
  }


  return (
    <>
      {pathname === "/photo" && <HeaderPhoto />}
      {pathname === "/me" && <HeaderMe />}
      {pathname === "/illustration" && <HeaderIllustration />}
      {pathname === "/design" && <HeaderDesign />}
      {pathname === "/tatto" && <HeaderTatto />}
      {pathname === "/contact" && <HeaderContact />}
    </>
  );
}
