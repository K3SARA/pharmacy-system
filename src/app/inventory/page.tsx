'use client';

import { useState, useEffect } from 'react';

type Medicine = {
  id: number;
  name: string;
  batchNumber: string;
  expiryDate: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
};

export default function InventoryPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    batchNumber: '',
    expiryDate: '',
    price: '',
    costPrice: '',
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
      const url = editingId ? `/api/inventory/${editingId}` : '/api/inventory';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setFormData({ name: '', batchNumber: '', expiryDate: '', price: '', costPrice: '', stockQuantity: '' });
        setShowForm(false);
        setEditingId(null);
        fetchMedicines();
      } else {
        alert(`Failed to ${editingId ? 'update' : 'add'} medicine`);
      }
    } catch (error) {
      console.error(`Error ${editingId ? 'updating' : 'adding'} medicine:`, error);
    }
  };

  const handleEdit = (med: Medicine) => {
    setFormData({
      name: med.name,
      batchNumber: med.batchNumber,
      // Format date for <input type="date"> (YYYY-MM-DD)
      expiryDate: new Date(med.expiryDate).toISOString().split('T')[0],
      price: med.price.toString(),
      costPrice: (med.costPrice || 0).toString(),
      stockQuantity: med.stockQuantity.toString()
    });
    setEditingId(med.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <button className="btn btn-primary" onClick={() => {
          if (showForm) {
            setShowForm(false);
            setEditingId(null);
            setFormData({ name: '', batchNumber: '', expiryDate: '', price: '', costPrice: '', stockQuantity: '' });
          } else {
            setShowForm(true);
          }
        }}>
          {showForm ? 'Cancel' : '+ Add Medicine'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{editingId ? 'Edit Medicine' : 'Add New Medicine'}</h2>
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
                <label>Selling Price</label>
                <input className="input-field" type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} required />
              </div>
              <div className="input-group">
                <label>Cost Price</label>
                <input className="input-field" type="number" step="0.01" name="costPrice" value={formData.costPrice} onChange={handleInputChange} required />
              </div>
              <div className="input-group">
                <label>Stock Quantity</label>
                <input className="input-field" type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleInputChange} required />
              </div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary">{editingId ? 'Update Medicine' : 'Save Medicine'}</button>
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
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Batch No.</th>
                  <th>Expiry Date</th>
                  <th>Cost Price</th>
                  <th>Selling Price</th>
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
                    <td>${(med.costPrice || 0).toFixed(2)}</td>
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
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#8b5cf6' }}
                          onClick={() => handleEdit(med)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => handleDelete(med.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
