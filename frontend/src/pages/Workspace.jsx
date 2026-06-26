import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, Image as ImageIcon, Upload, Trash2, Heart, Download, HelpCircle, RefreshCw, Cpu, Layers } from 'lucide-react';
import client from '../api/client';
import useUIStore from '../stores/uiStore';

export default function Workspace() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  
  const { showToast } = useUIStore();
  const fileInputRef = useRef(null);

  // Studio states
  const [tab, setTab] = useState('text'); // text | image
  const [prompt, setPrompt] = useState('');
  const [enhancePrompt, setEnhancePrompt] = useState(false);
  const [provider, setProvider] = useState('gemini');
  const [imageCount, setImageCount] = useState('4');
  
  // Image upload
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Style configurations
  const [category, setCategory] = useState('Tech');
  const [mood, setMood] = useState('Energetic');
  const [theme, setTheme] = useState('Gradient');
  const [primaryColor, setPrimaryColor] = useState('Blue');
  const [includeText, setIncludeText] = useState('Yes');
  const [textStyle, setTextStyle] = useState('Bold');
  const [thumbnailStyle, setThumbnailStyle] = useState('Photo-realistic');
  const [customPrompt, setCustomPrompt] = useState('');

  // Generation status
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [favorites, setFavorites] = useState({});

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      processFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (fileObj) => {
    setFile(fileObj);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(fileObj);
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      showToast('Validation Error', 'Please describe your thumbnail idea', 'warning');
      return;
    }
    if (tab === 'image' && !file) {
      showToast('Validation Error', 'Please upload a reference image', 'warning');
      return;
    }

    try {
      setGenerating(true);
      setResult(null);
      
      const payload = {
        prompt,
        enhancePrompt,
        category,
        mood,
        theme,
        primaryColor,
        includeText: includeText === 'Yes',
        textStyle,
        thumbnailStyle,
        customPrompt,
        imageCount: tab === 'image' ? '1' : imageCount,
        provider,
        projectId
      };

      let res;
      if (tab === 'text') {
        res = await client.post('/api/thumbnails/generate', payload);
      } else {
        const formData = new FormData();
        Object.entries(payload).forEach(([k, v]) => formData.append(k, v));
        formData.append('image', file);
        res = await client.post('/api/thumbnails/generate-from-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data && res.data.thumbnail) {
        setResult(res.data.thumbnail);
        showToast('Generation Success', 'Your thumbnails are ready!', 'success');
      }
    } catch (err) {
      showToast('Generation Failed', err.response?.data?.error || err.message, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const toggleFavorite = async (thumbnailId) => {
    try {
      const res = await client.post(`/api/thumbnails/${thumbnailId}/favorite`);
      if (res.data && res.data.success) {
        setFavorites(prev => ({
          ...prev,
          [thumbnailId]: !prev[thumbnailId]
        }));
        showToast('Favorite Updated', res.data.message, 'success');
      }
    } catch (err) {
      showToast('Error updating favorite', err.message, 'error');
    }
  };

  const downloadImage = async (url, idx) => {
    try {
      showToast('Exporting', 'Downloading your thumbnail...', 'info');
      const response = await client.get(`/api/thumbnails/download`, {
        params: { url },
        responseType: 'blob'
      });
      const blob = new Blob([response.data]);
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `thumbnail_${result?._id || 'gen'}_${idx}.png`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      // Fallback open in new tab
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Heading */}
      <div>
        <h1 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          Thumbnail Workspace
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-light text-sm">
          Customize AI models, upload templates, style details, and inspect variations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Configurations Panel */}
        <form onSubmit={handleGenerate} className="lg:col-span-5 space-y-6 bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 p-6 rounded-2xl shadow-sm">
          {/* Mode Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-950 p-1.5 rounded-xl border border-gray-200/20">
            <button
              type="button"
              onClick={() => setTab('text')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${tab === 'text' ? 'bg-white dark:bg-gray-900 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Text-to-Image
            </button>
            <button
              type="button"
              onClick={() => setTab('image')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${tab === 'image' ? 'bg-white dark:bg-gray-900 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Image-to-Image
            </button>
          </div>

          {/* AI engine */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase text-gray-400 tracking-wider flex items-center">
              <Cpu className="w-3.5 h-3.5 mr-1" />
              AI generation model
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent text-gray-700 dark:text-gray-200"
            >
              <option value="gemini">Google Gemini 2.5 Flash</option>
              <option value="openai">OpenAI DALL-E-3</option>
              <option value="openrouter">OpenRouter Engine</option>
              <option value="mock">Local Sandboxed Mock</option>
            </select>
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase text-gray-400 tracking-wider">
              Prompt idea
            </label>
            <textarea
              required
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A developer sitting at desk under neon lights coding intensely..."
              className="w-full p-3 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enhance"
                checked={enhancePrompt}
                onChange={(e) => setEnhancePrompt(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="enhance" className="text-xs text-gray-500 cursor-pointer">
                Enhance prompt automatically (costs 1 credit)
              </label>
            </div>
          </div>

          {/* Image Upload Area */}
          {tab === 'image' && (
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase text-gray-400 tracking-wider">
                Reference Image Upload
              </label>
              {!preview ? (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-800 hover:border-blue-500 rounded-xl p-6 cursor-pointer hover:bg-gray-50/50 transition duration-150"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500">Drag image here or click to browse</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative border border-gray-200 dark:border-gray-850 rounded-xl overflow-hidden group">
                  <img src={preview} alt="Upload Preview" className="w-full h-36 object-cover" />
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition duration-150"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Style Attributes Accordion */}
          <div className="border-t border-gray-200/50 dark:border-gray-800/40 pt-4 space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Thumbnail Style Rules
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full text-xs bg-transparent border border-gray-200 dark:border-gray-800 p-1.5 rounded">
                  {['Tech', 'Gaming', 'Vlog', 'Tutorial', 'Entertainment', 'News'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase">Mood</label>
                <select value={mood} onChange={(e) => setMood(e.target.value)} className="w-full text-xs bg-transparent border border-gray-200 dark:border-gray-800 p-1.5 rounded">
                  {['Excited', 'Serious', 'Fun', 'Professional', 'Mysterious', 'Energetic'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase">Colors</label>
                <select value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-full text-xs bg-transparent border border-gray-200 dark:border-gray-800 p-1.5 rounded">
                  {['Red', 'Blue', 'Green', 'Purple', 'Orange', 'Yellow', 'Pink', 'Cyan'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase">Art Style</label>
                <select value={thumbnailStyle} onChange={(e) => setThumbnailStyle(e.target.value)} className="w-full text-xs bg-transparent border border-gray-200 dark:border-gray-800 p-1.5 rounded">
                  {['Photo-realistic', 'Cartoonish', 'Minimalistic', 'Artistic', 'Modern'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase">Add text overlay?</label>
                <select value={includeText} onChange={(e) => setIncludeText(e.target.value)} className="w-full text-xs bg-transparent border border-gray-200 dark:border-gray-800 p-1.5 rounded">
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase">Text styling</label>
                <select disabled={includeText === 'No'} value={textStyle} onChange={(e) => setTextStyle(e.target.value)} className="w-full text-xs bg-transparent border border-gray-200 dark:border-gray-800 p-1.5 rounded disabled:opacity-50">
                  {['Bold', 'Minimal', 'Fancy', 'Outlined', 'Shadow', 'Gradient'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {tab === 'text' && (
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase">Variations count</label>
                <select value={imageCount} onChange={(e) => setImageCount(e.target.value)} className="w-full text-xs bg-transparent border border-gray-200 dark:border-gray-800 p-1.5 rounded">
                  <option value="1">1 draft (5 credits)</option>
                  <option value="2">2 drafts (5 credits)</option>
                  <option value="4">4 drafts (5 credits)</option>
                </select>
              </div>
            )}
          </div>

          {/* Trigger Generate */}
          <button
            type="submit"
            disabled={generating}
            className="w-full flex items-center justify-center py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/10 disabled:opacity-75 disabled:cursor-not-allowed group transition"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating Studio drafts...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                Generate variations (5 credits)
              </>
            )}
          </button>
        </form>

        {/* Results Panel */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center border border-gray-200/50 dark:border-gray-800/40 rounded-2xl bg-white/40 dark:bg-gray-900/10 min-h-[400px] overflow-hidden p-6 relative">
          
          {generating && (
            <div className="absolute inset-0 bg-white/70 dark:bg-gray-950/70 flex flex-col items-center justify-center z-10 backdrop-blur-sm space-y-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold tracking-wide animate-pulse">Painting your thumbnails...</p>
            </div>
          )}

          {result ? (
            <div className="w-full space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Generated Drafts</h3>
                <span className="text-xs px-2.5 py-1 bg-blue-100/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium rounded-full">
                  Model: {result.provider}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.imageUrls.map((url, idx) => (
                  <div key={url} className="relative group border border-gray-200 dark:border-gray-850 rounded-2xl overflow-hidden bg-black shadow-md hover:shadow-lg transition">
                    <img src={url} alt={`Variation ${idx + 1}`} className="w-full aspect-video object-cover" />
                    
                    {/* Action Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center space-x-3 transition duration-150">
                      <button
                        onClick={() => toggleFavorite(result._id)}
                        className={`p-2 rounded-xl text-white hover:scale-115 transition ${favorites[result._id] ? 'bg-rose-600' : 'bg-white/20'}`}
                      >
                        <Heart className="w-5 h-5 fill-current" />
                      </button>
                      <button
                        onClick={() => downloadImage(url, idx)}
                        className="p-2 rounded-xl bg-white/20 text-white hover:scale-115 transition"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Prompt breakdown */}
              <div className="p-4 bg-gray-100/50 dark:bg-gray-900/30 rounded-xl border border-gray-200/20 text-xs leading-relaxed space-y-1">
                <span className="font-bold text-gray-400 uppercase tracking-wider block">Enhanced prompt details:</span>
                <p className="text-gray-600 dark:text-gray-300 font-light font-sans">{result.finalPrompt}</p>
              </div>
            </div>
          ) : (
            <div className="text-center max-w-sm space-y-3">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-base">Studio Preview Screen</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                Configure your generation rules and click generate. The draft variations will load here.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
