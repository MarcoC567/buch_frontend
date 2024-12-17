"use client";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Alert, Spinner, Container, Badge } from "react-bootstrap";
import { format } from "date-fns";
import _ from "lodash";

const formatPrice = (preis: number) => {
  const formatter = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  });
  return formatter.format(preis);
};

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd.MM.yyyy");
  } catch {
    return "Ungültiges Datum";
  }
};

const renderStars = (rating: string) => {
  const ratingValue = parseFloat(rating);
  const fullStars = Math.floor(ratingValue);
  const hasHalfStar = ratingValue % 1 !== 0;

  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push("★");  // Volle Sterne
    } else if (i === fullStars && hasHalfStar) {
      stars.push("☆");  // Halbe Sterne
    } else {
      stars.push("☆");  // Leere Sterne
    }
  }

  return stars.join(" "); // Sterne als String zurückgeben
};

const formatRabatt = (rabatt: number) => `${_.round(rabatt, 2)}%`;

const BookDetails = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [buchTitel, setBuchTitel] = useState("");
  const [buchUntertitel, setBuchUntertitel] = useState("");
  const [buchPreis, setBuchPreis] = useState("");
  const [buchArt, setBuchArt] = useState("");
  const [buchDatum, setBuchDatum] = useState("");
  const [buchHomepage, setBuchHomepage] = useState("");
  const [buchLieferbar, setBuchLieferbar] = useState(false);
  const [buchRabatt, setBuchRabatt] = useState(0);
  const [buchRating, setBuchRating] = useState(0);
  const [buchSchlagwoerter, setBuchSchlagwoerter] = useState([]);
  const [searchError, setSearchError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleSearch = useCallback(async () => {
    console.log("Suche nach Buch mit der ID:", id);
    try {
      setLoading(true);
      const response = await axios.post(
        "https://localhost:3000/graphql",
        {
          query: `
            query ($id: ID!) {
              buch(id: $id) {
                id
                preis
                art
                rating
                lieferbar
                datum
                homepage
                rabatt
                schlagwoerter
                titel {
                  titel
                  untertitel
                }
              }
            }
          `,
          variables: { id },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const results = response.data?.data?.buch;
      console.log("Ergebnisse:", results);

      if (!results) {
        console.warn("Keine Ergebnisse für ID gefunden:", id);
        setSearchError(true);
      } else {
        setSearchError(false);
        setBuchTitel(results.titel?.titel || "Kein Titel gefunden");
        setBuchUntertitel(
          results.titel?.untertitel !== "null"
            ? results.titel?.untertitel
            : "Kein Untertitel vorhanden"
        );
        setBuchPreis(results.preis || "");
        setBuchArt(results.art || "Art nicht verfügbar");
        setBuchDatum(results.datum || "Datum nicht verfügbar");
        setBuchHomepage(results.homepage || "Homepage nicht verfügbar");
        setBuchLieferbar(results.lieferbar || false);
        setBuchRabatt(
          results.rabatt !== undefined && results.rabatt !== null
            ? parseFloat(results.rabatt)
            : 0
        );
        setBuchRating(results.rating || 0);
        setBuchSchlagwoerter(
          results.schlagwoerter && results.schlagwoerter.length > 0
            ? results.schlagwoerter
            : ["-"]
        );
      }
    } catch (error) {
      console.error("Fehler bei der Suche:", error);
      setSearchError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      handleSearch();
    }
  }, [id, handleSearch]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (searchError) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Alert variant="danger">
          <Alert.Heading>Buch nicht gefunden!</Alert.Heading>
          <p>Keine gültige ID</p>
        </Alert>
      </Container>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div
        className="card"
        style={{
          width: "550px",
          height: "500px",
          flexShrink: 0,
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          borderRadius: "10px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          padding: "10px",
          position: "relative",
        }}
      >
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <h1>{buchTitel || "Titel nicht verfügbar"}</h1>
          <h4 className="text-muted">
            {buchUntertitel ? `-${buchUntertitel}-` : ""}
          </h4>
          <h3>
            {buchPreis !== undefined
              ? formatPrice(
                  typeof buchPreis === "string"
                    ? parseFloat(buchPreis)
                    : buchPreis
                )
              : "Preis nicht verfügbar"}
          </h3>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flex: 1,
            padding: "0 50px",
          }}
        >
          <div>
            <div style={{ marginBottom: "20px" }}>
              <Badge style={{ fontSize: "1.0rem", padding: "10px" }}>Art</Badge>
              <div style={{ fontSize: "0.9rem", marginTop: "5px" }}>
                {buchArt || "Art nicht verfügbar"}
              </div>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <Badge style={{ fontSize: "1.0rem", padding: "10px" }}>
                Datum
              </Badge>
              <div style={{ fontSize: "0.9rem", marginTop: "5px" }}>
                {buchDatum ? formatDate(buchDatum) : "Datum nicht verfügbar"}
              </div>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <Badge style={{ fontSize: "1.0rem", padding: "10px" }}>
                Homepage
              </Badge>
              <div style={{ fontSize: "0.9rem", marginTop: "5px" }}>
                {buchHomepage ? (
                  <a
                    href={buchHomepage}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {buchHomepage}
                  </a>
                ) : (
                  "Homepage nicht verfügbar"
                )}
              </div>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <Badge style={{ fontSize: "1.0rem", padding: "10px" }}>
                Lieferbar
              </Badge>
              <div style={{ fontSize: "0.9rem", marginTop: "5px" }}>
                {buchLieferbar !== undefined
                  ? buchLieferbar
                    ? "Ja"
                    : "Nein"
                  : "Lieferbarkeitsstatus nicht verfügbar"}
              </div>
            </div>
          </div>

          <div>
            <div style={{ marginBottom: "20px" }}>
              <Badge style={{ fontSize: "1.0rem", padding: "10px" }}>
                Rabatt
              </Badge>
              <div style={{ fontSize: "1.1rem", marginTop: "5px" }}>
                {buchRabatt !== undefined
                  ? formatRabatt(buchRabatt)
                  : "Rabatt nicht verfügbar"}
              </div>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <Badge style={{ fontSize: "1.0rem", padding: "10px" }}>
                Rating
              </Badge>
              <div style={{ fontSize: "1.1rem", marginTop: "5px" }}>
                {buchRating !== undefined
                  ? renderStars(buchRating.toString())
                  : "Rating nicht verfügbar"}
              </div>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <Badge style={{ fontSize: "1.0rem", padding: "10px" }}>
                Schlagwörter
              </Badge>
              <div style={{ fontSize: "1.1rem", marginTop: "5px" }}>
                {buchSchlagwoerter && buchSchlagwoerter.length > 0
                  ? buchSchlagwoerter.join(", ")
                  : "Schlagwörter nicht verfügbar"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
