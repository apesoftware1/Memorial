"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { submitContactEnquiry } from '../../graphql/mutations/SubmitContactEnquiry';

export default function ContactPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    inquiryType: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    companyName: '',
    province: '',
    cityOrTown: '',
    message: '',
    agreeToTerms: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      toast({
        title: "Error",
        description: "You must agree to the terms and conditions",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await submitContactEnquiry(formData);
      alert("✅ Inquiry sent successfully!");

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Your message has been sent. We'll get back to you soon!",
        variant: "default"
      });
      
      // Reset form
      setFormData({
        inquiryType: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        companyName: '',
        province: '',
        cityOrTown: '',
        message: '',
        agreeToTerms: false
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inquiryOptions = [
    "I'm a Tombstone manufacturer and I'm interested in advertising my tombstones on www.TombstoneFinder.co.za",
    "I currently advertise on www.TombstoneFinder.co.za but I would like some changes made to my current tombstone listings",
    "End user",
    "Other"
  ];

  const provinces = [
    "Eastern Cape",
    "Free State",
    "Gauteng",
    "KwaZulu-Natal",
    "Limpopo",
    "Mpumalanga",
    "Northern Cape",
    "North West",
    "Western Cape"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Banner Image */}
      <div className="relative h-64 md:h-80 bg-gray-800">
        <Image 
          src="/banner/Generic Banner AD.jpg" 
          alt="Contact Us Banner"
          fill
          className="object-cover opacity-70"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
            Contact Us
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-lg text-gray-600 mb-8">
            Thank you for your interest in TombstonesFinder.co.za. Please provide the following information and we'll put you in touch with the right person.
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Inquiry Type<span className="text-red-500">*</span>
              </label>
              <select 
                name="inquiryType"
                value={formData.inquiryType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a value</option>
                {inquiryOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <h3 className="text-xl font-semibold mb-4">About You</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  First Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Last Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Phone Number<span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Company Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Province<span className="text-red-500">*</span>
                </label>
                <select 
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a value</option>
                  {provinces.map((province, index) => (
                    <option key={index} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  City or Town<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="cityOrTown"
                  value={formData.cityOrTown}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                How can we help you?<span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              ></textarea>
            </div>

            <div className="mb-6">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="mt-1 mr-2"
                  required
                />
                <label className="text-sm text-gray-600">
                  I agree to the use or processing of my personal information by TombstonesFinder.co.za for the purpose of handling this request and in accordance with TombstonesFinder.co.za's Privacy Statement.
                </label>
              </div>
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}