import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '1rem 0',
      marginBottom: '2rem',
      boxShadow: 'var(--shadow)'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link to="/" style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          textDecoration: 'none',
          color: 'var(--primary)'
        }}>
          Inventory Pro
        </Link>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link 
            to="/" 
            className={`btn ${isActive('/') ? 'btn-primary' : 'btn-secondary'}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/products" 
            className={`btn ${isActive('/products') ? 'btn-primary' : 'btn-secondary'}`}
          >
            Products
          </Link>
          <Link 
            to="/add-product" 
            className={`btn ${isActive('/add-product') ? 'btn-primary' : 'btn-secondary'}`}
          >
            Add Product
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            Welcome, {user?.username}
          </span>
          <button onClick={logout} className="btn btn-danger btn-sm">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;