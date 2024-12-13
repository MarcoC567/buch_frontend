import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button, Form, Table, Alert } from "react-bootstrap";
import { useAuth } from "../api/auth/useAuth";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface BuchDatas {
  //id : number,
  //version : number,
  isbn : string,
  titel : string,
  rating : number,
  javascript : boolean,
  typescript : boolean,
  art : string, //BuchArt
  //preis : number,
  //rabatt : number,
  //lieferbar : boolean,
  //homepage : string,
  //schlagwoerter : string[],
  //abbildungen : Abbildungen[],
}

const BookSearchPage = () => {
  const [buchData, setBuchData] = useState<BuchDatas[]>([]); //TODO find better name
  const [searchIsbn, setSearchIsbn] = useState("");
  const [searchTitel, setSearchTitel] = useState("");
  const [selectedRatingOption, setSelectedRatingOption] = useState("");
  const [ratingOptions, setRatingOptions] = useState([]);
  const [isJavaScript, setIsJavaScript] = useState(false);
  const [isTypeScript, setIsTypeScript] = useState(false);
  const [selectedBookFormat, setSelectedBookFormat] = useState("");
  const [searchError, setSearchError] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const { login } = useAuth(); //TODO war const {cToken} = useAuth();
  const router : AppRouterInstance = useRouter();

  const getIdFromLinks = (_links) => {
    if (_links?.self?.href) {
      return _links.self.href.split("/").pop();
    }
    return "N/A";
  };

  const handleSearch = async () => {
    setSearchError(false);
    setShowTable(true);

    try {
      let apiUrl = "/api/rest";
      const searchParams = [
        { term: "isbn", value: searchIsbn },
        { term: "titel", value: searchTitel },
        { term: "rating", value: selectedRatingOption },
        { term: "javascript", value: isJavaScript },
        { term: "typescript", value: isTypeScript },
        { term: "art", value: selectedBookFormat },
      ];
      searchParams.forEach(({ term, value }) => {
        if (value) {
          apiUrl += `${apiUrl.includes("?") ? "&" : "?"}${term}=${value}`;
        }
      });

      const response = await axios.get(apiUrl);
      if (response.status !== 200) throw new Error("Failed to fetch data");

      setBuchData(response.data._embedded?.buecher || []);
      setSearchError(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setSearchError(true);
    }
  };

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await axios.get("/api/rest");
        if (response.status !== 200) throw new Error("Failed to fetch ratings");

        const ratings = [
          ...new Set(response.data._embedded.buecher.map((b) => b.rating).sort()),
        ];
        setRatingOptions(ratings);
        setSearchError(false);
      } catch (error) {
        console.error("Error fetching ratings:", error);
        setSearchError(true);
      }
    };
    fetchRatings();
  }, []);

  const handleDeleteRow = async (id) => {
    try {
      if (!login) throw new Error("No token available");

      await axios.delete(`/api/rest/${id}`, {
        headers: { Authorization: `Bearer ${login}` },
      });

      setBuchData((prevData) => prevData.filter((row) => row.id !== id));
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };

  const handleReset = () => {
    setSearchIsbn("");
    setSearchTitel("");
    setSelectedRatingOption("");
    setIsJavaScript(false);
    setIsTypeScript(false);
    setSelectedBookFormat("");
  };

  const navigateToDetails = (id) => router.push(`/bookdetails/${id}`);
  const navigateToBookEdit = (id) => router.push(`/bookedit/${id}`);

  const buchDataWithUniqueId = buchData.map((buch) => ({
    ...buch,
    id: getIdFromLinks(buch._links),
  }));

  return (
    <div className="container mt-5">
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Titel</Form.Label>
          <Form.Control
            type="text"
            placeholder="Titel des gesuchten Buchs"
            value={searchTitel}
            onChange={(e) => setSearchTitel(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>ISBN</Form.Label>
          <Form.Control
            type="text"
            placeholder="ISBN Nummer des gesuchten Buches"
            value={searchIsbn}
            onChange={(e) => setSearchIsbn(e.target.value)}
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
        <div className="d-flex justify-content-between">
          <Button variant="primary" onClick={handleSearch}>
            Suche
          </Button>
          <Button variant="secondary" onClick={handleReset}>
            Zurücksetzen
          </Button>
        </div>
      </Form>

      {searchError && (
        <Alert variant="danger" className="mt-4">
          Keine Bücher gefunden.
        </Alert>
      )}

      {showTable && (
        <Table striped bordered hover className="mt-4">
          <thead>
            <tr>
              <th>ID</th>
              <th>ISBN</th>
              <th>Titel</th>
              <th>Rating</th>
              <th>Art</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {buchDataWithUniqueId.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.isbn}</td>
                <td>{row.titel.titel}</td>
                <td>{row.rating}</td>
                <td>{row.art}</td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    className="me-2"
                    onClick={() => navigateToDetails(row.id)}
                  >
                    Details
                  </Button>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => navigateToBookEdit(row.id)}
                  >
                    Bearbeiten
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteRow(row.id)}
                  >
                    Löschen
                  </Button>
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
