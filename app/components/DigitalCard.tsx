"use client";

import { useState } from "react";
import Image from "next/image";

import {
  FaWhatsapp,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaGlobe,
  FaShareAlt,
  FaQrcode,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaUtensils,
  FaStar,
  FaWifi,
  FaLink,
  FaShoppingBag,
} from "react-icons/fa";

import { SiPix } from "react-icons/si";
import { QRCodeSVG } from "qrcode.react";
import {
  Sparkles,
  Scissors,
  Camera,
  Palette,
  Dumbbell,
  HeartPulse,
  Leaf,
  Briefcase,
  Music,
  Code,
  Coffee,
  Flower2,
  Wrench,
  GraduationCap,
  ChefHat,
  Car,
} from "lucide-react";

const WATERMARK_ICONS: Record<string, typeof Sparkles> = {
  sparkles: Sparkles,
  scissors: Scissors,
  camera: Camera,
  palette: Palette,
  dumbbell: Dumbbell,
  "heart-pulse": HeartPulse,
  leaf: Leaf,
  briefcase: Briefcase,
  music: Music,
  code: Code,
  coffee: Coffee,
  flower: Flower2,
  wrench: Wrench,
  graduation: GraduationCap,
  chef: ChefHat,
  car: Car,
};
import { getTemplateById } from "../data/templates";

type Link = {
  type: string;
  name: string;
  value: string;
};

type DigitalCardProps = {
  slug?: string;
  name: string;
  job: string;
  location: string;
  photo: string;
  background: string;
  backgroundColor?: string;
  backgroundMode?: "template" | "image" | "color";
  links: Link[];

  backgroundPosition?: {
    x: number;
    y: number;
  };

  showPhoto?: boolean;
  showBackground?: boolean;
  showLocation?: boolean;

  backgroundZoom?: number;
  backgroundOverlay?: number;
  backgroundBlur?: number;
  nameFontSize?: number;
  jobFontSize?: number;
  locationFontSize?: number;

  onBackgroundPointerDown?: (
    e: React.PointerEvent<HTMLDivElement>
  ) => void;

  onBackgroundPointerMove?: (
    e: React.PointerEvent<HTMLDivElement>
  ) => void;

  onBackgroundPointerUp?: (
    e: React.PointerEvent<HTMLDivElement>
  ) => void;

  isEditing?: boolean;
  compact?: boolean;
  template?: string;
  customTemplate?: any;
  usePrimaryColor?: boolean;

  primaryColor?: string;
  textColor?: string;
  textNameColor?: string;
  textJobColor?: string;
  textLocationColor?: string;
  primaryColorOpacity?: number;
  useTemplate?: boolean;
  photoSize?: number;
  photoShape?: "square" | "rounded" | "circle";
  photoBorderColor?: string;
};

function getIcon(type: string) {
  switch (type) {
    case "whatsapp":
      return <FaWhatsapp size={20} />;

    case "instagram":
      return <FaInstagram size={20} />;

    case "linkedin":
      return <FaLinkedin size={20} />;

    case "website":
      return <FaGlobe size={20} />;

    case "youtube":
      return <FaYoutube size={20} />;

    case "email":
      return <FaEnvelope size={20} />;

    case "phone":
      return <FaPhone size={20} />;

    case "location":
      return <FaMapMarkerAlt size={20} />;

    case "menu":
      return <FaUtensils size={20} />;
    
    case "produtos":
      return <FaShoppingBag size={20} />;

    case "review":
      return <FaStar size={20} />;

    case "wifi":
      return <FaWifi size={20} />;

    case "pix":
      return <SiPix size={20} />;

    case "custom":
      return <FaLink size={20} />;

    default:
      return <FaGlobe size={20} />;
  }
}

function getLinkUrl(link: Link) {
  switch (link.type) {
    case "email":
      return `mailto:${link.value}`;

    case "phone":
      return `tel:${link.value}`;

    case "whatsapp":
      return link.value.startsWith("http")
        ? link.value
        : `https://wa.me/${link.value.replace(/\D/g, "")}`;

    case "location":
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        link.value
      )}`;

    case "menu":
    case "review":
    case "wifi":
    case "custom":
    case "produtos":
      return link.value;

    case "pix":
      return link.value;

    default:
      return link.value;
  }
}

function hexToRgba(hex: string, opacity: number) {
  const normalized = hex.replace("#", "");

  if (normalized.length !== 6) {
    return `rgba(17, 24, 39, ${opacity})`;
  }

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export default function DigitalCard({
  slug,
  name,
  job,
  location,
  photo,
  background,
  backgroundColor = "#FFFFFF",
  backgroundMode = "template",
  links,
  showPhoto = true,
  showBackground = true,
  backgroundPosition = { x: 0, y: 0 },
  backgroundZoom = 1,
  backgroundOverlay = 40,
  backgroundBlur = 0,
  nameFontSize = 30,
  jobFontSize = 16,
  locationFontSize = 14,
  onBackgroundPointerDown,
  onBackgroundPointerMove,
  onBackgroundPointerUp,
  isEditing = false,
  compact = false,
  template = "azul",
  usePrimaryColor = false,
  primaryColor = "#FFFFFF",
  textColor = "#FFFFFF",
  textNameColor,
  textJobColor,
  textLocationColor,
  primaryColorOpacity = 60,
  useTemplate = true,
  customTemplate,
  photoSize,
  photoShape,
  photoBorderColor,
}: DigitalCardProps) {
  const [showQRCode, setShowQRCode] = useState(false);
  const [copiedPixIndex, setCopiedPixIndex] = useState<number | null>(null);

  const templateConfig = customTemplate || getTemplateById(template);
  const hasLocation = location.trim().length > 0;
  const currentTemplate = templateConfig.layout;
  const layoutType = templateConfig.layoutType;

  const templateDefaults = templateConfig.defaults;
  const effectiveBackgroundBlur = backgroundBlur ?? templateDefaults.backgroundBlur ?? 0;
  const isGlassTemplate = ["glass", "glass-pro", "glass-frost", "glass-dark"].includes(layoutType);

  const shouldShowPhoto = showPhoto ?? templateDefaults.showPhoto;

  const shouldShowBackground =
    showBackground ?? templateDefaults.showBackground;

  const finalNameColor =
    textNameColor || templateDefaults.textNameColor || textColor;

  const finalJobColor =
    textJobColor || templateDefaults.textJobColor || textColor;

  const finalLocationColor =
    textLocationColor || templateDefaults.textLocationColor || textColor;

  const isCompactLayout =
  template === "executivo" || template === "motorista";

  /* Sobrescritas da foto: inline style vence as classes do template. */
  const photoRadius =
    photoShape === "square"
      ? "0px"
      : photoShape === "rounded"
        ? "18px"
        : "9999px";

  const photoOverrideStyle: React.CSSProperties | undefined =
    photoSize !== undefined ||
    photoShape !== undefined ||
    photoBorderColor
      ? {
          width: photoSize,
          height: photoSize,
          borderRadius: photoRadius,
          alignSelf: "center",
          marginLeft: "auto",
          marginRight: "auto",
          ...(photoBorderColor ? { borderColor: photoBorderColor } : {}),
        }
      : undefined;

  const layoutStyles: Record<string, { container: string; profile: string }> = {
    modern: { container: "text-center", profile: "mt-2" },
    professional: { container: "text-center", profile: "mt-3" },
    classic: { container: "text-center", profile: "mt-5" },
    bold: { container: "text-left", profile: "mt-2" },
    invitation: { container: "text-center", profile: "mt-1" },
    floral: { container: "text-center", profile: "mt-1" },
    elegant: { container: "text-center", profile: "mt-4" },
    health: { container: "text-center", profile: "mt-3" },
    executive: { container: "text-left", profile: "mt-4" },
    minimal: { container: "text-center", profile: "mt-3" },
    photographic: { container: "text-center", profile: "mt-2" },
    luxury: { container: "text-center", profile: "mt-4" },
    geometric: { container: "text-left", profile: "mt-3" },
    dark: { container: "text-center", profile: "mt-3" },
    nature: { container: "text-center", profile: "mt-3" },
    beauty: { container: "text-center", profile: "mt-3" },
    tech: { container: "text-left", profile: "mt-3" },
    glass: { container: "text-center", profile: "mt-3" },
    "glass-pro": { container: "text-center", profile: "mt-3" },
    "glass-frost": { container: "text-center", profile: "mt-3" },
    "glass-dark": { container: "text-center", profile: "mt-3" },
  };

  const currentLayout = layoutStyles[layoutType] ?? layoutStyles.modern;

  /*
   * Layout compacto:
   * Executivo e Motorista ficam com foto + informações lado a lado.
   *
   * Os demais templates continuam com foto acima das informações.
   */
  const profileRowClass = isCompactLayout && shouldShowPhoto && photo
    ? "flex flex-row items-center gap-5 px-6 py-6"
    : "flex flex-col items-center px-6 py-5";

  function renderDecoration() {
    switch (templateConfig.layout.decoration) {
      case "pink":
        return (
          <>
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-pink-400/30 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-pink-300/20 blur-2xl" />
          </>
        );

      case "blue":
        return (
          <>
            <div className="pointer-events-none absolute -right-20 top-20 h-44 w-44 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 bottom-10 h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" />
          </>
        );

      case "gold":
        return (
          <>
            <div className="pointer-events-none absolute inset-x-6 top-24 h-px bg-yellow-600/50" />
            <div className="pointer-events-none absolute inset-x-10 bottom-20 h-px bg-yellow-600/30" />
          </>
        );

      case "yellow":
        return (
          <>
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rotate-45 bg-yellow-400/20" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rotate-45 bg-yellow-300/10" />
          </>
        );

      case "purple":
        return (
          <>
            <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-purple-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-pink-400/10 blur-3xl" />
          </>
        );

      case "floral":
        return (
          <>
            <div className="pointer-events-none absolute -right-8 top-10 text-6xl opacity-20">
              🌸
            </div>
            <div className="pointer-events-none absolute -left-8 bottom-16 text-6xl opacity-20">
              🌺
            </div>
          </>
        );

      case "green":
        return (
          <>
            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-green-300/10 blur-3xl" />
          </>
        );

      case "cyan":
        return (
          <>
            <div className="pointer-events-none absolute -right-16 top-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-16 bottom-10 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />
          </>
        );

      case "executive":
        return (
          <>
            <div className="pointer-events-none absolute inset-x-8 top-24 h-px bg-white/20" />
            <div className="pointer-events-none absolute inset-x-8 bottom-20 h-px bg-white/10" />
          </>
        );

      case "glass-pro":
        return (
          <>
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-300/25 blur-3xl" />
            <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 rounded-full bg-white/15 blur-3xl" />
          </>
        );

      case "glass-frost":
        return (
          <>
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/25 blur-3xl" />
            <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-sky-200/25 blur-3xl" />
          </>
        );

      case "glass-dark":
        return (
          <>
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-cyan-400/15 blur-3xl" />
            <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-violet-500/15 blur-3xl" />
          </>
        );

      case "glass":
        return (
          <>
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-300/25 blur-3xl" />
            <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-violet-400/20 blur-3xl" />
            <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-72 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
          </>
        );

      case "minimal":
        return (
          <>
            <div className="pointer-events-none absolute left-8 right-8 top-24 h-px bg-black/10" />
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-slate-200/50 blur-3xl" />
          </>
        );

      default:
        return null;
    }
  }

  function getButtonStyle() {
    if (!usePrimaryColor) {
      return {};
    }

    const opacity = primaryColorOpacity / 100;

    return {
      backgroundColor: hexToRgba(primaryColor, opacity),
      borderColor: hexToRgba(
        primaryColor,
        Math.min(opacity + 0.15, 1)
      ),
      color: textColor,
    };
  }

  function handleShare() { const publicUrl = window.location.href; if (navigator.share) { navigator.share({ title: name, text: `Confira o cartão de ${name}`, url: publicUrl }); } else { navigator.clipboard.writeText(publicUrl); alert("Link do cartão copiado!"); } }

  function getNameSizeClass() {
    const length = name.trim().length;

    if (length > 32) return "text-xl sm:text-2xl";
    if (length > 22) return "text-2xl sm:text-3xl";
    return "text-3xl";
  }

  function getJobSizeClass() {
    const length = job.trim().length;

    if (length > 38) return "text-xs sm:text-sm";
    return "text-sm";
  }

  const adaptiveNameClass = getNameSizeClass();
  const adaptiveJobClass = getJobSizeClass();

  function renderProfile() {
    if (template === "executivo") {
      return (
        <div className="px-6 py-7">
          <div className="flex items-center gap-5 rounded-2xl border border-white/15 bg-black/25 p-5 backdrop-blur-md">
            {shouldShowPhoto && photo && (
              <div style={photoOverrideStyle} className={`shrink-0 overflow-hidden shadow-xl ${currentTemplate.photoStyle} h-24 w-24`}>
                {showPhoto && photo && (
                  <img
                    src={photo}
                    alt={`Foto de ${name}`}
                    width={112}
                    height={112}
                  />
                )} className="h-full w-full object-cover" 
                /&gt;
              </div>
            )}
            <div className="min-w-0 flex-1 text-left">
              <div className="mb-2 h-1 w-12 rounded-full bg-white/70" />
              <h1 className={currentTemplate.nameStyle} style={{ color: finalNameColor, fontSize: `${nameFontSize}px` }}>{name}</h1>
              <p className={`mt-1 ${currentTemplate.jobStyle}`} style={{ color: finalJobColor, opacity: 0.82, fontSize: `${jobFontSize}px` }}>{job}</p>
              {hasLocation && (
                <p className={`mt-2 ${currentTemplate.locationStyle}`} style={{ color: finalLocationColor, opacity: 0.65, fontSize: `${locationFontSize}px` }}>📍 {location}</p>
              )}  
            </div>
          </div>
        </div>
      );
    }

    if (template === "motorista") {
      return (
        <div className="px-6 py-5">
          <div className="flex items-center gap-5">
            {shouldShowPhoto && photo && (
              <div style={photoOverrideStyle} className={`shrink-0 overflow-hidden shadow-2xl ${currentTemplate.photoStyle} h-28 w-28`}>
                <Image src={photo} alt={`Foto de ${name}`} width={112} height={112} className="h-full w-full object-cover" />
              </div>
            )}
            <div className="min-w-0 flex-1 text-left">
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: textColor, opacity: 0.65 }}>Atendimento</p>
              <h1 className={currentTemplate.nameStyle} style={{ color: finalNameColor, fontSize: `${nameFontSize}px` }}>{name}</h1>
              <p className={`mt-1 ${currentTemplate.jobStyle}`} style={{ color: finalJobColor, fontSize: `${jobFontSize}px` }}>{job}</p>
               {hasLocation && (
              <p className="mt-2 text-sm font-medium" style={{ color: finalLocationColor, opacity: 0.7, fontSize: `${locationFontSize}px` }}>📍 {location}</p>)}
            </div>
          </div>
          <div className="mt-5 h-1 w-full rounded-full bg-white/20">
            <div className="h-1 w-1/3 rounded-full bg-yellow-400" />
          </div>
        </div>
      );
    }

    if (template === "advocacia") {
      return (
        <div className="px-6 py-7 text-center">
          <div className="mx-auto mb-5 h-px w-24 bg-yellow-500/70" />
          {shouldShowPhoto && photo && (
            <div style={photoOverrideStyle} className="mx-auto h-28 w-28 overflow-hidden rounded-full border-2 border-yellow-500/70 p-1 shadow-xl">
              <div className="h-full w-full overflow-hidden rounded-full">
                <Image src={photo} alt={`Foto de ${name}`} width={112} height={112} className="h-full w-full object-cover" />
              </div>
            </div>
          )}
          <div className="mt-5">
            <p className="mb-2 text-xs uppercase tracking-[0.35em]" style={{ color: textColor, opacity: 0.6 }}>Escritório</p>
            <h1 className={currentTemplate.nameStyle} style={{ color: finalNameColor, fontSize: `${nameFontSize}px` }}>{name}</h1>
            <div className="mx-auto mt-3 h-px w-16 bg-yellow-500/60" />
            <p className={`mt-3 ${currentTemplate.jobStyle}`} style={{ color: finalJobColor, opacity: 0.82, fontSize: `${jobFontSize}px` }}>{job}</p>
            {hasLocation && (
              <p className="mt-2 text-sm" style={{ color: finalLocationColor, opacity: 0.65, fontSize: `${locationFontSize}px` }}>📍 {location}</p>
            )}
          </div>
        </div>
      );
    }

    if (["glass", "glass-pro", "glass-frost", "glass-dark"].includes(template)) {
      const glassProfileClass = template === "glass-frost"
        ? "bg-white/15 border-white/40"
        : template === "glass-dark"
          ? "bg-slate-950/30 border-cyan-100/15"
          : "bg-white/10 border-white/25";
      return (
        <div className="px-5 py-5 sm:px-6 sm:py-6 text-center">
          <div className={`mx-auto max-w-[92%] rounded-[1.7rem] border p-5 shadow-2xl backdrop-blur-2xl ${glassProfileClass}`}>
            {shouldShowPhoto && photo && (
              <div style={photoOverrideStyle} className="mx-auto h-24 w-24 overflow-hidden rounded-full border-2 border-white/80 bg-white/10 p-0.5 shadow-2xl">
                <Image src={photo} alt={`Foto de ${name}`} width={112} height={112} className="h-full w-full rounded-full object-cover" />
              </div>
            )}
            <h1 className={`mt-4 ${adaptiveNameClass} font-bold break-words`} style={{ color: finalNameColor, fontSize: `${nameFontSize}px` }}>{name}</h1>
            <p className={`mt-1 ${adaptiveJobClass}`} style={{ color: finalJobColor, opacity: 0.88, fontSize: `${jobFontSize}px` }}>{job}</p>
            {hasLocation && (
              <div className="mx-auto mt-3 flex w-fit max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs backdrop-blur-xl" style={{ color: finalLocationColor, fontSize: `${locationFontSize}px` }}>
                <FaMapMarkerAlt size={11} />
                <span className="truncate">{location}</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className={profileRowClass}>
        {shouldShowPhoto && photo && (
          <div style={photoOverrideStyle} className={`shrink-0 overflow-hidden shadow-lg ${currentTemplate.photoStyle} ${templateConfig.layout.profileSize} ${isCompactLayout ? "" : currentLayout.profile}`}>
            <Image src={photo} alt={`Foto de ${name}`} width={112} height={112} className="h-full w-full object-cover" />
          </div>
        )}
        <div className={isCompactLayout && shouldShowPhoto && photo ? "min-w-0 flex-1 text-left" : `${currentLayout.container} min-w-0`}>
          <h1 className={currentTemplate.nameStyle} style={{ color: finalNameColor, fontSize: `${nameFontSize}px` }}>{name}</h1>
          <p className={`mt-1 ${currentTemplate.jobStyle}`} style={{ color: finalJobColor, opacity: 0.8, fontSize: `${jobFontSize}px` }}>{job}</p>
          {hasLocation && (
            <p className={`mt-2 ${currentTemplate.locationStyle}`} style={{ color: finalLocationColor, opacity: 0.65, fontSize: `${locationFontSize}px` }}>📍 {location}</p>
          )}
        </div>
      </div>
    );
  }


  function renderUniqueProfile() {
    if (template === "azul") {
      return (
        <div className="px-6 py-6">
          <div className="rounded-3xl border border-white/20 bg-blue-950/35 p-6 backdrop-blur-md">
            <div className="flex items-center gap-4">
              {shouldShowPhoto && photo && (
                <div style={photoOverrideStyle} className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/30 shadow-xl">
                  <Image src={photo} alt={`Foto de ${name}`} width={112} height={112} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: textColor, opacity: 0.65 }}>
                  Perfil profissional
                </p>
                <h1 className={`mt-1 ${adaptiveNameClass} font-bold leading-tight break-words`} style={{ color: finalNameColor, fontSize: `${nameFontSize}px` }}>
                  {name}
                </h1>
                <p className={`mt-1 ${adaptiveJobClass} font-medium`} style={{ color: finalJobColor, opacity: 0.82, fontSize: `${jobFontSize}px` }}>{job}</p>
              </div>
            </div>
            {hasLocation && (
              <div className="mt-5 flex items-center gap-2 border-t border-white/15 pt-4 text-sm" style={{ color: finalLocationColor, opacity: 0.7, fontSize: `${locationFontSize}px` }}>
                <FaMapMarkerAlt size={14} />
                <span>{location}</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (template === "rosa") {
      return (
        <div className="px-6 py-6 text-center">
          {shouldShowPhoto && photo && (
              <div style={photoOverrideStyle} className="relative mx-auto h-28 w-28">
              <div className="absolute inset-0 rounded-full bg-pink-400/30 blur-xl" />
              <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-white/70 shadow-2xl">
                <Image src={photo} alt={`Foto de ${name}`} width={112} height={112} className="h-full w-full object-cover" />
              </div>
            </div>
          )}
          <h1 className={`mt-5 ${adaptiveNameClass} font-bold break-words`} style={{ color: finalNameColor, fontSize: `${nameFontSize}px` }}>{name}</h1>
          <p className={`mt-1 ${adaptiveJobClass} font-medium`} style={{ color: finalJobColor, opacity: 0.82, fontSize: `${jobFontSize}px` }}>{job}</p>
          {hasLocation && (
            <div className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs backdrop-blur-sm" style={{ color: finalLocationColor, opacity: 0.75, fontSize: `${locationFontSize}px` }}>
              <FaMapMarkerAlt size={11} />
              {location}
            </div>
          )}
        </div>
      );
    }

    if (template === "convite") {
      return (
        <div className="px-6 py-7 text-center">
          <p className="text-xs uppercase tracking-[0.4em]" style={{ color: textColor, opacity: 0.65 }}>É um prazer ter você aqui</p>
          {shouldShowPhoto && photo && (
            <div style={photoOverrideStyle} className="mx-auto mt-5 h-28 w-28 overflow-hidden rounded-full border-4 border-white/60 shadow-2xl">
              <Image src={photo} alt={`Foto de ${name}`} width={112} height={112} className="h-full w-full object-cover" />
            </div>
          )}
          <h1 className={`mt-5 ${adaptiveNameClass} font-semibold italic break-words`} style={{ color: finalNameColor, fontSize: `${nameFontSize}px` }}>{name}</h1>
          <div className="mx-auto mt-3 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-white/40" />
            <span className="text-lg" style={{ color: textColor }}>✦</span>
            <span className="h-px w-8 bg-white/40" />
          </div>
          <p className={`mt-3 ${adaptiveJobClass} italic`} style={{ color: finalJobColor, opacity: 0.8, fontSize: `${jobFontSize}px` }}>{job}</p>
          {hasLocation && (
            <p className="mt-2 text-xs" style={{ color: finalLocationColor, opacity: 0.65, fontSize: `${locationFontSize}px` }}>{location}</p>
          )}
        </div>
      );
    }

    if (template === "floral") {
      return (
        <div className="relative px-6 py-7 text-center">
          <div className="absolute left-4 top-2 text-4xl opacity-50">🌸</div>
          <div className="absolute right-4 top-2 text-4xl opacity-50">🌺</div>
          {shouldShowPhoto && photo && (
            <div style={photoOverrideStyle} className="mx-auto h-28 w-28 overflow-hidden rounded-full border-4 border-pink-200/80 shadow-xl">
              <Image src={photo} alt={`Foto de ${name}`} width={112} height={112} className="h-full w-full object-cover" />
            </div>
          )}
          <h1 className={`mt-5 ${adaptiveNameClass} font-bold break-words`} style={{ color: finalNameColor, fontSize: `${nameFontSize}px` }}>{name}</h1>
          <p className={`mt-1 ${adaptiveJobClass} font-medium`} style={{ color: finalJobColor, opacity: 0.75, fontSize: `${jobFontSize}px` }}>{job}</p>
          {hasLocation && (
            <div className="mx-auto mt-4 flex items-center justify-center gap-2" style={{ color: finalLocationColor, opacity: 0.65, fontSize: `${locationFontSize}px` }}>
              <span>❀</span><span className="text-xs">{location}</span><span>❀</span>
            </div>
          )}
        </div>
      );
    }

    if (template === "verde") {
      return (
        <div className="px-6 py-6">
          <div className="flex items-center gap-5">
            {shouldShowPhoto && photo && (
              <div style={photoOverrideStyle} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border-2 border-emerald-300/50 shadow-xl">
                <Image src={photo} alt={`Foto de ${name}`} width={112} height={112} className="h-full w-full object-cover" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="mb-2 h-1 w-10 rounded-full bg-emerald-300/80" />
              <h1 className={`${adaptiveNameClass} font-bold break-words`} style={{ color: finalNameColor, fontSize: `${nameFontSize}px` }}>{name}</h1>
              <p className={`mt-1 ${adaptiveJobClass}`} style={{ color: finalJobColor, opacity: 0.8, fontSize: `${jobFontSize}px` }}>{job}</p>
              {hasLocation && (
                <p className="mt-2 text-xs" style={{ color: finalLocationColor, opacity: 0.65, fontSize: `${locationFontSize}px` }}>📍 {location}</p>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (template === "medico") {
      return (
        <div className="px-6 py-6">
          <div className="rounded-2xl bg-white/80 p-5 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-4">
              {shouldShowPhoto && photo && (
                <div style={photoOverrideStyle} className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-cyan-200 shadow-md">
                  <Image src={photo} alt={`Foto de ${name}`} width={112} height={112} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2 text-cyan-700">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-100 font-bold">+</span>
                  <span className="text-xs font-bold uppercase tracking-wider">Profissional de saúde</span>
                </div>
                <h1 className={`${adaptiveNameClass} font-bold text-slate-800 break-words`}
                  style={{ fontSize: `${nameFontSize}px` }}
                >
                  {name}
                </h1>
                <p className={`mt-1 ${adaptiveJobClass} font-medium text-slate-600`}
                  style={{ fontSize: `${jobFontSize}px` }}
                >
                  {job}
                </p>
              </div>
            </div>
            {hasLocation && (
              <div className="mt-4 flex items-center gap-2 border-t border-cyan-100 pt-3 text-sm text-slate-500"
                style={{ fontSize: `${locationFontSize}px` }}
              >
                <FaMapMarkerAlt size={13} />
                <span>{location}</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    return renderProfile();
  }

  function renderLinkItem(link: Link, index: number, className: string, justifyClass: string) {
    const content = (
      <span className={`flex min-w-0 items-center gap-3 ${justifyClass}`}>
        <span className="shrink-0">{getIcon(link.type)}</span>
        <span className="min-w-0 break-words">{link.name}</span>
      </span>
    );

    if (link.type === "pix" && !/^https?:\/\//i.test(link.value)) {
      return (
        <button
          key={index}
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(link.value);
              setCopiedPixIndex(index);
              window.setTimeout(() => setCopiedPixIndex(null), 1800);
            } catch {
              alert(`Chave Pix: ${link.value}`);
            }
          }}
          style={{ ...getButtonStyle(), color: textColor }}
          className={`${className} w-full min-w-0`}
        >
          {content}
          {copiedPixIndex === index && (
            <span className="mt-1 block text-[10px] font-semibold opacity-75">Chave Pix copiada</span>
          )}
        </button>
      );
    }

    return (
      <a
        key={index}
        onPointerDown={(e) => e.stopPropagation()}
        href={getLinkUrl(link)}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...getButtonStyle(), color: textColor }}
        className={`${className} block w-full min-w-0`}
      >
        {content}
      </a>
    );
  }

  function renderLinks() {
    if (template === "motorista") {
      return (
        <div className="min-h-0 flex-1 touch-pan-y space-y-3 overflow-y-auto px-6 pb-7 [&::-webkit-scrollbar]:hidden">
          {links.map((link, index) =>
            renderLinkItem(link, index, "rounded-xl border-2 px-3 py-3 sm:px-4 sm:py-4 font-bold uppercase tracking-wide transition hover:scale-[1.02]", "justify-start")
          )}
        </div>
      );
    }

    if (template === "advocacia") {
      return (
        <div className="min-h-0 flex-1 touch-pan-y space-y-2 overflow-y-auto px-6 pb-7 [&::-webkit-scrollbar]:hidden">
          {links.map((link, index) =>
            renderLinkItem(link, index, "border-b border-yellow-600/40 py-3 text-center font-serif transition hover:bg-white/5", "justify-center")
          )}
        </div>
      );
    }

    return (
      <div
        className={`${templateConfig.layout.contentSpacing} min-h-0 flex-1 touch-pan-y overflow-y-auto px-6 pb-6 [&::-webkit-scrollbar]:hidden`}
      >
        {links.map((link, index) =>
          renderLinkItem(
            link,
            index,
            `${templateConfig.layout.buttonHeight} ${templateConfig.layout.buttonFont} text-center transition hover:scale-[1.02] ${currentTemplate.buttonStyle}`,
            isCompactLayout ? "justify-start px-4" : "justify-center"
          )
        )}
      </div>
    );
  }

  return (
    <main
      className={`relative w-full overflow-hidden ${
        compact ? "h-full" : "h-[100dvh]"
      }`}
    >
      <div
        className={`relative w-full h-full max-w-none min-h-0 overflow-hidden shadow-2xl border border-white/20 ${currentTemplate.cardRadius} ${
          isGlassTemplate ? "ring-1 ring-white/20 shadow-black/30" : ""
          } ${
          isEditing
            ? "cursor-grab touch-none active:cursor-grabbing"
            : ""
        }`}
        onPointerDown={
          isEditing ? onBackgroundPointerDown : undefined
        }
        onPointerMove={
          isEditing ? onBackgroundPointerMove : undefined
        }
        onPointerUp={
          isEditing ? onBackgroundPointerUp : undefined
        }
      >
        {renderDecoration()}

        {/* Fundo */}
    
        <div
          className="absolute inset-0"
          style={{ backgroundColor, opacity: 1, }}
        />

        {shouldShowBackground && backgroundMode !== "color" && (
          <div
            className={`absolute inset-0 bg-cover bg-center ${
              isEditing
                ? "cursor-grab touch-none active:cursor-grabbing"
                : ""
            }`}
            style={{
              backgroundImage:
                backgroundMode === "image" && background
                  ? `url(${background})`
                  : templateConfig.background.type === "gradient"
                    ? templateConfig.background.value
                    : `url(${templateConfig.background.value})`,
               backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              // O blur precisa ser aplicado diretamente na camada da imagem.
              // A escala evita que as bordas desfocadas revelem áreas transparentes.
              filter:
                effectiveBackgroundBlur > 0
                  ? `blur(${effectiveBackgroundBlur}px)`
                  : "none",
              /* A imagem sempre cobre a tela inteira. O pan só tem efeito
                 quando ampliada (zoom > 1) e o editor limita o deslocamento
                 para nunca revelar bordas vazias. */
              transform: `scale(${
                (effectiveBackgroundBlur > 0 ? 1.12 : 1) * backgroundZoom
              }) translate(${-backgroundPosition.x / backgroundZoom}px, ${
                -backgroundPosition.y / backgroundZoom
              }px)`,
              transformOrigin: "center center",
              willChange: "filter, transform",
            }}
            onPointerDown={
              isEditing ? onBackgroundPointerDown : undefined
            }
            onPointerMove={
              isEditing ? onBackgroundPointerMove : undefined
            }
            onPointerUp={
              isEditing ? onBackgroundPointerUp : undefined
            }
          />
        )}

        {/* Camada escura */}
        {shouldShowBackground && backgroundMode !== "color" && (
          <div
            className="pointer-events-none absolute inset-0 bg-black"
            style={{
              opacity: backgroundOverlay / 100,
            }}
          />
        )}

      {(() => {
        const WatermarkIcon =
          WATERMARK_ICONS[templateConfig.layout.watermarkIcon ?? ""];
        if (!WatermarkIcon) return null;
        return (
          <div
            className="pointer-events-none absolute -bottom-14 -right-14 z-20 rotate-12"
            style={{ color: finalNameColor, opacity: 0.09 }}
          >
            <WatermarkIcon size={300} />
          </div>
        );
      })()}

        {/* Conteúdo */}
        <div
          className={`relative z-10 flex h-full w-full flex-col ${currentTemplate.contentStyle} ${isGlassTemplate ? "overflow-hidden" : ""}`}
        >
          {/* Botões superiores */}
          <div
            className={`flex items-center justify-between p-4 ${currentTemplate.headerStyle}`}
          >
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={handleShare}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm backdrop-blur-md transition hover:scale-[1.02] ${currentTemplate.buttonStyle} ${isGlassTemplate ? "order-2" : ""}`}
              style={{
                ...getButtonStyle(),
                color: textColor,
              }}
            >
              <FaShareAlt size={14} />
              Compartilhar
            </button>

            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setShowQRCode(true)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm backdrop-blur-md transition hover:scale-[1.02] ${currentTemplate.buttonStyle} ${isGlassTemplate ? "order-1" : ""}`}
              style={{
                ...getButtonStyle(),
                color: textColor,
              }}
            >
              <FaQrcode size={14} />
              QR Code
            </button>
          </div>
        
          {/* Perfil */}
          {renderUniqueProfile()}

          {/* Links */}
          {renderLinks()}
        </div>

        {/* Modal QR Code */}
        {showQRCode && (
          <div
          onPointerDown={(e) => e.stopPropagation()} 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
            <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setShowQRCode(false)}
                className="absolute right-4 top-4 text-2xl text-gray-500 transition hover:text-gray-900"
                aria-label="Fechar QR Code"
              >
                ×
              </button>

              <h2 className="mb-2 text-xl font-bold text-gray-900">
                QR Code
              </h2>

              <p className="mb-5 text-sm text-gray-500">
                Aponte a câmera do celular para acessar meu cartão
              </p>

              <div className="flex justify-center">
                <div className="rounded-2xl bg-white p-4 shadow-lg">
                  <QRCodeSVG
                    value={slug ? `${window.location.origin}/c/${slug}` : window.location.href}
                    size={220}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                  />
                </div>
              </div>

              <p className="mt-5 text-sm font-medium text-gray-700">
                {name}
              </p>

              <button
                onClick={() => setShowQRCode(false)}
                className="mt-5 w-full rounded-xl bg-gray-900 py-3 font-medium text-white transition hover:bg-gray-700"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
