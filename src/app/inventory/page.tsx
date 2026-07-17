'use client';

import { useState, useEffect } from 'react';

type Medicine = {
  id: number;
  name: string;
  batchNumber: string;
  expiryDate: string;
  price: number;
  stockQuantity: number;
};

export default function InventoryPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    batchNumber: '',
    expiryDate: '',
    price: '',
    stockQuantity: ''
  });

  const fetchMedicines = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setMedicines(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setFormData({ name: '', batchNumber: '', expiryDate: '', price: '', stockQuantity: '' });
        setShowForm(false);
        fetchMedicines();
      } else {
        alert('Failed to add medicine');
      }
    } catch (error) {
      console.error('Error adding medicine:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this medicine?')) {
      try {
        const res = await fetch(`/api/inventory/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          fetchMedicines();
        } else {
          alert('Failed to delete medicine');
        }
      } catch (error) {
        console.error('Error deleting medicine:', error);
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Inventory Management</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Medicine'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Add New Medicine</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="input-group">
                <label>Name</label>
                <input className="input-field" type="text" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="input-group">
                <label>Batch Number</label>
                <input className="input-field" type="text" name="batchNumber" value={formData.batchNumber} onChange={handleInputChange} required />
              </div>
              <div className="input-group">
                <label>Expiry Date</label>
                <input className="input-field" type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} required />
              </div>
              <div className="input-group">
                <label>Price</label>
                <input className="input-field" type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} required />
              </div>
              <div className="input-group">
                <label>Stock Quantity</label>
                <input className="input-field" type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleInputChange} required />
              </div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary">Save Medicine</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <p>Loading inventory...</p>
        ) : medicines.length === 0 ? (
          <p>No medicines found in inventory.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Batch No.</th>
                <th>Expiry Date</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((med) => (
                <tr key={med.id}>
                  <td>{med.id}</td>
                  <td style={{ fontWeight: 500 }}>{med.name}</td>
                  <td>{med.batchNumber}</td>
                  <td>{new Date(med.expiryDate).toLocaleDateString()}</td>
                  <td>${med.price.toFixed(2)}</td>
                  <td>
                    <span style={{ 
                      color: med.stockQuantity < 10 ? 'var(--danger)' : 'inherit',
                      fontWeight: med.stockQuantity < 10 ? 600 : 400 
                    }}>
                      {med.stockQuantity}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={() => handleDelete(med.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
