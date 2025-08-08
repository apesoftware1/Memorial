"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, AlertTriangle, Info, Phone, Mail, Clock, MapPin, Wrench, Shield, Users } from 'lucide-react'
import Header from '@/components/Header'

export default function InstallationGuidePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('preparation')

  const installationSteps = [
    {
      id: 'preparation',
      title: 'Preparation Phase',
      icon: <Wrench className="w-6 h-6" />,
      steps: [
        'Obtain necessary permits from local municipality',
        'Check weather conditions - avoid rainy days',
        'Gather all required tools and materials',
        'Mark the exact location for the tombstone',
        'Ensure proper drainage around the site'
      ]
    },
    {
      id: 'foundation',
      title: 'Foundation Work',
      icon: <Shield className="w-6 h-6" />,
      steps: [
        'Excavate the foundation area (minimum 30cm depth)',
        'Level the foundation base properly',
        'Install steel reinforcement if required',
        'Pour concrete foundation (minimum 15cm thickness)',
        'Allow foundation to cure for 48-72 hours'
      ]
    },
    {
      id: 'installation',
      title: 'Tombstone Installation',
      icon: <Users className="w-6 h-6" />,
      steps: [
        'Position the tombstone on the foundation',
        'Use spirit level to ensure perfect alignment',
        'Apply construction adhesive to the base',
        'Secure the tombstone with anchor bolts',
        'Fill any gaps with mortar or sealant'
      ]
    },
    {
      id: 'finishing',
      title: 'Finishing Touches',
      icon: <Check className="w-6 h-6" />,
      steps: [
        'Clean the tombstone surface thoroughly',
        'Apply protective sealant if recommended',
        'Install any additional decorative elements',
        'Landscape the surrounding area',
        'Conduct final inspection and testing'
      ]
    }
  ]

  const safetyGuidelines = [
    'Always wear appropriate safety gear (gloves, safety glasses)',
    'Work with at least one other person for heavy lifting',
    'Use proper lifting techniques to avoid injury',
    'Keep children and pets away from the work area',
    'Have a first aid kit readily available',
    'Follow all local safety regulations and guidelines'
  ]

  const commonMistakes = [
    'Insufficient foundation depth or strength',
    'Poor alignment and leveling of the tombstone',
    'Inadequate drainage around the installation',
    'Using incorrect adhesive or sealant products',
    'Not allowing sufficient curing time for materials',
    'Skipping the protective sealant application'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Tombstone Installation Guide
            </h1>
            <p className="text-xl mb-8">
              Professional step-by-step instructions for proper tombstone installation
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div className="flex items-center gap-2">
                <Wrench className="w-6 h-6" />
                <span>Professional Tools</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6" />
                <span>Safety First</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-6 h-6" />
                <span>Quality Results</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            
            {/* Tab Navigation */}
            <div className="flex flex-wrap justify-center mb-8">
              {installationSteps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setActiveTab(step.id)}
                  className={`px-6 py-3 mx-2 mb-2 rounded-lg font-semibold transition-colors ${
                    activeTab === step.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {step.icon}
                  <span className="ml-2">{step.title}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Main Content Area */}
              <div className="lg:col-span-2">
                {installationSteps.map((step) => (
                  <div
                    key={step.id}
                    className={`bg-white rounded-lg shadow-lg p-8 mb-8 ${
                      activeTab === step.id ? 'block' : 'hidden'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      {step.icon}
                      <h2 className="text-3xl font-bold text-gray-900">{step.title}</h2>
                    </div>
                    
                    <div className="space-y-4">
                      {step.steps.map((stepItem, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold text-sm">
                            {index + 1}
                          </div>
                          <p className="text-gray-700 leading-relaxed">{stepItem}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Safety Guidelines */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-orange-500" />
                    Safety Guidelines
                  </h3>
                  <div className="space-y-3">
                    {safetyGuidelines.map((guideline, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700 text-sm">{guideline}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Common Mistakes */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Info className="w-6 h-6 text-red-500" />
                    Common Mistakes
                  </h3>
                  <div className="space-y-3">
                    {commonMistakes.map((mistake, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 text-sm">{mistake}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tools & Materials */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Required Tools & Materials
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Tools:</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Spirit level</li>
                        <li>• Measuring tape</li>
                        <li>• Shovel and spade</li>
                        <li>• Concrete mixer</li>
                        <li>• Safety equipment</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Materials:</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Concrete mix</li>
                        <li>• Steel reinforcement</li>
                        <li>• Construction adhesive</li>
                        <li>• Anchor bolts</li>
                        <li>• Protective sealant</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Need Professional Help?
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-purple-600" />
                      <span className="text-gray-700">0800 123 4567</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-purple-600" />
                      <span className="text-gray-700">install@tombstonefinder.co.za</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <span className="text-gray-700">Mon-Fri: 8AM-6PM</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      <span className="text-gray-700">Nationwide Service</span>
                    </div>
                  </div>
                </div>

                {/* Professional Services */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Professional Services
                  </h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-900">Installation Service</h4>
                      <p className="text-gray-600 text-sm">Professional installation by certified experts</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-900">Site Preparation</h4>
                      <p className="text-gray-600 text-sm">Complete site preparation and foundation work</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-900">Maintenance</h4>
                      <p className="text-gray-600 text-sm">Ongoing maintenance and repair services</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-900">Consultation</h4>
                      <p className="text-gray-600 text-sm">Expert advice and planning assistance</p>
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