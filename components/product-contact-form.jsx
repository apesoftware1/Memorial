import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sendInquiryRest } from "@/graphql/queries/sendInquiry";
import { CheckCircle, X, AlertCircle } from "lucide-react";
import { trackAnalyticsEvent } from "@/lib/analytics";

export default function ProductContactForm({ documentId, className = " ", listingTitle }) {
  const getDefaultMessage = () =>
    listingTitle
      ? `I would like to find out more about the ${listingTitle} Tombstone.`
      : `I would like to find out more about the Tombstone for sale.`;

  const [form, setForm] = useState({ name: '', email: '', message: getDefaultMessage() });
  const [status, setStatus] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    // Keep message aligned with the current listing title
    setForm((prev) => ({ ...prev, message: getDefaultMessage() }));
  }, [listingTitle]);
  
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');
    try {
      await sendInquiryRest({
        ...form,
        documentId: documentId,
      });
      setStatus('Inquiry sent successfully!');
      setForm({ name: '', email: '', message: getDefaultMessage() });
      
      // Show success toast
      setToastMessage('Inquiry sent successfully!');
      setToastType('success');
      setShowToast(true);
      
      // Auto-hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } catch (err) {
      setStatus('Failed to send inquiry.');
      
      // Show error toast
      setToastMessage('Failed to send inquiry. Please try again.');
      setToastType('error');
      setShowToast(true);
      
      // Auto-hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  };

  const handleCloseToast = () => {
    setShowToast(false);
  };

  return (
    <>
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className={`${toastType === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-[300px] max-w-[400px]`}>
            {toastType === 'success' ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <span className="font-medium flex-1">{toastMessage}</span>
            <button
              onClick={handleCloseToast}
              className="ml-2 text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <form className={className || "space-y-4 mb-4"} onSubmit={handleSubmit}>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Name & Surname *</label>
          <Input className="w-full" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Mobile Number *</label>
          <Input className="w-full" name="mobile" required />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Email *</label>
          <Input className="w-full" name="email" value={form.email} onChange={handleChange} type="email" required />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Message *</label>
          <Textarea
            className="w-full h-24"
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder={getDefaultMessage()}
            required
          />
        </div>
        <button onClick={() => trackAnalyticsEvent('inquiry_click', documentId)} type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded transition-colors">
          Send Message
        </button>
        <div className="text-xs text-gray-500 mt-4">
          By continuing I understand and agree with TombstonesFinder's{" "}
          <Link href="#" className="text-blue-500 hover:underline">
            Terms & Conditions
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-blue-500 hover:underline">
            Privacy Policy
          </Link>.
        </div>
        {status && status !== 'Inquiry sent successfully!' && (
          <p className="text-sm mt-2">{status}</p>
        )}
      </form>
    </>
  );
}