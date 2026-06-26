import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Grid, Heart, Trash2, Download, Calendar, Filter, ChevronLeft, ChevronRight, RefreshCw, Eye } from 'lucide-react';
import client from '../api/client';
import useUIStore from '../stores/uiStore';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { showToast } = useUIStore();
  const [thumbnails, setThumbnails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | text-to-image | image-to-image | favorites
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 6;

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const endpoint = filter === 'favorites' ? '/api/thumbnails/favorites' : '/api/thumbnails/gallery';
      const params = {
        limit,
        skip: (page - 1) * limit
      };
      
      const res = await client.get(endpoint, { params });
      if (res.data) {
        setThumbnails(res.data.thumbnails || []);
        setTotal(res.data.total || (res.data.thumbnails ? res.data.thumbnails.length : 0));
      }
    } catch (err) {
      console.warn('Error loading history:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filter, page]);

  const handleDelete = async (id) => {
    try {
      const res = await client.delete(`/api/thumbnails/${id}`);
      if (res.data && res.data.success) {
        setThumbnails(prev => prev.filter(t => t._id !== id));
        showToast('Deleted', 'Thumbnail deleted successfully', 'success');
      }
    } catch (err) {
      showToast('Error', 'Failed to delete thumbnail', 'error');
    }
  };

  const handleFavorite = async (id) => {
    try {
      const res = await client.post(`/api/thumbnails/${id}/favorite`);
      if (res.data && res.data.success) {
        showToast('Success', res.data.message, 'success');
        if (filter === 'favorites') {
          setThumbnails(prev => prev.filter(t => t._id !== id));
        } else {
          setThumbnails(prev => prev.map(t => t._id === id ? { ...t, isFavorite: res.data.thumbnail.isFavorite } : t));
        }
      }
    } catch (err) {
      showToast('Error', 'Failed to toggle favorite', 'error');
    }
  };

  const handleDownload = (url) => {
    // Open image in a new tab for download
    window.open(url, '_blank');
  };

  const filteredThumbnails = thumbnails.filter(t => {
    if (filter === 'text-to-image' && t.type !== 'text-to-image') return false;
    if (filter === 'image-to-image' && t.type !== 'image-to-image') return false;
    if (search) {
      return (
        t.originalPrompt.toLowerCase().includes(search.toLowerCase()) ||
        (t.finalPrompt && t.finalPrompt.toLowerCase().includes(search.toLowerCase()))
      );
    }
    return true;
  });

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Thumbnail Gallery
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-light text-sm">
            Inspect previous generation variations and download files.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2.5">
          {['all', 'text-to-image', 'image-to-image', 'favorites'].map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${filter === f ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white dark:bg-gray-950 border-gray-200/50 dark:border-gray-800/40 text-gray-500 hover:text-gray-800'}`}
            >
              {f === 'all' && 'All Drafts'}
              {f === 'text-to-image' && 'Text-to-Image'}
              {f === 'image-to-image' && 'Image-to-Image'}
              {f === 'favorites' && 'Favorites'}
            </button>
          ))}
        </div>
      </div>

      {/* Search and stats bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 p-4 rounded-2xl shadow-sm w-full">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search prompt contents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-250 dark:border-gray-800 bg-transparent rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="text-xs text-gray-400 font-mono flex items-center space-x-4">
          <span>Page {page} of {totalPages}</span>
          <button onClick={fetchHistory} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Thumbnails grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filteredThumbnails.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredThumbnails.map((item) => (
            <div key={item._id} className="bg-white dark:bg-gray-900 border border-gray-250/50 dark:border-gray-800/40 rounded-2xl shadow-sm overflow-hidden group flex flex-col justify-between">
              {/* Image previews (carousel or single display) */}
              <div className="relative aspect-video bg-black overflow-hidden">
                <img
                  src={item.imageUrls[0]}
                  alt="Thumbnail Output"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                
                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center space-x-3 transition duration-150">
                  <button
                    onClick={() => handleFavorite(item._id)}
                    className={`p-2 rounded-xl text-white hover:scale-115 transition ${item.isFavorite ? 'bg-rose-600' : 'bg-white/20'}`}
                  >
                    <Heart className="w-5 h-5 fill-current" />
                  </button>
                  <button
                    onClick={() => handleDownload(item.imageUrls[0])}
                    className="p-2 rounded-xl bg-white/20 text-white hover:scale-115 transition"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Info details */}
              <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
                <p className="text-xs text-gray-700 dark:text-gray-300 font-sans leading-relaxed line-clamp-2">
                  {item.originalPrompt}
                </p>

                <div className="flex justify-between items-center text-[10px] text-gray-400">
                  <span className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-gray-400 hover:text-rose-600 rounded-lg transition"
                    title="Delete Draft"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white/40 dark:bg-gray-900/10 border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl max-w-md mx-auto">
          <p className="text-sm text-gray-500 mb-4">No generated thumbnails found in history.</p>
          <button
            onClick={() => navigate('/workspace')}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
          >
            Create Variations
          </button>
        </div>
      )}

      {/* Pagination controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-200/50 dark:border-gray-800/40">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center text-xs font-semibold text-gray-500 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>
          <span className="text-xs text-gray-400 font-mono">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center text-xs font-semibold text-gray-500 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}
