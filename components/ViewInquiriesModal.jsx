'use client';
import React, { useState, useEffect } from 'react';

export default function ViewInquiriesModal({ open, onClose, listings, onInquiriesRead }) {
  // Flatten all inquiries from all listings, each with its listing title
  const allInquiries = (Array.isArray(listings) ? listings : []).flatMap(listing =>
    (listing.inquiries || listing.inquiries_c || []).map(inq => ({ 
      ...inq, 
      id: inq.documentId || inq.id, // Ensure we have an ID for API calls
      listingTitle: listing.title || '',
      isRead: inq.isRead || false,
      isNew: inq.isNew || false
    }))
  );

  // Filter state
  const [filterDate, setFilterDate] = useState('');
  const [filterTime, setFilterTime] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  
  // Detailed inquiry view state
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showInquiryDetail, setShowInquiryDetail] = useState(false);

  // No longer automatically mark all inquiries as read when modal opens
  // Individual inquiries will be marked as read only when clicked

  // Filtering logic
  const filteredInquiries = allInquiries.filter(inq => {
    const created = new Date(inq.createdAt);
    let match = true;
    
    if (filterDate) {
      const dateStr = created.toISOString().slice(0, 10);
      match = match && dateStr === filterDate;
    }
    if (filterTime) {
      const timeStr = created.toTimeString().slice(0, 5);
      match = match && timeStr === filterTime;
    }
    if (showUnreadOnly) {
      match = match && !inq.isRead;
    }
    
    return match;
  });

  // Count unread and new inquiries
  const unreadCount = allInquiries.filter(inq => !inq.isRead).length;
  const newCount = allInquiries.filter(inq => inq.isNew).length;
  
  console.log('ViewInquiriesModal - Inquiry counts:', {
    total: allInquiries.length,
    unread: unreadCount,
    new: newCount,
    inquiries: allInquiries.map(inq => ({
      id: inq.id,
      documentId: inq.documentId,
      isRead: inq.isRead,
      isNew: inq.isNew,
      name: inq.name
    }))
  });

  // Handle opening inquiry detail
  const handleOpenInquiry = async (inquiry) => {
   
    
    // Set the selected inquiry with updated read status immediately for UI
    const updatedInquiry = { ...inquiry, isRead: true };
    setSelectedInquiry(updatedInquiry);
    setShowInquiryDetail(true);
    
    // Mark this specific inquiry as read if it's not already read
    if (inquiry.isRead !== true) {
      try {
        const inquiryId = inquiry.documentId || inquiry.id;
        const response = await fetch(`https://typical-car-e0b66549b3.strapiapp.com/api/inquiries/${inquiryId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              isRead: true,
              isNew: false
            }
          })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to mark inquiry as read: ${response.status}`);
        }
        
        const result = await response.json();
     
        
        // Update local state with all inquiries - only update the specific inquiry that was clicked
        const updatedInquiries = allInquiries.map(inq => {
          const matchesId = (inq.id === inquiry.id) || (inq.documentId === inquiry.documentId) || 
                           (inq.documentId === inquiry.id) || (inq.id === inquiry.documentId);
          
          if (matchesId) {
            console.log('Updating inquiry in local state:', inq.id || inq.documentId);
            // Ensure it is marked read AND not new locally so the UI updates immediately
            return { ...inq, isRead: true, isNew: false };
          }
          return inq;
        });
        
        console.log('Updated inquiries:', updatedInquiries);
        console.log('Inquiry counts after update:', {
          total: updatedInquiries.length,
          unread: updatedInquiries.filter(inq => !inq.isRead).length,
          new: updatedInquiries.filter(inq => inq.isNew).length
        });
        
        if (onInquiriesRead) {
          onInquiriesRead(updatedInquiries);
        }
      } catch (error) {
        console.error('Error marking inquiry as read:', error);
        // Revert the UI state if backend update failed
        setSelectedInquiry(inquiry);
      }
    }
  };

  // Handle closing inquiry detail
  const handleCloseInquiryDetail = () => {
    setShowInquiryDetail(false);
    setSelectedInquiry(null);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end transition-all duration-300 ${
        open ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      style={{
        background: open ? 'rgba(30, 41, 59, 0.18)' : 'transparent',
        transition: 'background 0.3s',
      }}
      onClick={onClose}
    >
      <div
        className={`bg-[#f7f9fb] w-full max-w-2xl h-full shadow-2xl transform transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        } border-l border-gray-200 flex flex-col`}
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex justify-between items-center p-5 border-b bg-white/90 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold tracking-tight text-gray-800">Inquiries</h2>
            {newCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {newCount} new
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-3xl font-light px-2 py-1 rounded transition-colors focus:outline-none">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6 items-end bg-white/80 rounded-lg p-4 shadow border border-gray-100">
            <div>
              <label className="block text-xs text-gray-600 mb-1 font-semibold">Filter by Date</label>
              <input
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1 font-semibold">Filter by Time</label>
              <input
                type="time"
                value={filterTime}
                onChange={e => setFilterTime(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1 font-semibold">Show Unread Only</label>
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={e => setShowUnreadOnly(e.target.checked)}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition"
              />
            </div>
            {(filterDate || filterTime || showUnreadOnly) && (
              <button
                onClick={() => { setFilterDate(''); setFilterTime(''); setShowUnreadOnly(false); }}
                className="ml-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-700 font-semibold border border-gray-200 transition"
              >
                Clear Filters
              </button>
            )}
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-x-auto">
            {filteredInquiries && filteredInquiries.length > 0 ? (
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Listing</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Message</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Created At</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInquiries.map((inq, idx) => (
                    <tr key={`${inq.id || idx}-${inq.createdAt || Date.now()}`} 
                        className={`cursor-pointer transition-all duration-200 ${idx % 2 === 0 ? 'bg-gray-50 hover:bg-blue-50' : 'bg-white hover:bg-blue-50'} ${
                          !inq.isRead ? 'border-l-4 border-l-red-500' : ''
                        } hover:shadow-md`}
                        onClick={() => handleOpenInquiry(inq)}>
                      <td className="py-2 px-4">
                        {inq.isNew && (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">NEW</span>
                        )}
                        {!inq.isRead && !inq.isNew && (
                          <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">UNREAD</span>
                        )}
                        {inq.isRead && !inq.isNew && (
                          <span className="bg-gray-300 text-gray-600 text-xs px-2 py-1 rounded-full">READ</span>
                        )}
                      </td>
                      <td className="py-2 px-4 font-semibold text-blue-700">{inq.listingTitle}</td>
                      <td className="py-2 px-4">{inq.name}</td>
                      <td className="py-2 px-4">{inq.email}</td>
                      <td className="py-2 px-4 max-w-xs truncate" title={inq.message}>{inq.message}</td>
                      <td className="py-2 px-4 text-xs text-gray-500">{inq.id}</td>
                      <td className="py-2 px-4 text-xs text-gray-500">{new Date(inq.createdAt).toLocaleString()}</td>
                      <td className="py-2 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenInquiry(inq);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-1 mx-auto shadow-sm hover:shadow-md"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-gray-500 text-center py-12">No inquiries found.</div>
            )}
          </div>
        </div>
      </div>

      {/* Professional Inquiry Detail Modal */}
      {showInquiryDetail && selectedInquiry && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4" 
          style={{ background: 'rgba(0, 0, 0, 0.75)' }}
          onClick={handleCloseInquiryDetail}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white relative">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Inquiry Details</h2>
                  <p className="text-blue-100 text-sm">
                    {selectedInquiry.isNew && <span className="bg-green-500 px-2 py-1 rounded-full text-xs font-semibold mr-2">NEW</span>}
                    {!selectedInquiry.isRead && !selectedInquiry.isNew && <span className="bg-orange-500 px-2 py-1 rounded-full text-xs font-semibold mr-2">UNREAD</span>}
                    ID: {selectedInquiry.id}
                  </p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseInquiryDetail();
                  }}
                  className="text-white hover:text-red-300 text-3xl font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto flex-1">
              {/* Customer Information Card */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600 block mb-1">Full Name</label>
                      <p className="text-gray-900 font-semibold bg-white px-4 py-3 rounded-lg border">{selectedInquiry.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 block mb-1">Email Address</label>
                      <p className="text-gray-900 font-semibold bg-white px-4 py-3 rounded-lg border flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {selectedInquiry.email}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600 block mb-1">Phone Number</label>
                      <p className="text-gray-900 font-semibold bg-white px-4 py-3 rounded-lg border flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {selectedInquiry.phone || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 block mb-1">Date & Time</label>
                      <p className="text-gray-900 font-semibold bg-white px-4 py-3 rounded-lg border flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(selectedInquiry.createdAt).toLocaleString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Listing Information Card */}
              <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
                  </svg>
                  Related Listing
                </h3>
                <div className="bg-white px-4 py-3 rounded-lg border">
                  <p className="text-gray-900 font-semibold text-lg">{selectedInquiry.listingTitle}</p>
                  <p className="text-gray-600 text-sm mt-1">This inquiry is about the above listing</p>
                </div>
              </div>

              {/* Message Card */}
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Customer Message
                </h3>
                <div className="bg-white rounded-lg border p-6">
                  <p className="text-gray-900 leading-relaxed whitespace-pre-wrap text-base">
                    {selectedInquiry.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex justify-between items-center flex-shrink-0">
              <div className="text-sm text-gray-600">
                Inquiry ID: <span className="font-mono font-semibold">{selectedInquiry.id}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`mailto:${selectedInquiry.email}?subject=Re: Your inquiry about ${selectedInquiry.listingTitle}`);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Reply via Email
                </button>
                {selectedInquiry.phone && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`tel:${selectedInquiry.phone}`);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call Customer
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseInquiryDetail();
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2.5 rounded-lg font-semibold transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}