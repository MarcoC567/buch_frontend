"use client";

// Run:
// npm install react-bootstrap-icons

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Form, Table, Alert } from "react-bootstrap";
import { InfoCircle, Pen } from "react-bootstrap-icons";

interface Book {
  id: number;
  version: number;
  title: string;
  art: string;
  keywords: string[];
}

interface BookDetails {
  isbn: string;
  version: number;
  rating: number;
  art: string;
  price: number;
  available: boolean;
  date: string;
  homepage: string;
  keywords: string[];
  title: string;
  discount: string;
}

const BookSearchPage = () => {
  const [books, setBooks] = useState<Book[]>([]); // Liste aller Bücher
  const [bookDetails, setBookDetails] = useState<BookDetails | null>(null); // Details eines Buches
  const [searchId, setSearchId] = useState<string>(""); // ID für die Buchsuche
  const [searchTitle, setSearchTitle] = useState<string>(""); // Titel für die Buchsuche
  const [selectedRatingOption, setSelectedRatingOption] = useState("");
  const [ratingOptions, setRatingOptions] = useState([]);
  const [isJavaScript, setIsJavaScript] = useState(false);
  const [isTypeScript, setIsTypeScript] = useState(false);
  const [selectedBookFormat, setSelectedBookFormat] = useState("");
  const [error, setError] = useState(false);

  // 
  const [activeLink, setActiveLink] = useState("#");
  const handleLinkClick = (tabName: string) => setActiveLink(tabName);

  // Fetch all books (id, version, title, and type)
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
        title: buch.titel.titel,
        art: buch.art,
      }));
      setBooks(fetchedBooks);
    } catch (err) {
      console.error("Error fetching books:", err);
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
      setBookDetails({
        isbn: details.isbn,
        version: details.version,
        rating: details.rating,
        art: details.art,
        price: details.preis,
        available: details.lieferbar,
        date: details.datum,
        homepage: details.homepage,
        keywords: details.schlagwoerter,
        title: details.titel.titel,
        discount: details.rabatt,
      });
      setError(false);
    } catch (err) {
      console.error("Error fetching book details:", err);
      setError(true);
    }
  };

  // Reset filters and book details
  const resetFilters = () => {
    setSearchId("");
    setSearchTitle("");
    setSelectedRatingOption("");
    setRatingOptions([]);
    setIsJavaScript(false);
    setIsTypeScript(false);
    setSelectedBookFormat("");
    setBookDetails(null);
    setError(false);
  };

  // Handle search by ID or Title
  const handleSearch = () => {
    if (searchId) {
      fetchBookDetails(searchId);
    } else if (searchTitle) {
      const filteredBooks = books.filter((book) =>
        book.title.toLowerCase().includes(searchTitle.toLowerCase())
      );
      if (filteredBooks.length > 0) {
        setBooks(filteredBooks);
        setError(false);
      } else {
        setError(true);
      }
    } else if (selectedRatingOption) {
      const filteredBooks = books.filter((book) => book.rating === selectedRatingOption);
      if (filteredBooks.length > 0) {
        setBooks(filteredBooks);
        setError(false);
      } else {
        setError(true);
      }
    } else if (isJavaScript || isTypeScript) {
      const filteredBooks = books.filter((book) =>
        (isJavaScript && book.keywords.includes("JavaScript")) ||
        (isTypeScript && book.keywords.includes("TypeScript"))
      );
      if (filteredBooks.length > 0) {
        setBooks(filteredBooks);
        setError(false);
      } else {
        setError(true);
      }
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
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Titel</Form.Label>
          <Form.Control
            type="text"
            placeholder="Titel des gesuchten Buchs"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
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
            {ratingOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
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
              checked={selectedBookFormat === "DRUCKAUSGABE"}
              onChange={(e) => setSelectedBookFormat(e.target.value)}
            />
            <Form.Check
              type="radio"
              name="bookFormat"
              label="Kindle"
              value="KINDLE"
              checked={selectedBookFormat === "KINDLE"}
              onChange={(e) => setSelectedBookFormat(e.target.value)}
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
      {bookDetails && (
        <div className="mt-4">
          <h3>Details zum Buch</h3>
          <p><strong>ISBN:</strong> {bookDetails.isbn}</p>
          <p><strong>Titel:</strong> {bookDetails.title}</p>
          <p><strong>Version:</strong> {bookDetails.version}</p>
          <p><strong>Rating:</strong> {bookDetails.rating}</p>
          <p><strong>Art:</strong> {bookDetails.art}</p>
          <p><strong>Preis:</strong> {bookDetails.price} €</p>
          <p><strong>Lieferbar:</strong> {bookDetails.available ? "Ja" : "Nein"}</p>
          <p><strong>Datum:</strong> {bookDetails.date}</p>
          <p><strong>Homepage:</strong> <a href={bookDetails.homepage}>{bookDetails.homepage}</a></p>
          <p><strong>Schlagwörter:</strong> {bookDetails.keywords.join(", ")}</p>
          <p><strong>Rabatt:</strong> {bookDetails.discount}</p>
        </div>
      )}

      {/* Liste aller Bücher */}
      <h3 className="mt-5">Liste aller Bücher</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ISBN</th>
            <th>Version</th>
            <th>Titel</th>
            <th>Art</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td>{book.id}</td>
              <td>{book.version}</td>
              <td>{book.title}</td>
              <td>{book.art}</td>
              <td>

                <Button>
                  <InfoCircle>
                    <li className="search-item">
                      <a  className={`search-link ${activeLink === "Suchen" ? "active" : ""}`} 
                      aria-current="page" href="details" onClick={() => handleLinkClick("Details")}>
                        Details
                      </a>
                    </li>
                  </InfoCircle>
                </Button>
                <Button>
                  <Pen>
                    <li className="search-item">
                      <a className={`search-link ${activeLink === "Hinzufügen" ? "active" : ""}`} href="edit" onClick={() => handleLinkClick("Bearbeiten")}>
                        Bearbeiten
                      </a>
                    </li>
                  </Pen>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default BookSearchPage;
