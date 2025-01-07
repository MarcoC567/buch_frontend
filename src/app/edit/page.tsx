"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import { Badge, Button, Alert, Spinner } from "react-bootstrap";
import RouteGuard from "../api/auth/routeGuard";
import { FaCalendarAlt } from "react-icons/fa";
import { api } from "../config";

const EditBook = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const [, setBuch] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isbn, setIsbn] = useState("");
  const [preis, setPreis] = useState("");
  const [art, setArt] = useState("");
  const [datum, setDatum] = useState("");
  const [homepage, setHomepage] = useState("");
  const [lieferbar, setLieferbar] = useState(false);
  const [rabatt, setRabatt] = useState("");
  const [rating, setRating] = useState(0);
  const [version, setVersion] = useState(0);
  const [token, setToken] = useState("");
  const [schlagwoerter, setSchlagwoerter] = useState("");

  useEffect(() => {
    setToken(localStorage.getItem("token") || "");
    if (id) {
      fetchBookData(id);
    }
  }, [id]);

  const fetchBookData = async (id: string) => {
    try {
      setLoading(true);
      const response = await axios.post(`${api}/graphql`, {
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
      });

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
        setVersion(bookData.version || 0);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const rabattValue = parseFloat(rabatt);
    if (rabattValue > 1) {
      setError("Bitte geben Sie einen Rabatt zwischen 0 und 1 an.");
      setLoading(false);
      return;
    }

    const schlagwoerterArray = schlagwoerter
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    const input = {
      id,
      version,
      isbn,
      rating,
      art: art || "HARDCOVER",
      preis: parseFloat(preis),
      rabatt: rabattValue,
      lieferbar,
      datum,
      homepage,
      schlagwoerter: schlagwoerterArray,
    };

    try {
      const response = await axios.post(
        `${api}/graphql`,
        {
          query: `
            mutation updateBook($input: BuchUpdateInput!) {
              update(input: $input) {
                version
              }
            }
          `,
          variables: { input },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { data, errors } = response.data;

      if (errors && errors.length > 0) {
        throw new Error(errors[0].message);
      }

      alert(
        `Buch erfolgreich bearbeitet! Neue Version: ${data.update.version}`
      );
      router.push("/");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Server-Fehler");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ein unbekannter Fehler ist aufgetreten.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <RouteGuard>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "5px",
        }}
      >
        <div
          className="card border-primary"
          style={{ maxWidth: "100%", width: "600px", height: "auto" }}
        >
          <div className="card-body">
            <h5 className="card-title text-center mb-5">Buch bearbeiten</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Badge className="mb-3 default-color">ISBN</Badge>
                <input
                  type="text"
                  name="isbn"
                  className="form-control"
                  placeholder="ISBN"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <Badge className="mb-3">Preis</Badge>
                <input
                  type="number"
                  name="preis"
                  className="form-control"
                  placeholder="Preis"
                  value={preis}
                  onChange={(e) => setPreis(e.target.value)}
                  min={0}
                  step="0.01"
                  required
                />
              </div>

              <div className="mb-4">
                <Badge className="mb-3">Rabatt</Badge>
                <input
                  type="number"
                  name="rabatt"
                  className="form-control"
                  placeholder="Rabatt"
                  value={rabatt}
                  onChange={(e) => setRabatt(e.target.value)}
                  min={0}
                  max={1}
                  step="0.01"
                />
              </div>

              <div className="mb-4">
                <Badge className="mb-3">Art</Badge>
                <select
                  name="art"
                  className="form-control"
                  value={art}
                  onChange={(e) => setArt(e.target.value)}
                >
                  <option value="HARDCOVER">HARDCOVER</option>
                  <option value="PAPERBACK">PAPERBACK</option>
                  <option value="EBOOK">EBOOK</option>
                </select>
              </div>

              <div className="mb-4">
                <Badge className="mb-3">Datum</Badge>
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="date"
                    name="datum"
                    className="form-control"
                    placeholder="Datum angeben"
                    value={datum}
                    onChange={(e) => setDatum(e.target.value)}
                  />
                  <FaCalendarAlt
                    style={{
                      position: "absolute",
                      right: "10px",
                      color: "#0d6efd",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      const dateInput = document.querySelector(
                        'input[name="datum"]'
                      ) as HTMLInputElement;
                      if (dateInput) {
                        dateInput.showPicker?.();
                        dateInput.focus();
                      }
                    }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <Badge className="mb-3">Homepage</Badge>
                <input
                  type="text"
                  name="homepage"
                  className="form-control"
                  placeholder="Homepage"
                  value={homepage}
                  onChange={(e) => setHomepage(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <Badge className="mb-3">Rating</Badge>
                <input
                  type="number"
                  name="rating"
                  className="form-control"
                  placeholder="Rating"
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value))}
                  min={0}
                  max={5}
                />
              </div>

              <div className="mb-4">
                <Badge className="mb-3">Schlagwörter</Badge>
                <input
                  type="text"
                  name="schlagwoerter"
                  className="form-control"
                  placeholder="Schlagwörter mit Komma getrennt"
                  value={schlagwoerter}
                  onChange={(e) => setSchlagwoerter(e.target.value)}
                />
              </div>

              <div
                className="mb-4"
                style={{
                  display: "inline-block",
                  width: "100%",
                  paddingLeft: "5px",
                  paddingRight: "5px",
                  paddingBottom: "5px",
                }}
              >
                <Badge
                  className="mb-3"
                  style={{ marginTop: "5px", marginLeft: "5px" }}
                >
                  Lieferbar
                </Badge>
                <div
                  className="form-check mx-3"
                  style={{ marginBottom: "10px" }}
                >
                  <input
                    type="checkbox"
                    name="lieferbar"
                    className="form-check-input"
                    checked={lieferbar}
                    onChange={(e) => setLieferbar(e.target.checked)}
                    id="lieferbarCheckbox"
                  />
                  <label
                    htmlFor="lieferbarCheckbox"
                    className="form-check-label"
                    style={{ color: "black" }}
                  >
                    Lieferbar
                  </label>
                </div>
              </div>

              {error && (
                <Alert variant="danger" className="mt-3">
                  {error}
                </Alert>
              )}

              <div className="text-center mt-4">
                <Button
                  variant="primary"
                  style={{ minWidth: "120px" }}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Lade..." : "Speichern"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
};

export default EditBook;
