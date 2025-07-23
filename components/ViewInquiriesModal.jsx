'use client';
import React, { useState } from 'react';

export default function ViewInquiriesModal({ open, onClose, listings }) {
  // Flatten all inquiries from all listings, each with its listing title
  const allInquiries = (Array.isArray(listings) ? listings : []).flatMap(listing =>
    (listing.inquiries || []).map(inq => ({ ...inq, listingTitle: listing.title || '' }))
  );

  // Filter state
  const [filterDate, setFilterDate] = useState('');
  const [filterTime, setFilterTime] = useState('');

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
    return match;
  });

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
          <h2 className="text-xl font-bold tracking-tight text-gray-800">Inquiries</h2>
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
            {(filterDate || filterTime) && (
              <button
                onClick={() => { setFilterDate(''); setFilterTime(''); }}
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
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Listing</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Message</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInquiries.map((inq, idx) => (
                    <tr key={inq.id} className={idx % 2 === 0 ? 'bg-gray-50 hover:bg-blue-50' : 'bg-white hover:bg-blue-50'}>
                      <td className="py-2 px-4 font-semibold text-blue-700">{inq.listingTitle}</td>
                      <td className="py-2 px-4">{inq.name}</td>
                      <td className="py-2 px-4">{inq.email}</td>
                      <td className="py-2 px-4 max-w-xs truncate" title={inq.message}>{inq.message}</td>
                      <td className="py-2 px-4 text-xs text-gray-500">{inq.id}</td>
                      <td className="py-2 px-4 text-xs text-gray-500">{new Date(inq.createdAt).toLocaleString()}</td>
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
    </div>
  );
} 