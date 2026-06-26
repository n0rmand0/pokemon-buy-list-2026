import { useEffect, useState } from "react";
import TCGdex from "@tcgdex/sdk";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "./assets/vite.svg";
// import heroImg from "./assets/hero.png";
import "./App.css";
import { cards } from "./cards";
import { setIds } from "./setIds";

// Instantiate the SDK with your preferred language
const tcgdex = new TCGdex("en");

let setData: Record<string, any> = {};

function App() {
  // const [isLoading, setIsLoading] = useState(true);
  const [cardData, setCardData] = useState<any[]>([]);

  useEffect(() => {
    onLoad();
  }, []);

  const onLoad = async () => {
    try {
      const cardPromises = cards.map(
        async (card) => await tcgdex.card.get(card.id),
      );
      const setPromises = setIds.map(
        async (id) => await tcgdex.fetch("sets", id),
      );

      // Wait for all setIds.map promises to complete
      await Promise.all(setPromises).then((results) => {
        results.forEach((set) => {
          if (set) setData[set.id] = set;
        });
        console.log("Set Data loaded:", setData);
      });

      // Wait for all cardIds.map promises to complete
      await Promise.all(cardPromises).then((results) => {
        const combinedData = results.map((apiCard, index) => ({
          ...apiCard,
          ...cards[index],
        }));
        setCardData(combinedData); //
        console.log("Card Data loaded:", combinedData);
      });

      console.log("All data loaded successfully");
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const cardUI = (card: any, key: number) => {
    const oneMonthPrice = card.priceHistory.onemonth;
    const sixMonthPrice = card.priceHistory.sixmonth;
    const appreciationSix =
      oneMonthPrice && sixMonthPrice
        ? (((sixMonthPrice - oneMonthPrice) / oneMonthPrice) * 100).toFixed(0)
        : "--";
    const appreciationMarket =
      card.pricing.tcgplayer?.holofoil.marketPrice && sixMonthPrice
        ? (
            ((card.pricing.tcgplayer?.holofoil.marketPrice - sixMonthPrice) /
              sixMonthPrice) *
            100
          ).toFixed(0)
        : "--";

    return (
      <div key={key} className="card">
        <div className="card-image">
          <img src={card.image + "/low.jpg"} alt={card.name} />
        </div>
        <div className="card-data">
          <h3 className="card-name">{card.name}</h3>
          <p className="card-set">
            {card.set.name} {card.localId}/{card.set.cardCount.official}
          </p>
          {/* <p className="card-date">Nov 12,2026</p> */}
          <p className="card-price">
            1 Month Price: ${oneMonthPrice.toFixed(2)}{" "}
          </p>
          <p className="card-price">
            6 Month Price: ${sixMonthPrice.toFixed(2)}{" "}
            <span
              className={
                Number(appreciationSix) < 0
                  ? "card-neg-appreciation "
                  : "card-pos-appreciation"
              }
            >
              ({appreciationSix}%)
            </span>
          </p>
          <p className="card-market-price">
            <span className="card-market-price-icon"></span>
            Market Price $
            {card.pricing.tcgplayer?.holofoil.marketPrice.toFixed(2) || "--"}
            <span
              className={
                Number(appreciationMarket) < 0
                  ? "card-neg-appreciation "
                  : "card-pos-appreciation"
              }
            >
              ({appreciationMarket}%)
            </span>
          </p>
          <p className="card-link">
            <a href={card.url} target="_blank" rel="noopener noreferrer">
              View PriceCharting
            </a>
          </p>
        </div>
      </div>
    );
  };

  const cardGrid = () => cardData.map((card, key) => cardUI(card, key));
  return (
    <>
      <header className="header">
        <h1>Pokemon Buy List</h1>
        <h2>Summer 2026</h2>
      </header>
      <section className="card-grid ">{cardGrid()}</section>
    </>
  );
}

export default App;
