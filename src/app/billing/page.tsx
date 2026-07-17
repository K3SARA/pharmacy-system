'use client';

import { useState, useEffect } from 'react';

type Medicine = {
  id: number;
  name: string;
  price: number;
  stockQuantity: number;
};

type CartItem = Medicine & {
  cartQuantity: number;
};

export default function BillingPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastBillId, setLastBillId] = useState<number | null>(null);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const url = search ? `/api/inventory?search=${encodeURIComponent(search)}` : '/api/inventory';
        const res = await fetch(url);
        const data = await res.json();
        setMedicines(data);
      } catch (error) {
        console.error('Error fetching inventory for billing:', error);
      }
    };
    
    // Add a slight debounce for search
    const delayDebounce = setTimeout(() => {
      fetchMedicines();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const addToCart = (medicine: Medicine) => {
    const existing = cart.find(item => item.id === medicine.id);
    if (existing) {
      if (existing.cartQuantity < medicine.stockQuantity) {
        setCart(cart.map(item => item.id === medicine.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item));
      } else {
        alert('Cannot add more than available stock.');
      }
    } else {
      if (medicine.stockQuantity > 0) {
        setCart([...cart, { ...medicine, cartQuantity: 1 }]);
      } else {
        alert('Item is out of stock.');
      }
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    if (newQuantity <= 0) {
      removeFromCart(id);
    } else if (newQuantity > item.stockQuantity) {
      alert('Cannot exceed available stock.');
    } else {
      setCart(cart.map(i => i.id === id ? { ...i, cartQuantity: newQuantity } : i));
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      const billData = {
        totalAmount,
        items: cart.map(item => ({
          medicineId: item.id,
          quantity: item.cartQuantity,
          price: item.price
        }))
      };

      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billData)
      });

      if (res.ok) {
        const data = await res.json();
        setCart([]);
        setSearch('');
        setLastBillId(data.id);
        
        // Auto-open print page in the same tab
        window.location.href = `/print/${data.id}`;

        // Trigger a re-fetch of medicines to get updated stock
        const freshRes = await fetch('/api/inventory');
        setMedicines(await freshRes.json());
      } else {
        alert('Failed to generate bill.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred during checkout.');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
      
      {/* Left Column: Product Search */}
      <div>
        <h1 className="page-title">Point of Sale</h1>
        <div className="card" style={{ marginBottom: '1rem' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Search medicines by name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="card" style={{ padding: '0' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((med) => (
                <tr key={med.id}>
                  <td style={{ fontWeight: 500 }}>{med.name}</td>
                  <td>${med.price.toFixed(2)}</td>
                  <td>{med.stockQuantity}</td>
                  <td>
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                      onClick={() => addToCart(med)}
                      disabled={med.stockQuantity === 0}
                    >
                      {med.stockQuantity === 0 ? 'Out of Stock' : 'Add'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {medicines.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--foreground)', opacity: 0.7 }}>
              No medicines found.
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Cart */}
      <div>
        <div className="card" style={{ position: 'sticky', top: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            Current Bill
          </h2>

          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <p style={{ color: 'var(--foreground)', opacity: 0.7, marginBottom: '1rem' }}>Cart is empty.</p>
              {lastBillId && (
                <button 
                  className="btn btn-primary" 
                  style={{ backgroundColor: 'var(--success)' }}
                  onClick={() => window.location.href = `/print/${lastBillId}`}
                >
                  🖨️ Print Last Bill
                </button>
              )}
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                {cart.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontWeight: 500 }}>{item.name}</h4>
                      <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>${item.price.toFixed(2)} x {item.cartQuantity}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button 
                        style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--background)', cursor: 'pointer' }}
                        onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                      >-</button>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500, width: '20px', textAlign: 'center' }}>{item.cartQuantity}</span>
                      <button 
                        style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--background)', cursor: 'pointer' }}
                        onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                      >+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '1.5rem 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.25rem', fontWeight: 700 }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--primary)' }}>${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', fontSize: '1.125rem', padding: '1rem' }}
                onClick={handleCheckout}
              >
                Generate Bill
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
