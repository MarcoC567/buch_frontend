'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Alert, Badge, Button, Spinner } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

const ADD_BOOK_MUTATION = `
  mutation CreateBook($input: BuchDTO!) {
    create(input: $input) {
      id
    }
  }
`;

const AddPage = () => {
  const [formData, setFormData] = useState({
    isbn: '',
    titel: '',
    datum: '',
    schlagwoerter: '',
    preis: 0,
    rabatt: 0,
    art: 'Hardcover',
    thema: '',
    lieferbar: false,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: e.target.checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'preis' || name === 'rabatt' ? parseFloat(value) : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const { schlagwoerter, ...rest } = formData;
    const input = {
      ...rest,
      schlagwoerter: schlagwoerter.split(',').map((tag) => tag.trim()).filter((tag) => tag !== ''),
    };

    try {
      const response = await axios.post('https://localhost:3001/graphql', {
        query: ADD_BOOK_MUTATION,
        variables: { input },
      });
      const { data, errors } = response.data;

      if (errors) {
        throw new Error(errors[0].message);
      }

      alert(`Buch erfolgreich hinzugefügt! ID: ${data.create.id}`);
      router.push('/'); // Redirect to homepage or book list
    } catch (err: any) {
      console.error('Fehler beim Hinzufügen des Buches:', err);
      setErrorMessage(err.message || 'Unbekannter Fehler');
    } finally {
      setLoading(false);
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
          <h5 className="card-title text-center mb-5">Neues Buch hinzufügen</h5>
          {/* ISBN Field */}
          <div className="mb-4" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <Badge className="mb-3" style={{ display: 'inline-block', width: 'auto' }}>
              ISBN
            </Badge>
            <input
              type="text"
              className="form-control border-primary"
              placeholder="ISBN eingeben"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
            />
          </div>
          {/* Title Field */}
          <div className="mb-4" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <Badge className="mb-3" style={{ display: 'inline-block', width: 'auto' }}>
              Titel
            </Badge>
            <input
              type="text"
              className="form-control border-primary"
              placeholder="Titel eingeben"
              name="titel"
              value={formData.titel}
              onChange={handleChange}
            />
          </div>
          {/* Date Field */}
          <div className="mb-4" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <Badge className="mb-3" style={{ display: 'inline-block', width: 'auto' }}>
              Veröffentlichungsdatum
            </Badge>
            <input
              type="date"
              className="form-control border-primary"
              name="datum"
              value={formData.datum}
              onChange={handleChange}
            />
          </div>
          {/* Schlagwörter Field */}
          <div className="mb-4" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <Badge className="mb-3" style={{ display: 'inline-block', width: 'auto' }}>
              Schlagwörter
            </Badge>
            <input
              type="text"
              className="form-control border-primary"
              placeholder="Kommagetrennte Schlagwörter"
              name="schlagwoerter"
              value={formData.schlagwoerter}
              onChange={handleChange}
            />
          </div>
          {/* Price Field */}
          <div className="mb-4" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <Badge className="mb-3" style={{ display: 'inline-block', width: 'auto' }}>
              Preis (€)
            </Badge>
            <input
              type="number"
              className="form-control border-primary"
              placeholder="Preis eingeben"
              name="preis"
              value={formData.preis}
              onChange={handleChange}
            />
          </div>
          {/* Rabatt Field */}
          <div className="mb-4" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <Badge className="mb-3" style={{ display: 'inline-block', width: 'auto' }}>
              Rabatt (%)
            </Badge>
            <input
              type="number"
              className="form-control border-primary"
              placeholder="Rabatt in %"
              name="rabatt"
              value={formData.rabatt}
              onChange={handleChange}
            />
          </div>
          {/* Format Dropdown */}
          <div className="mb-4" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <Badge className="mb-3" style={{ display: 'inline-block', width: 'auto' }}>
              Format
            </Badge>
            <select
              className="form-control border-primary"
              name="art"
              value={formData.art}
              onChange={handleChange}
            >
              <option value="Hardcover">Hardcover</option>
              <option value="Kindle">Kindle</option>
              <option value="Softcover">Softcover</option>
            </select>
          </div>
          {/* Thema Field */}
          <div className="mb-4" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <Badge className="mb-3" style={{ display: 'inline-block', width: 'auto' }}>
              Thema
            </Badge>
            <input
              type="text"
              className="form-control border-primary"
              placeholder="Thema eingeben"
              name="thema"
              value={formData.thema}
              onChange={handleChange}
            />
          </div>
          {/* Lieferbar Checkbox */}
          <div className="mb-4" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <input
              type="checkbox"
              name="lieferbar"
              checked={formData.lieferbar}
              onChange={handleChange}
            />
            <span style={{ marginLeft: '8px' }}>Lieferbar</span>
          </div>
          {/* Submit Button */}
          <div className="text-center mt-4">
            <Button variant="primary" style={{ minWidth: '120px' }} onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Hinzufügen...
                </>
              ) : (
                'Buch hinzufügen'
              )}
            </Button>
            {errorMessage && <Alert variant="danger" className="mt-3">{errorMessage}</Alert>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPage;
