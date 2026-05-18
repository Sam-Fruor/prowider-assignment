import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto text-center mt-12 py-12 px-6 bg-white rounded-2xl shadow-sm border border-gray-200">
      {/* Brand Header */}
      <div className="inline-block bg-blue-100 text-blue-800 font-bold p-3 rounded-2xl text-3xl mb-4">
        BMP
      </div>
      <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
        Book My Packers
      </h1>
      <p className="max-w-xl mx-auto mt-4 text-base text-gray-500">
        Enterprise Lead Generation & Distributed Partner Allocation Engine Portal.
      </p>

      {/* Main Feature Cards */}
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/request-service" className="p-6 text-left border rounded-xl hover:border-blue-500 hover:shadow-sm transition bg-gray-50 group">
          <div className="text-2xl mb-2">📋</div>
          <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition">Customer Form</h3>
          <p className="text-xs text-gray-500 mt-1">Submit enquiries with background data unique constraint sorting.</p>
        </Link>

        <Link href="/dashboard" className="p-6 text-left border rounded-xl hover:border-blue-500 hover:shadow-sm transition bg-gray-50 group">
          <div className="text-2xl mb-2">📊</div>
          <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition">Live Dashboard</h3>
          <p className="text-xs text-gray-500 mt-1">Monitor allocation round-robins and real-time quota status lines.</p>
        </Link>

        <Link href="/test-tools" className="p-6 text-left border rounded-xl hover:border-blue-500 hover:shadow-sm transition bg-gray-50 group">
          <div className="text-2xl mb-2">🧪</div>
          <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition">Testing Suite</h3>
          <p className="text-xs text-gray-500 mt-1">Simulate parallel stress-tests, concurrency spikes, and webhooks.</p>
        </Link>
      </div>

      <div className="mt-12 pt-6 border-t text-xs text-gray-400">
        Designed for the Book My Packers Full-Stack Internship Assignment Evaluation
      </div>
    </div>
  );
}