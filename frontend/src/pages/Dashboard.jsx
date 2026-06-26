import { useEffect, useState } from 'react';
import { Sparkles, Folder, Plus, PlusCircle, ArrowRight, ShieldAlert, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import client from '../api/client';

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('');
  const [folderName, setFolderName] = useState('');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const projRes = await client.get('/api/projects');
      if (projRes.data && projRes.data.projects) {
        setProjects(projRes.data.projects);
      }
      const foldRes = await client.get('/api/projects/folders');
      if (foldRes.data && foldRes.data.folders) {
        setFolders(foldRes.data.folders);
      }
    } catch (err) {
      console.warn('Error loading dashboard data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    try {
      const res = await client.post('/api/projects', { name: projectName });
      if (res.data && res.data.success) {
        setProjects([res.data.project, ...projects]);
        setProjectName('');
        setShowProjectModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    try {
      const res = await client.post('/api/projects/folders', { name: folderName });
      if (res.data && res.data.success) {
        setFolders([res.data.folder, ...folders]);
        setFolderName('');
        setShowFolderModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white shadow-xl shadow-blue-500/10">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-1">Welcome back, {user ? user.name : 'Creator'}!</h1>
          <p className="text-blue-100 text-sm font-light">Craft stunning thumbnails and organize them within custom projects.</p>
        </div>
        <button
          onClick={() => navigate('/workspace')}
          className="mt-4 md:mt-0 flex items-center px-5 py-3 bg-white text-blue-700 font-bold rounded-xl text-sm hover:bg-blue-50 shadow-md transition-all transform hover:-translate-y-0.5"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Open Studio
        </button>
      </div>

      {/* Grid Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Project Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Active Projects</h2>
            <button
              onClick={() => setShowProjectModal(true)}
              className="flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Project
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map(n => (
                <div key={n} className="h-32 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map(proj => (
                <div
                  key={proj._id}
                  onClick={() => navigate(`/workspace?projectId=${proj._id}`)}
                  className="p-5 bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between h-36"
                >
                  <div>
                    <h3 className="font-bold text-base mb-1 group-hover:text-blue-600 transition-colors">{proj.name}</h3>
                    <p className="text-xs text-gray-400 font-light truncate">{proj.description || 'No description added'}</p>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 font-mono">
                      {proj.thumbnailCount || 0} variations
                    </span>
                    <span className="text-blue-500 flex items-center font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Open <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white/40 dark:bg-gray-900/10 border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl">
              <p className="text-sm text-gray-500 mb-4">No active projects found. Create a project to start grouping your drafts.</p>
              <button
                onClick={() => setShowProjectModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
              >
                Create First Project
              </button>
            </div>
          )}
        </div>

        {/* Folders & Shortcuts Sidebar */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold font-sans">Folders</h2>
            <button
              onClick={() => setShowFolderModal(true)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center"
            >
              <Plus className="w-4 h-4 mr-0.5" />
              Add
            </button>
          </div>

          <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl space-y-3">
            {loading ? (
              <div className="space-y-2">
                {[1, 2].map(n => <div key={n} className="h-10 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />)}
              </div>
            ) : folders.length > 0 ? (
              folders.map(f => (
                <div key={f._id} className="flex items-center space-x-3 p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/20 rounded-xl transition cursor-pointer">
                  <Folder className="w-5 h-5 text-indigo-500" />
                  <span className="text-sm font-medium">{f.name}</span>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-xs text-gray-400">
                No folders created yet
              </div>
            )}
          </div>

          {/* Shortcut Card */}
          <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/15 dark:to-purple-950/10 border border-indigo-100/30 dark:border-indigo-900/30 rounded-2xl">
            <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs mb-3 uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>Keyboard Shortcuts</span>
            </div>
            <div className="space-y-2 text-xs font-light">
              <div className="flex justify-between font-mono"><span className="text-gray-400">Palette</span><span>Ctrl + K</span></div>
              <div className="flex justify-between font-mono"><span className="text-gray-400">Go Dashboard</span><span>Alt + D</span></div>
              <div className="flex justify-between font-mono"><span className="text-gray-400">Go Studio</span><span>Alt + G</span></div>
              <div className="flex justify-between font-mono"><span className="text-gray-400">Toggle Theme</span><span>Alt + T</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 w-full max-w-md p-6 rounded-2xl shadow-xl">
            <h3 className="text-lg font-bold mb-4">Create New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Project Name</label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-850 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Minecraft Gameplay"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 w-full max-w-md p-6 rounded-2xl shadow-xl">
            <h3 className="text-lg font-bold mb-4">Create New Folder</h3>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Folder Name</label>
                <input
                  type="text"
                  required
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-850 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Gaming Drafts"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFolderModal(false)}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
