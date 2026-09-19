"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState, type PointerEvent } from "react";
import DigitalCard from "../components/DigitalCard";
import { templates, getTemplateById } from "../data/templates";
import type { TemplateConfig } from "../data/templates";
import { extractPalette, buildTemplateFromAI } from "../../lib/ai-template";
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Camera,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  LayoutTemplate,
  Link2,
  Palette,
  QrCode,
  Save,
  Sparkles,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";


/* ------------------------------------------------------------------ */
/* Constantes de estilo (design system do editor)                      */
/* ------------------------------------------------------------------ */

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-sky-400/10";

const panelCard =
  "rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5";

const panelTitle = "text-sm font-semibold text-white";
const panelHint = "mt-1 text-xs leading-5 text-slate-400";

const TABS = [
  { id: "ia", label: "Assistente IA", icon: Sparkles },
  { id: "templates", label: "Modelo", icon: LayoutTemplate },
  { id: "dados", label: "Perfil", icon: UserRound },
  { id: "links", label: "Links", icon: Link2 },
  { id: "fundo", label: "Fundo", icon: ImageIcon },
  { id: "cores", label: "Estilo", icon: Palette },
] as const;

type TabId = (typeof TABS)[number]["id"];

const TAB_META: Record<
  TabId,
  { title: string; description: string }
> = {
  ia: {
    title: "Assistente IA",
    description: "Descreva seu estilo e a IA cria um template exclusivo.",
  },
  templates: {
    title: "Modelo",
    description: "Escolha a base visual do seu cartão.",
  },
  dados: {
    title: "Perfil",
    description: "Nome, foto e informações principais.",
  },
  links: {
    title: "Links",
    description: "WhatsApp, redes sociais, Pix, Wi-Fi e mais.",
  },
  fundo: {
    title: "Fundo",
    description: "Imagem, cor, desfoque e posicionamento.",
  },
  cores: {
    title: "Estilo",
    description: "Cores dos textos e dos botões.",
  },
};

type CardLink = {
  id: string;
  type: string;
  name: string;
  value: string;
  enabled: boolean;
};

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabId>("templates");
  const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false);

  const [name, setName] = useState("João Henrique");
  const [job, setJob] = useState("Diretor Comercial");
  const [location, setLocation] = useState("Cidade - UF");
  const [slug, setSlug] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState("");
  const [userId, setUserId] = useState("");
  const [cards, setCards] = useState<unknown[]>([]);
  const [selectedCardId, setSelectedCardId] = useState("");
  const [authChecking, setAuthChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  /* Cores e tipografia */
  const [primaryColor, setPrimaryColor] = useState("#FFFFFF");
  const [primaryColorOpacity, setPrimaryColorOpacity] = useState(60);
  const [usePrimaryColor, setUsePrimaryColor] = useState(false);
  const [textColor, setTextColor] = useState("#FFFFFF");

  const [textNameColor, setTextNameColor] = useState("#FFFFFF");
  const [textJobColor, setTextJobColor] = useState("#FFFFFF");
  const [textLocationColor, setTextLocationColor] = useState("#FFFFFF");
  const [nameFontSize, setNameFontSize] = useState(30);
  const [jobFontSize, setJobFontSize] = useState(16);
  const [locationFontSize, setLocationFontSize] = useState(14);
  const [healthLabel, setHealthLabel] = useState("Profissional de saúde");

  /* Exibição */
  const [showPhoto, setShowPhoto] = useState(true);
  const [showBackground, setShowBackground] = useState(true);
  

  /* Mídia */
  const [photo, setPhoto] = useState("/images/perfil.jpg");
  const [background, setBackground] = useState("/images/fundo.jpg");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [backgroundMode, setBackgroundMode] = useState<
    "template" | "image" | "color"
  >("template");

  /* Template */
    const [template, setTemplate] = useState("rosa");
  const [useTemplate, setUseTemplate] = useState(true);
  const [customTemplates, setCustomTemplates] = useState<TemplateConfig[]>([]);
  const [aiLogo, setAiLogo] = useState<string | null>(null);
  const [aiProfession, setAiProfession] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiStyle, setAiStyle] = useState("");
  const [pendingTemplate, setPendingTemplate] =
    useState<TemplateConfig | null>(null);
  const [templateSnapshot, setTemplateSnapshot] = useState<{
    template: string;
    useTemplate: boolean;
    primaryColor: string;
    textNameColor: string;
    textJobColor: string;
    textLocationColor: string;
    textColor: string;
    primaryColorOpacity: number;
    usePrimaryColor: boolean;
    backgroundOverlay: number;
    showPhoto: boolean;
    showBackground: boolean;
    backgroundBlur: number;
    backgroundMode: "template" | "image" | "color";
    photoSize: number;
    photoShape: "square" | "rounded" | "circle";
    usePhotoBorderColor: boolean;
    photoBorderColor: string;
    photo: string;
  } | null>(null);

  /* Fundo */
  const [backgroundPosition, setBackgroundPosition] = useState({
    x: 0,
    y: 0,
  });
  const [backgroundZoom, setBackgroundZoom] = useState(1);
  const [backgroundOverlay, setBackgroundOverlay] = useState(40);
  const [backgroundBlur, setBackgroundBlur] = useState(8);
  const [isDraggingBackground, setIsDraggingBackground] = useState(false);
  const [backgroundDragStart, setBackgroundDragStart] = useState({
    x: 0,
    y: 0,
  });

  /* Foto (crop) */
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoSize, setPhotoSize] = useState(112);
  const [photoShape, setPhotoShape] = useState<
    "square" | "rounded" | "circle"
  >("circle");
  const [photoBorderColor, setPhotoBorderColor] = useState("");
  const [usePhotoBorderColor, setUsePhotoBorderColor] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  /* Links */
  const [links, setLinks] = useState<CardLink[]>([
    {
      id: "link-whatsapp",
      type: "whatsapp",
      name: "WhatsApp",
      value: "+55",
      enabled: true,
    },
    {
      id: "link-instagram",
      type: "instagram",
      name: "Instagram",
      value: "https://instagram.com/",
      enabled: true,
    },
    {
      id: "link-linkedin",
      type: "linkedin",
      name: "LinkedIn",
      value: "https://linkedin.com/",
      enabled: true,
    },
  ]);

  /* Marca quais links o usuário já editou (para não mostrar erro
     de validação em campos que ainda estão com o valor padrão). */
  const [dirtyLinks, setDirtyLinks] = useState<Record<string, boolean>>({});

  /* ---------------------------------------------------------------- */
  /* Efeitos                                                           */
  /* ---------------------------------------------------------------- */

  /* Autenticação + carregamento do cartão (consolidado). O
     `authChecking` agora sempre é resolvido, evitando a tela
     travada em "Carregando...". */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          window.location.href = "/login";
          return;
        }

        if (cancelled) return;
        setUserId(user.id);

        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        setIsAdmin(profile?.role === "admin");
      

        const { data: userCards, error } = await supabase
          .from("digital_cards")
          .select("id,data,slug")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        setCards(userCards || []);

        const card = userCards?.[0] || null;

        if (card) {
          setSelectedCardId(card.id);
        }
        if (error) {
          console.error("Erro ao carregar cartão:", error);
          return;
        }

        if (!card) return;

        const cardData = card.data || {};

        setSlug(card.slug || "");
        setCustomSlug(card.slug || "");
        setName(cardData.name || "");
        setJob(cardData.job || "");
        setLocation(cardData.location || "");
        setPrimaryColor(cardData.primaryColor || "#111827");
        setPrimaryColorOpacity(cardData.primaryColorOpacity ?? 60);
        setTextColor(cardData.textColor || "#FFFFFF");
        setTextNameColor(cardData.textNameColor || "#FFFFFF");
        setTextJobColor(cardData.textJobColor || "#FFFFFF");
        setTextLocationColor(cardData.textLocationColor || "#FFFFFF");
        setNameFontSize(cardData.nameFontSize ?? 30);
        setJobFontSize(cardData.jobFontSize ?? 16);
        setLocationFontSize(cardData.locationFontSize ?? 14);
        setHealthLabel(cardData.healthLabel || "Profissional de saúde");
        setShowPhoto(cardData.showPhoto ?? true);
        setShowBackground(cardData.showBackground ?? true);
        setUsePrimaryColor(cardData.usePrimaryColor ?? false);
        setTemplate(cardData.template || "rosa");
        setUseTemplate(cardData.useTemplate ?? true);
        setPhoto(cardData.photo || "/images/perfil.jpg");
        setBackground(cardData.background || "/images/fundo.jpg");
        setBackgroundColor(cardData.backgroundColor || "#FFFFFF");
        setBackgroundMode(cardData.backgroundMode || "template");
        setBackgroundPosition(cardData.backgroundPosition || { x: 0, y: 0 });
        setBackgroundZoom(cardData.backgroundZoom ?? 1);
        setBackgroundOverlay(cardData.backgroundOverlay ?? 40);
        setBackgroundBlur(cardData.backgroundBlur ?? 8);
         setPosition(cardData.position || { x: 0, y: 0 });
        setZoom(cardData.zoom ?? 1);
        setPhotoSize(cardData.photoSize ?? 112);
        setPhotoShape(cardData.photoShape || "circle");
        setPhotoBorderColor(cardData.photoBorderColor || "");
        setUsePhotoBorderColor(cardData.usePhotoBorderColor ?? false);
        const { data: customRows } = await supabase
          .from("custom_templates")
          .select("data")
          .eq("user_id", user.id);

        if (customRows?.length) {
          const loaded = customRows.map((row) => row.data as TemplateConfig);
          templates.push(
            ...loaded.filter((t) => !templates.some((x) => x.id === t.id))
          );
          setCustomTemplates(loaded);
        }

        setLinks(
          (cardData.links || []).map((link: CardLink, index: number) => ({
            ...link,
            enabled: link.enabled ?? true,
            id: link.id || `link-${index}-${Date.now()}`,
          }))
        );
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      } finally {
        if (!cancelled) setAuthChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* Verificação de disponibilidade do endereço (debounce 500ms). */
  useEffect(() => {
    const value = normalizeSlug(customSlug);

    const timer = setTimeout(async () => {
      if (!value) {
        setSlugStatus("");
        return;
      }

      const { data, error } = await supabase
        .from("digital_cards")
        .select("id,slug")
        .eq("slug", value)
        .maybeSingle();

      if (error) {
        setSlugStatus("⚠️ Não foi possível verificar.");
        return;
      }

      if (data && value !== slug) {
        setSlugStatus("❌ Este endereço já está em uso.");
      } else {
        setSlugStatus("✅ Este endereço está disponível.");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [customSlug, slug]);

  /* Fecha o dropdown de templates ao clicar fora ou apertar Escape. */
  useEffect(() => {
    if (!templateDropdownOpen) return;

    function handleMouseDown(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest("[data-template-dropdown]")) {
        setTemplateDropdownOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setTemplateDropdownOpen(false);
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [templateDropdownOpen]);

  /* ---------------------------------------------------------------- */
  /* Handlers de arraste do fundo                                      */
  /* ---------------------------------------------------------------- */

  function handleBackgroundPointerDown(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDraggingBackground(true);
    setBackgroundDragStart({
      x: e.clientX - backgroundPosition.x,
      y: e.clientY - backgroundPosition.y,
    });
  }

    function handleBackgroundPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!isDraggingBackground) return;

    /* A imagem só pode ser movida quando ampliada. O deslocamento
       máximo é metade do quanto ela excede a tela — assim nunca
       aparecem bordas vazias. */
    const rect = e.currentTarget.getBoundingClientRect();
    const maxX = Math.max(0, ((backgroundZoom - 1) / 2) * rect.width);
    const maxY = Math.max(0, ((backgroundZoom - 1) / 2) * rect.height);

    const newX = Math.min(
      maxX,
      Math.max(-maxX, e.clientX - backgroundDragStart.x)
    );
    const newY = Math.min(
      maxY,
      Math.max(-maxY, e.clientY - backgroundDragStart.y)
    );

    setBackgroundPosition({ x: newX, y: newY });
  }

  function handleBackgroundPointerUp(e: PointerEvent<HTMLDivElement>) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsDraggingBackground(false);
  }

  /* ---------------------------------------------------------------- */
  /* Links                                                             */
  /* ---------------------------------------------------------------- */

  const linkTypes = [
    { name: "WhatsApp", type: "whatsapp" },
    { name: "Instagram", type: "instagram" },
    { name: "LinkedIn", type: "linkedin" },
    { name: "YouTube", type: "youtube" },
    { name: "Site", type: "website" },
    { name: "E-mail", type: "email" },
    { name: "Telefone", type: "phone" },
    { name: "Localização", type: "location" },
    { name: "Produtos", type: "produtos" },
    { name: "Cardápio", type: "menu" },
    { name: "Avaliação", type: "review" },
    { name: "Pix", type: "pix" },
    { name: "Wi-Fi", type: "wifi" },
    { name: "Link personalizado", type: "custom" },
  ];

  function validateLink(type: string, value: string) {
    if (!value.trim()) {
      return "Este campo é obrigatório.";
    }

    if (type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return "Digite um endereço de e-mail válido.";
      }
    }

    if (type === "whatsapp" || type === "phone") {
      const numbers = value.replace(/\D/g, "");
      if (numbers.length < 10) {
        return "Digite um número de telefone válido.";
      }
    }

    if (
      type === "instagram" ||
      type === "linkedin" ||
      type === "youtube" ||
      type === "website" ||
      type === "menu" ||
      type === "review" ||
      type === "custom"
    ) {
      if (!value.startsWith("http://") && !value.startsWith("https://")) {
        return "Digite uma URL começando com https://";
      }
    }

    if (type === "pix" && value.trim().length < 2) {
      return "Informe a chave Pix ou um link de pagamento.";
    }

    if (type === "custom" && value.trim().length < 4) {
      return "Informe um link válido.";
    }

    if (type === "location" && value.trim().length < 5) {
      return "Digite um endereço válido.";
    }

    return "";
  }

  function hasInvalidLinks() {
    return links.some((link) => {
      const value = link.value?.trim() ?? "";

      /* Links desativados ou vazios não impedem o salvamento. */
      if (!link.enabled || !value) {
        return false;
      }

      return validateLink(link.type, value) !== "";
    });
  }

  function moveLink(index: number, direction: "up" | "down") {
    setLinks((currentLinks) => {
      const newLinks = [...currentLinks];
      const newIndex = direction === "up" ? index - 1 : index + 1;

      if (newIndex < 0 || newIndex >= newLinks.length) {
        return currentLinks;
      }

      [newLinks[index], newLinks[newIndex]] = [
        newLinks[newIndex],
        newLinks[index],
      ];

      return newLinks;
    });
  }

  function updateLink(index: number, patch: Partial<CardLink>) {
    setLinks((current) =>
      current.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  }

  function markLinkDirty(id: string) {
    setDirtyLinks((current) => (current[id] ? current : { ...current, [id]: true }));
  }

  /* ---------------------------------------------------------------- */
  /* Mídia                                                             */
  /* ---------------------------------------------------------------- */

  function optimizeBackgroundImage(dataUrl: string): Promise<string> {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        const maxSize = 1600;
        const scale = Math.min(
          1,
          maxSize / Math.max(image.width, image.height)
        );
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      image.onerror = () => resolve(dataUrl);
      image.src = dataUrl;
    });
  }

  function cropImage() {
    if (!selectedPhoto) return;

    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 512;

      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const baseScale = Math.min(size / image.width, size / image.height);
      const finalScale = baseScale * zoom;

      const width = image.width * finalScale;
      const height = image.height * finalScale;

      const x = (size - width) / 2 + position.x * 2;
      const y = (size - height) / 2 + position.y * 2;

      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(image, x, y, width, height);

      const croppedImage = canvas.toDataURL("image/jpeg", 0.9);

      setPhoto(croppedImage);
      setShowCropper(false);
      setSelectedPhoto(null);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    };

    image.src = selectedPhoto;
  }

  /* Deriva as configurações padrão de foto do template selecionado.
     Ex.: profileSize "h-28 w-28" → 112px; photoStyle com
     "rounded-full" → círculo. */
  function getPhotoDefaults(templateId: string) {
    const t = getTemplateById(templateId);

    const sizeMap: Record<string, number> = {
      "h-20": 80,
      "h-24": 96,
      "h-28": 112,
      "h-36": 144,
    };
    const sizeKey = t.layout.profileSize.trim().split(" ")[0];
    const size = sizeMap[sizeKey] ?? 112;

    const style = t.layout.photoStyle;
    const shape: "circle" | "rounded" | "square" = style.includes("rounded-full")
      ? "circle"
      : style.includes("rounded-")
        ? "rounded"
        : "square";

    return { size, shape };
  }

  /* ---------------------------------------------------------------- */
  /* Slug / auth / QR                                                  */
  /* ---------------------------------------------------------------- */

  function generateSlug(name: string, job: string) {
    return `${name}-${job}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function normalizeSlug(value: string) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const downloadQRCode = () => {
    const svg = document.querySelector(
      "#qrcode-modal svg"
    ) as SVGSVGElement | null;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const link = document.createElement("a");
      link.download = `qr-code-${slug || "cartao"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData);
  };

  async function copyPublicUrl() {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      alert("Não foi possível copiar o link.");
    }
  }
    function undoTemplateChange() {
    if (!templateSnapshot) return;
    setTemplate(templateSnapshot.template);
    setUseTemplate(templateSnapshot.useTemplate);
    setPrimaryColor(templateSnapshot.primaryColor);
    setTextNameColor(templateSnapshot.textNameColor);
    setTextJobColor(templateSnapshot.textJobColor);
    setTextLocationColor(templateSnapshot.textLocationColor);
    setTextColor(templateSnapshot.textColor);
    setPrimaryColorOpacity(templateSnapshot.primaryColorOpacity);
    setUsePrimaryColor(templateSnapshot.usePrimaryColor);
    setBackgroundOverlay(templateSnapshot.backgroundOverlay);
    setShowPhoto(templateSnapshot.showPhoto);
    setShowBackground(templateSnapshot.showBackground);
    setBackgroundBlur(templateSnapshot.backgroundBlur);
    setBackgroundMode(templateSnapshot.backgroundMode);
    setPhotoSize(templateSnapshot.photoSize);
    setPhotoShape(templateSnapshot.photoShape);
    setUsePhotoBorderColor(templateSnapshot.usePhotoBorderColor);
    setPhotoBorderColor(templateSnapshot.photoBorderColor);
    setPhoto(templateSnapshot.photo);
    setTemplateSnapshot(null);
  }
  /* ---------------------------------------------------------------- */
  /* Salvar                                                            */
  /* ---------------------------------------------------------------- */

    async function generateTemplateWithAI() {
    if (!aiProfession.trim()) {
      alert("Informe o ramo da profissão (ex.: dentistas, advocacia).");
      return;
    }

    setIsGenerating(true);
    try {
      const palette = aiLogo ? await extractPalette(aiLogo) : [];

      const forceDark = /dark|sombri|preto|escur|black/i.test(aiStyle);

      const res = await fetch("/api/generate-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          palette,
          profession: aiProfession.trim(),
          name,
          style: aiStyle.trim(),
          forceDark,
        }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Erro na IA");

      /* Debug: veja no console do navegador o que a IA respondeu. */
      console.log("🤖 Resposta da IA:", payload.json);
      const custom = buildTemplateFromAI(
        payload.json,
        palette,
        templates.map((t) => t.id),
        { forceDark }
      );

      /* Registra no array para o DigitalCard renderizar o preview.
         A persistência no banco só acontece se o usuário confirmar. */
      templates.push(custom);

      /* Fica pendente de confirmação — ainda não salva. */
      setPendingTemplate(custom);

      /* Snapshot para o botão "Desfazer". */
      setTemplateSnapshot({
        template,
        useTemplate,
        primaryColor,
        textNameColor,
        textJobColor,
        textLocationColor,
        textColor,
        primaryColorOpacity,
        usePrimaryColor,
        backgroundOverlay,
        showPhoto,
        showBackground,
        backgroundBlur,
        backgroundMode,
        photoSize,
        photoShape,
        usePhotoBorderColor,
        photoBorderColor,
        photo,
      });

      /* Aplica no editor, igual ao seletor manual. */
      setTemplate(custom.id);
      setUseTemplate(true);
      setPrimaryColor(custom.defaults.primaryColor);
      setTextNameColor(custom.defaults.textNameColor);
      setTextJobColor(custom.defaults.textJobColor);
      setTextLocationColor(custom.defaults.textLocationColor);
      setTextColor(custom.defaults.textNameColor);
      setPrimaryColorOpacity(custom.defaults.primaryColorOpacity);
      setUsePrimaryColor(custom.defaults.usePrimaryColor);
      setBackgroundOverlay(custom.defaults.backgroundOverlay);
      setShowPhoto(custom.defaults.showPhoto);
      setShowBackground(custom.defaults.showBackground);
      setBackgroundBlur(custom.defaults.backgroundBlur ?? 8);
      setBackgroundMode("template");

      /* A logo usada na IA vira a foto de perfil automaticamente. */
      if (aiLogo) {
        setPhoto(aiLogo);
        setShowPhoto(true);
      }

      setAiLogo(null);
    } catch (error) {
      console.error("Erro ao gerar template:", error);
      const message =
        error instanceof Error && error.message.includes("sobrecarregada")
          ? "A IA está sobrecarregada agora (muita gente usando). Aguarde ~30 segundos e tente de novo."
          : "Não foi possível gerar o template. Tente novamente.";
      alert(message);
    } finally {
      setIsGenerating(false);
    }
  }

  /* Salva o template gerado (dropdown + banco) após confirmação. */
  async function savePendingTemplate() {
    if (!pendingTemplate) return;

    /* Já está no array templates (preview). Aqui só persiste
       no banco e marca como salvo para o dropdown. */
    setCustomTemplates((current) => [...current, pendingTemplate]);

    if (userId) {
      const { error } = await supabase.from("custom_templates").insert({
        user_id: userId,
        name: pendingTemplate.name,
        data: pendingTemplate,
      });
      if (error) console.error("Erro ao salvar template:", error);
    }

    setPendingTemplate(null);
  }

  /* Descarta o template gerado e volta ao anterior. */
  function discardPendingTemplate() {
    if (!pendingTemplate) return;

    /* Remove o template do sistema antes de desfazer as mudanças. */
    const index = templates.findIndex((t) => t.id === pendingTemplate.id);
    if (index >= 0) templates.splice(index, 1);

    undoTemplateChange();
    setPendingTemplate(null);
  }

  async function saveCard() {
    setIsSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsSaving(false);
      alert("Usuário não autenticado.");
      return;
    }

    const currentUserId = user.id;

    if (hasInvalidLinks()) {
      setIsSaving(false);
      alert("Existem links inválidos. Corrija os campos antes de salvar.");
      return;
    }

    const { data: existingCard, error: findError } = await supabase
      .from("digital_cards")
      .select("id, slug")
      .eq("user_id", currentUserId)
      .maybeSingle();

    if (findError) {
      setIsSaving(false);
      console.error("Erro ao localizar cartão:", findError);
      alert("Não foi possível localizar seu cartão.");
      return;
    }

    const requestedSlug = normalizeSlug(
      customSlug || existingCard?.slug || generateSlug(name, job)
    );

    if (!requestedSlug) {
      setIsSaving(false);
      alert("Informe um endereço válido para o cartão.");
      return;
    }

    if (requestedSlug !== existingCard?.slug) {
      const { data: slugOwner, error: slugError } = await supabase
        .from("digital_cards")
        .select("id")
        .eq("slug", requestedSlug)
        .maybeSingle();

      if (slugError) {
        setIsSaving(false);
        console.error("Erro ao verificar URL:", slugError);
        alert("Não foi possível verificar a disponibilidade do endereço.");
        return;
      }

      /* Correção: comparação segura mesmo sem cartão existente. */
      if (slugOwner && (!existingCard || slugOwner.id !== existingCard.id)) {
        setIsSaving(false);
        alert("Este endereço já está em uso. Escolha outro.");
        return;
      }
    }

    const finalSlug = requestedSlug;
    setSlug(finalSlug);
    setCustomSlug(finalSlug);

    const cardData = {
      slug: finalSlug,
      user_id: currentUserId,
      name,
      job,
      location,
      primaryColor,
      primaryColorOpacity,
      photo,
      textColor,
      textNameColor,
      textJobColor,
      textLocationColor,
      nameFontSize,
      jobFontSize,
      locationFontSize,
      healthLabel,
      showPhoto,
      showBackground,
      usePrimaryColor,
      template,
      useTemplate,
      background,
      backgroundColor,
      backgroundMode,
      backgroundPosition,
      backgroundZoom,
      backgroundOverlay,
      backgroundBlur,
      position,
      zoom,
      photoSize,
      photoShape,
      photoBorderColor,
      usePhotoBorderColor,
      /* Links desativados não são publicados. */
      links: links.filter((link) => link.enabled && link.value?.trim()),
    };

    const { error } = existingCard
      ? await supabase
          .from("digital_cards")
          .update({
            slug: finalSlug,
            user_id: currentUserId,
            data: cardData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingCard.id)
      : await supabase.from("digital_cards").insert({
          slug: finalSlug,
          user_id: currentUserId,
          data: cardData,
          updated_at: new Date().toISOString(),
        });

    setIsSaving(false);

    if (error) {
      console.error("Erro ao salvar no Supabase:", error);
      alert(
        "Houve um erro ao salvar no Supabase. Tente novamente."
      );
      return;
    }

    alert("Alterações salvas com sucesso!");
  }

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0f1a] text-slate-300">
        <div className="flex flex-col items-center gap-4">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-sky-400/30 border-t-sky-400" />
          <p className="text-sm">Carregando editor…</p>
        </div>
      </div>
    );
  }

  const activeMeta = TAB_META[activeTab];
  const selectedTemplate = getTemplateById(template);
  const publicUrl = slug ? `${window.location.origin}/c/${slug}` : "";

  return (
    <main className="min-h-screen bg-[#0a0f1a] text-slate-100">
      <div className="flex min-h-screen">
        {/* ===================== SIDEBAR (desktop) ===================== */}
        <aside className="sticky top-0 hidden h-screen w-[288px] shrink-0 flex-col border-r border-white/[0.06] bg-gradient-to-b from-[#0d1522] to-[#0a111d] lg:flex">
          {/* Cabeçalho */}
          <div className="border-b border-white/[0.06] px-5 pb-5 pt-5">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Sair do editor
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-sky-950/50">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-white">
                  Editor do Cartão
                </h1>
                <p className="mt-0.5 text-xs text-slate-400">
                  Personalização em tempo real
                </p>
              </div>
            </div>
          </div>

          {/* Navegação */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {TABS.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                    active
                      ? "bg-white/[0.08] font-semibold text-white ring-1 ring-white/10"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-sky-400 to-blue-500" />
                  )}
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                      active
                        ? "bg-sky-400/15 text-sky-300"
                        : "bg-white/[0.05] text-slate-400 group-hover:text-slate-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Rodapé: salvar + publicação */}
          <div className="space-y-3 border-t border-white/[0.06] p-4">
            <button
              type="button"
              onClick={saveCard}
              disabled={isSaving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-950/40 transition hover:from-sky-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Salvando…" : "Salvar alterações"}
            </button>

            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] p-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <p className="text-xs font-semibold text-emerald-200">
                  Seu cartão está publicado
                </p>
              </div>

              <p
                className="mt-2 truncate font-mono text-[11px] leading-4 text-slate-400"
                title={publicUrl}
              >
                {publicUrl || "Salve o cartão para gerar o link"}
              </p>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={copyPublicUrl}
                  disabled={!publicUrl}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] px-2 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copiar link
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => window.open(publicUrl, "_blank")}
                  disabled={!publicUrl}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white px-2 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Abrir cartão
                </button>
              </div>

              {publicUrl && (
                <button
                  type="button"
                  onClick={() => setShowQRCode(true)}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs font-medium text-slate-200 transition hover:bg-white/[0.1]"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  Ver QR Code
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* ===================== MODAL QR CODE ===================== */}
        {showQRCode && publicUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#0d1622] p-6 shadow-2xl shadow-black/60">
              <button
                type="button"
                onClick={() => setShowQRCode(false)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-slate-300 transition hover:bg-white/[0.12] hover:text-white"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/15 text-sky-300">
                  <QrCode className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-white">
                    {name || "Meu cartão"}
                  </h3>
                  <p className="truncate font-mono text-[11px] text-slate-500">
                    {publicUrl}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <div className="rounded-2xl bg-white p-5 shadow-xl shadow-black/40">
                  <div id="qrcode-modal">
                    <QRCodeSVG value={publicUrl} size={220} />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={downloadQRCode}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-950/40 transition hover:from-sky-400 hover:to-blue-500"
              >
                Baixar QR Code
              </button>
              <button
                type="button"
                onClick={() => setShowQRCode(false)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.1]"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* ===================== TOPBAR (mobile) ===================== */}
        <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#0d1522]/95 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-slate-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar
          </button>
          <span className="text-sm font-semibold text-white">
            Editor do Cartão
          </span>
          <button
            type="button"
            onClick={saveCard}
            disabled={isSaving}
            className="rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
          >
            {isSaving ? "…" : "Salvar"}
          </button>
        </div>

        {/* Tabs (mobile) */}
        <nav className="fixed inset-x-0 top-14 z-30 flex gap-1.5 overflow-x-auto border-b border-white/[0.06] bg-[#0d1522]/95 px-3 py-2 backdrop-blur lg:hidden">
          {TABS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                  active
                    ? "bg-sky-400/15 text-sky-200 ring-1 ring-sky-400/30"
                    : "text-slate-400 hover:bg-white/[0.05]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* ===================== CONTEÚDO PRINCIPAL ===================== */}
        <section className="min-w-0 flex-1 bg-[#0a0f1a] pt-[112px] lg:pt-0">
          <div className="relative min-h-screen">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-sky-500/[0.07] blur-3xl" />
              <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-blue-600/[0.06] blur-3xl" />
            </div>

            <div className="relative z-10 flex min-h-screen flex-col">
              {/* Header */}
              <header className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-5 md:px-8">
                <div className="min-w-0">
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-sky-400/25 bg-sky-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-sky-300">
                    <Sparkles className="h-3 w-3" />
                    Editor
                  </div>
                  <h2 className="truncate text-xl font-bold tracking-tight text-white md:text-2xl">
                    Personalize seu cartão
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-400">
                    Altere os elementos e acompanhe o resultado
                    instantaneamente.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={saveCard}
                  disabled={isSaving}
                  className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.12] disabled:opacity-60 md:flex"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Salvando…" : "Salvar"}
                </button>
              </header>

              <div className="grid flex-1 xl:grid-cols-[minmax(440px,600px)_1fr]">                {/* ===================== PAINEL DE CONFIG ===================== */}
                <div className="border-b border-white/[0.06] bg-[#0c1420]/80 p-5 md:p-7 xl:border-b-0 xl:border-r xl:p-8">
                  <div className="mx-auto w-full max-w-[520px] xl:max-w-none"></div>
                  <div className="sticky top-[104px] z-20 -mx-5 mb-6 flex items-start justify-between gap-3 border-b border-white/[0.06] bg-[#0c1420]/95 px-5 py-4 backdrop-blur md:-mx-7 md:px-7 lg:top-0 xl:-mx-8 xl:px-8">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                        Configurações
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-white">
                        {activeMeta.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {activeMeta.description}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-slate-400">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                      Tempo real
                    </span>
                  </div>

                                  {/* ---------------------- ABA: ASSISTENTE IA ---------------------- */}
                  {activeTab === "ia" && (
                    <div className="space-y-4">
                      <div className="relative overflow-hidden rounded-2xl border border-violet-400/25 bg-gradient-to-br from-violet-500/15 via-fuchsia-500/10 to-transparent p-5">
                        <div className="pointer-events-none absolute -right-6 -top-6 opacity-15">
                          <Sparkles size={110} className="text-violet-300" />
                        </div>
                        <p className="text-sm font-semibold text-white">
                          Template exclusivo em segundos
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-300">
                          A IA analisa sua logo e seu ramo, cria cores, ícone e
                          tipografia sob medida. Você pré-visualiza antes de
                          decidir salvar.
                        </p>
                      </div>

                      <div className={panelCard}>
                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-violet-400/40 bg-violet-400/[0.06] px-4 py-3 text-sm font-semibold text-violet-200 transition hover:bg-violet-400/[0.12]">
                          <Upload className="h-4 w-4" />
                          {aiLogo ? "Logo enviada ✓" : "Enviar logo (opcional)"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onloadend = () =>
                                setAiLogo(reader.result as string);
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>

                        <input
                          value={aiProfession}
                          onChange={(e) => setAiProfession(e.target.value)}
                          placeholder="Ramo da profissão (ex.: studio de tatuagem)"
                          className={`${fieldClass} mt-3`}
                        />

                        <textarea
                          value={aiStyle}
                          onChange={(e) => setAiStyle(e.target.value)}
                          placeholder="Descreva o estilo desejado (opcional). Ex.: sombrio, minimalista, tipografia forte"
                          rows={3}
                          className={`${fieldClass} mt-3 resize-none`}
                        />

                        <button
                          type="button"
                          onClick={generateTemplateWithAI}
                          disabled={isGenerating || !!pendingTemplate}
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/40 transition hover:from-violet-400 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Sparkles className="h-4 w-4" />
                          {isGenerating
                            ? "Gerando template…"
                            : pendingTemplate
                              ? "Template gerado — veja o preview"
                              : "✨ Gerar meu template"}
                        </button>
                      </div>

                      {pendingTemplate && (
                        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/[0.07] p-5">
                          <p className="text-sm font-semibold text-amber-200">
                            Gostou do resultado no preview?
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-300">
                            &quot;{pendingTemplate.name}&quot; ficará salvo no dropdown
                            para reutilizar sempre.
                          </p>
                          <div className="mt-4 flex gap-2">
                            <button
                              type="button"
                              onClick={savePendingTemplate}
                              className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-950/30 transition hover:from-emerald-400 hover:to-teal-500"
                            >
                              💾 Salvar modelo
                            </button>
                            <button
                              type="button"
                              onClick={discardPendingTemplate}
                              className="flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.1]"
                            >
                              🗑 Descartar
                            </button>
                          </div>
                        </div>
                      )}

                      {templateSnapshot && !pendingTemplate && (
                        <button
                          type="button"
                          onClick={undoTemplateChange}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.1]"
                        >
                          ↩ Desfazer último template
                        </button>
                      )}
                    </div>
                  )}

                  {/* ---------------------- ABA: MODELO ---------------------- */}
                  {activeTab === "templates" && (
                    <div className="space-y-4">
                      <div className={panelCard}>
                        <label className={panelTitle}>Template</label>
                        <p className={panelHint}>
                          A base visual define cores, formato da foto e estilo
                          dos botões.
                        </p>

                        <div className="relative mt-4" data-template-dropdown>
                          <button
                            type="button"
                            onClick={() =>
                              setTemplateDropdownOpen((v) => !v)
                            }
                            className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                              templateDropdownOpen
                                ? "border-sky-400/60 bg-white/[0.08] ring-4 ring-sky-400/10"
                                : "border-white/10 bg-white/[0.04] hover:border-white/25"
                            }`}
                          >
                            {(() => {
                              const thumb =
                                selectedTemplate.background.type ===
                                "gradient"
                                  ? selectedTemplate.background.value
                                  : `url(${selectedTemplate.background.value})`;
                              return (
                                <>
                                  <div
                                    className="h-11 w-12 shrink-0 rounded-lg border border-white/20 bg-cover bg-center"
                                    style={{ backgroundImage: thumb }}
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-white">
                                      {selectedTemplate.name}
                                    </p>
                                    <p className="mt-0.5 text-xs capitalize text-slate-400">
                                      {selectedTemplate.category}
                                    </p>
                                  </div>
                                  <ChevronDown
                                    className={`h-4 w-4 text-slate-400 transition ${
                                      templateDropdownOpen
                                        ? "rotate-180"
                                        : ""
                                    }`}
                                  />
                                </>
                              );
                            })()}
                          </button>

                          {templateDropdownOpen && (
                            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[360px] overflow-y-auto rounded-xl border border-white/10 bg-[#131d2e] p-1.5 shadow-2xl shadow-black/50">
                              {[
                              ...templates,
                              ...customTemplates,
                            ]
                              .filter(
                                (item, index, all) =>
                                  all.findIndex((x) => x.id === item.id) ===
                                  index
                              )
                              .map((item) => {
                                const thumb =
                                  item.background.type === "gradient"
                                    ? item.background.value
                                    : `url(${item.background.value})`;
                                const isSelected = template === item.id;
                                return (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                      const t = getTemplateById(item.id);
                                      setTemplate(t.id);
                                      setUseTemplate(true);
                                      setPrimaryColor(t.defaults.primaryColor);
                                      setTextNameColor(
                                        t.defaults.textNameColor
                                      );
                                      setTextJobColor(
                                        t.defaults.textJobColor
                                      );
                                      setTextLocationColor(
                                        t.defaults.textLocationColor
                                      );
                                      setTextColor(
                                        t.defaults.textNameColor
                                      );
                                      setPrimaryColorOpacity(
                                        t.defaults.primaryColorOpacity
                                      );
                                      setUsePrimaryColor(
                                        t.defaults.usePrimaryColor
                                      );
                                      setBackgroundOverlay(
                                        t.defaults.backgroundOverlay
                                      );
                                      setShowPhoto(t.defaults.showPhoto);
                                      setShowBackground(
                                        t.defaults.showBackground
                                      );
                                      setBackgroundBlur(
                                        t.defaults.backgroundBlur ?? 8
                                      );
                                      setBackgroundMode("template");

                                      /* Volta para o padrão de foto do
                                         template selecionado. */
                                      const photoDefaults =
                                        getPhotoDefaults(t.id);
                                      setPhotoSize(photoDefaults.size);
                                      setPhotoShape(photoDefaults.shape);
                                      setUsePhotoBorderColor(false);
                                      setPhotoBorderColor("");

                                      setTemplateDropdownOpen(false);
                                    }}
                                    className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition ${
                                      isSelected
                                        ? "bg-sky-400/15 ring-1 ring-sky-400/40"
                                        : "hover:bg-white/[0.06]"
                                    }`}
                                  >
                                    <div
                                      className="h-10 w-11 shrink-0 rounded-lg border border-white/15 bg-cover bg-center"
                                      style={{ backgroundImage: thumb }}
                                    />
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-sm font-semibold text-white">
                                        {item.name}
                                      </p>
                                      <p className="truncate text-xs capitalize text-slate-400">
                                        {item.category}
                                      </p>
                                    </div>
                                    {isSelected && (
                                      <Check className="h-4 w-4 text-sky-300" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <p className="mt-4 text-sm leading-5 text-slate-400">
                          {selectedTemplate.description}
                        </p>
                      </div>

                      <label
                        className={`${panelCard} flex cursor-pointer items-center justify-between`}
                      >
                        <div>
                          <p className={panelTitle}>Ativar modelo</p>
                          <p className={panelHint}>
                            Usa o estilo visual do template selecionado.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={useTemplate}
                          onChange={(e) => setUseTemplate(e.target.checked)}
                          className="h-5 w-5 accent-sky-500"
                        />
                      </label>
                    </div>
                  )}
                  {/* ---------------------- ABA: PERFIL ---------------------- */}
                  {activeTab === "dados" && (
                    <div className="space-y-4">
                      <div className={panelCard}>
                        <div className="space-y-4">
                          <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Nome
                            </label>
                            <input
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className={fieldClass}
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Profissão / Cargo
                            </label>
                            <input
                              value={job}
                              onChange={(e) => setJob(e.target.value)}
                              className={fieldClass}
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Localização
                            </label>
                            <input
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                              className={fieldClass}
                            />
                          </div>
                          {template === "medico" && (
                            <div>
                              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Texto de identificação
                              </label>
                              <input
                                value={healthLabel}
                                onChange={(e) =>
                                  setHealthLabel(e.target.value)
                                }
                                placeholder="Profissional de saúde"
                                className={fieldClass}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className={panelCard}>
                        <label className={panelTitle}>
                          Endereço do cartão
                        </label>
                        <p className={panelHint}>
                          Link público onde seu cartão fica disponível.
                        </p>
                        <div className="mt-3 flex items-center rounded-xl border border-white/10 bg-white/[0.04] transition focus-within:border-sky-400/60 focus-within:ring-4 focus-within:ring-sky-400/10">
                          <span className="pl-4 font-mono text-sm text-slate-500">
                            /c/
                          </span>
                          <input
                            value={customSlug}
                            onChange={(e) => {
                              const value = normalizeSlug(e.target.value);
                              setCustomSlug(value);
                              setSlugStatus("");
                            }}
                            placeholder="meu-cartao"
                            className="w-full bg-transparent px-2 py-3 font-mono text-sm text-white outline-none placeholder:text-slate-600"
                          />
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          Exemplo: /c/sil-bonecas-de-pano
                        </p>
                        {slugStatus && (
                          <p className="mt-2 text-xs text-slate-300">
                            {slugStatus}
                          </p>
                        )}
                      </div>

                      <div className={panelCard}>
                        <p className={panelTitle}>Foto de perfil</p>
                        <p className={panelHint}>
                          Envie uma nova foto ou mantenha a atual.
                        </p>

                        <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-sky-400/40 bg-sky-400/[0.06] px-4 py-4 text-sm font-semibold text-sky-200 transition hover:bg-sky-400/[0.12]">
                          <Upload className="h-4 w-4" />
                          Trocar foto do perfil
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setSelectedPhoto(reader.result as string);
                                setShowCropper(true);
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>

                        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] text-slate-300">
                              <Camera className="h-4 w-4" />
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-white">
                                Manter foto do perfil
                              </p>
                              <p className="mt-0.5 text-xs text-slate-400">
                                Exibir a foto atualmente salva.
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={showPhoto}
                            onClick={() => setShowPhoto((v) => !v)}
                            className={`relative h-7 w-12 rounded-full transition ${
                              showPhoto
                                ? "bg-gradient-to-r from-sky-500 to-blue-600"
                                : "bg-white/15"
                            }`}
                          >
                            <span
                              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                                showPhoto ? "left-6" : "left-1"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <div className={panelCard}>
                        <p className={panelTitle}>Tamanho das letras</p>
                        <p className={panelHint}>
                          Ajuste cada elemento independentemente.
                        </p>

                        <label className="mt-4 block">
                          <span className="mb-2 flex justify-between text-xs">
                            <span className="text-slate-300">Tamanho</span>
                            <span className="font-mono text-slate-500">
                              {photoSize}px
                            </span>
                          </span>
                          <input
                            type="range"
                            min={64}
                            max={160}
                            step={4}
                            value={photoSize}
                            onChange={(e) => setPhotoSize(Number(e.target.value))}
                            className="w-full accent-sky-500"
                          />
                        </label>

                        <div className="mt-4 grid grid-cols-3 gap-2">
                          {[
                            { value: "square", label: "Quadrado", preview: "rounded-none" },
                            { value: "rounded", label: "Arredondado", preview: "rounded-xl" },
                            { value: "circle", label: "Redondo", preview: "rounded-full" },
                          ].map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                setPhotoShape(option.value as typeof photoShape)
                              }
                              className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-3 text-xs font-semibold transition ${
                                photoShape === option.value
                                  ? "border-sky-400/60 bg-sky-400/15 text-sky-200"
                                  : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
                              }`}
                            >
                              <span
                                className={`h-7 w-7 border-2 border-current ${option.preview}`}
                              />
                              {option.label}
                            </button>
                          ))}
                        </div>

                        <label className="mt-4 flex cursor-pointer items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold">Cor da borda</p>
                            <p className="mt-0.5 text-xs text-slate-400">
                              Padrão: cor definida pelo template.
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={usePhotoBorderColor}
                            onChange={(e) =>
                              setUsePhotoBorderColor(e.target.checked)
                            }
                            className="h-5 w-5 accent-sky-500"
                          />
                        </label>

                        {usePhotoBorderColor && (
                          <div className="mt-3 flex gap-3">
                            <input
                              type="color"
                              value={photoBorderColor || "#FFFFFF"}
                              onChange={(e) => setPhotoBorderColor(e.target.value)}
                              className="h-11 w-14 cursor-pointer rounded-lg border border-white/10 bg-transparent"
                            />
                            <input
                              value={photoBorderColor}
                              onChange={(e) => setPhotoBorderColor(e.target.value)}
                              placeholder="#FFFFFF"
                              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 font-mono text-sm text-white outline-none focus:border-sky-400/60"
                            />
                          </div>
                        )}
                      </div>

                      <div className={panelCard}>
                        <p className={panelTitle}>Tamanho das letras</p>
                        <div className="mt-4 space-y-4">
                          {[
                            {
                              label: "Nome",
                              value: nameFontSize,
                              setValue: setNameFontSize,
                              min: 18,
                              max: 48,
                            },
                            {
                              label: "Profissão / cargo",
                              value: jobFontSize,
                              setValue: setJobFontSize,
                              min: 10,
                              max: 32,
                            },
                            {
                              label: "Localização",
                              value: locationFontSize,
                              setValue: setLocationFontSize,
                              min: 9,
                              max: 28,
                            },
                          ].map((item) => (
                            <label key={item.label} className="block">
                              <span className="mb-2 flex justify-between text-xs">
                                <span className="text-slate-300">
                                  {item.label}
                                </span>
                                <span className="font-mono text-slate-500">
                                  {item.value}px
                                </span>
                              </span>
                              <input
                                type="range"
                                min={item.min}
                                max={item.max}
                                value={item.value}
                                onChange={(e) =>
                                  item.setValue(Number(e.target.value))
                                }
                                className="w-full accent-sky-500"
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ---------------------- ABA: LINKS ---------------------- */}
                  {activeTab === "links" && (
                    <div className="space-y-4">
                      <p className="text-sm leading-6 text-slate-400">
                        Gerencie WhatsApp, redes sociais, produtos, Pix, Wi-Fi
                        e outros links. Links desativados não aparecem no
                        cartão publicado.
                      </p>

                      <div className="max-h-[62vh] space-y-3 overflow-y-auto pr-1">
                        {links.map((link, index) => {
                          const linkError = validateLink(link.type, link.value);
                          const showError =
                            dirtyLinks[link.id] && linkError !== "";

                          return (
                            <div
                              key={link.id}
                              className={`rounded-2xl border bg-white/[0.03] p-4 transition ${
                                link.enabled
                                  ? "border-white/[0.07]"
                                  : "border-white/[0.05] opacity-60"
                              }`}
                            >
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
                                  {link.name}
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => moveLink(index, "up")}
                                    disabled={index === 0}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-30"
                                    title="Mover para cima"
                                  >
                                    <ArrowUp className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveLink(index, "down")}
                                    disabled={index === links.length - 1}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-30"
                                    title="Mover para baixo"
                                  >
                                    <ArrowDown className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    role="switch"
                                    aria-checked={link.enabled}
                                    title={
                                      link.enabled
                                        ? "Desativar link"
                                        : "Ativar link"
                                    }
                                    onClick={() =>
                                      updateLink(index, {
                                        enabled: !link.enabled,
                                      })
                                    }
                                    className={`relative ml-1 h-6 w-10 rounded-full transition ${
                                      link.enabled
                                        ? "bg-gradient-to-r from-sky-500 to-blue-600"
                                        : "bg-white/15"
                                    }`}
                                  >
                                    <span
                                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                                        link.enabled ? "left-5" : "left-0.5"
                                      }`}
                                    />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setLinks((current) =>
                                        current.filter((_, i) => i !== index)
                                      )
                                    }
                                    className="ml-1 text-xs text-red-300 transition hover:text-red-200"
                                  >
                                    Remover
                                  </button>
                                </div>
                              </div>

                              <select
                                value={link.type}
                                onChange={(e) => {
                                  const selectedType = linkTypes.find(
                                    (t) => t.type === e.target.value
                                  );
                                  updateLink(index, {
                                    type: e.target.value,
                                    name:
                                      selectedType?.name || link.name,
                                    value:
                                      e.target.value === "custom"
                                        ? ""
                                        : link.value,
                                  });
                                }}
                                className="mb-3 w-full rounded-xl border border-white/10 bg-[#131d2e] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/60"
                              >
                                {linkTypes.map((type) => (
                                  <option key={type.type} value={type.type}>
                                    {type.name}
                                  </option>
                                ))}
                              </select>

                              {link.type === "custom" && (
                                <input
                                  value={link.name}
                                  onChange={(e) =>
                                    updateLink(index, {
                                      name: e.target.value,
                                    })
                                  }
                                  placeholder="Nome do link"
                                  className={`${fieldClass} mb-3`}
                                />
                              )}

                              <input
                                value={link.value}
                                onChange={(e) => {
                                  updateLink(index, {
                                    value: e.target.value,
                                  });
                                  markLinkDirty(link.id);
                                }}
                                placeholder="Digite o valor do link"
                                className={`${fieldClass} ${
                                  showError
                                    ? "border-red-400/50 focus:border-red-400/60 focus:ring-red-400/10"
                                    : ""
                                }`}
                              />

                              {showError && (
                                <p className="mt-2 text-xs text-red-300">
                                  {linkError}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setLinks((c) => [
                            ...c,
                            {
                              id: `link-${Date.now()}-${Math.random()
                                .toString(36)
                                .slice(2)}`,
                              type: "custom",
                              name: "Novo link",
                              value: "",
                              enabled: true,
                            },
                          ])
                        }
                        className="w-full rounded-xl border border-dashed border-sky-400/40 bg-sky-400/[0.05] py-3 text-sm font-semibold text-sky-200 transition hover:bg-sky-400/[0.12]"
                      >
                        + Adicionar link
                      </button>
                    </div>
                  )}

                  {/* ---------------------- ABA: FUNDO ---------------------- */}
                  {activeTab === "fundo" && (
                    <div className="space-y-4">
                      <div
                        className={`${panelCard} flex items-center justify-between`}
                      >
                        <div>
                          <p className={panelTitle}>Mostrar fundo</p>
                          <p className={panelHint}>
                            Ativar a camada de fundo.
                          </p>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={showBackground}
                          onClick={() => setShowBackground((v) => !v)}
                          className={`relative h-7 w-12 rounded-full transition ${
                            showBackground
                              ? "bg-gradient-to-r from-sky-500 to-blue-600"
                              : "bg-white/15"
                          }`}
                        >
                          <span
                            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                              showBackground ? "left-6" : "left-1"
                            }`}
                          />
                        </button>
                      </div>

                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-sky-400/40 bg-sky-400/[0.06] px-4 py-4 text-sm font-semibold text-sky-200 transition hover:bg-sky-400/[0.12]">
                        <Upload className="h-4 w-4" />
                        Trocar imagem de fundo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              const optimized = await optimizeBackgroundImage(
                                reader.result as string
                              );
                              setBackground(optimized);
                              setBackgroundMode("image");
                              setShowBackground(true);
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>

                      <div className={panelCard}>
                        <p className={panelTitle}>Tipo de fundo</p>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {[
                            { value: "template", label: "Modelo" },
                            { value: "image", label: "Imagem" },
                            { value: "color", label: "Cor" },
                          ].map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                setBackgroundMode(
                                  option.value as
                                    | "template"
                                    | "image"
                                    | "color"
                                )
                              }
                              className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                                backgroundMode === option.value
                                  ? "border-sky-400/60 bg-sky-400/15 text-sky-200"
                                  : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>

                        {backgroundMode === "color" && (
                          <div className="mt-4 flex gap-3">
                            <input
                              type="color"
                              value={backgroundColor}
                              onChange={(e) =>
                                setBackgroundColor(e.target.value)
                              }
                              className="h-11 w-14 cursor-pointer rounded-lg border border-white/10 bg-transparent"
                            />
                            <input
                              value={backgroundColor}
                              onChange={(e) =>
                                setBackgroundColor(e.target.value)
                              }
                              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 font-mono text-sm text-white outline-none focus:border-sky-400/60"
                            />
                          </div>
                        )}
                      </div>

                      {[
                        {
                          label: "Desfoque do fundo",
                          display: `${backgroundBlur}px`,
                          hint: "0px = nítido · 20px = máximo",
                          min: 0,
                          max: 20,
                          step: 1,
                          value: backgroundBlur,
                          onChange: setBackgroundBlur,
                        },
                        {
                          label: "Zoom do fundo",
                          display: `${backgroundZoom.toFixed(1)}x`,
                          hint: null,
                          min: 1,
                          max: 3,
                          step: 0.1,
                          value: backgroundZoom,
                          onChange: setBackgroundZoom,
                        },
                        {
                          label: "Escurecimento",
                          display: `${backgroundOverlay}%`,
                          hint: null,
                          min: 0,
                          max: 100,
                          step: 5,
                          value: backgroundOverlay,
                          onChange: setBackgroundOverlay,
                        },
                      ].map((item) => (
                        <label key={item.label} className={`${panelCard} block`}>
                          <span className="mb-3 flex justify-between text-sm font-semibold">
                            <span>{item.label}</span>
                            <span className="font-mono text-xs text-slate-400">
                              {item.display}
                            </span>
                          </span>
                          <input
                            type="range"
                            min={item.min}
                            max={item.max}
                            step={item.step}
                            value={item.value}
                            onChange={(e) =>
                              item.onChange(Number(e.target.value))
                            }
                            className="w-full accent-sky-500"
                          />
                          {item.hint && (
                            <span className="mt-2 block text-xs text-slate-500">
                              {item.hint}
                            </span>
                          )}
                        </label>
                      ))}

                      <div className={panelCard}>
                        <p className={panelTitle}>Posição da imagem</p>
                        <p className={panelHint}>
                          Ou arraste o fundo diretamente na pré-visualização.
                        </p>
                        {backgroundZoom <= 1 && (
                          <p className="mt-2 text-xs text-amber-300/80">
                            Amplie o zoom do fundo para movê-lo.
                          </p>
                        )}
                        <div className="mt-4 space-y-4">
                          {[
                            {
                              label: "Posição X",
                              value: backgroundPosition.x,
                              setter: (v: number) =>
                                setBackgroundPosition((p) => ({
                                  ...p,
                                  x: v,
                                })),
                            },
                            {
                              label: "Posição Y",
                              value: backgroundPosition.y,
                              setter: (v: number) =>
                                setBackgroundPosition((p) => ({
                                  ...p,
                                  y: v,
                                })),
                            },
                          ].map((item) => (
                            <label key={item.label} className="block">
                              <span className="mb-2 flex justify-between text-xs text-slate-300">
                                <span>{item.label}</span>
                                <span className="font-mono text-slate-500">
                                  {item.value}px
                                </span>
                              </span>
                              <input
                                type="range"
                                min={-Math.round(
                                  ((backgroundZoom - 1) / 2) * 330
                                )}
                                max={Math.round(
                                  ((backgroundZoom - 1) / 2) * 330
                                )}
                                value={item.value}
                                onChange={(e) =>
                                  item.setter(Number(e.target.value))
                                }
                                className="w-full accent-sky-500"
                                disabled={backgroundZoom <= 1}
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ---------------------- ABA: ESTILO ---------------------- */}
                  {activeTab === "cores" && (
                    <div className="space-y-4">
                      {[
                        {
                          label: "Cor principal",
                          value: primaryColor,
                          setter: setPrimaryColor,
                        },
                        {
                          label: "Cor do nome",
                          value: textNameColor,
                          setter: setTextNameColor,
                        },
                        {
                          label: "Cor da profissão",
                          value: textJobColor,
                          setter: setTextJobColor,
                        },
                        {
                          label: "Cor da localização",
                          value: textLocationColor,
                          setter: setTextLocationColor,
                        },
                        {
                          label: "Cor geral",
                          value: textColor,
                          setter: setTextColor,
                        },
                      ].map((item) => (
                        <div key={item.label} className={panelCard}>
                          <label className="mb-3 block text-sm font-semibold">
                            {item.label}
                          </label>
                          <div className="flex gap-3">
                            <input
                              type="color"
                              value={item.value}
                              onChange={(e) => item.setter(e.target.value)}
                              className="h-11 w-14 cursor-pointer rounded-lg border border-white/10 bg-transparent"
                            />
                            <input
                              value={item.value}
                              onChange={(e) => item.setter(e.target.value)}
                              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 font-mono text-sm text-white outline-none focus:border-sky-400/60"
                            />
                          </div>
                        </div>
                      ))}

                      <label
                        className={`${panelCard} flex cursor-pointer items-center justify-between`}
                      >
                        <span className="text-sm font-semibold">
                          Usar cor principal nos botões
                        </span>
                        <input
                          type="checkbox"
                          checked={usePrimaryColor}
                          onChange={(e) =>
                            setUsePrimaryColor(e.target.checked)
                          }
                          className="h-5 w-5 accent-sky-500"
                        />
                      </label>

                      <label className={`${panelCard} block`}>
                        <span className="mb-2 flex justify-between text-sm font-semibold">
                          <span>Transparência dos botões</span>
                          <span className="font-mono text-xs text-slate-400">
                            {primaryColorOpacity}%
                          </span>
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          value={primaryColorOpacity}
                          onChange={(e) =>
                            setPrimaryColorOpacity(Number(e.target.value))
                          }
                          className="w-full accent-sky-500"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* ===================== PRÉ-VISUALIZAÇÃO ===================== */}
                                <div className="relative flex min-h-[900px] flex-col items-center justify-center overflow-hidden p-6 md:p-10 xl:p-12 xl:sticky xl:top-0 xl:h-screen">
                  <div className="absolute left-6 top-6 hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-slate-300 md:flex">
                    <Eye className="h-3.5 w-3.5 text-sky-300" />
                    Pré-visualização ao vivo
                  </div>

                  <div className="mb-7 text-center xl:hidden">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300">
                      Preview
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-white">
                      {selectedTemplate.name}
                    </h3>
                  </div>

                  <div className="relative mx-auto flex w-full max-w-[780px] items-center justify-center">
                    <div className="pointer-events-none absolute h-[680px] w-[420px] rounded-full bg-sky-400/10 blur-3xl" />

                    {/* Mockup de celular */}
                    <div className="relative h-[680px] w-[350px] max-w-[80vw] rounded-[3.2rem] border-[10px] border-[#05070c] bg-[#05070c] shadow-[0_40px_100px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
                      <div className="pointer-events-none absolute left-1/2 top-2.5 z-30 h-6 w-24 -translate-x-1/2 rounded-full bg-black shadow-md" />
                      <div className="pointer-events-none absolute -left-[15px] top-32 h-16 w-[4px] rounded-full bg-[#1a2230]" />
                      <div className="pointer-events-none absolute -left-[15px] top-52 h-20 w-[4px] rounded-full bg-[#1a2230]" />
                      <div className="pointer-events-none absolute -right-[15px] top-40 h-24 w-[4px] rounded-full bg-[#1a2230]" />

                      <div className="relative h-full w-full overflow-hidden rounded-[2.6rem] bg-black">
                        <DigitalCard
                          slug={slug}
                          name={name}
                          job={job}
                          location={location}
                          photo={photo}
                          background={background}
                          backgroundColor={backgroundColor}
                          backgroundMode={backgroundMode}
                          links={links}
                          backgroundPosition={backgroundPosition}
                          backgroundZoom={backgroundZoom}
                          backgroundOverlay={backgroundOverlay}
                          backgroundBlur={backgroundBlur}
                          template={template}
                          onBackgroundPointerDown={
                            handleBackgroundPointerDown
                          }
                          onBackgroundPointerMove={
                            handleBackgroundPointerMove
                          }
                          onBackgroundPointerUp={handleBackgroundPointerUp}
                          isEditing={true}
                          usePrimaryColor={usePrimaryColor}
                          primaryColor={primaryColor}
                          textColor={textColor}
                          primaryColorOpacity={primaryColorOpacity}
                          useTemplate={useTemplate}
                          textNameColor={textNameColor}
                          textJobColor={textJobColor}
                          textLocationColor={textLocationColor}
                          nameFontSize={nameFontSize}
                          jobFontSize={jobFontSize}
                          locationFontSize={locationFontSize}
                          showPhoto={showPhoto}
                          showBackground={showBackground}
                          photoSize={photoSize}
                          photoShape={photoShape}
                          photoBorderColor={
                            usePhotoBorderColor ? photoBorderColor : undefined
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 hidden max-w-xl items-center justify-center gap-6 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-6 py-4 text-xs text-slate-400 md:flex">
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-sky-300" />
                      Alterações em tempo real
                    </span>
                    <span className="h-4 w-px bg-white/10" />
                    <span>Arraste o fundo para reposicionar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ===================== MODAL CROP DE FOTO ===================== */}
      {showCropper && selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0d1622] p-6 shadow-2xl shadow-black/60">
            <h2 className="text-xl font-bold text-white">Ajustar foto</h2>
            <p className="mb-5 mt-1 text-sm text-slate-400">
              Posicione a foto como deseja no cartão.
            </p>

            <div className="flex justify-center">
              <div
                className="relative h-64 w-64 cursor-grab touch-none overflow-hidden rounded-full border-4 border-white/10 bg-black/20 active:cursor-grabbing"
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  setIsDragging(true);
                  setDragStart({
                    x: e.clientX - position.x,
                    y: e.clientY - position.y,
                  });
                }}
                onPointerMove={(e) => {
                  if (!isDragging) return;
                  setPosition({
                    x: e.clientX - dragStart.x,
                    y: e.clientY - dragStart.y,
                  });
                }}
                onPointerUp={(e) => {
                  if (e.currentTarget.hasPointerCapture(e.pointerId))
                    e.currentTarget.releasePointerCapture(e.pointerId);
                  setIsDragging(false);
                }}
                onPointerCancel={() => setIsDragging(false)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedPhoto}
                  alt="Prévia da foto"
                  draggable={false}
                  className="absolute left-1/2 top-1/2 h-full w-full select-none object-contain"
                  style={{
                    transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  }}
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-2 flex justify-between text-sm font-semibold">
                <span>Zoom</span>
                <span className="font-mono text-xs text-slate-400">
                  {zoom.toFixed(1)}x
                </span>
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCropper(false);
                  setSelectedPhoto(null);
                }}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.05] py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.1]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={cropImage}
                className="flex-1 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-950/40 transition hover:from-sky-400 hover:to-blue-500"
              >
                Usar foto
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}