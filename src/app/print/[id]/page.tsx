'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function PrintBillPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [bill, setBill] = useState<any>(null);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [billRes, settingsRes] = await Promise.all([
          fetch(`/api/bills/${id}`),
          fetch('/api/settings')
        ]);
        
        if (billRes.ok) {
          setBill(await billRes.json());
        }
        if (settingsRes.ok) {
          setSettings(await settingsRes.json());
        }
      } catch (err) {
        console.error('Failed to fetch data for print', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Trigger print dialog once loaded
  useEffect(() => {
    if (!loading && bill) {
      setTimeout(() => {
        window.print();
      }, 500); // Slight delay to ensure rendering is complete
    }
  }, [loading, bill]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading bill...</div>;
  }

  if (!bill) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Bill not found.</div>;
  }

  return (
    <div className="print-container">
      <style dangerouslySetInnerHTML={{__html: `
        @page {
          size: 80mm auto;
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
          background: #fff;
          color: #000;
          font-family: 'Courier New', Courier, monospace;
          font-size: 12px;
        }
        /* Override global layout styles for the print popup window */
        main.main-content {
          padding: 0 !important;
          margin: 0 !important;
          background: #fff !important;
        }
        .app-container {
          background: #fff !important;
        }
        .print-container {
          width: 72mm; /* Leave small margin for 80mm paper */
          margin: 0 auto;
          padding: 4mm 0;
        }
        .text-center {
          text-align: center;
        }
        .text-right {
          text-align: right;
        }
        .font-bold {
          font-weight: bold;
        }
        .header {
          margin-bottom: 10px;
          border-bottom: 1px dashed #000;
          padding-bottom: 5px;
        }
        .pharmacy-name {
          font-size: 16px;
          font-weight: bold;
          margin: 0 0 4px 0;
        }
        .pharmacy-detail {
          margin: 2px 0;
          font-size: 11px;
        }
        .bill-info {
          margin: 10px 0;
          font-size: 11px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
        }
        .items-table th {
          border-bottom: 1px dashed #000;
          text-align: left;
          padding: 4px 0;
          font-size: 11px;
        }
        .items-table td {
          padding: 4px 0;
          font-size: 11px;
        }
        .totals {
          border-top: 1px dashed #000;
          padding-top: 5px;
          margin-bottom: 10px;
        }
        .footer {
          text-align: center;
          margin-top: 15px;
          font-size: 11px;
        }
        
        /* Hide layout elements during print */
        @media print {
          .sidebar, header, nav, .non-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            min-height: auto !important;
          }
        }
      `}} />

      <div className="header text-center">
        <h1 className="pharmacy-name">{settings.pharmacyName || 'Pharmacy Store'}</h1>
        {settings.address && <p className="pharmacy-detail">{settings.address}</p>}
        {settings.phone && <p className="pharmacy-detail">Ph: {settings.phone}</p>}
        {settings.email && <p className="pharmacy-detail">{settings.email}</p>}
        {settings.gstNumber && <p className="pharmacy-detail">GST: {settings.gstNumber}</p>}
      </div>

      <div className="bill-info">
        <div><span className="font-bold">Bill No:</span> {bill.id}</div>
        <div><span className="font-bold">Date:</span> {new Date(bill.date).toLocaleString()}</div>
      </div>

      <table className="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th className="text-right">Qty</th>
            <th className="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item: any, index: number) => (
            <tr key={index}>
              <td>
                {item.medicine.name}<br/>
                <small>@ ${item.price.toFixed(2)}</small>
              </td>
              <td className="text-right" style={{ verticalAlign: 'top' }}>{item.quantity}</td>
              <td className="text-right" style={{ verticalAlign: 'top' }}>${(item.quantity * item.price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="totals">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }} className="font-bold">
          <span>TOTAL:</span>
          <span>${bill.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <div className="footer">
        <p style={{ margin: '0 0 5px 0' }}>Thank you for your visit!</p>
        <p style={{ margin: '0' }}>Get Well Soon</p>
      </div>
      
      <div className="non-print" style={{ marginTop: '20px', textAlign: 'center' }}>
        <button onClick={() => window.print()} style={{ padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Print Again
        </button>
      </div>
    </div>
  );
}
