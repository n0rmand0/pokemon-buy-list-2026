import { useEffect, useState } from "react";
import TCGdex from "@tcgdex/sdk";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "./assets/vite.svg";
// import heroImg from "./assets/hero.png";
import "./App.css";
import { cards } from "./cards";
import { sets } from "./sets";

// Instantiate the SDK with your preferred language
const tcgdex = new TCGdex("en");

let setData: Record<string, any> = {};

function App() {
  // const [isLoading, setIsLoading] = useState(true);
  const [cardData, setCardData] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<string>("set-release-oldest");

  useEffect(() => {
    onLoad();
  }, []);

  // test
  // const testseries = async () => {
  //   await tcgdex.fetch("sets").then((data) => {
  //     console.log("test data:", data);
  //   });
  // };
  // testseries();
  // const testset = async () => {
  //   await tcgdex.fetch("sets", "smp").then((data) => {
  //     console.log("test data:", data);
  //   });
  // };
  // testset();

  const onLoad = async () => {
    try {
      const cardPromises = cards.map(
        async (card) => await tcgdex.card.get(card.id),
      );
      const setPromises = sets.map(
        async (id) => await tcgdex.fetch("sets", id),
      );

      // Wait for all sets.map promises to complete
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
        combinedData.sort(
          (a, b) =>
            new Date(a.localId || 0).getTime() -
            new Date(b.localId || 0).getTime(),
        );
        getAppreciation(combinedData);
        setCardData(combinedData); //
        console.log("Card Data loaded:", combinedData);
      });

      console.log("All data loaded successfully");
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const getAppreciation = (all: any) => {
    all.map((card: any) => {
      const oneMonthPrice = card.priceHistory.onemonth;
      const sixMonthPrice = card.priceHistory.sixmonth;

      card.appreciationSix =
        oneMonthPrice && sixMonthPrice
          ? (((sixMonthPrice - oneMonthPrice) / oneMonthPrice) * 100).toFixed(0)
          : "--";
      card.appreciationMarket =
        card.pricing?.tcgplayer?.holofoil.marketPrice && sixMonthPrice
          ? (
              ((card.pricing?.tcgplayer?.holofoil.marketPrice - sixMonthPrice) /
                sixMonthPrice) *
              100
            ).toFixed(0)
          : "--";
    });
  };

  const cardUI = (card: any, key: number) => {
    // cards[card.id].appreciationMarket = appreciationMarket;

    return (
      <div key={key} className="card">
        <div className="card-image">
          <img src={card.image + "/low.jpg"} alt={card.name} />
        </div>
        <div className="card-data">
          <h3 className="card-name">{card.name}</h3>
          <p className="card-set">
            {card.set?.name} {card.localId}/{card.set.cardCount.official}
          </p>
          {/* <p className="card-date">Nov 12,2026</p> */}
          <p className="card-price">
            1 Month Price: ${Number(card.priceHistory.onemonth.toFixed(2))}{" "}
          </p>
          <p className="card-price">
            6 Month Price: ${Number(card.priceHistory.sixmonth.toFixed(2))}{" "}
            <span
              className={
                Number(card.appreciationSix) < 0
                  ? "card-neg-appreciation "
                  : "card-pos-appreciation"
              }
            >
              ({Number(card.appreciationSix)}%)
            </span>
          </p>
          <p className="card-market-price">
            <span className="card-market-price-icon"></span>
            Market Price $
            {Number(card.pricing.tcgplayer?.holofoil.marketPrice.toFixed(2)) ||
              "--"}
            <span
              className={
                Number(card.appreciationMarket) < 0
                  ? "card-neg-appreciation "
                  : "card-pos-appreciation"
              }
            >
              ({Number(card.appreciationMarket)}%)
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

  const getSortedData = () => {
    const dataCopy = [...cardData];
    switch (sortBy) {
      case "market-low":
        return dataCopy.sort(
          (a, b) =>
            (a.pricing.tcgplayer?.holofoil.marketPrice || 0) -
            (b.pricing.tcgplayer?.holofoil.marketPrice || 0),
        );
      case "market-high":
        return dataCopy.sort(
          (a, b) =>
            (b.pricing.tcgplayer?.holofoil.marketPrice || 0) -
            (a.pricing.tcgplayer?.holofoil.marketPrice || 0),
        );
      case "set-release-newest":
        return dataCopy.sort(
          (a, b) =>
            new Date(setData[b.set?.id].releaseDate || 0).getTime() -
            new Date(setData[a.set?.id].releaseDate || 0).getTime(),
        );
      case "set-release-oldest":
        return dataCopy.sort(
          (a, b) =>
            new Date(setData[a.set?.id].releaseDate || 0).getTime() -
            new Date(setData[b.set?.id].releaseDate || 0).getTime(),
        );

      case "appreciation-high":
        return dataCopy.sort(
          (a, b) => (b.appreciationMarket || 0) - (a.appreciationMarket || 0),
        );
      case "appreciation-low":
        return dataCopy.sort(
          (a, b) => (a.appreciationMarket || 0) - (b.appreciationMarket || 0),
        );
      default:
        return dataCopy;
    }
  };

  const cardGrid = () => getSortedData().map((card, key) => cardUI(card, key));
  return (
    <>
      <header className="header">
        <div className="header-title">
          <h1>Pokemon Buy List</h1>
          <h2>Summer 2026</h2>
        </div>
        <div className="header-sort">
          <label htmlFor="sort-dropdown">Sort by: </label>
          <select
            id="sort-dropdown"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-dropdown"
          >
            <option value="set-release-oldest">
              Set Release Date (Oldest)
            </option>
            <option value="set-release-newest">
              Set Release Date (Newest)
            </option>

            <option value="market-low">Market Price (Low to High)</option>
            <option value="market-high">Market Price (High to Low)</option>
            <option value="appreciation-high">
              Appreciation (High to Low)
            </option>
            <option value="appreciation-low">Appreciation (Low to High)</option>
          </select>
        </div>
      </header>
      <section className="card-grid ">{cardGrid()}</section>
    </>
  );
}

export default App;
