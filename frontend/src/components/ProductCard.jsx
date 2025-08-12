import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, onDelete }) => {
  const isLowStock = product.quantity <= product.lowStockThreshold;

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        width: '100%',
        height: '200px',
        backgroundColor: 'var(--background)',
        borderRadius: '0.5rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)'
      }}>
        {product.image ? (
          <img 
            src={`http://localhost:5000${product.image}`}
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '0.5rem'
            }}
          />
        ) : (
          <div>No Image</div>
        )}
      </div>
      
      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>
        {product.name}
      </h3>
      
      <p style={{ 
        color: 'var(--text-muted)', 
        fontSize: '0.875rem',
        marginBottom: '0.5rem'
      }}>
        {product.category}
      </p>
      
      <div style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: 'var(--primary)',
        marginBottom: '0.75rem'
      }}>
        ${product.price.toFixed(2)}
      </div>
      
      <div style={{ marginBottom: '0.5rem' }}>
        <span className={`status-badge ${isLowStock ? 'status-low' : 'status-good'}`}>
          Stock: {product.quantity}
        </span>
      </div>
      
      <div style={{
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        marginBottom: '1rem'
      }}>
        SKU: {product.sku}
      </div>
      
      <div style={{
        marginTop: 'auto',
        display: 'flex',
        gap: '0.5rem'
      }}>
        <Link 
          to={`/products/${product._id}/edit`} 
          className="btn btn-sm btn-primary"
          style={{ flex: 1 }}
        >
          Edit
        </Link>
        <button 
          onClick={() => onDelete(product._id)}
          className="btn btn-sm btn-danger"
          style={{ flex: 1 }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ProductCard;