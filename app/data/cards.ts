"use client";

import { createElement, useEffect, useState } from "react";
import DigitalCard from "../components/DigitalCard";

type Link = { type: string; name: string; value: string };

type CardClientProps = {
  name: string; job: string; location: string; photo: string; background: string; links: Link[];
};

type SavedCardData = CardClientProps & {
  backgroundColor?: string; backgroundMode?: "template" | "image" | "color";
  backgroundPosition?: { x: number; y: number }; backgroundZoom?: number; backgroundOverlay?: number;
  showPhoto?: boolean; showBackground?: boolean; template?: string; useTemplate?: boolean;
  usePrimaryColor?: boolean; primaryColor?: string; textColor?: string;
  textNameColor?: string; textJobColor?: string; textLocationColor?: string; primaryColorOpacity?: number;
  nameFontSize?: number; jobFontSize?: number; locationFontSize?: number; healthLabel?: string;
};

export default function CardClient(props: CardClientProps) {
  const [cardData, setCardData] = useState<SavedCardData>({ ...props, backgroundColor: "#FFFFFF", backgroundMode: "template", backgroundPosition: {x:0,y:0}, backgroundZoom:1, backgroundOverlay:40, showPhoto:true, showBackground:true, template:"rosa", useTemplate:true, usePrimaryColor:false, primaryColor:"#FFFFFF", textColor:"#FFFFFF", textNameColor:"#FFFFFF", textJobColor:"#FFFFFF", textLocationColor:"#FFFFFF", primaryColorOpacity:60, nameFontSize:30, jobFontSize:16, locationFontSize:14, healthLabel:"Profissional de saúde" });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("digitalCard");
      if (!saved) return;
      const data = JSON.parse(saved) as Partial<SavedCardData>;
      setCardData((current) => ({
        ...current, ...data,
        name: data.name || current.name, job: data.job || current.job, location: data.location || current.location,
        photo: data.photo || current.photo, background: data.background || current.background,
        links: Array.isArray(data.links) ? data.links : current.links,
      }));
    } catch { console.error("Não foi possível carregar o cartão salvo."); }
  }, []);

  return createElement(DigitalCard, cardData);
}
