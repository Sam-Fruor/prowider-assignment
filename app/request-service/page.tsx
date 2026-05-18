"use client";

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function RequestServiceForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    serviceId: '1', 
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.phone.length !== 10) {
      toast.error('Mobile number must be exactly 10 digits.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/request-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Something went wrong');
      } else {
        toast.success('Enquiry Submitted! Lead distributed successfully.');
        
        setFormData({ name: '', phone: '', city: '', serviceId: '1', description: '' });
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-4">
      <div className="bg-white p-8 border border-gray-200 rounded-xl shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Request a Service</h1>
          <p className="text-gray-500 mt-2">Submit your details and we will connect you with top providers.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input 
                required 
                type="text" 
                placeholder="John Doe" 
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Number</label>
              <input 
                required 
                type="tel" 
                pattern="[0-9]{10}"
                maxLength={10}
                title="Please enter a valid 10-digit mobile number"
                placeholder="e.g. 9876543210" 
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                value={formData.phone} 
                onChange={e => {
                  const onlyNumbers = e.target.value.replace(/\D/g, '');
                  setFormData({...formData, phone: onlyNumbers});
                }} 
              />
              <p className="text-xs text-gray-400 mt-1">Must be exactly 10 digits.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
              <input 
                required 
                type="text" 
                placeholder="e.g. Mumbai" 
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                value={formData.city} 
                onChange={e => setFormData({...formData, city: e.target.value})} 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Service Required</label>
              <select 
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white" 
                value={formData.serviceId} 
                onChange={e => setFormData({...formData, serviceId: e.target.value})}
              >
                <option value="1">Service 1 (Packing)</option>
                <option value="2">Service 2 (Moving)</option>
                <option value="3">Service 3 (Storage)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description of Requirements</label>
            <textarea 
              required 
              placeholder="Tell us more about what you need..." 
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
              rows={4}
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <button 
            disabled={loading} 
            type="submit" 
            className="w-full flex justify-center items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white p-3 rounded-lg font-bold text-lg transition disabled:opacity-70 shadow-md"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}