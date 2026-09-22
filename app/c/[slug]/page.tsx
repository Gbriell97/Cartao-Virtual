import CardClient from "../../components/CardClient";
import { supabase } from "../../../lib/supabase";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CardPage({ params }: PageProps) {
  const { slug } = await params;

  const { data, error } = await supabase
    .from("digital_cards")
    .select("data,user_id")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return <h1>Cartão não encontrado</h1>;
  }

  const card = data.data;

  const customTemplate = card.templateData || null;

  return (
    <CardClient
      slug={slug}
      name={card.name || ""}
      job={card.job || ""}
      location={card.location || ""}
      photo={card.photo || ""}
      background={card.background || ""}
      backgroundColor={card.backgroundColor}
      backgroundMode={card.backgroundMode}
      links={card.links || []}
      backgroundPosition={card.backgroundPosition}
      backgroundZoom={card.backgroundZoom}
      backgroundOverlay={card.backgroundOverlay}
      backgroundBlur={card.backgroundBlur}
      template={card.template}
      customTemplate={customTemplate}
      usePrimaryColor={card.usePrimaryColor}
      primaryColor={card.primaryColor}
      textColor={card.textColor}
      primaryColorOpacity={card.primaryColorOpacity}
      useTemplate={card.useTemplate}
      textNameColor={card.textNameColor}
      textJobColor={card.textJobColor}
      textLocationColor={card.textLocationColor}
      nameFontSize={card.nameFontSize}
      jobFontSize={card.jobFontSize}
      locationFontSize={card.locationFontSize}
      showPhoto={card.showPhoto}
      showBackground={card.showBackground}
    />
  );
}