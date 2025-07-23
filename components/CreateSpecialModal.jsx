import React, { useState } from 'react';
import { X } from 'lucide-react';

const CreateSpecialModal = ({ isOpen, onClose, listing }) => {
  const [selectedDiscount, setSelectedDiscount] = useState('5');
  const [startDate, setStartDate] = useState('15/05/2025');
  const [endDate, setEndDate] = useState('16/05/2025');

  const discountOptions = [
    { value: '5', label: '5 %' },
    { value: '10', label: '10 %' },
    { value: '12', label: '12 %' },
    { value: '15', label: '15 %' },
    { value: '17', label: '17 %' },
    { value: '20', label: '20 %' },
    { value: '25', label: '25 %' },
    { value: '30', label: '30 %' },
    { value: '40', label: '40 %' },
    { value: '50', label: '50 %' }
  ];

  const calculateFinalPrice = () => {
    if (!listing?.price) return '000 000 . 00';
    
    // Parse the price - handle both string and number formats
    let price = 0;
    if (typeof listing.price === 'number') {
      price = listing.price;
    } else if (typeof listing.price === 'string') {
      price = parseFloat(listing.price.replace(/[^\d.]/g, '')) || 0;
    }
    
    const discount = parseFloat(selectedDiscount) / 100;
    const finalPrice = price * (1 - discount);
    
    // Format as currency with spaces
    return finalPrice.toLocaleString('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).replace(/,/g, ' ');
  };

  const handleConfirm = () => {
    // Handle the special creation logic here
    console.log('Creating special with:', {
      listingId: listing?.documentId || listing?.id,
      discount: selectedDiscount,
      startDate,
      endDate,
      finalPrice: calculateFinalPrice()
    });
    
    // Close modal after confirmation
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={20} color="#666" />
        </button>

        {/* SPECIALS Header */}
        <div style={{
          backgroundColor: '#00bfff',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '4px',
          marginBottom: '20px',
          fontSize: '14px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>SPECIALS - TICK HERE TO ADD THIS TOMBSTONE TO THE</span>
          <span style={{ textDecoration: 'underline' }}>SPECIALS PAGE</span>
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#ff6b35'
            }} />
          </div>
        </div>

        {/* Package info */}
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          (This <strong>PACKAGE</strong> Includes <strong>X___</strong> Tombstones that can be added to the <strong>SPECIALS PAGE</strong>)
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '20px' }}>
          To Up-grade your Package contact us or{' '}
          <a href="#" style={{ color: '#00bfff', textDecoration: 'underline' }}>click here</a>
        </div>

        <div style={{ display: 'flex', gap: '40px' }}>
          {/* Left side - Discount options */}
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#333' }}>
              DISCOUNT
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {discountOptions.map((option) => (
                <label
                  key={option.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  <input
                    type="radio"
                    name="discount"
                    value={option.value}
                    checked={selectedDiscount === option.value}
                    onChange={(e) => setSelectedDiscount(e.target.value)}
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: '#333'
                    }}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>

            {/* Discount Duration */}
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '24px 0 16px 0', color: '#333' }}>
              DISCOUNT DURATION
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontSize: '14px', fontWeight: 'bold', minWidth: '80px' }}>
                  START DATE:
                </label>
                <input
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: '#999'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontSize: '14px', fontWeight: 'bold', minWidth: '80px' }}>
                  END DATE:
                </label>
                <input
                  type="text"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: '#999'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right side - Final Price */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#00bfff', 
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              FINAL PRICE
            </h3>
            
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#00bfff',
              textAlign: 'center',
              letterSpacing: '2px'
            }}>
              R {calculateFinalPrice()}
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: '32px',
          paddingTop: '20px',
          borderTop: '1px solid #eee'
        }}>
          <button
            onClick={handleConfirm}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
          >
            Confirm Special
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSpecialModal;