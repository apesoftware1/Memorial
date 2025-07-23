import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {sendInquiryRest} from "@/graphql/queries/sendInquiry"


export default function ProductContactForm({documentId, className = " "}) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

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
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setStatus('Failed to send inquiry.');
    }
  };

  return (
    <form className={className || "space-y-4 mb-4"} onSubmit={handleSubmit}>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">Name & Surname *</label>
        <Input className="w-full" name="name" value={form.name} onChange={handleChange} />
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">Mobile Number *</label>
        <Input className="w-full" name="mobile" /* not in form state, for UI only */ />
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">Email</label>
        <Input className="w-full" name="email" value={form.email} onChange={handleChange} />
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">Message *</label>
        <Textarea
          className="w-full h-24"
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder={`I would like to find out more about the Tombstone for sale.`}
        />
      </div>
      <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded">Send Message</button>
      <div className="text-xs text-gray-500 mt-4">
        By continuing I understand and agree with Memorial Hub's{" "}
        <Link href="#" className="text-blue-500 hover:underline">
          Terms & Conditions
        </Link>{" "}
        and{" "}
        <Link href="#" className="text-blue-500 hover:underline">
          Privacy Policy
        </Link>.
      </div>
      {status && <p className="text-sm mt-2">{status}</p>}
    </form>
  );
} 