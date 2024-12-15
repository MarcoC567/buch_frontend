"use client";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Image from "next/image";

interface CardData {
  preis: number;
  title: string;
  rating: string;
  art: string;
}

interface BuchResponse {
  preis: number;
  art: string;
  rating?: string;
  titel: {
    titel: string;
  };
}

const Homepage: React.FC = () => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [visibleCards, setVisibleCards] = useState<CardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch data from the backend
  const fetchCards = async () => {
    try {

      const response = await axios.post(
        "https://localhost:3000/graphql",
        {
          query: `
            query {
              buecher {
                preis
                art
                rating
                titel {
                  titel
                }
              }
            }
          `,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const fetchedCards: CardData[] = response.data.data.buecher.map(
        (buch: BuchResponse) => ({
          preis: buch.preis,
          title: buch.titel.titel,
          rating: buch.rating || "No rating available",
          art: buch.art,
        })
      );

      setCards(fetchedCards);
      setVisibleCards(fetchedCards.slice(0, 3)); // Zeigt die ersten 3 Karten an
    } catch (error) {
      console.error("Error fetching cards:", error);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  // Funktion zur Anzeige von Sternen
  const renderStars = (rating: string) => {
    const ratingValue = parseFloat(rating);
    const fullStars = Math.floor(ratingValue);
    const hasHalfStar = ratingValue % 1 !== 0;

    // Erstelle Sterne als Array
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push("★"); // Voller Stern
      } else if (i === fullStars && hasHalfStar) {
        stars.push("☆"); // Halber Stern
      } else {
        stars.push("☆"); // Leer Stern
      }
    }

    return stars.join(" "); // Sterne als String zurückgeben
  };

  // Move the carousel forward
  const moveNext = useCallback(() => {
    if (cards.length < 4) return;

    const nextIndex = (currentIndex + 1) % cards.length;
    const newVisibleCards = [
      ...visibleCards.slice(1), // Entferne die linke Karte
      cards[(currentIndex + 3) % cards.length], // Füge eine neue Karte von rechts hinzu
    ];

    setCurrentIndex(nextIndex);
    setVisibleCards(newVisibleCards);
  }, [cards, currentIndex, visibleCards]);

  const movePrevious = useCallback(() => {
    if (cards.length < 4) return;

    const previousIndex = (currentIndex - 1 + cards.length) % cards.length;
    const newVisibleCards = [
      cards[(previousIndex - 1 + cards.length) % cards.length], // Füge eine Karte links hinzu
      ...visibleCards.slice(0, 2), // Entferne die rechte Karte
    ];

    setCurrentIndex(previousIndex);
    setVisibleCards(newVisibleCards);
  }, [cards, currentIndex, visibleCards]);

  useEffect(() => {
    const interval = setInterval(() => {
      moveNext();
    }, 10000);
    return () => clearInterval(interval);
  }, [moveNext]);

  return (
    <div style={{ marginTop: "100px", position: "relative", height: "auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          overflow: "hidden",
          width: "100%",
          height: "auto",
          position: "relative",
        }}
      >
        {/* Container für die Karten */}
        <div
          style={{
            display: "flex",
            gap: "20px", // Abstand von 20px zwischen den Karten
            width: "auto",
            transition: "transform 0.5s ease-in-out",
          }}
        >
          {/* Karten */}
          {visibleCards.map((card, index) => (
            <div
              className="card"
              style={{
                width: "400px",
                height: "400px",
                flexShrink: 0,
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                borderRadius: "10px",
                overflow: "hidden",
                textAlign: "center",
                display: "flex",
                flexDirection: "column", // Vertikale Ausrichtung der Inhalte
                justifyContent: "center", // Vertikal zentrieren
                alignItems: "center", // Horizontal zentrieren
                padding: "10px",
              }}
              key={index}
            >
              <Image
                src="./book.svg"
                className="card-img-top my-4"
                width={200}
                height={100}
                alt={card.title}
                style={{
                  width: "200px",
                  height: "100px",
                  margin: "0 auto",
                }}
              />
              <div className="card-body" style={{ flexGrow: 1 }}>
                <h5
                  className="card-title"
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    color: "#007bff",
                    marginBottom: "10px",
                  }}
                >
                  {card.title}
                </h5>
                <div
                  style={{
                    textAlign: "center", // Zentriert alle Texte in der Mitte
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%", // Stellt sicher, dass die Texte gleichmäßig verteilt sind
                    marginBottom: "20px", // Abstand unten
                  }}
                >
                  <p style={{ margin: "5px 0" }}>
                    <strong>Preis:</strong> {card.preis} €
                  </p>
                  <p style={{ margin: "5px 0" }}>
                    <strong>Art:</strong> {card.art}
                  </p>
                  <p style={{ margin: "5px 0" }}>
                    <strong>Bewertung:</strong> {renderStars(card.rating)}
                  </p>
                </div>
                <a href="#" className="btn btn-primary my-3">
                  Details
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          position: "absolute",
          top: "50%",
          width: "100%",
          transform: "translateY(-50%)",
        }}
      >
        <button
          className="btn btn-secondary"
          style={{ marginLeft: "20px" }}
          onClick={movePrevious}
        >
          {"<"}
        </button>
        <button
          className="btn btn-secondary"
          style={{ marginRight: "20px" }}
          onClick={moveNext}
        >
          {">"}
        </button>
      </div>
    </div>
  );
};

export default Homepage;
