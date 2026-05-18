"use client";

import useSWR from 'swr';
import { Users, Phone, Package, Inbox } from 'lucide-react';
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Dashboard() {
  const { data, error } = useSWR('/api/providers', fetcher, { refreshInterval: 3000 });

  if (error) return <div>Failed to load data</div>;
  if (!data) return <div>Loading dashboard...</div>;

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
          <p className="text-gray-500 mt-1">Live lead distribution monitoring.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-medium text-gray-600">Live Updates</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.providers.map((provider: any) => {
          const quotaPercentage = (provider.quota / 10) * 100;
          const isWarning = provider.quota <= 2;
          
          return (
            <div key={provider.id} className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-96 overflow-hidden hover:shadow-md transition">
              <div className="bg-gray-50 border-b p-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-bold text-gray-800">{provider.name}</h2>
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                    {provider.assignments.length} Leads
                  </span>
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span className="text-gray-600">Quota Remaining</span>
                    <span className={isWarning ? "text-red-600" : "text-gray-600"}>{provider.quota}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all duration-500 ${isWarning ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${quotaPercentage}%` }}></div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 flex-grow overflow-y-auto bg-white">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Assigned Leads</h3>
                
                {provider.assignments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full pb-8 opacity-60">
                    <Inbox size={48} strokeWidth={1.5} className="mb-3 text-gray-400" />
                    <p className="text-sm text-gray-500 font-semibold">Inbox Zero</p>
                    <p className="text-xs text-gray-400 mt-1">Waiting for new leads...</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {provider.assignments.map((assignment: any) => (
                      <li key={assignment.id} className="text-sm p-3 border rounded-lg bg-gray-50 border-gray-100 transition hover:bg-gray-100">
                        <div className="font-semibold text-gray-800 flex items-center gap-1.5">
                          <Users size={14} className="text-gray-500" />
                          {assignment.lead.name}
                        </div>
                        <div className="text-gray-600 font-mono text-xs mt-1 flex items-center gap-1.5">
                          <Phone size={14} className="text-gray-400" />
                          {assignment.lead.phone}
                        </div>
                        <div className="mt-2.5 inline-flex items-center gap-1.5 bg-white border px-2 py-1 rounded text-xs text-blue-700 font-medium shadow-sm">
                          <Package size={12} />
                          {assignment.lead.service.name}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}