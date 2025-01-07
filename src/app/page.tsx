"use client";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {api} from "./config";
import formatPrice from "../app/utils/priceFormatter";

interface CardData {
  id: string;
  preis: number;
  title: string;
  rating: string;
  art: string;
}

interface BuchResponse {
  id: string,
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
  const router = useRouter();

  const moveToDetails = (id: string) => {
    if(!id){
      console.error("ID is missing");
    }
    router.push(`/details?id=${id}`); // Navigiere zur Detail-Seite für das spezifische Buch
  };

  // Fetch data from the backend
  const fetchCards = async () => {
    try {

      const response = await axios.post(
        `${api}/graphql`,
        {
          query: `
            query {
              buecher {
                id
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
          id: buch.id.toString(),
          preis: buch.preis,
          title: buch.titel.titel,
          rating: buch.rating || "No rating available",
          art: buch.art,
        })
      );
      
      setCards(fetchedCards);
      setVisibleCards(fetchedCards.slice(0, 3));
    } catch (error) {
      console.error("Error fetching cards:", error);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  
  const renderStars = (rating: string) => {
    const ratingValue = parseFloat(rating);
    const fullStars = Math.floor(ratingValue);
    const hasHalfStar = ratingValue % 1 !== 0;

   
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push("★"); 
      } else if (i === fullStars && hasHalfStar) {
        stars.push("☆"); 
      } else {
        stars.push("☆"); 
      }
    }

    return stars.join(" "); 
  };

  
  const moveNext = useCallback(() => {
    if (cards.length < 4) return;

    const nextIndex = (currentIndex + 1) % cards.length;
    const newVisibleCards = [
      ...visibleCards.slice(1), 
      cards[(currentIndex + 3) % cards.length], 
    ];

    setCurrentIndex(nextIndex);
    setVisibleCards(newVisibleCards);
  }, [cards, currentIndex, visibleCards]);

  const movePrevious = useCallback(() => {
    if (cards.length < 4) return;

    const previousIndex = (currentIndex - 1 + cards.length) % cards.length;
    const newVisibleCards = [
      cards[(previousIndex - 1 + cards.length) % cards.length], 
      ...visibleCards.slice(0, 2),
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
    <div style={{ marginTop: "60px", position: "relative", height: "auto" }}>
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
        <div
          style={{
            display: "flex",
            gap: "15px",
            width: "auto",
            transition: "transform 0.5s ease-in-out",
          }}
        >
          {visibleCards.map((card, index) => (
            <div
              className="card border-primary"
              style={{
                width: "350px",
                height: "350px",
                flexShrink: 0,
                borderRadius: "10px",
                overflow: "hidden",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
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
                  width: "150px",
                  height: "50px",
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
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%", 
                    marginBottom: "20px"
                  }}
                >
                  <p style={{ margin: "5px 0" }}>
                    <strong>Preis:</strong> {card.preis !== undefined
                                  ? formatPrice(
                                      typeof card.preis === "string"
                                        ? parseFloat(card.preis)
                                        : card.preis
                                    )
                                  : "Preis nicht verfügbar"} 
                  </p>
                  <p style={{ margin: "5px 0" }}>
                    <strong>Art:</strong> {card.art}
                  </p>
                  <p style={{ margin: "5px 0" }}>
                    <strong>Bewertung:</strong> {renderStars(card.rating)}
                  </p>
                </div>
                <a  className="btn btn-primary my-3" onClick={() => moveToDetails(card.id)}>
                  Details
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
     
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
