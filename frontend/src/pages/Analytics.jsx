import { useEffect, useState } from 'react';
import { BarChart3, Coins, Database, RefreshCw, Cpu, Award } from 'lucide-react';
import client from '../api/client';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await client.get('/api/analytics/summary');
      if (res.data) setStats(res.data);

      const logsRes = await client.get('/api/analytics/logs');
      if (logsRes.data) setLogs(logsRes.data.logs || []);
    } catch (err) {
      console.warn('Analytics loading error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          SaaS Usage Analytics
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-light text-sm">
          Monitor your credit quota balance and API requests.
        </p>
      </div>

      {/* Credit Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Remaining Credits Card */}
        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-400">Remaining Credits</span>
            <h2 className="text-3xl font-black text-blue-600 dark:text-blue-400">{stats ? stats.credits.remaining : 50}</h2>
            <p className="text-[10px] text-gray-400">Resets monthly</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
            <Coins className="w-6 h-6" />
          </div>
        </div>

        {/* Max Quota Card */}
        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-400">Total Quota</span>
            <h2 className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{stats ? stats.credits.quota : 50}</h2>
            <p className="text-[10px] text-gray-400">Maximum allocation</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* API Requests Card */}
        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-400">Total Operations</span>
            <h2 className="text-3xl font-black text-purple-600 dark:text-purple-400">{logs ? logs.length : 0}</h2>
            <p className="text-[10px] text-gray-400">Drafts generated</p>
          </div>
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Credit Usage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Graph representation */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base">Generation Category Breakdown</h3>
            <button onClick={fetchAnalytics} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="space-y-4">
            {stats && stats.usage && stats.usage.length > 0 ? (
              stats.usage.map(item => (
                <div key={item._id} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="capitalize">{item._id}</span>
                    <span>{item.count} calls ({item.totalCredits} credits)</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, (item.totalCredits / 50) * 100)}%` }}
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-gray-400">
                No generation logs to show yet. Create variations in Workspace.
              </div>
            )}
          </div>
        </div>

        {/* Info Sidebar Card */}
        <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/10 dark:to-blue-950/10 border border-indigo-100/30 dark:border-indigo-900/30 rounded-2xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <Database className="w-4 h-4" />
              <span>SaaS billing policy</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed font-light">
              ThumbCraft operates on a credit structure. Each user receives 50 monthly credits. 
              Each variation batch of thumbnails consumes 5 credits. Prompt enhancements cost 1 credit.
            </p>
          </div>
          <div className="pt-6 border-t border-indigo-100/20 text-xs text-gray-400 font-mono">
            Requires upgrading for production API rates.
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-800/30 flex justify-between items-center">
          <h3 className="font-bold text-base">Credits Consumption Audit Log</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-gray-50 dark:bg-gray-950 text-gray-400 border-b border-gray-200/50 dark:border-gray-800/30 font-semibold uppercase">
              <tr>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4">Credits Consumed</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-gray-800/30 text-gray-700 dark:text-gray-300 font-light">
              {logs.length > 0 ? (
                logs.map(log => (
                  <tr key={log._id}>
                    <td className="px-6 py-4 font-medium capitalize">{log.action}</td>
                    <td className="px-6 py-4 uppercase font-mono">{log.provider}</td>
                    <td className="px-6 py-4 font-bold text-red-500">-{log.creditsConsumed}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${log.status === 'success' ? 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700' : 'bg-rose-100 dark:bg-rose-950/20 text-rose-700'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    No consumption history recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
