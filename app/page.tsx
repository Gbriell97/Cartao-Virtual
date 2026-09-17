import DigitalCard from "./components/DigitalCard";
import { cards } from "./data/cards";

export default function Home() {
  const card = cards[0];

  return (
    <DigitalCard
      name={card.name}
      job={card.job}
      location={card.location}
      photo={card.photo}
      background={card.background}
      links={card.links}
    />
  );
}