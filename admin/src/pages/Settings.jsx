import React from 'react'
import { FiSettings, FiTruck, FiCreditCard, FiMail, FiShield } from 'react-icons/fi'

const Settings = ({ token }) => {
  const settingsSections = [
    {
      title: 'Store Settings',
      icon: FiSettings,
      description: 'Manage store information and basic settings'
    },
    {
      title: 'Shipping',
      icon: FiTruck,
      description: 'Configure shipping methods and rates'
    },
    {
      title: 'Payments',
      icon: FiCreditCard,
      description: 'Set up payment methods and gateways'
    },
    {
      title: 'Email',
      icon: FiMail,
      description: 'Configure email templates and SMTP settings'
    },
    {
      title: 'Security',
      icon: FiShield,
      description: 'Manage security settings and access controls'
    }
  ]

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsSections.map((section, index) => {
          const IconComponent = section.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <IconComponent className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{section.title}</h3>
              </div>
              <p className="text-sm text-gray-600">{section.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Settings