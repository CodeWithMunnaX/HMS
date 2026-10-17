import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import {
  Package,
  Pill,
  AlertTriangle,
  CheckCircle2,
  Plus,
  RefreshCw,
  Search,
  DollarSign,
  TrendingDown,
  Clock,
  ShieldAlert,
  Printer,
} from 'lucide-react';

export const PharmacyInventoryModal = ({ isOpen, onClose }) => {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [inventory, setInventory] = useState([
    { id: 'MED-101', name: 'Amoxicillin Trihydrate', strength: '500mg', category: 'Antibiotics', stock: 140, minThreshold: 30, price: 12.5, batch: 'BT-8821', expiry: '2027-11-30' },
    { id: 'MED-102', name: 'Paracetamol (Acetaminophen)', strength: '650mg', category: 'Analgesic', stock: 260, minThreshold: 50, price: 4.0, batch: 'BT-8822', expiry: '2028-04-15' },
    { id: 'MED-103', name: 'Epinephrine Auto-Injector', strength: '1mg/mL', category: 'Emergency STAT', stock: 14, minThreshold: 20, price: 85.0, batch: 'BT-8823', expiry: '2026-12-31' },
    { id: 'MED-104', name: 'Atorvastatin Calcium', strength: '20mg', category: 'Cardiology', stock: 85, minThreshold: 25, price: 18.0, batch: 'BT-8824', expiry: '2027-08-20' },
    { id: 'MED-105', name: 'Insulin Glargine (Lantus)', strength: '100 units/mL', category: 'Endocrinology', stock: 18, minThreshold: 25, price: 62.0, batch: 'BT-8825', expiry: '2027-02-10' },
    { id: 'MED-106', name: 'Azithromycin Dihydrate', strength: '250mg', category: 'Antibiotics', stock: 48, minThreshold: 20, price: 16.0, batch: 'BT-8826', expiry: '2027-09-15' },
    { id: 'MED-107', name: 'Normal Saline IV (0.9% NaCl)', strength: '500mL', category: 'IV Fluids', stock: 120, minThreshold: 40, price: 8.5, batch: 'BT-8827', expiry: '2028-06-30' },
    { id: 'MED-108', name: 'Morphine Sulfate Injection', strength: '10mg/mL', category: 'Emergency STAT', stock: 12, minThreshold: 15, price: 45.0, batch: 'BT-8828', expiry: '2026-11-20' },
  ]);

  const handleRestock = (id, amount = 50) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, stock: item.stock + amount };
        }
        return item;
      })
    );
    toast.success(`Restocked +${amount} units to hospital pharmacy inventory!`);
  };

  const filtered = inventory.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory ? item.category === selectedCategory : true;
    return matchSearch && matchCategory;
  });

  const lowStockCount = inventory.filter((i) => i.stock <= i.minThreshold).length;
  const totalValuation = inventory.reduce((sum, i) => sum + i.stock * i.price, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pharmacy Inventory"
      maxWidth="1000px"
    >
      <div>
        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          <div className="clinical-stat">
            <div className="clinical-metric-label">Total drug SKUs</div>
            <div className="clinical-stat-value">{inventory.length} medications</div>
          </div>

          <div className="clinical-stat" style={{ backgroundColor: 'var(--danger-50)', borderColor: 'var(--danger-100)' }}>
            <div className="clinical-metric-label" style={{ color: 'var(--danger-600)' }}>Low stock</div>
            <div className="clinical-stat-value" style={{ color: 'var(--danger-600)' }}>{lowStockCount} below minimum</div>
          </div>

          <div className="clinical-stat" style={{ backgroundColor: 'var(--success-50)', borderColor: 'var(--success-100)' }}>
            <div className="clinical-metric-label" style={{ color: 'var(--success-700)' }}>Inventory valuation</div>
            <div className="clinical-stat-value" style={{ color: 'var(--success-700)' }}>₹{totalValuation.toLocaleString()}</div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)' }} />
            <input
              type="text"
              placeholder="Search medication name, category, or batch..."
              className="form-input"
              style={{ paddingLeft: '2.2rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ flex: '0 1 200px', minWidth: '160px' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Antibiotics">Antibiotics</option>
            <option value="Analgesic">Analgesic</option>
            <option value="Emergency STAT">Emergency STAT</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Endocrinology">Endocrinology</option>
            <option value="IV Fluids">IV Fluids</option>
          </select>
        </div>

        {/* Inventory Table */}
        <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table className="custom-table" style={{ fontSize: '0.8125rem' }}>
            <thead>
              <tr>
                <th>Drug Code</th>
                <th>Medication Name & Strength</th>
                <th>Category</th>
                <th>Batch / Expiry</th>
                <th>Stock Level</th>
                <th>Unit Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const isLow = item.stock <= item.minThreshold;
                return (
                  <tr key={item.id} style={{ backgroundColor: isLow ? 'var(--warning-50)' : 'transparent' }}>
                    <td><strong style={{ color: 'var(--primary-700)' }}>{item.id}</strong></td>
                    <td>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{item.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Strength: {item.strength}</div>
                    </td>
                    <td>
                      <span style={{ backgroundColor: 'var(--slate-100)', color: 'var(--slate-700)', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' }}>
                        {item.category}
                      </span>
                    </td>
                    <td>
                      <div>Batch: {item.batch}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Exp: {item.expiry}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: '800', fontSize: '0.95rem', color: isLow ? '#dc2626' : '#059669' }}>
                          {item.stock}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>units</span>
                        {isLow && (
                          <span style={{ fontSize: '0.65rem', backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '800' }}>
                            LOW
                          </span>
                        )}
                      </div>
                    </td>
                    <td><strong>₹{item.price.toFixed(2)}</strong></td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                        onClick={() => handleRestock(item.id, 50)}
                      >
                        <Plus size={12} /> +50 Restock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="modal-footer" style={{ marginTop: '1.25rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              window.print();
              toast.success('Procurement order slip printed!');
            }}
          >
            <Printer size={14} /> Print Procurement Order
          </button>
        </div>
      </div>
    </Modal>
  );
};
