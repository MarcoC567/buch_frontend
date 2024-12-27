"use client";

import React, {  useState } from "react";
import axios from "axios";
import { useAuth } from "../api/auth/useAuth";
import { Badge, Button, Form, Table, Alert } from "react-bootstrap";
import { InfoCircle, Pen, Trash } from "react-bootstrap-icons";
import Link from "next/link";
import {api} from "../config";

interface Buch {
  id: number;
  isbn: string;
  rating: string;
  titel: { titel: string };
  art: string;
  lieferbar: boolean;
  schlagwoerter: string[];
}

const DELETE_BOOK_MUTATION = `
  mutation deleteBook($id: ID!) {
    delete(id: $id)
  }
`;


const BookSearchPage = () => {
  const { writeAccess } = useAuth();
  const [filteredBooks, setFilteredBooks] = useState<Buch[]>([]); // Nur die Suchergebnisse
  const [sucheISBN, setSucheISBN] = useState<string>(""); // ISBN für die Buchsuche
  const [sucheTitel, setSucheTitel] = useState<string>(""); // Titel für die Buchsuche
  const [sucheRating, setSucheRating] = useState(""); // Rating für die Buchsuche
  const [istJavaScript, setIstJavaScript] = useState(false);
  const [istTypeScript, setIstTypeScript] = useState(false);
  const [istPython, setIstPython] = useState(false);
  const [sucheBuchArt, setSucheBuchArt] = useState<string>("");
  const [istLieferbar, setIstLieferbar] = useState<boolean>(false);
  const { token } = useAuth();
  const [error, setError] = useState(false);

  const handleSearch = async () => {
    try {
      const response = await axios.post(
        `${api}/graphql`,
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
        { headers: { "Content-Type": "application/json" } }
      );

      let buecher = response.data.data.buecher;

      if (sucheISBN) {
        buecher = buecher.filter((buch: Buch) => buch.isbn.includes(sucheISBN));
      }

      if (sucheTitel) {
        buecher = buecher.filter((buch: Buch) =>
          buch.titel.titel.toLowerCase().includes(sucheTitel.toLowerCase())
        );
      }

      if (sucheRating) {
        const selectedRating = Number(sucheRating);  // Convert to number directly
        buecher = buecher.filter(
          (buch: Buch) => Number(buch.rating) === selectedRating
        );
      }

      if (istJavaScript || istTypeScript || istPython) {
        buecher = buecher.filter((buch: Buch) => {
          const lowerCaseSchlagwoerter = Array.isArray(buch.schlagwoerter)
            ? buch.schlagwoerter.map((tag) => tag.toLowerCase())
            : [];
          return (
            (istJavaScript && lowerCaseSchlagwoerter.includes("javascript")) ||
            (istTypeScript && lowerCaseSchlagwoerter.includes("typescript")) ||
            (istPython && lowerCaseSchlagwoerter.includes("python"))
          );
        });
      }          

      if (sucheBuchArt) {
        buecher = buecher.filter((buch: Buch) => buch.art === sucheBuchArt); // Werte wie "EPUB", "HARDCOVER"
      }

      if (istLieferbar) {
        buecher = buecher.filter((buch: Buch) => buch.lieferbar); // Einfacher Wahrheitswert-Check
      }

      setFilteredBooks(buecher);
      setError(buecher.length === 0);
    } catch (err) {
      console.error("Error fetching buecher:", err);
      setError(true);
    }
  };

  const resetFilters = () => {
    setSucheISBN("");
    setSucheTitel("");
    setFilteredBooks([]);
    setSucheRating("");
    setIstJavaScript(false);
    setIstTypeScript(false);
    setIstPython(false);
    setSucheBuchArt("");
    setIstLieferbar(false);
    setError(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleDeleteRow = async (id: number) => {
    try {
      const response = await axios.post(
        "https://localhost:3000/graphql",
        {
          query: DELETE_BOOK_MUTATION,
          variables: { id },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Authentifizierungstoken hinzufügen
            "Content-Type": "application/json",
          },
        }
      );
  
      const { data, errors } = response.data;
  
      if (errors && errors.length > 0) {
        throw new Error(errors[0].message); // Fehler vom Server anzeigen
      }
  
      const success = data?.delete;
      if (success) {
        // Entferne das Buch aus der lokalen Liste
        setFilteredBooks((prevBooks) => prevBooks.filter((buch) => buch.id !== id));
        alert("Das Buch wurde erfolgreich gelöscht.");
      } else {
        throw new Error("Fehler beim Löschen des Buches.");
      }
    } catch (err) {
      console.error("Fehler beim Löschen des Buches:", err);
      alert("Das Buch konnte nicht gelöscht werden. Bitte versuchen Sie es erneut.");
    }
  };
  
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

  return (
    <div className="container mt-5">
      <h1>Buchsuche</h1>
      <Form>
        <Form.Group className="mb-4">
          <Badge>ISBN</Badge>
          <Form.Control
            style={{ fontSize: "0.9rem", marginTop: "5px" }}
            type="text"
            placeholder="ISBN des gesuchten Buchs"
            value={sucheISBN}
            onChange={(e) => setSucheISBN(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Badge>Titel</Badge>
          <Form.Control
            style={{ fontSize: "0.9rem", marginTop: "5px" }}
            type="text"
            placeholder="Titel des gesuchten Buchs"
            value={sucheTitel}
            onChange={(e) => setSucheTitel(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Badge>Rating</Badge>
          <Form.Select
            style={{ fontSize: "0.9rem", marginTop: "5px" }}
            value={sucheRating}
            onChange={(e) => setSucheRating(e.target.value)}
            >
            <option value="">Wählen Sie ein Rating</option>
            {[1, 2, 3, 4, 5].map((star) => (
                <option key={star} value={star}>{`${star} Stern${star > 1 ? "e" : ""}`}</option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Badge>Schlagwörter</Badge>
          <div style={{ fontSize: "0.9rem", marginTop: "5px" }}>
            <Form.Check
              type="checkbox"
              label={<label htmlFor="javascript-checkbox">JavaScript</label>}
              id="javascript-checkbox"
              checked={istJavaScript}
              onChange={(e) => setIstJavaScript(e.target.checked)}
            />
            <Form.Check
              type="checkbox"
              label={<label htmlFor="typescript-checkbox">TypeScript</label>}
              id="typescript-checkbox"
              checked={istTypeScript}
              onChange={(e) => setIstTypeScript(e.target.checked)}
            />
            <Form.Check
              type="checkbox"
              label={<label htmlFor="python-checkbox">Python</label>}
              id="Python-checkbox"
              checked={istPython}
              onChange={(e) => setIstPython(e.target.checked)}
            />
          </div>
        </Form.Group>
        <Form.Group className="mb-3">
          <Badge>Buchformat</Badge>
          <div style={{ fontSize: "0.9rem", marginTop: "5px" }}>
            <Form.Check
              type="radio"
              name="bookFormat"
              label={<label htmlFor="epub-format">EPUB</label>}
              value="EPUB"
              id="epub-format"
              checked={sucheBuchArt === "EPUB"}
              onChange={(e) => setSucheBuchArt(e.target.value)}
            />
            <Form.Check
              type="radio"
              name="bookFormat"
              label={<label htmlFor="hardcover-format">Hardcover</label>}
              value="HARDCOVER"
              id="hardcover-format"
              checked={sucheBuchArt === "HARDCOVER"}
              onChange={(e) => setSucheBuchArt(e.target.value)}
            />
            <Form.Check
              type="radio"
              name="bookFormat"
              label={<label htmlFor="paperback-format">Paperback</label>}
              value="PAPERBACK"
              id="paperback-format"
              checked={sucheBuchArt === "PAPERBACK"}
              onChange={(e) => setSucheBuchArt(e.target.value)}
            />
          </div>
        </Form.Group>
        <Form.Group className="mb-">
          <Badge>Lieferbarkeit</Badge>
          <div style={{ fontSize: "0.9rem", marginTop: "5px" }}>
            <Form.Check
              type="checkbox"
              label={<label htmlFor="lieferbar-checkbox">Nur lieferbare Bücher</label>}
              id="lieferbar-checkbox"
              checked={istLieferbar}
              onChange={(e) => setIstLieferbar(e.target.checked)}
            />
          </div>
        </Form.Group>
        <div style={{ fontSize: "0.9rem", marginTop: "5px" }}>
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

      {filteredBooks.length > 0 && (
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
            {filteredBooks.map((buch) => (
              <tr key={buch.id}>
                <td>{buch.id}</td>
                <td>{buch.isbn}</td>
                <td>{buch.titel.titel}</td>
                <td>{renderStars(buch.rating)}</td>
                <td>
                  <Link href={`/details?id=${buch.id}`} passHref>
                    <InfoCircle style={{ cursor: "pointer", marginRight: "10px" }} />
                  </Link>
                  {writeAccess && (
                  <Link href={`/details/${buch.id}/edit`} passHref>
                    <Pen style={{ cursor: "pointer" }} />
                  </Link>
                  )}
                  {writeAccess && (
                  <Trash
                    style={{ cursor: "pointer", marginLeft: "10px" }}
                    aria-label="delete"
                    color="secondary"
                    onClick={() => {
                      handleDeleteRow(buch.id);
                    }}
                  />
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default BookSearchPage;
