"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState, type PointerEvent } from "react";
import DigitalCard from "../components/DigitalCard";
import { templates, getTemplateById } from "../data/templates";
import { ArrowLeft, ArrowDown, ArrowUp, Camera, Check, ChevronDown, Eye, Image as ImageIcon, LayoutTemplate, Link2, Palette, Save, Sparkles, Upload, UserRound } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";


export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("templates");
  const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false);

  const [name, setName] = useState("João Henrique");
  const [job, setJob] = useState("Diretor Comercial");
  const [location, setLocation] = useState("Cidade - UF");
  const [slug,setSlug]=useState("");
  const [customSlug,setCustomSlug]=useState("");
  const [slugStatus,setSlugStatus]=useState("");
  const [publicUrl,setPublicUrl]=useState("");
  const [userId,setUserId]=useState("");
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(()=>{supabase.auth.getUser().then(({data})=>{if(!data.user){window.location.href="/login";return;}setUserId(data.user.id);setAuthChecking(false);});},[]);
  useEffect(() => { if (slug) setPublicUrl(`${window.location.origin}/c/${slug}`); }, [slug]);
  useEffect(()=>{const value=normalizeSlug(customSlug);if(!value){setSlugStatus("");return;}const timer=setTimeout(async()=>{const{data,error}=await supabase.from("digital_cards").select("id,slug").eq("slug",value).maybeSingle();if(error){setSlugStatus("⚠️ Não foi possível verificar.");return;}if(data&&value!==slug){setSlugStatus("❌ Este endereço já está em uso.");}else{setSlugStatus("✅ Este endereço está disponível.");}},500);return()=>clearTimeout(timer);},[customSlug,slug]);

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

  const [showPhoto, setShowPhoto] = useState(true);
  const [showBackground, setShowBackground] = useState(true);

  const [photo, setPhoto] = useState("/images/perfil.jpg");
  const [background, setBackground] = useState("/images/fundo.jpg");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [backgroundMode, setBackgroundMode] = useState<"template" | "image" | "color">("template");

  const [template, setTemplate] = useState("rosa");
  const [useTemplate, setUseTemplate] = useState(true);

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

  function handleBackgroundPointerDown(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDraggingBackground(true);

    setBackgroundDragStart({
      x: e.clientX - backgroundPosition.x,
      y: e.clientY - backgroundPosition.y,
    });
  }

  function handleBackgroundPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!isDraggingBackground) {
      return;
    }

    const newX = e.clientX - backgroundDragStart.x;
    const newY = e.clientY - backgroundDragStart.y;

    setBackgroundPosition({
      x: newX,
      y: newY,
    });
  }

  function handleBackgroundPointerUp(e: PointerEvent<HTMLDivElement>) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    setIsDraggingBackground(false);
  }

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [zoom, setZoom] = useState(1);

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0,
  });

  const [links, setLinks] = useState([
    {
      id: "link-whatsapp",
      type: "whatsapp",
      name: "WhatsApp",
      value: "+55",
      enabled:true
    },
    {
      id: "link-instagram",
      type: "instagram",
      name: "Instagram",
      value: "https://instagram.com/",
      enabled:true
    },
    {
      id: "link-linkedin",
      type: "linkedin",
      name: "LinkedIn",
      value: "https://linkedin.com/",
      enabled:true
    },
  ]);

  useEffect(()=>{supabase.auth.getUser().then(async({data:{user}})=>{if(!user){window.location.href="/login";return;}setUserId(user.id);const{data:card,error}=await supabase.from("digital_cards").select("data,slug").eq("user_id",user.id).maybeSingle();if(error){console.error("Erro ao carregar cartão:",error);return;}if(!card)return;const cardData=card.data||{};setSlug(card.slug||"");setCustomSlug(card.slug||"");setName(cardData.name||"");setJob(cardData.job||"");setLocation(cardData.location||"");setPrimaryColor(cardData.primaryColor||"#111827");setPrimaryColorOpacity(cardData.primaryColorOpacity??60);setTextColor(cardData.textColor||"#FFFFFF");setTextNameColor(cardData.textNameColor||"#FFFFFF");setTextJobColor(cardData.textJobColor||"#FFFFFF");setTextLocationColor(cardData.textLocationColor||"#FFFFFF");setNameFontSize(cardData.nameFontSize??30);setJobFontSize(cardData.jobFontSize??16);setLocationFontSize(cardData.locationFontSize??14);setHealthLabel(cardData.healthLabel||"Profissional de saúde");setShowPhoto(cardData.showPhoto??true);setShowBackground(cardData.showBackground??true);setUsePrimaryColor(cardData.usePrimaryColor??false);setTemplate(cardData.template||"rosa");setUseTemplate(cardData.useTemplate??true);setPhoto(cardData.photo||"/images/perfil.jpg");setBackground(cardData.background||"/images/fundo.jpg");setBackgroundColor(cardData.backgroundColor||"#FFFFFF");setBackgroundMode(cardData.backgroundMode||"template");setBackgroundPosition(cardData.backgroundPosition||{x:0,y:0});setBackgroundZoom(cardData.backgroundZoom??1);setBackgroundOverlay(cardData.backgroundOverlay??40);setBackgroundBlur(cardData.backgroundBlur??8);setPosition(cardData.position||{x:0,y:0});setZoom(cardData.zoom??1);setLinks((cardData.links||[]).map((link:any,index:number)=>({...link,id:link.id||`link-${index}-${Date.now()}`})));}).catch(error=>console.error("Erro ao carregar usuário:",error));},[]);

  const linkTypes = [
    { name: "WhatsApp", type: "whatsapp" },
    { name: "Instagram", type: "instagram" },
    { name: "LinkedIn", type: "linkedin" },
    { name: "YouTube", type: "youtube" },
    { name: "Site", type: "website" },
    { name: "E-mail", type: "email" },
    { name: "Telefone", type: "phone" },
    { name: "Localização", type: "location" },
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

      // Links são opcionais. Um link vazio não deve impedir o salvamento.
      if (!value) {
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

  function optimizeBackgroundImage(dataUrl: string): Promise<string> {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        const maxSize = 1600;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
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
    if (!selectedPhoto) {
      return;
    }

    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 512;

      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        return;
      }

      const baseScale = Math.min(
        size / image.width,
        size / image.height
      );

      const finalScale = baseScale * zoom;

      const width = image.width * finalScale;
      const height = image.height * finalScale;

      const x = (size - width) / 2 + position.x * 2;
      const y = (size - height) / 2 + position.y * 2;

      ctx.clearRect(0, 0, size, size);

      ctx.drawImage(
        image,
        x,
        y,
        width,
        height
      );

      const croppedImage = canvas.toDataURL("image/jpeg", 0.9);

      setPhoto(croppedImage);
      setShowCropper(false);
      setSelectedPhoto(null);

      setZoom(1);
      setPosition({
        x: 0,
        y: 0,
      });
    };

    image.src = selectedPhoto;
  }
    function generateSlug(name:string,job:string){return `${name}-${job}`.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");}

    function normalizeSlug(value:string){return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");}

    async function handleLogout(){await supabase.auth.signOut();window.location.href="/login";}

    async function saveCard() {
        const { data: { user } } = await supabase.auth.getUser(); if (!user) { alert("Usuário não autenticado."); return; } const currentUserId = user.id; const { data: { session } } = await supabase.auth.getSession(); console.log("SESSÃO:", !!session, "USER DA SESSÃO:", session?.user?.id);
        if (hasInvalidLinks()) {
            alert("Existem links inválidos. Corrija os campos antes de salvar.");
            return;
        }
        
        const { data: existingCard, error: findError } = await supabase.from("digital_cards").select("id, slug").eq("user_id", currentUserId).maybeSingle(); if (findError) { console.error("Erro ao localizar cartão:", findError); alert("Não foi possível localizar seu cartão."); return; } const requestedSlug=normalizeSlug(customSlug||existingCard?.slug||generateSlug(name,job));if(!requestedSlug){alert("Informe um endereço válido para o cartão.");return;}if(requestedSlug!==existingCard?.slug){const{data:slugOwner,error:slugError}=await supabase.from("digital_cards").select("id").eq("slug",requestedSlug).maybeSingle();if(slugError){console.error("Erro ao verificar URL:",slugError);alert("Não foi possível verificar a disponibilidade do endereço.");return;}if(slugOwner&&slugOwner.id!==existingCard?.id){alert("Este endereço já está em uso. Escolha outro.");return;}}const finalSlug=requestedSlug;setSlug(finalSlug);setCustomSlug(finalSlug);
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
        links: links.filter((link) => link.value?.trim()),
        };

        localStorage.setItem("digitalCard", JSON.stringify(cardData));
    
    console.log("SLUG SALVO:", finalSlug); console.log("USER ID SALVO:", currentUserId); console.log("CARD DATA:", cardData);

    const { error } = existingCard ? await supabase.from("digital_cards").update({slug:finalSlug,user_id:currentUserId,data:cardData,updated_at:new Date().toISOString()}).eq("id",existingCard.id) : await supabase.from("digital_cards").insert({slug:finalSlug,user_id:currentUserId,data:cardData,updated_at:new Date().toISOString()});

    if (error) {
        console.error("Erro ao salvar no Supabase:", error);
        console.log("SLUG SALVO:", finalSlug); console.log("USER ID SALVO:", currentUserId); console.log("CARD DATA:", cardData);
        alert("O cartão foi salvo localmente, mas houve um erro ao salvar no Supabase.");
        return;
    }

    alert("Alterações salvas com sucesso!");
    }

  if (authChecking) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0b1220] text-white">
            Carregando...
        </div>
    );
  }


  return (
    <main className="min-h-screen bg-[#0b1220] text-white">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-[270px] shrink-0 border-r border-white/10 bg-[#111a29] lg:flex lg:flex-col">
          <div className="border-b border-white/10 px-6 pb-6 pt-5">
            <button type="button" onClick={() => window.history.back()} className="mb-7 flex items-center gap-2 rounded-xl bg-white/[0.07] px-4 py-3 text-sm font-medium transition hover:bg-white/[0.12]">
              <ArrowLeft className="h-4 w-4" /> Sair do editor
            </button>
            <h1 className="text-2xl font-bold tracking-tight">Editor do Cartão</h1>
            <p className="mt-2 text-sm leading-5 text-slate-400">Personalize seu cartão digital em tempo real.</p>
          </div>


          <nav className="flex-1 overflow-y-auto py-3">
            {[
              { id: "templates", label: "Modelo", icon: LayoutTemplate },
              { id: "dados", label: "Perfil", icon: UserRound },
              { id: "links", label: "Links", icon: Link2 },
              { id: "fundo", label: "Fundo", icon: ImageIcon },
              { id: "cores", label: "Estilo", icon: Palette },
            ].map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button key={item.id} type="button" onClick={() => setActiveTab(item.id)} className={`relative flex w-full items-center gap-4 border-b border-white/[0.06] px-6 py-5 text-left transition ${active ? "bg-[#168cff]/20 text-white" : "text-slate-300 hover:bg-white/[0.05]"}`}>
                  {active && <span className="absolute inset-y-0 left-0 w-1 bg-[#24a8ff]" />}
                  <Icon className={`h-5 w-5 ${active ? "text-[#45b7ff]" : "text-slate-400"}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <button type="button" onClick={saveCard} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#168cff] px-4 py-3 font-semibold shadow-lg shadow-blue-950/30 transition hover:bg-[#0f7be4]">
              <Save className="h-4 w-4" /> Salvar alterações
            </button>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4"><p className="text-sm font-medium text-white">Seu cartão está publicado</p><p className="mt-1 break-all text-sm text-white/60">{publicUrl || "Salve o cartão para gerar o link"}</p><div className="mt-3 flex gap-2"><button type="button" onClick={()=>navigator.clipboard.writeText(publicUrl)} className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20">📋 Copiar link</button><button type="button" onClick={()=>window.open(publicUrl,"_blank")} className="rounded-lg bg-white px-4 py-2 text-sm text-black hover:bg-white/90">↗ Abrir cartão</button></div>{publicUrl && <div className="mt-4 flex flex-col items-center gap-3 rounded-xl bg-white p-4"><p className="text-sm font-medium text-black">Escaneie para abrir o cartão</p><QRCodeSVG value={publicUrl} size={160} /></div>}</div>
          </div>
        </aside>

        <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#111a29]/95 px-4 py-3 backdrop-blur lg:hidden">
          <button type="button" onClick={() => window.history.back()} className="flex items-center gap-2 rounded-lg bg-white/[0.07] px-3 py-2 text-sm"><ArrowLeft className="h-4 w-4" />Voltar</button>
          <span className="font-semibold">Editor do Cartão</span>
          <button type="button" onClick={saveCard} className="rounded-lg bg-[#168cff] px-3 py-2 text-sm font-semibold">Salvar</button>
        </div>
        
        <nav className="fixed inset-x-0 top-[57px] z-30 flex gap-2 overflow-x-auto border-b border-white/10 bg-[#111a29]/95 px-3 py-2 backdrop-blur lg:hidden">{[{id:"templates",label:"Modelo",icon:LayoutTemplate},{id:"dados",label:"Perfil",icon:UserRound},{id:"links",label:"Links",icon:Link2},{id:"fundo",label:"Fundo",icon:ImageIcon},{id:"cores",label:"Estilo",icon:Palette}].map((item)=>{const Icon=item.icon;const active=activeTab===item.id;return <button key={item.id} type="button" onClick={()=>setActiveTab(item.id)} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${active?"bg-[#168cff]/20 text-white":"text-slate-400 hover:bg-white/[0.05]"}`}><Icon className="h-4 w-4"/>{item.label}</button>})}</nav>
        <section className="min-w-0 flex-1 bg-[#0e1726] pt-[105px] lg:pt-0">
          <div className="relative min-h-screen overflow-hidden">
            <div className="pointer-events-none absolute inset-0 opacity-80">
              <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="absolute right-0 top-1/3 h-[500px] w-[500px] rounded-full bg-cyan-400/10 blur-3xl" />
            </div>

            <div className="relative z-10 flex min-h-screen flex-col">
              <header className="flex items-center justify-between border-b border-white/10 px-6 py-5 xl:px-10">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-300/30 bg-blue-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-200">
                    <Sparkles className="h-3.5 w-3.5" /> Editor
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight xl:text-3xl">Personalize seu cartão</h2>
                  <p className="mt-1 text-sm text-slate-400">Altere os elementos e acompanhe o resultado instantaneamente.</p>
                </div>
                <button type="button" onClick={saveCard} className="hidden items-center gap-2 rounded-xl border border-white/15 bg-white/[0.07] px-5 py-3 text-sm font-semibold transition hover:bg-white/[0.12] md:flex">
                  <Save className="h-4 w-4" /> Salvar
                </button>
              </header>

              <div className="grid flex-1 xl:grid-cols-[minmax(390px,520px)_1fr]">
                <div className="border-b border-white/10 bg-[#121c2c]/95 p-5 md:p-7 xl:border-b-0 xl:border-r xl:p-8">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Configurações</p>
                      <h3 className="mt-1 text-lg font-bold">{activeTab==="templates"?"Modelo":activeTab==="dados"?"Perfil":activeTab==="links"?"Links":activeTab==="fundo"?"Fundo":"Estilo"}</h3>
                    </div>
                    <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-400">Tempo real</span>
                  </div>

                  {activeTab === "templates" && (
                    <div className="space-y-5">
                      <div>
                        <label className="mb-2 block text-sm font-semibold">Template</label>
                        <div className="relative">
                          <button type="button" onClick={()=>setTemplateDropdownOpen(v=>!v)} className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${templateDropdownOpen?"border-[#32aaff] bg-white/[0.08]":"border-white/20 bg-white/[0.06] hover:border-white/35"}`}>
                            {(()=>{const selected=getTemplateById(template);const thumb=selected.background.type==="gradient"?selected.background.value:`url(${selected.background.value})`;return <><div className="h-11 w-12 shrink-0 rounded-lg border border-white/20 bg-cover bg-center" style={{backgroundImage:thumb}}/><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{selected.name}</p><p className="mt-0.5 text-xs text-slate-400">Template digital</p></div><ChevronDown className={`h-4 w-4 text-slate-400 transition ${templateDropdownOpen?"rotate-180":""}`}/></>})()}
                          </button>
                          {templateDropdownOpen && <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[360px] overflow-y-auto rounded-xl border border-white/15 bg-[#172233] p-1.5 shadow-2xl shadow-black/40">
                            {templates.map(item=>{const thumb=item.background.type==="gradient"?item.background.value:`url(${item.background.value})`;const selected=template===item.id;return <button key={item.id} type="button" onClick={()=>{const t=getTemplateById(item.id);setTemplate(t.id);setUseTemplate(true);setPrimaryColor(t.defaults.primaryColor);setTextNameColor(t.defaults.textNameColor);setTextJobColor(t.defaults.textJobColor);setTextLocationColor(t.defaults.textLocationColor);setTextColor(t.defaults.textNameColor);setPrimaryColorOpacity(t.defaults.primaryColorOpacity);setUsePrimaryColor(t.defaults.usePrimaryColor);setBackgroundOverlay(t.defaults.backgroundOverlay);setShowPhoto(t.defaults.showPhoto);setShowBackground(t.defaults.showBackground);setBackgroundBlur(t.defaults.backgroundBlur??8);setBackgroundMode("template");setTemplateDropdownOpen(false)}} className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition ${selected?"bg-[#168cff]/15 ring-1 ring-[#32aaff]/40":"hover:bg-white/[0.07]"}`}><div className="h-10 w-11 shrink-0 rounded-lg border border-white/15 bg-cover bg-center" style={{backgroundImage:thumb}}/><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-white">{item.name}</p><p className="truncate text-xs text-slate-400">Template digital</p></div>{selected&&<Check className="h-4 w-4 text-[#4bb7ff]"/>}</button>})}
                          </div>}
                        </div>
                        <p className="mt-3 text-sm leading-5 text-slate-400">{getTemplateById(template).description}</p>
                      </div>
                      <label className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-4"><div><p className="text-sm font-semibold">Ativar modelo</p><p className="mt-1 text-xs text-slate-400">Usa o estilo visual do template selecionado.</p></div><input type="checkbox" checked={useTemplate} onChange={e=>setUseTemplate(e.target.checked)} className="h-5 w-5 accent-[#168cff]"/></label>
                    </div>
                  )}

                  {activeTab === "dados" && (
                    <div className="space-y-5">
                      <div><label className="mb-2 block text-sm font-semibold">Nome</label><input value={name} onChange={e=>setName(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm outline-none focus:border-blue-400/70"/></div>
                      <div><label className="mb-2 block text-sm font-semibold">Profissão / Cargo</label><input value={job} onChange={e=>setJob(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm outline-none focus:border-blue-400/70"/></div>
                      <div><label className="mb-2 block text-sm font-semibold">Localização</label><input value={location} onChange={e=>setLocation(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm outline-none focus:border-blue-400/70"/></div>
                      {template==="medico"&&<div><label className="mb-2 block text-sm font-semibold">Texto de identificação</label><input value={healthLabel} onChange={e=>setHealthLabel(e.target.value)} placeholder="Profissional de saúde" className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm outline-none"/></div>}
                      <div><label className="mb-2 block text-sm font-medium">Endereço do cartão</label><div className="flex items-center rounded-xl border border-white/10 bg-white/[0.06]"><span className="pl-4 text-sm text-slate-500">/c/</span><input value={customSlug} onChange={(e)=>{const value=normalizeSlug(e.target.value);setCustomSlug(value);setSlugStatus("");}} placeholder="meu-cartao" className="w-full bg-transparent px-2 py-3 text-sm text-white outline-none"/></div><p className="mt-2 text-xs text-slate-400">Exemplo: /c/sil-bonecas-de-pano</p>{slugStatus&&<p className="mt-2 text-xs text-white/70">{slugStatus}</p>}</div>
                      

                      <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                        <p className="text-sm font-semibold">Foto de perfil</p><p className="mt-1 text-xs text-slate-400">Envie uma nova foto ou mantenha a atual.</p>
                        <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-blue-400/40 bg-blue-400/5 px-4 py-4 text-sm font-semibold text-blue-100 hover:bg-blue-400/10"><Upload className="h-5 w-5"/>Trocar foto do perfil<input type="file" accept="image/*" className="hidden" onChange={e=>{const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onloadend=()=>{setSelectedPhoto(reader.result as string);setShowCropper(true)};reader.readAsDataURL(file)}}/></label>
                        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-4"><div className="flex items-center gap-3"><Camera className="h-4 w-4 text-slate-300"/><div><p className="text-sm font-semibold">Manter foto do perfil</p><p className="mt-1 text-xs text-slate-400">Exibir a foto atualmente salva.</p></div></div><button type="button" onClick={()=>setShowPhoto(v=>!v)} className={`relative h-7 w-12 rounded-full ${showPhoto?"bg-[#168cff]":"bg-white/15"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white ${showPhoto?"left-6":"left-1"}`}/></button></div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4"><p className="text-sm font-semibold">Tamanho das letras</p><p className="mb-4 mt-1 text-xs text-slate-400">Ajuste cada elemento independentemente.</p>
                        {[{label:"Nome",value:nameFontSize,setValue:setNameFontSize,min:18,max:48},{label:"Profissão / cargo",value:jobFontSize,setValue:setJobFontSize,min:10,max:32},{label:"Localização",value:locationFontSize,setValue:setLocationFontSize,min:9,max:28}].map(i=><label key={i.label} className="mb-4 block last:mb-0"><span className="mb-2 flex justify-between text-xs"><span>{i.label}</span><span className="text-slate-400">{i.value}px</span></span><input type="range" min={i.min} max={i.max} value={i.value} onChange={e=>i.setValue(Number(e.target.value))} className="w-full accent-[#168cff]"/></label>)}
                      </div>
                    </div>
                  )}

                  {activeTab === "links" && (
                    <div className="space-y-4">
                      <p className="text-sm text-slate-400">Gerencie WhatsApp, redes sociais, Produtos, Pix, Wi-Fi e outros links.</p>
                      <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
                        {links.map((link,index)=><div key={link.id} className="rounded-xl border border-white/10 bg-white/[0.035] p-4"><div className="mb-3 flex items-center justify-between gap-3"><span className="min-w-0 flex-1 truncate text-sm font-semibold">{link.name}</span><div className="flex items-center gap-1"><button type="button" onClick={()=>moveLink(index,"up")} disabled={index===0} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-30" title="Mover para cima"><ArrowUp className="h-4 w-4"/></button><button type="button" onClick={()=>moveLink(index,"down")} disabled={index===links.length-1} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-30" title="Mover para baixo"><ArrowDown className="h-4 w-4"/></button><button type="button" onClick={()=>setLinks(current=>current.filter((_,i)=>i!==index))} className="ml-1 text-xs text-red-300 transition hover:text-red-200">Remover</button></div></div><select value={link.type} onChange={e=>{const selectedType=linkTypes.find(t=>t.type===e.target.value);setLinks(current=>current.map((item,i)=>i===index?{...item,type:e.target.value,name:selectedType?.name||item.name,value:e.target.value==="custom"?"":item.value}:item))}} className="mb-3 w-full rounded-xl border border-white/10 bg-[#182436] px-4 py-3 text-sm text-white outline-none">{linkTypes.map(type=><option key={type.type} value={type.type}>{type.name}</option>)}</select>{link.type==="custom"&&<input value={link.name} onChange={e=>setLinks(current=>current.map((item,i)=>i===index?{...item,name:e.target.value}:item))} placeholder="Nome do link" className="mb-3 w-full rounded-xl border border-white/10 bg-[#182436] px-4 py-3 text-sm text-white outline-none"/>}<input value={link.value} onChange={e=>setLinks(current=>current.map((item,i)=>i===index?{...item,value:e.target.value}:item))} placeholder="Digite o valor do link" className="w-full rounded-xl border border-white/10 bg-[#182436] px-4 py-3 text-sm text-white outline-none"/>{validateLink(link.type,link.value)&&<p className="mt-2 text-xs text-red-300">{validateLink(link.type,link.value)}</p>}</div>)}
                      </div>
                      <button type="button" onClick={()=>setLinks(c=>[...c,{id:`link-${Date.now()}-${Math.random().toString(36).slice(2)}`,type:"custom",name:"Novo link",value:"",enabled:true}])} className="w-full rounded-xl border border-dashed border-blue-400/40 bg-blue-400/5 py-3 text-sm font-semibold text-blue-200">+ Adicionar link</button>
                    </div>
                  )}

                  {activeTab === "fundo" && (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] p-4"><div><p className="text-sm font-semibold">Mostrar fundo</p><p className="mt-1 text-xs text-slate-400">Ativar a camada de fundo.</p></div><button type="button" onClick={()=>setShowBackground(v=>!v)} className={`relative h-7 w-12 rounded-full ${showBackground?"bg-[#168cff]":"bg-white/15"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white ${showBackground?"left-6":"left-1"}`}/></button></div>
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-blue-400/40 bg-blue-400/5 px-4 py-4 text-sm font-semibold text-blue-100 hover:bg-blue-400/10"><Upload className="h-5 w-5"/>Trocar imagem de fundo<input type="file" accept="image/*" className="hidden" onChange={e=>{const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onloadend=async()=>{const optimized=await optimizeBackgroundImage(reader.result as string);setBackground(optimized);setBackgroundMode("image");setShowBackground(true)};reader.readAsDataURL(file)}}/></label>
                      <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4"><p className="mb-3 text-sm font-semibold">Tipo de fundo</p><div className="grid grid-cols-3 gap-2">{[{value:"template",label:"Modelo"},{value:"image",label:"Imagem"},{value:"color",label:"Cor"}].map(o=><button key={o.value} type="button" onClick={()=>setBackgroundMode(o.value as "template"|"image"|"color")} className={`rounded-xl border px-3 py-2.5 text-xs font-semibold ${backgroundMode===o.value?"border-blue-400/70 bg-blue-400/15 text-blue-100":"border-white/10 bg-white/[0.03] text-slate-300"}`}>{o.label}</button>)}</div>{backgroundMode==="color"&&<div className="mt-4 flex gap-3"><input type="color" value={backgroundColor} onChange={e=>setBackgroundColor(e.target.value)} className="h-11 w-14 rounded-lg border border-white/10 bg-transparent"/><input value={backgroundColor} onChange={e=>setBackgroundColor(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white outline-none"/></div>}</div>
                      <label className="block rounded-xl border border-white/10 bg-white/[0.035] p-4"><span className="mb-3 flex justify-between text-sm font-semibold"><span>Desfoque do fundo</span><span className="text-slate-400">{backgroundBlur}px</span></span><input type="range" min="0" max="20" value={backgroundBlur} onChange={e=>setBackgroundBlur(Number(e.target.value))} className="w-full accent-[#168cff]"/><span className="mt-2 block text-xs text-slate-500">0px = nítido · 20px = máximo</span></label>
                      <label className="block rounded-xl border border-white/10 bg-white/[0.035] p-4"><span className="mb-3 flex justify-between text-sm font-semibold"><span>Zoom do fundo</span><span className="text-slate-400">{backgroundZoom.toFixed(1)}x</span></span><input type="range" min="1" max="3" step="0.1" value={backgroundZoom} onChange={e=>setBackgroundZoom(Number(e.target.value))} className="w-full accent-[#168cff]"/></label>
                      <label className="block rounded-xl border border-white/10 bg-white/[0.035] p-4"><span className="mb-3 flex justify-between text-sm font-semibold"><span>Escurecimento</span><span className="text-slate-400">{backgroundOverlay}%</span></span><input type="range" min="0" max="100" step="5" value={backgroundOverlay} onChange={e=>setBackgroundOverlay(Number(e.target.value))} className="w-full accent-[#168cff]"/></label>
                      <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4"><p className="mb-3 text-sm font-semibold">Posição da imagem</p>{[{label:"Posição X",value:backgroundPosition.x,setter:(v:number)=>setBackgroundPosition(p=>({...p,x:v}))},{label:"Posição Y",value:backgroundPosition.y,setter:(v:number)=>setBackgroundPosition(p=>({...p,y:v}))}].map(i=><label key={i.label} className="mb-4 block last:mb-0"><span className="mb-2 flex justify-between text-xs text-slate-300"><span>{i.label}</span><span>{i.value}px</span></span><input type="range" min="-150" max="150" value={i.value} onChange={e=>i.setter(Number(e.target.value))} className="w-full accent-[#168cff]"/></label>)}</div>
                    </div>
                  )}

                  {activeTab === "cores" && (
                    <div className="space-y-4">
                      {[{label:"Cor principal",value:primaryColor,setter:setPrimaryColor},{label:"Cor do nome",value:textNameColor,setter:setTextNameColor},{label:"Cor da profissão",value:textJobColor,setter:setTextJobColor},{label:"Cor da localização",value:textLocationColor,setter:setTextLocationColor},{label:"Cor geral",value:textColor,setter:setTextColor}].map(i=><div key={i.label} className="rounded-xl border border-white/10 bg-white/[0.035] p-4"><label className="mb-2 block text-sm font-semibold">{i.label}</label><div className="flex gap-3"><input type="color" value={i.value} onChange={e=>i.setter(e.target.value)} className="h-11 w-14 rounded-lg border border-white/10 bg-transparent"/><input value={i.value} onChange={e=>i.setter(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm outline-none"/></div></div>)}
                      <label className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] p-4"><span className="text-sm font-semibold">Usar cor principal nos botões</span><input type="checkbox" checked={usePrimaryColor} onChange={e=>setUsePrimaryColor(e.target.checked)} className="h-5 w-5 accent-[#168cff]"/></label>
                      <label className="block rounded-xl border border-white/10 bg-white/[0.035] p-4"><span className="mb-2 flex justify-between text-sm font-semibold"><span>Transparência dos botões</span><span className="text-slate-400">{primaryColorOpacity}%</span></span><input type="range" min="0" max="100" step="5" value={primaryColorOpacity} onChange={e=>setPrimaryColorOpacity(Number(e.target.value))} className="w-full accent-[#168cff]"/></label>
                    </div>
                  )}
                </div>

                <div className="relative flex min-h-[720px] flex-col items-center justify-center overflow-hidden p-6 md:p-10 xl:p-12">
                  <div className="absolute left-6 top-6 hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-slate-300 md:flex"><Eye className="h-4 w-4"/>Pré-visualização</div>
                  <div className="mb-7 text-center xl:hidden"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">Preview</p><h3 className="mt-1 text-xl font-bold">{getTemplateById(template).name}</h3></div>

                  <div className="relative flex w-full max-w-[7000px] items-center justify-center">
                    <div className="pointer-events-none absolute h-[720px] w-[430px] rounded-full bg-blue-400/10 blur-3xl"/>
                    <div className="relative h-[620px] w-[350px] max-w-[78vw] rounded-[3.1rem] border-[8px] border-[#080b11] bg-[#080b11] p-0 shadow-[0_35px_90px_rgba(0,0,0,0.55)] ring-1 ring-white/10">
                      <div className="pointer-events-none absolute left-1/2 top-2 z-30 h-7 w-28 -translate-x-1/2 rounded-full bg-black shadow-lg"/>
                      <div className="pointer-events-none absolute -left-[14px] top-32 h-16 w-[4px] rounded-full bg-[#151922]"/>
                      <div className="pointer-events-none absolute -left-[14px] top-52 h-20 w-[4px] rounded-full bg-[#151922]"/>
                      <div className="pointer-events-none absolute -right-[14px] top-40 h-24 w-[4px] rounded-full bg-[#151922]"/>
                      <div className="relative h-full w-full overflow-hidden rounded-[2.65rem] bg-black">
                        <DigitalCard slug={slug} name={name} job={job} location={location} photo={photo} background={background} backgroundColor={backgroundColor} backgroundMode={backgroundMode} links={links} backgroundPosition={backgroundPosition} backgroundZoom={backgroundZoom} backgroundOverlay={backgroundOverlay} backgroundBlur={backgroundBlur} template={template} onBackgroundPointerDown={handleBackgroundPointerDown} onBackgroundPointerMove={handleBackgroundPointerMove} onBackgroundPointerUp={handleBackgroundPointerUp} isEditing={true} usePrimaryColor={usePrimaryColor} primaryColor={primaryColor} textColor={textColor} primaryColorOpacity={primaryColorOpacity} useTemplate={useTemplate} textNameColor={textNameColor} textJobColor={textJobColor} textLocationColor={textLocationColor} nameFontSize={nameFontSize} jobFontSize={jobFontSize} locationFontSize={locationFontSize} showPhoto={showPhoto} showBackground={showBackground}/>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 hidden max-w-xl items-center justify-center gap-6 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-xs text-slate-400 md:flex"><span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-blue-300"/>Alterações em tempo real</span><span className="h-4 w-px bg-white/10"/><span>Arraste o fundo para reposicionar</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {showCropper && selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111a29] p-6 shadow-2xl">
            <h2 className="mb-1 text-xl font-bold">Ajustar foto</h2>
            <p className="mb-5 text-sm text-slate-400">Posicione a foto como deseja no cartão.</p>
            <div className="flex justify-center">
              <div className="relative h-64 w-64 cursor-grab touch-none overflow-hidden rounded-full border-4 border-white/10 bg-black/20 active:cursor-grabbing" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);setIsDragging(true);setDragStart({x:e.clientX-position.x,y:e.clientY-position.y})}} onPointerMove={e=>{if(!isDragging)return;setPosition({x:e.clientX-dragStart.x,y:e.clientY-dragStart.y})}} onPointerUp={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);setIsDragging(false)}} onPointerCancel={()=>setIsDragging(false)}>
                <img src={selectedPhoto} alt="Prévia da foto" className="absolute left-1/2 top-1/2 h-full w-full object-contain" style={{transform:`translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom})`}}/>
              </div>
            </div>
            <div className="mt-6"><label className="mb-2 flex justify-between text-sm font-semibold"><span>Zoom</span><span className="text-slate-400">{zoom.toFixed(1)}x</span></label><input type="range" min="1" max="3" step="0.1" value={zoom} onChange={e=>setZoom(Number(e.target.value))} className="w-full accent-[#168cff]"/></div>
            <div className="mt-6 flex gap-3"><button type="button" onClick={()=>{setShowCropper(false);setSelectedPhoto(null)}} className="flex-1 rounded-xl border border-white/10 bg-white/[0.05] py-3 font-semibold">Cancelar</button><button type="button" onClick={cropImage} className="flex-1 rounded-xl bg-[#168cff] py-3 font-semibold">Usar foto</button></div>
          </div>
        </div>
      )}
    </main>
  );
}