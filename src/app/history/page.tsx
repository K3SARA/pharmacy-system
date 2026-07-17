'use client';

import { useState, useEffect } from 'react';

type BillItem = {
  id: number;
  medicineId: number;
  quantity: number;
  price: number;
  medicine: {
    name: string;
  };
};

type Bill = {
  id: number;
  totalAmount: number;
  date: string;
  items: BillItem[];
};

export default function HistoryPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Initialize with current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const currentDay = today.toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState(firstDay);
  const [toDate, setToDate] = useState(currentDay);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('from', fromDate);
      if (toDate) params.append('to', toDate);

      const res = await fetch(`/api/bills?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBills(data);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when dates change
  useEffect(() => {
    fetchBills();
  }, [fromDate, toDate]);

  return (
    <div>
      <h1 className="page-title">Billing History</h1>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Filter by Date</h2>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-end' }}>
          <div className="input-group" style={{ marginBottom: 0, flex: 1, maxWidth: '250px' }}>
            <label>From Date</label>
            <input 
              type="date" 
              className="input-field" 
              value={fromDate} 
              onChange={(e) => setFromDate(e.target.value)} 
            />
          </div>
          <div className="input-group" style={{ marginBottom: 0, flex: 1, maxWidth: '250px' }}>
            <label>To Date</label>
            <input 
              type="date" 
              className="input-field" 
              value={toDate} 
              onChange={(e) => setToDate(e.target.value)} 
            />
          </div>
          <button className="btn btn-primary" onClick={fetchBills}>
            Refresh
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <p>Loading history...</p>
        ) : bills.length === 0 ? (
          <p>No bills found for this date range.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bill ID</th>
                  <th>Date & Time</th>
                  <th>Items Sold</th>
                  <th>Total Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => (
                  <tr key={bill.id}>
                    <td style={{ fontWeight: 600 }}>#{bill.id}</td>
                    <td>{new Date(bill.date).toLocaleString()}</td>
                    <td>
                      {bill.items.length} items 
                      <span style={{ fontSize: '0.8rem', opacity: 0.7, marginLeft: '0.5rem' }}>
                        ({bill.items.reduce((sum, item) => sum + item.quantity, 0)} qty)
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                      ${bill.totalAmount.toFixed(2)}
                    </td>
                    <td>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                        onClick={() => window.open(`/print/${bill.id}`, 'PrintBill', 'width=400,height=600,left=100,top=100')}
                      >
                        📄 View Receipt
                      </button>
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
