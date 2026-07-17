import prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const [totalMedicines, lowStockMedicines, bills] = await Promise.all([
    prisma.medicine.count(),
    prisma.medicine.findMany({
      where: { stockQuantity: { lt: 10 } },
      take: 5,
    }),
    prisma.bill.findMany()
  ]);

  const totalSales = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--foreground)', opacity: 0.8 }}>Total Medicines</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem' }}>{totalMedicines}</p>
        </div>
        
        <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--foreground)', opacity: 0.8 }}>Total Sales</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem' }}>${totalSales.toFixed(2)}</p>
        </div>
        
        <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--foreground)', opacity: 0.8 }}>Low Stock Items</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem' }}>{lowStockMedicines.length}</p>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Low Stock Alerts</h2>
          <Link href="/inventory" style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 500 }}>
            View All Inventory →
          </Link>
        </div>
        
        {lowStockMedicines.length === 0 ? (
          <p style={{ color: 'var(--foreground)', opacity: 0.7 }}>No items are currently low on stock.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Batch No.</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {lowStockMedicines.map(med => (
                <tr key={med.id}>
                  <td style={{ fontWeight: 500 }}>{med.name}</td>
                  <td>{med.batchNumber}</td>
                  <td>
                    <span style={{ 
                      backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                      color: 'var(--danger)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontWeight: 600,
                      fontSize: '0.875rem'
                    }}>
                      {med.stockQuantity}
                    </span>
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
