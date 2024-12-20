'use client';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import { Form, Button, Container, Alert, Spinner } from "react-bootstrap";

const EditBook = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id"); // Buch-ID aus der URL abrufen

  const [buch, setBuch] = useState<unknown>(null); // Buch-Daten
  const [loading, setLoading] = useState(true); // Ladespinner
  const [error, setError] = useState<string | null>(null); // Fehlerbehandlung

  // Formulareingaben
  const [isbn, setIsbn] = useState("");
  const [preis, setPreis] = useState("");
  const [art, setArt] = useState("");
  const [datum, setDatum] = useState("");
  const [homepage, setHomepage] = useState("");
  const [lieferbar, setLieferbar] = useState(false);
  const [rabatt, setRabatt] = useState("");
  const [rating, setRating] = useState(0);
  const [version, setVersion] = useState(0); // Version für das Buch
  const [token, setToken] = useState(''); // Token für Authentifizierung
  const [schlagwoerter, setSchlagwoerter] = useState(""); // Schlagwörter als Text eingeben

  useEffect(() => {
    // Token aus dem LocalStorage oder einer anderen Quelle laden
    setToken(localStorage.getItem('token') || '');
    if (id) {
      fetchBookData(id);
    }
  }, [id]);

  // Buchdaten vom Server laden
  const fetchBookData = async (id: string) => {
    try {
      setLoading(true);
      const response = await axios.post(
        "https://localhost:3000/graphql",
        {
          query: `
            query FindBookById($id: ID!) {
              buch(id: $id) {
                id
                isbn
                preis
                art
                datum
                homepage
                lieferbar
                rabatt
                rating
                version
              }
            }
          `,
          variables: { id: parseInt(id) },
        }
      );

      const bookData = response.data?.data?.buch;
      if (bookData) {
        setBuch(bookData);
        setIsbn(bookData.isbn || "");
        setPreis(bookData.preis || "");
        setArt(bookData.art || "");
        setDatum(bookData.datum || "");
        setHomepage(bookData.homepage || "");
        setLieferbar(bookData.lieferbar || false);
        setRabatt(bookData.rabatt || 0);
        setRating(bookData.rating || 0);
        setVersion(bookData.version || 0); // Version setzen
      } else {
        setError("Buch konnte nicht gefunden werden.");
      }
    } catch (err) {
      console.error(err);
      setError("Fehler beim Laden des Buches.");
    } finally {
      setLoading(false);
    }
  };

  // Buchdaten bearbeiten
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Fehlernachricht zurücksetzen

    // Rabatt validieren
    const rabattValue = parseFloat(rabatt);
    if (rabattValue > 1) {
      setError("Rabatt darf nicht größer als 1 sein.");
      setLoading(false);
      return;
    }

    // Schlagwörter in Array umwandeln
    const schlagwoerterArray = schlagwoerter.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

    // Input-Objekt für die GraphQL-Mutation vorbereiten
    const input = {
      id,                // Buch-ID aus der URL
      version,           // Version (wird um 1 erhöht, wenn ein neues Update gemacht wird)
      isbn,              // ISBN (diese wird mit einem Wert gefüllt, den du eventuell im Formular erfasst hast)
      rating,            // Rating (auch aus dem Formular)
      art: art || 'HARDCOVER',  // Art des Buches, Standardwert 'HARDCOVER'
      preis: parseFloat(preis), // Preis (mit parseFloat sicherstellen, dass es eine Zahl ist)
      rabatt: rabattValue, // Rabatt (als Zahl)
      lieferbar,         // Lieferbar-Status (Checkbox)
      datum,             // Veröffentlichungsdatum
      homepage,          // Homepage-URL
      schlagwoerter: schlagwoerterArray, // Schlagwörter (falls vorhanden)
    };

    console.log("GraphQL Input:", input); // Debugging-Log

    try {
      const response = await axios.post(
        'https://localhost:3000/graphql',
        {
          query: `
            mutation updateBook($input: BuchUpdateInput!) {
              update(input: $input) {
                version
              }
            }
          `,
          variables: { input }, // Die Variablen für die Mutation
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Token für Authentifizierung
          },
        }
      );

      const { data, errors } = response.data;

      // Fehlerbehandlung
      if (errors && errors.length > 0) {
        throw new Error(errors[0].message);
      }

      // Erfolgsmeldung und Weiterleitung
      alert(`Buch erfolgreich bearbeitet! Neue Version: ${data.update.version}`);
      router.push('/'); // Zurück zur Hauptseite oder einer anderen Route

    } catch (err: unknown) {
      // Fehlerbehandlung
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Server-Fehler');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ein unbekannter Fehler ist aufgetreten.');
      }
    } finally {
      setLoading(false); // Ladevorgang beenden
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container style={{ maxWidth: "600px", marginTop: "50px" }}>
      <h2>Bearbeite Buch</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      {buch ? (
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="isbn">
            <Form.Label>ISBN</Form.Label>
            <Form.Control
              type="text"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="preis">
            <Form.Label>Preis</Form.Label>
            <Form.Control
              type="number"
              value={preis}
              onChange={(e) => setPreis(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="art">
            <Form.Label>Art</Form.Label>
            <Form.Control
              type="text"
              value={art}
              onChange={(e) => setArt(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="datum">
            <Form.Label>Datum</Form.Label>
            <Form.Control
              type="date"
              value={datum}
              onChange={(e) => setDatum(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="homepage">
            <Form.Label>Homepage</Form.Label>
            <Form.Control
              type="text"
              value={homepage}
              onChange={(e) => setHomepage(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="lieferbar">
            <Form.Check
              type="checkbox"
              label="Lieferbar"
              checked={lieferbar}
              onChange={(e) => setLieferbar(e.target.checked)}
            />
          </Form.Group>

          <Form.Group controlId="rabatt">
            <Form.Label>Rabatt</Form.Label>
            <Form.Control
              type="number"
              value={rabatt}
              onChange={(e) => setRabatt(e.target.value)}
              max="1" // Maximale Grenze für Rabatt
              step="0.01" // Dezimalstellen für Rabatt
            />
          </Form.Group>

          <Form.Group controlId="rating">
            <Form.Label>Rating</Form.Label>
            <Form.Control
              type="number"
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
              max={5}
              min={0}
            />
          </Form.Group>

          <Form.Group controlId="schlagwoerter">
            <Form.Label>Schlagwörter</Form.Label>
            <Form.Control
              type="text"
              value={schlagwoerter}
              onChange={(e) => setSchlagwoerter(e.target.value)}
              placeholder="Schlagwörter mit Komma getrennt"
            />
          </Form.Group>

          <Button variant="primary" type="submit" style={{ marginTop: "20px" }}>
            Speichern
          </Button>
        </Form>
      ) : (
        <Alert variant="warning">Buch wurde nicht gefunden.</Alert>
      )}
    </Container>
  );
};

export default EditBook;
