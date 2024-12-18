'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Badge, Button } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../api/auth/useAuth';

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
    isbn: '',
    titel: '',
    untertitel: '',
    preis: 0,
    rabatt: 0,
    lieferbar: false,
    schlagwoerter: '',
    homepage: '',
    datum: '',
    art: 'HARDCOVER', // Standardwert
    rating: 1, // Standardwert
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { token } = useAuth(); // Token vom AuthProvider holen

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
  
    const { schlagwoerter, titel, untertitel, ...rest } = formData;
  
    const input = {
      ...rest,
      
      titel: {
        titel: titel,
        untertitel: untertitel || '',
      },
      schlagwoerter: schlagwoerter
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag !== ''),
      art: rest.art || 'HARDCOVER',
      
    };
  
    console.log("GraphQL Input:", input); // Debugging
  
    try {
      const response = await axios.post(
        'https://localhost:3000/graphql',
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
      router.push('/');
    } catch (err: unknown) {
      // Typ überprüfen und Fehler behandeln
      if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.message || 'Server-Fehler');
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Ein unbekannter Fehler ist aufgetreten.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
  
    if (type === 'checkbox') {
      // Checkbox-Wert explizit behandeln
      const target = e.target as HTMLInputElement; // Typverengung für 'checked'
      setFormData({
        ...formData,
        [name]: target.checked,
      });
    } else if (type === 'number') {
      // Zahleneingaben behandeln
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
      });
    } else {
      // Standardverhalten für andere Eingabetypen
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  
  

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '50px',
      }}
    >
      <div className="card border-primary" style={{ width: '450px', height: 'auto' }}>
        <div className="card-body">
          <h5 className="card-title text-center mb-5">Buch hinzufügen</h5>
          <form onSubmit={handleSubmit}>
            {/* ISBN */}
            <div className="mb-4">
              <Badge className="mb-3">ISBN</Badge>
              <input
                type="text"
                name="isbn"
                className="form-control"
                placeholder="ISBN"
                value={formData.isbn}
                onChange={handleChange}
                required
              />
            </div>

            {/* Titel */}
            <div className="mb-4">
              <Badge className="mb-3">Titel</Badge>
              <input
                type="text"
                name="titel"
                className="form-control"
                placeholder="Titel"
                value={formData.titel}
                onChange={handleChange}
                required
              />
            </div>

            {/* Untertitel */}
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
            </div>

            {/* Art */}
            <div className="mb-4">
              <Badge className="mb-3">Art</Badge>
              <select
                name="art"
                className="form-control"
                value={formData.art}
                onChange={handleChange}
              >
                <option value="HARDCOVER">HARDCOVER</option>
                <option value="PAPERBACK">PAPERBACK</option>
                <option value="EBOOK">EBOOK</option>
              </select>
            </div>

            {/* Rating */}
            <div className="mb-4">
              <Badge className="mb-3">Rating</Badge>
              <input
                type="number"
                name="rating"
                className="form-control"
                placeholder="Rating"
                value={formData.rating}
                onChange={handleChange}
                min="1"
                max="5"
                required
              />
            </div>

            {/* Preis */}
            <div className="mb-4">
              <Badge className="mb-3">Preis</Badge>
              <input
                type="number"
                name="preis"
                className="form-control"
                placeholder="Preis"
                value={formData.preis}
                onChange={handleChange}
                required
              />
            </div>

            {/* Rabatt */}
            <div className="mb-4">
              <Badge className="mb-3">Rabatt</Badge>
              <input
                type="number"
                name="rabatt"
                className="form-control"
                placeholder="Rabatt"
                value={formData.rabatt}
                onChange={handleChange}
              />
            </div>

            {/* Lieferbar */}
            <div className="mb-4">
              <Badge className="mb-3">Lieferbar</Badge>
              <div className="form-check">
                <input
                  type="checkbox"
                  name="lieferbar"
                  className="form-check-input"
                  checked={formData.lieferbar}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Schlagwörter */}
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
            </div>

            {/* Homepage */}
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
            </div>

            {/* Datum */}
            <div className="mb-4">
              <Badge className="mb-3">Datum</Badge>
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
              />
            </div>

            {/* Fehleranzeige */}
            {errorMessage && (
              <Alert variant="danger" className="mt-3">
                {errorMessage}
              </Alert>
            )}

            {/* Button */}
            <div className="text-center mt-4">
              <Button variant="primary" style={{ minWidth: '120px' }} type="submit" disabled={loading}>
                {loading ? 'Lade...' : 'Buch hinzufügen'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookForm;
