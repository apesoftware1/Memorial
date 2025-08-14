import React, { useState } from 'react';
import { X } from 'lucide-react';

// Component definition
const CreateSpecialModal = ({ isOpen, onClose, listing }) => {
  const [selectedDiscount, setSelectedDiscount] = useState('5');
  const [startDate, setStartDate] = useState('15/05/2025');
  const [endDate, setEndDate] = useState('16/05/2025');
  const [showMessage, setShowMessage] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const discountOptions = [
    { value: '5', label: '5%' },
    { value: '10', label: '10%' },
    { value: '12', label: '12%' },
    { value: '15', label: '15%' },
    { value: '17', label: '17%' },
    { value: '20', label: '20%' },
    { value: '25', label: '25%' },
    { value: '30', label: '30%' },
    { value: '40', label: '40%' },
    { value: '50', label: '50%' }
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

  const handleConfirm = async () => {
    try {
      const price = parseFloat(
        listing.price?.toString().replace(/[^\d.]/g, '') || '0'
      );
      const discount = parseFloat(selectedDiscount || '0') / 100;
      const salePrice = price * (1 - discount);
  
      const formatDate = (dateStr) => {
        const [day, month, year] = dateStr.split('/');
        return new Date(`${year}-${month}-${day}`).toISOString(); // Convert DD/MM/YYYY to ISO
      };
  
      // First, create the special
      const specialPayload = {
        data: {
          start_date: formatDate(startDate),
          end_date: formatDate(endDate),
          sale_price: salePrice,
          active: true,
          listings: {
            connect: [{ documentId: listing.documentId }],
          },
        },
      };
  
      const specialResponse = await fetch(
        'https://balanced-sunrise-2fce1c3d37.strapiapp.com/api/specials',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
          },
          body: JSON.stringify(specialPayload),
        }
      );
  
      const specialResult = await specialResponse.json();
  
      if (!specialResponse.ok) {
        throw new Error(specialResult.error?.message || 'Failed to create special');
      }
  
      // Then, update the listing to mark it as on special
      const listingUpdatePayload = {
        data: {
          isOnSpecial: true,
          salePrice: salePrice,
          discountPercentage: selectedDiscount,
          specialStartDate: formatDate(startDate),
          specialEndDate: formatDate(endDate),
        },
      };
  
      const listingResponse = await fetch(
        `https://balanced-sunrise-2fce1c3d37.strapiapp.com/api/listings/${listing.documentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            // Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
          },
          body: JSON.stringify(listingUpdatePayload),
        }
      );
  
      const listingResult = await listingResponse.json();
  
      if (!listingResponse.ok) {
        console.warn('Special created but failed to update listing:', listingResult.error?.message);
        // Don't throw error here as the special was created successfully
      }
  
   
      
      // Show styled success message
      setSubmitMessage('Special offer created successfully! The listing will now appear on the specials page.');
      setShowMessage(true);
      
      // Auto-hide message after 3 seconds
      setTimeout(() => {
        setShowMessage(false);
        setSubmitMessage('');
        onClose(); // Close modal after success
      }, 3000);
    } catch (err) {
      
      setSubmitMessage(`Error: ${err.message}`);
      setShowMessage(true);
      
      // Auto-hide error message after 5 seconds
      setTimeout(() => {
        setShowMessage(false);
        setSubmitMessage('');
      }, 5000);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '0',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #005bac 0%, #00bfff 100%)',
          color: 'white',
          padding: '24px 32px',
          borderRadius: '16px 16px 0 0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background Pattern */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            transform: 'rotate(45deg)'
          }} />
          
          <div style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                margin: '0 0 8px 0',
                letterSpacing: '-0.5px'
              }}>
                Create Special Offer
              </h2>
              <p style={{
                fontSize: '14px',
                margin: '0',
                opacity: '0.9',
                fontWeight: '400'
              }}>
                Add this listing to the specials page with exclusive discounts
              </p>
            </div>
            
            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'scale(1)';
              }}
            >
              <X size={20} color="white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {/* Package Info Card */}
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '32px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <div style={{
                background: '#005bac',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                color: 'white',
                fontWeight: 'bold'
              }}>
                %
              </div>
              <span style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1e293b'
              }}>
                Premium Package
              </span>
            </div>
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              margin: '0',
              lineHeight: '1.5'
            }}>
              This package includes <strong>X___</strong> tombstones that can be added to the specials page. 
              To upgrade your package, contact us or{' '}
              <a href="#" style={{ 
                color: '#005bac', 
                textDecoration: 'underline',
                fontWeight: '500'
              }}>
                click here
              </a>
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            {/* Left Column - Settings */}
            <div>
              {/* Discount Section */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    background: '#005bac',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    %
                  </div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1e293b',
                    margin: '0'
                  }}>
                    Discount Percentage
                  </h3>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px'
                }}>
                  {discountOptions.map((option) => (
                    <label
                      key={option.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        padding: '12px',
                        borderRadius: '8px',
                        border: selectedDiscount === option.value 
                          ? '2px solid #005bac' 
                          : '1px solid #e2e8f0',
                        background: selectedDiscount === option.value 
                          ? '#f0f9ff' 
                          : 'white',
                        transition: 'all 0.2s ease',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                      onMouseOver={(e) => {
                        if (selectedDiscount !== option.value) {
                          e.target.style.borderColor = '#005bac';
                          e.target.style.background = '#f8fafc';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (selectedDiscount !== option.value) {
                          e.target.style.borderColor = '#e2e8f0';
                          e.target.style.background = 'white';
                        }
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
                          accentColor: '#005bac'
                        }}
                      />
                      <span style={{
                        color: selectedDiscount === option.value ? '#005bac' : '#374151'
                      }}>
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Section */}
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    background: '#005bac',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    📅
                  </div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1e293b',
                    margin: '0'
                  }}>
                    Offer Duration
                  </h3>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '8px',
                      display: 'block'
                    }}>
                      Start Date
                    </label>
                    <div style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <input
                        type="text"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        placeholder="DD/MM/YYYY"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          color: '#374151',
                          background: 'white',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#005bac';
                          e.target.style.boxShadow = '0 0 0 3px rgba(0, 91, 172, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e2e8f0';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '8px',
                      display: 'block'
                    }}>
                      End Date
                    </label>
                    <div style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <input
                        type="text"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        placeholder="DD/MM/YYYY"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          color: '#374151',
                          background: 'white',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#005bac';
                          e.target.style.boxShadow = '0 0 0 3px rgba(0, 91, 172, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e2e8f0';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Price Display */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              borderRadius: '16px',
              padding: '32px',
              border: '1px solid #e0f2fe'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '24px'
              }}>
                <div style={{
                  background: '#005bac',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  R
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1e293b',
                  margin: '0'
                }}>
                  Final Price
                </h3>
              </div>
              
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                minWidth: '200px'
              }}>
                <div style={{
                  fontSize: '14px',
                  color: '#64748b',
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>
                  Special Offer Price
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#005bac',
                  letterSpacing: '-1px',
                  lineHeight: '1'
                }}>
                  R {calculateFinalPrice()}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  marginTop: '8px'
                }}>
                  {selectedDiscount}% off original price
                </div>
              </div>
              
              <div style={{
                marginTop: '24px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '12px',
                  color: '#64748b',
                  marginBottom: '4px'
                }}>
                  Offer Duration
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  {startDate} - {endDate}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '24px 32px',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          borderRadius: '0 0 16px 16px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '16px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              background: 'white',
              color: '#64748b',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.borderColor = '#cbd5e1';
              e.target.style.color = '#374151';
            }}
            onMouseOut={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.color = '#64748b';
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: '12px 32px',
              border: 'none',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #005bac 0%, #00bfff 100%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 6px -1px rgba(0, 91, 172, 0.2)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 6px 12px -1px rgba(0, 91, 172, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 91, 172, 0.2)';
            }}
          >
            Create Special Offer
          </button>
        </div>
      </div>

      {/* Success/Error Message */}
      {showMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '16px 24px',
          borderRadius: '8px',
          color: '#fff',
          fontWeight: 'bold',
          zIndex: 1001,
          background: submitMessage.includes('Error') ? '#dc3545' : '#28a745',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          animation: 'slideIn 0.3s ease'
        }}>
          {submitMessage}
        </div>
      )}
    </div>
  );
};

export default CreateSpecialModal; 