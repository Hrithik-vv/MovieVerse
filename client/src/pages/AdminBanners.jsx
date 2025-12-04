import React, { useContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminBanners = () => {
  const { user } = useContext(AuthContext);
  const [banners, setBanners] = useState([]);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ title: '', subtitle: '', active: true, order: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchAll = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/banners/all`, { headers: getAuthHeaders() });
      setBanners(res.data);
    } catch (err) {
      // Fallback to active banners if admin endpoint fails
      try {
        const res = await axios.get(`${API_URL}/api/banners/active`);
        setBanners(res.data);
      } catch (fallbackErr) {
        setError('Failed to load banners');
        console.error('Banner fetch error:', fallbackErr);
      }
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const upload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image file');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = new FormData();
      data.append('image', file);
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined) {
          data.append(k, String(v));
        }
      });
      await axios.post(`${API_URL}/api/banners`, data, {
        headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' },
      });
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setForm({ title: '', subtitle: '', active: true, order: 0 });
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to upload banner');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id, active) => {
    try {
      await axios.patch(`${API_URL}/api/banners/${id}`, { active }, { headers: getAuthHeaders() });
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update banner');
    }
  };

  const reorder = async (id, order) => {
    try {
      await axios.patch(`${API_URL}/api/banners/${id}`, { order }, { headers: getAuthHeaders() });
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reorder banner');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await axios.delete(`${API_URL}/api/banners/${id}`, { headers: getAuthHeaders() });
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete banner');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Banners</h1>
      {error && (
        <div className="bg-red-600/20 border border-red-600 text-red-300 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={upload} className="bg-dark-gray p-6 rounded-lg mb-8 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-gray-300"
          />
        </div>
        <input className="px-3 py-2 rounded bg-black/30" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="px-3 py-2 rounded bg-black/30" placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            <span>Active</span>
          </label>
          <input type="number" className="px-3 py-2 rounded bg-black/30 w-24" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
        </div>
        <div className="md:col-span-2">
          <button disabled={loading || !file} className="bg-primary hover:bg-red-700 text-white px-6 py-2 rounded">
            {loading ? 'Uploading...' : 'Upload Banner'}
          </button>
        </div>
      </form>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {banners.map((b, idx) => (
          <div key={b._id} className="bg-dark-gray rounded-lg overflow-hidden">
            <img src={`${API_URL}${b.imageUrl}`} alt={b.title || 'banner'} className="w-full h-48 object-cover" />
            <div className="p-4 space-y-2">
              <div className="font-semibold">{b.title || 'Untitled'}</div>
              <div className="text-sm text-gray-400">{b.subtitle}</div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(b._id, !b.active)} className="px-3 py-1 rounded bg-black/30">
                  {b.active ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => reorder(b._id, Math.max(0, (b.order || 0) - 1))} className="px-3 py-1 rounded bg-black/30">Up</button>
                <button onClick={() => reorder(b._id, (b.order || 0) + 1)} className="px-3 py-1 rounded bg-black/30">Down</button>
                <button onClick={() => remove(b._id)} className="px-3 py-1 rounded bg-red-600 text-white ml-auto">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminBanners;


