"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Phone, Mail, Clock, Shield, Heart, Users, Star } from 'lucide-react'
import Header from '@/components/Header'

export default function LifeInsurancePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    province: '',
    city: '',
    age: '',
    occupation: '',
    coverageAmount: '',
    policyType: '',
    healthStatus: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSubmitMessage('Thank you! We will contact you within 24 hours to discuss your life insurance options.')
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        province: '',
        city: '',
        age: '',
        occupation: '',
        coverageAmount: '',
        policyType: '',
        healthStatus: '',
        message: ''
      })
    } catch (error) {
      setSubmitMessage('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Life Insurance for Peace of Mind
            </h1>
            <p className="text-xl mb-8">
              Protect your family's future with comprehensive life insurance coverage
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6" />
                <span>Comprehensive Coverage</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6" />
                <span>Family Protection</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6" />
                <span>Expert Advisors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Contact Form */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Get Your Free Quote
                </h2>
                <p className="text-gray-600 mb-8">
                  Fill out the form below and we'll connect you with trusted life insurance providers.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Province *
                      </label>
                      <select
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Province</option>
                        <option value="gauteng">Gauteng</option>
                        <option value="western-cape">Western Cape</option>
                        <option value="kwazulu-natal">KwaZulu-Natal</option>
                        <option value="eastern-cape">Eastern Cape</option>
                        <option value="free-state">Free State</option>
                        <option value="mpumalanga">Mpumalanga</option>
                        <option value="limpopo">Limpopo</option>
                        <option value="north-west">North West</option>
                        <option value="northern-cape">Northern Cape</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Insurance Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age *
                      </label>
                      <select
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Age Range</option>
                        <option value="18-25">18-25 years</option>
                        <option value="26-35">26-35 years</option>
                        <option value="36-45">36-45 years</option>
                        <option value="46-55">46-55 years</option>
                        <option value="56-65">56-65 years</option>
                        <option value="over-65">Over 65 years</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Occupation *
                      </label>
                      <select
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Occupation</option>
                        <option value="professional">Professional</option>
                        <option value="manager">Manager</option>
                        <option value="administrative">Administrative</option>
                        <option value="sales">Sales</option>
                        <option value="technical">Technical</option>
                        <option value="manual">Manual Labor</option>
                        <option value="student">Student</option>
                        <option value="retired">Retired</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Coverage Amount *
                      </label>
                      <select
                        name="coverageAmount"
                        value={formData.coverageAmount}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Coverage</option>
                        <option value="100000-250000">R100,000 - R250,000</option>
                        <option value="250000-500000">R250,000 - R500,000</option>
                        <option value="500000-1000000">R500,000 - R1,000,000</option>
                        <option value="1000000-2000000">R1,000,000 - R2,000,000</option>
                        <option value="2000000-5000000">R2,000,000 - R5,000,000</option>
                        <option value="over-5000000">Over R5,000,000</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Policy Type *
                      </label>
                      <select
                        name="policyType"
                        value={formData.policyType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Policy Type</option>
                        <option value="term-life">Term Life Insurance</option>
                        <option value="whole-life">Whole Life Insurance</option>
                        <option value="universal-life">Universal Life Insurance</option>
                        <option value="critical-illness">Critical Illness Cover</option>
                        <option value="disability">Disability Insurance</option>
                        <option value="funeral">Funeral Cover</option>
                        <option value="not-sure">Not Sure - Need Advice</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Health Status *
                    </label>
                    <select
                      name="healthStatus"
                      value={formData.healthStatus}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select Health Status</option>
                      <option value="excellent">Excellent - No health issues</option>
                      <option value="good">Good - Minor health issues</option>
                      <option value="fair">Fair - Some health conditions</option>
                      <option value="poor">Poor - Significant health issues</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Information
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Tell us more about your insurance needs..."
                    />
                  </div>

                  {submitMessage && (
                    <div className={`p-4 rounded-lg ${
                      submitMessage.includes('Thank you') 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {submitMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Get Free Quote'}
                  </button>
                </form>
              </div>

              {/* Information Sidebar */}
              <div className="space-y-8">
                {/* Benefits */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Why Choose Our Life Insurance?
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Comprehensive Coverage</h4>
                        <p className="text-gray-600 text-sm">Protection for you and your family</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Competitive Rates</h4>
                        <p className="text-gray-600 text-sm">Best prices from top insurers</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Expert Advisors</h4>
                        <p className="text-gray-600 text-sm">Professional guidance throughout</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Quick Claims Process</h4>
                        <p className="text-gray-600 text-sm">Fast and efficient claim settlement</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Policy Types */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Types of Coverage
                  </h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-900">Term Life Insurance</h4>
                      <p className="text-gray-600 text-sm">Affordable coverage for a specific period</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-900">Whole Life Insurance</h4>
                      <p className="text-gray-600 text-sm">Lifetime coverage with cash value</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-900">Critical Illness Cover</h4>
                      <p className="text-gray-600 text-sm">Protection against serious illnesses</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-900">Funeral Cover</h4>
                      <p className="text-gray-600 text-sm">Immediate financial assistance</p>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Need Help?
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">0800 123 4567</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">insurance@tombstonefinder.co.za</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">Mon-Fri: 8AM-6PM</span>
                    </div>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Trusted by Thousands
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-green-600">15,000+</div>
                      <div className="text-sm text-gray-600">Policies Sold</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-green-600">R100M+</div>
                      <div className="text-sm text-gray-600">Claims Paid</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-green-600">24hrs</div>
                      <div className="text-sm text-gray-600">Average Response</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-green-600">4.9★</div>
                      <div className="text-sm text-gray-600">Customer Rating</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 