"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Badge, Button } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../api/auth/useAuth";
import RouteGuard from "../api/auth/routeGuard";
import { api } from "../config";

const ADD_BOOK_MUTATION = `
  mutation createBook($input: BuchInput!) {
  create(input: $input) {
    id
  }
}
`;

const BookForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    isbn: "",
    titel: "",
    untertitel: "",
    preis: 0,
    rabatt: 0,
    lieferbar: false,
    schlagwoerter: "",
    homepage: "",
    datum: "",
    art: "HARDCOVER",
    rating: 1,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { token } = useAuth();

  const validateField = (name: string, value: string | number) => {
    if (!value) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "Bitte füllen Sie dieses Feld aus",
      }));
    } else {
      setErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors[name];
        return updatedErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    Object.keys(formData).forEach((key) => {
      if (!formData[key as keyof typeof formData]) {
        newErrors[key] = "Bitte füllen Sie dieses Feld aus";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const { schlagwoerter, titel, untertitel, ...rest } = formData;

    const input = {
      ...rest,
      titel: {
        titel: titel,
        untertitel: untertitel || "",
      },
      schlagwoerter: schlagwoerter
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== ""),
      art: rest.art || "HARDCOVER",
    };

    console.log("GraphQL Input:", input); // Debugging

    try {
      const response = await axios.post(
        `${api}/graphql`,
        {
          query: ADD_BOOK_MUTATION,
          variables: { input },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Token hinzufügen
          },
        }
      );

      const { data, errors } = response.data;

      if (errors && errors.length > 0) {
        throw new Error(errors[0].message);
      }

      alert(`Buch erfolgreich hinzugefügt! ID: ${data.create.id}`);
      router.push("/");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.message || "Server-Fehler");
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Ein unbekannter Fehler ist aufgetreten.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: target.checked,
      });
    } else if (type === "number") {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

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
            <h5 className="card-title text-center mb-5">Buch hinzufügen</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Badge className="mb-3 default-color">ISBN</Badge>
                <input
                  type="text"
                  name="isbn"
                  className="form-control"
                  placeholder="ISBN"
                  value={formData.isbn}
                  onChange={handleChange}
                  onBlur={(e) => validateField(e.target.name, e.target.value)}
                  required
                />
                {errors.isbn && <span className="text-danger">{errors.isbn}</span>}
              </div>

              <div className="mb-4">
                <Badge className="mb-3">Titel</Badge>
                <input
                  type="text"
                  name="titel"
                  className="form-control"
                  placeholder="Titel"
                  value={formData.titel}
                  onChange={handleChange}
                  onBlur={(e) => validateField(e.target.name, e.target.value)}
                  required
                />
                {errors.titel && <span className="text-danger">{errors.titel}</span>}
              </div>

              <div className="mb-4">
                <Badge className="mb-3">Untertitel</Badge>
                <input
                  type="text"
                  name="untertitel"
                  className="form-control"
                  placeholder="Untertitel"
                  value={formData.untertitel}
                  onChange={handleChange}
                />
                {errors.untertitel && (
                  <span className="text-danger">{errors.untertitel}</span>
                )}
              </div>

              <div className="mb-4">
                <Badge className="mb-3">Schlagwörter</Badge>
                <input
                  type="text"
                  name="schlagwoerter"
                  className="form-control"
                  placeholder="Schlagwörter"
                  value={formData.schlagwoerter}
                  onChange={handleChange}
                />
                {errors.schlagwoerter && (
                  <span className="text-danger">{errors.schlagwoerter}</span>
                )}
              </div>

              <div className="mb-4">
                <Badge className="mb-3">Homepage</Badge>
                <input
                  type="text"
                  name="homepage"
                  className="form-control"
                  placeholder="Homepage"
                  value={formData.homepage}
                  onChange={handleChange}
                />
                {errors.homepage && (
                  <span className="text-danger">{errors.homepage}</span>
                )}
              </div>

              <div className="mb-4">
                <Badge className="mb-3">Art</Badge>
                <select
                  name="art"
                  className="form-control"
                  value={formData.art}
                  onChange={handleChange}
                  onBlur={(e) => validateField(e.target.name, e.target.value)}
                >
                  <option value="HARDCOVER">HARDCOVER</option>
                  <option value="PAPERBACK">PAPERBACK</option>
                  <option value="EBOOK">EBOOK</option>
                </select>
                {errors.art && <span className="text-danger">{errors.art}</span>}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <div style={{ width: "50%" }}>
                  <div className="mb-4">
                    <Badge className="mb-3">Preis</Badge>
                    <input
                      type="number"
                      name="preis"
                      className="form-control"
                      placeholder="Preis"
                      value={formData.preis}
                      onChange={handleChange}
                      onBlur={(e) => validateField(e.target.name, e.target.value)}
                      min={0}
                      required
                    />
                    {errors.preis && <span className="text-danger">{errors.preis}</span>}
                  </div>

                  <div className="mb-4">
                    <Badge className="mb-3">Rabatt</Badge>
                    <input
                      type="number"
                      name="rabatt"
                      className="form-control"
                      placeholder="Rabatt"
                      value={formData.rabatt}
                      onChange={handleChange}
                      min={0}
                      max={1}
                      step={0.01}
                    />
                    {errors.rabatt && (
                      <span className="text-danger">{errors.rabatt}</span>
                    )}
                  </div>
                </div>

                <div style={{ width: "40%" }}>
                  <div
                    className="mb-4 border-dashed rounded"
                    style={{
                      display: "inline-block",
                      width: "100%",
                    }}
                  >
                    <Badge
                      className="mb-3"
                      style={{
                        marginLeft: "10px",
                        marginTop: "10px",
                      }}
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
                        checked={formData.lieferbar}
                        onChange={handleChange}
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

                  <div
                    className="mb-4 border-dashed rounded"
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
                      Datum
                    </Badge>
                    <input
                      type="date"
                      name="datum"
                      className="form-control"
                      value={formData.datum}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          datum: e.target.value,
                        })
                      }
                      onBlur={(e) => validateField(e.target.name, e.target.value)}
                    />
                    {errors.datum && <span className="text-danger">{errors.datum}</span>}
                  </div>
                </div>
              </div>

              {errorMessage && (
                <Alert variant="danger" className="mt-3">
                  {errorMessage}
                </Alert>
              )}

              <div className="text-center mt-4">
                <Button
                  variant="primary"
                  style={{ minWidth: "120px" }}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Lade..." : "Buch hinzufügen"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
};

export default BookForm;
