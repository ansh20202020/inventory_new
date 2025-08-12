import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, productsResponse] = await Promise.all([
        productsAPI.getStats(),
        productsAPI.getAll()
      ]);
      
      setStats(statsResponse.data);
      setLowStockProducts(productsResponse.data.lowStockProducts);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, color = 'var(--primary)', subtitle }) => (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ 
        fontSize: '2.5rem', 
        fontWeight: 'bold', 
        color,
        marginBottom: '0.5rem' 
      }}>
        {value}
      </div>
      <div style={{ 
        fontSize: '1rem', 
        color: 'var(--text)', 
        fontWeight: '500',
        marginBottom: '0.25rem'
      }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {subtitle}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem', color: 'var(--text)' }}>Dashboard</h1>
      
      <div className="grid grid-4">
        <StatCard 
          title="Total Products" 
          value={stats?.totalProducts || 0}
        />
        <StatCard 
          title="Low Stock Items" 
          value={stats?.lowStockProducts || 0}
          color="var(--danger)"
        />
        <StatCard 
          title="Categories" 
          value={stats?.categories?.length || 0}
          color="var(--success)"
        />
        <StatCard 
          title="Total Value" 
          value={`$${(stats?.totalValue || 0).toFixed(2)}`}
          color="var(--warning)"
        />
      </div>

      {lowStockProducts.length > 0 && (
        <div className="card">
          <h2 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>
            Low Stock Alert ({lowStockProducts.length} items)
          </h2>
          <div className="grid grid-2">
            {lowStockProducts.map(product => (
              <div key={product._id} style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.5rem',
                padding: '1rem'
              }}>
                <h4 style={{ marginBottom: '0.5rem' }}>{product.name}</h4>
                <p style={{ marginBottom: '0.25rem' }}>
                  Current Stock: <strong>{product.quantity}</strong>
                </p>
                <p style={{ marginBottom: '1rem' }}>
                  Threshold: {product.lowStockThreshold}
                </p>
                <Link to={`/products/${product._id}/edit`} className="btn btn-sm btn-primary">
                  Restock
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats?.categories && (
        <div className="card">
          <h2 style={{ marginBottom: '1rem' }}>Categories Overview</h2>
          <div className="grid grid-3">
            {stats.categories.map(category => (
              <StatCard
                key={category._id}
                title={category._id}
                value={category.count}
              />
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/add-product" className="btn btn-primary">
            Add New Product
          </Link>
          <Link to="/products" className="btn btn-secondary">
            View All Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;