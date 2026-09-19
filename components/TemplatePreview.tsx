import type { CSSProperties } from "react";
import type { TemplateConfig } from "../data/templates";

type TemplatePreviewProps = {
  template: TemplateConfig;
  selected?: boolean;
  onClick?: () => void;
};

export default function TemplatePreview({
  template,
  selected = false,
  onClick,
}: TemplatePreviewProps) {
  const backgroundStyle: CSSProperties =
    template.background.type === "gradient"
      ? {
          backgroundImage: template.background.value,
        }
      : {
          backgroundImage: `url(${template.background.value})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        };

  const {
    textNameColor,
    textJobColor,
    textLocationColor,
    showPhoto,
  } = template.defaults;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full rounded-2xl border-2 bg-white p-2 text-left transition ${
        selected
          ? "border-gray-900 shadow-lg"
          : "border-gray-200 hover:border-gray-400 hover:shadow-md"
      }`}
    >
      {/* Mini cartão */}
      <div
        className={`relative mx-auto aspect-[9/16] w-full max-w-[150px] overflow-hidden ${template.layout.cardRadius}`}
        style={backgroundStyle}
      >
        {/* Escurecimento */}
        <div
          className="absolute inset-0 bg-black"
          style={{
            opacity: template.defaults.backgroundOverlay / 100,
          }}
        />

        {/* Decoração */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -right-8 -top-8 h-20 w-20 rounded-full blur-2xl"
            style={{
              backgroundColor: template.defaults.primaryColor,
              opacity: 0.35,
            }}
          />

          <div
            className="absolute -bottom-8 -left-8 h-20 w-20 rounded-full blur-2xl"
            style={{
              backgroundColor: template.defaults.primaryColor,
              opacity: 0.2,
            }}
          />
        </div>

        {/* Conteúdo */}
        <div className="relative z-10 flex h-full flex-col items-center px-3 py-4">
          {/* Foto */}
          {showPhoto ? (
            <div
              className={`mb-3 shrink-0 overflow-hidden shadow-lg ${template.layout.photoStyle} ${template.layout.profileSize}`}
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,.5), rgba(255,255,255,.1))",
              }}
            >
              <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-white/80">
                FOTO
              </div>
            </div>
          ) : null}

          {/* Nome */}
          <div
            className="max-w-full truncate text-center font-bold"
            style={{
              color: textNameColor,
              fontSize: "11px",
            }}
          >
            João Henrique
          </div>

          {/* Cargo */}
          <div
            className="mt-1 max-w-full truncate text-center"
            style={{
              color: textJobColor,
              fontSize: "7px",
              opacity: 0.85,
            }}
          >
            Diretor Comercial
          </div>

          {/* Localização */}
          <div
            className="mt-1 max-w-full truncate text-center"
            style={{
              color: textLocationColor,
              fontSize: "6px",
              opacity: 0.7,
            }}
          >
            📍 Salvador - BA
          </div>

          {/* Links fictícios */}
          <div className="mt-4 flex w-full flex-col gap-1.5">
            <div
              className={`h-5 w-full ${template.layout.buttonStyle}`}
              style={{
                backgroundColor: template.defaults.usePrimaryColor
                  ? template.defaults.primaryColor
                  : "rgba(255,255,255,0.15)",
                opacity: template.defaults.usePrimaryColor
                  ? Math.max(template.defaults.primaryColorOpacity / 100, 0.35)
                  : 1,
              }}
            />

            <div
              className={`h-5 w-full ${template.layout.buttonStyle}`}
              style={{
                backgroundColor: template.defaults.usePrimaryColor
                  ? template.defaults.primaryColor
                  : "rgba(255,255,255,0.12)",
                opacity: template.defaults.usePrimaryColor
                  ? Math.max(template.defaults.primaryColorOpacity / 100, 0.35)
                  : 1,
              }}
            />

            <div
              className={`h-5 w-full ${template.layout.buttonStyle}`}
              style={{
                backgroundColor: template.defaults.usePrimaryColor
                  ? template.defaults.primaryColor
                  : "rgba(255,255,255,0.1)",
                opacity: template.defaults.usePrimaryColor
                  ? Math.max(template.defaults.primaryColorOpacity / 100, 0.35)
                  : 1,
              }}
            />
          </div>
        </div>
      </div>

      {/* Nome do template */}
      <div className="px-1 pb-1 pt-3">
        <p className="truncate text-sm font-semibold text-gray-900">
          {template.name}
        </p>

        <p className="mt-0.5 truncate text-xs text-gray-500">
          {template.description}
        </p>
      </div>
    </button>
  );
}