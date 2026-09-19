import { getTemplateById } from "@/app/data/templates";
import type { TemplateConfig, TemplateLayout } from "@/app/data/templates";
/* Extrai as cores dominantes de uma imagem (logo). */
export function extractPalette(
  dataUrl: string,
  maxColors = 3
): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const size = 48;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve([]);

      ctx.drawImage(img, 0, 0, size, size);
      const { data } = ctx.getImageData(0, 0, size, size);
      const buckets = new Map<
        string,
        { count: number; r: number; g: number; b: number }
      >();

      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        if (a < 125) continue;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const key = `${Math.round(r / 32)}-${Math.round(g / 32)}-${Math.round(b / 32)}`;
        const bucket = buckets.get(key);
        if (bucket) {
          bucket.count++;
          bucket.r = (bucket.r + r) / 2;
          bucket.g = (bucket.g + g) / 2;
          bucket.b = (bucket.b + b) / 2;
        } else {
          buckets.set(key, { count: 1, r, g, b });
        }
      }

      const toHex = (v: number) =>
        Math.round(v).toString(16).padStart(2, "0");

      const colors = [...buckets.values()]
        .sort((a, b) => b.count - a.count)
        .map(
          (c) =>
            `#${toHex(c.r)}${toHex(c.g)}${toHex(c.b)}`.toUpperCase()
        )
        .slice(0, maxColors);

      resolve(colors);
    };
    img.onerror = () => resolve([]);
    img.src = dataUrl;
  });
}

const hexOk = (v: unknown, fallback: string) =>
  typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v) ? v : fallback;

const LAYOUT_BASE: Record<string, string> = {
  modern: "rosa",
  professional: "azul",
  classic: "advocacia",
  bold: "motorista",
  invitation: "convite",
  floral: "floral",
  elegant: "verde",
  health: "medico",
  executive: "executivo",
  minimal: "minimal",
  photographic: "fotografico",
  luxury: "luxo",
  geometric: "geometrico",
  dark: "dark",
  nature: "nature",
  beauty: "beauty",
  tech: "tech",
  glass: "glass",
  "glass-pro": "vidro-pro",
  "glass-frost": "vidro-frost",
  "glass-dark": "vidro-dark",
  "glass-clear": "glass-clear",
};

function luminance(hex: string) {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16) / 255;
  const g = parseInt(n.slice(2, 4), 16) / 255;
  const b = parseInt(n.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/* Converte a resposta da IA num TemplateConfig válido do sistema. */
export function buildTemplateFromAI(
  ai: Record<string, unknown>,
  palette: string[],
  existingIds: string[],
  options?: { forceDark?: boolean }
): TemplateConfig {
   const layoutKey = String(ai.layoutType ?? "modern");
  const base = getTemplateById(LAYOUT_BASE[layoutKey] ?? "rosa");
  const template: TemplateConfig = JSON.parse(JSON.stringify(base));

  /* Garante que campos usados abaixo sempre existam, mesmo se o
     template base mudar no futuro. */
  template.layout = template.layout ?? ({} as TemplateConfig["layout"]);
  template.defaults = template.defaults ?? ({} as TemplateConfig["defaults"]);

  const gradient =
    Array.isArray(ai.gradient) && ai.gradient.length >= 2
      ? (ai.gradient as unknown[]).map((c) => hexOk(c, "#334155"))
      : palette.length >= 2
        ? palette
        : ["#1e293b", "#334155", "#0f766e"];

  while (gradient.length < 3) gradient.push(gradient[gradient.length - 1]);

  /* Trava: se o usuário pediu tema escuro, escurece o gradiente
     de qualquer jeito — não depende da IA ter obedecido. */
  if (options?.forceDark) {
    const darken = (hex: string) => {
      const n = hex.replace("#", "");
      const channel = (i: number) =>
        Math.max(
          8,
          Math.round(parseInt(n.slice(i, i + 2), 16) * 0.35)
        );
      return `#${channel(0).toString(16).padStart(2, "0")}${channel(2)
        .toString(16)
        .padStart(2, "0")}${channel(4).toString(16).padStart(2, "0")}`;
    };
    for (let i = 0; i < gradient.length; i++) gradient[i] = darken(gradient[i]);
  }

  const isDark = options?.forceDark || ai.mood === "dark";
  const midColor = gradient[1];
  const textOnBg = luminance(midColor) > 0.55 ? "#1F2937" : "#FFFFFF";

  const photo = String(ai.photoStyle ?? "circle");
  const radius = String(ai.buttonStyle ?? "rounded-xl");

  let id = `custom-${Date.now()}`;
  while (existingIds.includes(id)) id = `${id}-x`;

  template.id = id;
  template.name = String(ai.name ?? "Template IA").slice(0, 40);
  template.category = "IA";
  template.description = `Template gerado por IA para ${template.category === "IA" ? "seu ramo" : "seu ramo"}.`;
  template.layoutType = (LAYOUT_BASE[layoutKey]
    ? layoutKey
    : "modern") as TemplateLayout;

    const angle =
    typeof ai.gradientAngle === "number"
      ? Math.min(170, Math.max(90, Math.round(ai.gradientAngle)))
      : 145;

  template.background = {
    type: "gradient",
    value: `linear-gradient(${angle}deg, ${gradient[0]} 0%, ${gradient[1]} 50%, ${gradient[2]} 100%)`,
  };

  template.defaults = {
    ...template.defaults,
    primaryColor: hexOk(ai.primaryColor, gradient[0]),
    textNameColor: textOnBg,
    textJobColor: textOnBg,
    textLocationColor: textOnBg,
    primaryColorOpacity:
      typeof ai.primaryColorOpacity === "number"
        ? Math.min(95, Math.max(10, Math.round(ai.primaryColorOpacity)))
        : 60,
    backgroundOverlay:
      typeof ai.backgroundOverlay === "number"
        ? Math.min(80, Math.max(0, Math.round(ai.backgroundOverlay)))
        : template.defaults.backgroundOverlay,
    backgroundBlur:
      typeof ai.backgroundBlur === "number"
        ? Math.min(20, Math.max(0, Math.round(ai.backgroundBlur)))
        : template.defaults.backgroundBlur,
  };

  const validDecorations = [
    "pink", "blue", "gold", "purple", "green", "cyan",
    "executive", "glass-pro", "glass-frost", "glass-dark",
    "glass", "minimal", "yellow", "floral",
  ];
  const decoration = String(ai.decoration ?? "");
  if (validDecorations.includes(decoration)) {
    template.layout.decoration = decoration;
  }

  template.layout.photoStyle =
    photo === "square"
      ? "rounded-none border-2 border-white/50"
      : photo === "rounded"
        ? "rounded-2xl border-2 border-white/50"
        : "rounded-full border-2 border-white/70";

    template.layout.buttonStyle = template.layout.buttonStyle.replace(
    /rounded-(full|2xl|xl|lg|md|none)/,
    radius
  );

  /* ----- Detalhes personalizados da IA ----- */
  const details = (ai.customDetails ?? {}) as Record<string, unknown>;

  const borderRadius = String(details.borderRadius ?? "");
  if (borderRadius === "sharp") {
    template.layout.buttonStyle = template.layout.buttonStyle.replace(
      /rounded-(full|2xl|xl|lg|md)/,
      "rounded-none"
    );
    template.layout.photoStyle = "rounded-none border-2 border-white/50";
  } else if (borderRadius === "soft") {
    template.layout.photoStyle = "rounded-2xl border-2 border-white/50";
  }

  /* Estilo das letras. */
  const fontMood = String(details.fontMood ?? "");
  const fontMap: Record<string, string> = {
    bold: "font-black",
    elegant: "font-semibold italic tracking-wide",
    minimal: "font-medium tracking-[0.2em]",
    playful: "font-extrabold tracking-tight",
  };
  if (fontMap[fontMood]) {
    template.layout.nameStyle = template.layout.nameStyle.replace(
      /font-(bold|semibold|medium|extrabold|black)/,
      fontMap[fontMood]
    );
    template.layout.jobStyle = template.layout.jobStyle.replace(
      /font-(bold|semibold|medium)/,
      fontMood === "elegant" ? "font-medium italic" : "font-semibold"
    );
  }
  if (details.uppercase === true) {
    template.layout.nameStyle += " uppercase";
  }

  /* Ícone marca d'água (só aceita nomes da lista). */
  const validIcons = [
    "sparkles", "scissors", "camera", "palette", "dumbbell",
    "heart-pulse", "leaf", "briefcase", "music", "code",
    "coffee", "flower", "wrench", "graduation", "chef", "car",
  ];
  const icon = String(ai.icon ?? "");
  if (validIcons.includes(icon)) {
    template.layout.watermarkIcon = icon;
  }

  /* Cor de acento vira a cor primária dos botões. */
  if (typeof ai.accentColor === "string" && /^#[0-9a-fA-F]{6}$/.test(ai.accentColor)) {
    template.defaults.primaryColor = ai.accentColor;
    template.defaults.usePrimaryColor = true;
  }

  return template;
}