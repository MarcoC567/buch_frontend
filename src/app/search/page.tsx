"use client";

// Run:
// npm install react-bootstrap-icons
// TODO: Nur wenn eingeloggt, soll die Bearbeiten-Funktion sichtbar sein
// TODO: Titel Type

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../api/auth/useAuth";
import { Badge, Button, Form, Table, Alert } from "react-bootstrap";
import { InfoCircle, Pen } from "react-bootstrap-icons";
import Link from "next/link";

interface Buch {
  id: number;
  isbn: string;
  version: number;
  rating: string;
  titel: { titel: string };
  art: string;
  lieferbar: boolean;
  schlagwoerter: string[];
}

interface BuchDetails {
  isbn: string;
  version: number;
  rating?: string;
  art: string;
  preis: number;
  lieferbar: boolean;
  datum: string;
  homepage: string;
  schlagwoerter: string[];
  titel: string;
  rabatt: string;
}

const BookSearchPage = () => {
  const { writeAccess } = useAuth();
  const [buecher, setBuecher] = useState<Buch[]>([]); // Liste aller Bücher
  const [buchDetails, setBuchDetails] = useState<BuchDetails | null>(null); // Details eines Buches
  const [sucheISBN, setSucheISBN] = useState<string>(""); // ID für die Buchsuche
  const [sucheTitel, setSucheTitel] = useState<string>(""); // Titel für die Buchsuche
  const [selectedRatingOption, setSelectedRatingOption] = useState("");
  const [isJavaScript, setIsJavaScript] = useState(false);
  const [isTypeScript, setIsTypeScript] = useState(false);
  const [selectedBuchArt, setSelectedBuchArt] = useState("");
  const [isLieferbar, setIsLieferbar] = useState(false);
  const [error, setError] = useState(false);

  const fetchAllBooks = async () => {
    try {
      const response = await axios.post(
        "https://localhost:3000/graphql",
        {
          query: `
            query {
              buecher {
                id
                isbn
                rating
                art
                lieferbar
                schlagwoerter
                titel {
                  titel
                }
              }
            }
          `,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("API Response:", response.data);
  
      const fetchedBooks = response.data.data.buecher.map((buch: Buch) => {
        console.log("Vor return von fetchedBooks: ",buch);
  
        return {
          id: buch.id,
          isbn: buch.isbn,
          rating: buch.rating,
          titel: buch.titel,
          art: buch.art,
          lieferbar: buch.lieferbar,
          schlagwoerter: buch.schlagwoerter || [],
        };
      });
      console.log("nach fetchedBooks: ", fetchedBooks);
      setBuecher(fetchedBooks);
    } catch (err) {
      console.error("Error fetching buecher:", err);
      setError(true);
    }
  };
  

  // Reset filters and book details
  const resetFilters = () => {
    setSucheISBN("");
    setSucheTitel("");
    setSelectedRatingOption("");
    setIsJavaScript(false);
    setIsTypeScript(false);
    setSelectedBuchArt("");
    setIsLieferbar(false);
    setBuchDetails(null);
    setError(false);
    fetchAllBooks();
  };

  // Handle search
  const handleSearch = () => {
    let filteredBooks = [...buecher]; // Kopie der Bücherliste
  
    // ISBN-Filter
    if (sucheISBN) {
      filteredBooks = filteredBooks.filter((book) =>
        book.isbn.includes(sucheISBN) // ISBN kann als String oder Zahl vorliegen
      );
    }
  
    // Titel-Filter
    if (sucheTitel) {
      filteredBooks = filteredBooks.filter((book) =>
        book.titel.titel.toLowerCase().includes(sucheTitel.toLowerCase()) // Titel vergleichen
      );
    }

    // Rating-Filter
    if (selectedRatingOption) {
      const selectedRating = Number(selectedRatingOption);  // Convert to number directly
      filteredBooks = filteredBooks.filter(
        (book) => Number(book.rating) === selectedRating
      );
    }

    // JavaScript/TypeScript-Filter
    if (isJavaScript || isTypeScript) {
      filteredBooks = filteredBooks.filter((book) => {
        const lowerCaseSchlagwoerter = book.schlagwoerter.map((tag) => tag.toLowerCase());
        return (
          (isJavaScript && lowerCaseSchlagwoerter.includes("javascript")) ||
          (isTypeScript && lowerCaseSchlagwoerter.includes("typescript"))
        );
      });
    }

    // Buchformat-Filter (auf Grundlage von 'art')
    if (selectedBuchArt) {
      filteredBooks = filteredBooks.filter((book) => book.art === selectedBuchArt); // Werte wie "EPUB", "HARDCOVER"
    }

    // Lieferbarkeit-Filter
    if (isLieferbar) {
      filteredBooks = filteredBooks.filter((book) => book.lieferbar); // Einfacher Wahrheitswert-Check
    }

    // Fehlerstatus setzen, wenn keine Bücher gefunden werden
    setBuecher(filteredBooks);
    setError(filteredBooks.length === 0);
  };
  
  

  // Trigger search with Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  useEffect(() => {
    fetchAllBooks();
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

  return (
    <div className="container mt-5">
      <h1>Buchsuche</h1>
      <Form>
        <Form.Group className="mb-4">
          <Badge className="mb-3">ISBN</Badge>
          <Form.Control
            type="text"
            placeholder="ISBN des gesuchten Buchs"
            value={sucheISBN}
            onChange={(e) => setSucheISBN(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Badge className="mb-3">Titel</Badge>
          <Form.Control
            type="text"
            placeholder="Titel des gesuchten Buchs"
            value={sucheTitel}
            onChange={(e) => setSucheTitel(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Badge className="mb-3">Rating</Badge>
          <Form.Select
            value={selectedRatingOption}
            onChange={(e) => setSelectedRatingOption(e.target.value)}
            >
            <option value="">Wählen Sie ein Rating</option>
            {[1, 2, 3, 4, 5].map((star) => (
                <option key={star} value={star}>{`${star} Stern${star > 1 ? "e" : ""}`}</option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Badge className="mb-3">JavaScript oder TypeScript</Badge>
          <div>
            <Form.Check
              type="checkbox"
              label={<label htmlFor="javascript-checkbox">JavaScript</label>}
              id="javascript-checkbox"
              checked={isJavaScript}
              onChange={(e) => setIsJavaScript(e.target.checked)}
            />
            <Form.Check
              type="checkbox"
              label={<label htmlFor="typescript-checkbox">TypeScript</label>}
              id="typescript-checkbox"
              checked={isTypeScript}
              onChange={(e) => setIsTypeScript(e.target.checked)}
            />
          </div>
        </Form.Group>
        <Form.Group className="mb-3">
          <Badge className="mb-3">Buchformat</Badge>
          <div>
            <Form.Check
              type="radio"
              name="bookFormat"
              label={<label htmlFor="epub-format">EPUB</label>}
              value="EPUB"
              id="epub-format"
              checked={selectedBuchArt === "EPUB"}
              onChange={(e) => setSelectedBuchArt(e.target.value)}
            />
            <Form.Check
              type="radio"
              name="bookFormat"
              label={<label htmlFor="hardcover-format">Hardcover</label>}
              value="HARDCOVER"
              id="hardcover-format"
              checked={selectedBuchArt === "HARDCOVER"}
              onChange={(e) => setSelectedBuchArt(e.target.value)}
            />
            <Form.Check
              type="radio"
              name="bookFormat"
              label={<label htmlFor="paperback-format">Paperback</label>}
              value="PAPERBACK"
              id="paperback-format"
              checked={selectedBuchArt === "PAPERBACK"}
              onChange={(e) => setSelectedBuchArt(e.target.value)}
            />
          </div>
        </Form.Group>
        <Form.Group className="mb-">
          <Badge className="mb-3">Lieferbarkeit</Badge>
          <div>
            <Form.Check
              type="checkbox"
              label={<label htmlFor="lieferbar-checkbox">Nur lieferbare Bücher</label>}
              id="lieferbar-checkbox"
              checked={isLieferbar}
              onChange={(e) => setIsLieferbar(e.target.checked)}
            />
          </div>
        </Form.Group>
        <div className="mt-4">
          <Button variant="primary" onClick={handleSearch} className="me-2">
            Suchen
          </Button>
          <Button variant="secondary" onClick={resetFilters}>
            Zurücksetzen
          </Button>
        </div>
      </Form>

      {error && (
        <Alert variant="danger" className="mt-4">
          Keine Ergebnisse gefunden. Bitte versuchen Sie es erneut.
        </Alert>
      )}

      {/* Buchdetails anzeigen */}
      {buchDetails && (
        <div className="mt-4">
          <h3>Details zum Buch</h3>
          <p><strong>ISBN:</strong> {buchDetails.isbn}</p>
          <p><strong>Titel:</strong> {buchDetails.titel}</p>
          <p><strong>Version:</strong> {buchDetails.version}</p>
          <p><strong>Rating:</strong> {buchDetails.rating}</p>
          <p><strong>Art:</strong> {buchDetails.art}</p>
          <p><strong>Preis:</strong> {buchDetails.preis} €</p>
          <p><strong>Lieferbar:</strong> {buchDetails.lieferbar ? "Ja" : "Nein"}</p>
          <p><strong>Datum:</strong> {buchDetails.datum}</p>
          <p><strong>Homepage:</strong> <a href={buchDetails.homepage}>{buchDetails.homepage}</a></p>
          <p><strong>Schlagwörter:</strong> {buchDetails.schlagwoerter.join(", ")}</p>
          <p><strong>Rabatt:</strong> {buchDetails.rabatt}</p>
        </div>
      )}

      {/* Liste aller Bücher */}
      <h3 className="mt-5">Liste aller Bücher</h3>
      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>ID</th>
            <th>ISBN</th>
            <th>Titel</th>
            <th>Rating</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {buecher.map((buecher) => (
            <tr key={buecher.id}>
              <td>{buecher.id}</td>
              <td>{buecher.isbn}</td>
              <td>{buecher.titel.titel}</td>
              <td>{renderStars(buecher.rating)}</td>
              <td>
                {/* InfoCircle immer anzeigen */}
                <Link href={`/details?id=${buecher.id}`} passHref>
                  <InfoCircle style={{ cursor: "pointer", marginRight: "10px" }} />
                </Link>
                {/* Pen nur anzeigen, wenn eingeloggt */}
                {writeAccess && (
                  <Link href={`/details/${buecher.id}/edit`} passHref>
                    <Pen style={{ cursor: "pointer" }} />
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default BookSearchPage;
