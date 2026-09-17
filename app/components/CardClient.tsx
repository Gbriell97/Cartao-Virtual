"use client";

import DigitalCard from "./DigitalCard";

type Link = {
  type: string;
  name: string;
  value: string;
};

type CardClientProps = {
  slug?: string;
  name: string;
  job: string;
  location: string;
  photo: string;
  background: string;
  links: Link[];
  backgroundColor?: string;
  backgroundMode?: "template" | "image" | "color";
  backgroundPosition?: { x: number; y: number };
  backgroundZoom?: number;
  backgroundOverlay?: number;
  backgroundBlur?: number;
  nameFontSize?: number;
  jobFontSize?: number;
  locationFontSize?: number;
  buttonFontSize?: number;
  showPhoto?: boolean;
  showBackground?: boolean;
  template?: string;
  useTemplate?: boolean;
  usePrimaryColor?: boolean;
  primaryColor?: string;
  textColor?: string;
  textNameColor?: string;
  textJobColor?: string;
  textLocationColor?: string;
  primaryColorOpacity?: number;
};

export default function CardClient(props: CardClientProps) {
  const cardData = {
    backgroundColor: "#FFFFFF",
    backgroundMode: "template" as const,
    backgroundPosition: { x: 0, y: 0 },
    backgroundZoom: 1,
    backgroundOverlay: 40,
    backgroundBlur: 0,
    nameFontSize: 28,
    jobFontSize: 14,
    locationFontSize: 12,
    buttonFontSize: 14,
    showPhoto: true,
    showBackground: true,
    template: "rosa",
    useTemplate: true,
    usePrimaryColor: false,
    primaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    textNameColor: "#FFFFFF",
    textJobColor: "#FFFFFF",
    textLocationColor: "#FFFFFF",
    primaryColorOpacity: 60,
    ...props,
  };

  return <DigitalCard {...cardData} slug={props.slug} />;
}