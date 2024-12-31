"use client";

import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../api/auth/useAuth";
import { Badge, Button, Form, Table, Alert } from "react-bootstrap";
import { InfoCircle, Pen, Trash } from "react-bootstrap-icons";
import Link from "next/link";
import { api } from "../config";
import renderStars from "../utils/stars";

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
  const [filteredBooks, setFilteredBooks] = useState<Buch[]>([]);
  const [sucheISBN, setSucheISBN] = useState<string>("");
  const [sucheTitel, setSucheTitel] = useState<string>("");
  const [sucheRating, setSucheRating] = useState("");
  const [istJavaScript, setIstJavaScript] = useState(false);
  const [istTypeScript, setIstTypeScript] = useState(false);
  const [istPython, setIstPython] = useState(false);
  const [sucheBuchArt, setSucheBuchArt] = useState<string>("");
  const [istLieferbar, setIstLieferbar] = useState<boolean>(false);
  const { token } = useAuth();
  const [error, setError] = useState(false);

  const handleSearch = async () => {
    try {
      const query = `
        query getFilteredBooks($suchkriterien: SuchkriterienInput) {
          buecher(suchkriterien: $suchkriterien) {
            id
            isbn
            rating
            art
            lieferbar
            javascript
            typescript
            python
            titel {
              titel
            }
          }
        }
      `;

      interface Suchkriterien {
        isbn?: string;
        titel?: string;
        rating?: number;
        schlagwoerter?: string[];
        art?: string;
        lieferbar?: boolean;
        javascript?: string;
        typescript?: string;
        python?: string;
      }

      const suchkriterien: Suchkriterien = {};
      if (sucheISBN) suchkriterien.isbn = sucheISBN;
      if (sucheTitel) suchkriterien.titel = sucheTitel;
      if (sucheRating) suchkriterien.rating = parseInt(sucheRating, 10);
      if (sucheBuchArt) suchkriterien.art = sucheBuchArt;
      if (istLieferbar) suchkriterien.lieferbar = istLieferbar;

      if (istJavaScript) suchkriterien.javascript = "true";
      if (istTypeScript) suchkriterien.typescript = "true";
      if (istPython) suchkriterien.python = "true";

      console.log("Search Criteria:", suchkriterien);

      const response = await axios.post(
        `${api}/graphql`,
        {
          query,
          variables: { suchkriterien },
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const buecher = response.data.data.buecher || [];
      setFilteredBooks(buecher);
      setError(buecher.length === 0);
    } catch (err) {
      console.error("Error fetching filtered books:", err);
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
        `${api}/graphql`,
        {
          query: DELETE_BOOK_MUTATION,
          variables: { id },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const { data, errors } = response.data;

      if (errors && errors.length > 0) {
        throw new Error(errors[0].message);
      }

      const success = data?.delete;
      if (success) {
        setFilteredBooks((prevBooks) =>
          prevBooks.filter((buch) => buch.id !== id)
        );
        alert("Das Buch wurde erfolgreich gelöscht.");
      } else {
        throw new Error("Fehler beim Löschen des Buches.");
      }
    } catch (err) {
      console.error("Fehler beim Löschen des Buches:", err);
      alert(
        "Das Buch konnte nicht gelöscht werden. Bitte versuchen Sie es erneut."
      );
    }
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
              <option key={star} value={star}>{`${star} Stern${
                star > 1 ? "e" : ""
              }`}</option>
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
        <Form.Group>
          <Badge>Lieferbar</Badge>
          <div style={{ fontSize: "0.9rem", marginTop: "5px" }}>
            <Form.Check
              type="checkbox"
              label={
                <label htmlFor="lieferbar-checkbox">
                  Nur lieferbare Bücher
                </label>
              }
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
                    <InfoCircle
                      style={{ cursor: "pointer", marginRight: "10px" }}
                    />
                  </Link>
                  {writeAccess && (
                    <Link href={`/edit?id=${buch.id}`} passHref>
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
