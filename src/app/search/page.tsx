"use client";

// Run:
// npm install react-bootstrap-icons
// TODO: Bei Suche nach Büchern die lieferbar/ nicht lieferbar sind suchen 
// TODO: Suche nach Buchformaten funktioniert noch nicht
// TODO: Suche nach JavaScript oder TypeScript funktioniert noch nicht

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Form, Table, Alert } from "react-bootstrap";
import { InfoCircle, Pen } from "react-bootstrap-icons";
import Link from "next/link";

interface Buch {
  id: number;
  version: number;
  rating: string;
  titel: string;
  art: string;
  schlagwoerter: string[];
}

interface BookDetails {
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
  const [buecher, setBuecher] = useState<Buch[]>([]); // Liste aller Bücher
  const [buchDetails, setBuchDetails] = useState<BookDetails | null>(null); // Details eines Buches
  const [sucheISBN, setSucheISBN] = useState<string>(""); // ID für die Buchsuche
  const [sucheTitel, setSucheTitel] = useState<string>(""); // Titel für die Buchsuche
  const [selectedRatingOption, setSelectedRatingOption] = useState("");
  const [isJavaScript, setIsJavaScript] = useState(false);
  const [isTypeScript, setIsTypeScript] = useState(false);
  const [selectedBuchArt, setSelectedBuchArt] = useState("");
  const [error, setError] = useState(false);

  // 
  const [activeLink, setActiveLink] = useState("#");
  const handleLinkClick = (tabName: string) => setActiveLink(tabName);

  // Fetch all buecher (id, version, titel, and type)
  const fetchAllBooks = async () => {
    try {
      const response = await axios.post(
        "https://localhost:3000/graphql",
        {
          query: `
            query {
              buecher {
                id
                version
                rating
                art
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

      const fetchedBooks = response.data.data.buecher.map((buch: any) => ({
        id: buch.id,
        version: buch.version,
        rating: buch.rating,
        titel: buch.titel.titel,
        art: buch.art,
      }));
      setBuecher(fetchedBooks);
    } catch (err) {
      console.error("Error fetching buecher:", err);
      setError(true);
    }
  };

  // Fetch details of a single book by ID
  const fetchBookDetails = async (id: string) => {
    try {
      const response = await axios.post(
        "https://localhost:3000/graphql",
        {
          query: `
            query {
              buch(id: ${id}) {
                isbn
                version
                rating
                art
                preis
                lieferbar
                datum
                homepage
                schlagwoerter
                titel {
                  titel
                }
                rabatt
              }
            }
          `,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const details = response.data.data.buch;
      setBuchDetails({
        isbn: details.isbn,
        version: details.version,
        rating: details.rating,
        art: details.art,
        preis: details.preis,
        lieferbar: details.lieferbar,
        datum: details.datum,
        homepage: details.homepage,
        schlagwoerter: details.schlagwoerter,
        titel: details.titel.titel,
        rabatt: details.rabatt,
      });
      setError(false);
    } catch (err) {
      console.error("Error fetching book details:", err);
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
    setBuchDetails(null);
    setError(false);
    fetchAllBooks();
  };

  // Handle search by ID or Title
  const handleSearch = () => {
    if (sucheISBN) {
      fetchBookDetails(sucheISBN);
    } else if (sucheTitel) {
      const filteredBooks = buecher.filter((book) =>
        book.titel.toLowerCase().includes(sucheTitel.toLowerCase())
      );
      if (filteredBooks.length > 0) {
        setBuecher(filteredBooks);
        setError(false);
      } else {
        setError(true);
      }
    } else if (selectedRatingOption) {
      const selectedRating = parseInt(selectedRatingOption, 10); // String zu Zahl
      const filteredBooks = buecher.filter((book) => book.rating === selectedRating);
      setBuecher(filteredBooks);
      setError(filteredBooks.length === 0);
    } else if (selectedBuchArt) {
      const filteredBooks = buecher.filter((book) => {
        // Prüfe, ob 'art' definiert ist, bevor auf 'includes' zugegriffen wird
        const bookType = book.art?.toLowerCase();
        if (isJavaScript && bookType === "javascript") return true;
        if (isTypeScript && bookType === "typescript") return true;
        return false;
      });
      setBuecher(filteredBooks);
      setError(filteredBooks.length === 0);
    } 
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

  return (
    <div className="container mt-5">
      <h1>Buchsuche</h1>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>ISBN</Form.Label>
          <Form.Control
            type="text"
            placeholder="ISBN des gesuchten Buchs"
            value={sucheISBN}
            onChange={(e) => setSucheISBN(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Titel</Form.Label>
          <Form.Control
            type="text"
            placeholder="Titel des gesuchten Buchs"
            value={sucheTitel}
            onChange={(e) => setSucheTitel(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Rating</Form.Label>
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
          <Form.Label>JavaScript oder TypeScript</Form.Label>
          <Form.Check
            type="checkbox"
            label="JavaScript"
            checked={isJavaScript}
            onChange={(e) => setIsJavaScript(e.target.checked)}
          />
          <Form.Check
            type="checkbox"
            label="TypeScript"
            checked={isTypeScript}
            onChange={(e) => setIsTypeScript(e.target.checked)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Buchformat</Form.Label>
          <div>
            <Form.Check
              type="radio"
              name="bookFormat"
              label="Druckausgabe"
              value="DRUCKAUSGABE"
              checked={selectedBuchArt === "DRUCKAUSGABE"}
              onChange={(e) => setSelectedBuchArt(e.target.value)}
            />
            <Form.Check
              type="radio"
              name="bookFormat"
              label="Kindle"
              value="KINDLE"
              checked={selectedBuchArt === "KINDLE"}
              onChange={(e) => setSelectedBuchArt(e.target.value)}
            />
          </div>
        </Form.Group>
        <Button variant="primary" onClick={handleSearch} className="me-2">
          Suchen
        </Button>
        <Button variant="secondary" onClick={resetFilters}>
          Zurücksetzen
        </Button>
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
            <th>Version</th>
            <th>Titel</th>
            <th>Art</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {buecher.map((buch) => (
            <tr key={buch.id}>
              <td>{buch.id}</td>
              <td>{buch.version}</td>
              <td>{buch.titel}</td>
              <td>{buch.art}</td>
              <td>
                {/* InfoCircle führt zu Details-Ansicht */}
                <Link href={`/details/${buch.id}`} passHref>
                  <InfoCircle style={{ cursor: "pointer", marginRight: "10px" }} />
                </Link>
                {/* Pen führt zur Bearbeiten-Ansicht */}
                <Link href={`/details/${buch.id}/edit`} passHref>
                  <Pen style={{ cursor: "pointer" }} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

    </div>
  );
};

export default BookSearchPage;
