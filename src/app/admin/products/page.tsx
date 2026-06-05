'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiSliders, FiArrowLeft, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const categoriesList = [
  { id: 'electronics', name: 'Electronics' },
  { id: 'fashion', name: 'Fashion' },
  { id: 'home-living', name: 'Home & Living' },
  { id: 'beauty-health', name: 'Beauty & Health' },
  { id: 'sports-outdoors', name: 'Sports & Outdoors' },
  { id: 'groceries', name: 'Groceries' },
  { id: 'baby-toys', name: 'Baby & Toys' },
  { id: 'automotive', name: 'Automotive' },
  { id: 'gaming', name: 'Gaming' },
];

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    categoryName: 'Electronics',
    category: '', // will be set dynamically based on categoryName
    price: '',
    discountPrice: '',
    stock: '',
    image: '',
  });

  // Access check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/admin/products');
    } else if (session && session.user && ((session.user as { role?: string }).role !== 'admin' || session.user.email !== 'admin@moonmart.com')) {
      router.push('/');
    }
  }, [status, session, router]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user && (session.user as { role?: string }).role === 'admin' && session.user.email === 'admin@moonmart.com') {
      fetchProducts();
    }
  }, [session]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Product deleted successfully');
        fetchProducts();
      } else {
        toast.error(data.error || 'Failed to delete product');
      }
    } catch (err) {
      toast.error('Connection error deleting product');
    }
  };

  const handleEditClick = (prod: any) => {
    setEditingId(prod._id);
    setFormData({
      name: prod.name,
      description: prod.description || '',
      brand: prod.brand || '',
      categoryName: prod.categoryName || 'Electronics',
      category: prod.category || '',
      price: String(prod.price),
      discountPrice: prod.discountPrice ? String(prod.discountPrice) : '',
      stock: String(prod.stock),
      image: prod.images[0] || '',
    });
    setShowForm(true);
  };

  const handleAddNewClick = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      brand: '',
      categoryName: 'Electronics',
      category: '',
      price: '',
      discountPrice: '',
      stock: '10',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', // pre-fill placeholder
    });
    setShowForm(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Map category name to ID (simulating DB ref)
    const targetCat = categoriesList.find((c) => c.name === formData.categoryName);
    const resolvedCategory = targetCat ? targetCat.id : 'electronics';

    const payload = {
      name: formData.name,
      description: formData.description,
      brand: formData.brand || 'Unbranded',
      categoryName: formData.categoryName,
      category: resolvedCategory,
      price: parseFloat(formData.price),
      discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
      stock: parseInt(formData.stock),
      images: [formData.image],
      slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    };

    try {
      let res;
      if (editingId) {
        res = await fetch(`/api/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? 'Product updated successfully' : 'Product created successfully');
        setShowForm(false);
        fetchProducts();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (err) {
      toast.error('Connection error submitting details');
    }
  };

  // Filter list by search query
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-bg-primary min-h-screen py-6">
      <div className="container-main">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Link href="/admin" className="p-2 bg-white rounded-lg border border-border hover:bg-bg-primary text-text-secondary">
              <FiArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Catalog Manager</h1>
              <p className="text-xs text-text-secondary">Add, edit, or delete items in the store</p>
            </div>
          </div>
          <button
            onClick={handleAddNewClick}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <FiPlus size={16} /> Add Product
          </button>
        </div>

        {/* Search Bar filter */}
        <div className="bg-white p-4 rounded-xl border border-border-light shadow-sm flex items-center gap-3 mb-6">
          <FiSearch className="text-text-muted" size={18} />
          <input
            type="text"
            placeholder="Search by product name, brand or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none text-text-primary"
            aria-label="Search catalog"
          />
        </div>

        {/* Products Table list */}
        {loading ? (
          <div className="space-y-3">
            <div className="h-12 skeleton w-full" />
            <div className="h-12 skeleton w-full" />
            <div className="h-12 skeleton w-full" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-text-secondary">
            No products found matching search criteria.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border-light overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-text-secondary">
                <thead>
                  <tr className="bg-bg-primary text-text-primary font-bold uppercase tracking-wider border-b border-border">
                    <th className="p-3">Product</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Brand</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => {
                    const price = p.discountPrice || p.price;
                    return (
                      <tr key={p._id} className="border-b border-border-light hover:bg-bg-primary/30 transition-colors">
                        <td className="p-3 flex items-center gap-3">
                          <div className="w-10 h-10 bg-bg-primary rounded border border-border-light overflow-hidden shrink-0">
                            <img src={p.images[0]} alt="" className="object-cover w-full h-full" />
                          </div>
                          <span className="font-semibold text-text-primary truncate max-w-[200px] sm:max-w-xs block">
                            {p.name}
                          </span>
                        </td>
                        <td className="p-3">{p.categoryName}</td>
                        <td className="p-3 font-medium text-text-primary">{p.brand}</td>
                        <td className="p-3">
                          <span className="font-bold text-text-primary">Rs. {price.toLocaleString()}</span>
                          {p.discountPrice && (
                            <span className="text-[10px] text-text-muted line-through block">Rs. {p.price.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`font-semibold ${p.stock <= 5 ? 'text-error font-bold' : 'text-text-primary'}`}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditClick(p)}
                              className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                              aria-label="Edit product"
                            >
                              <FiEdit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(p._id)}
                              className="p-1.5 bg-red-50 text-error rounded hover:bg-red-100 transition-colors"
                              aria-label="Delete product"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── Add/Edit Product Slideout Drawer Panel ─── */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
            <div className="relative w-96 max-w-[90vw] h-full bg-white flex flex-col z-10 shadow-2xl animate-slide-up">
              {/* Form Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-bold text-text-primary text-base">
                  {editingId ? 'Edit Product Catalog' : 'Add New Product'}
                </h2>
                <button onClick={() => setShowForm(false)} aria-label="Close form">
                  <FiX size={20} className="text-text-secondary" />
                </button>
              </div>

              {/* Form Content scrollable */}
              <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {/* Name */}
                <div>
                  <label htmlFor="prodName" className="block font-semibold text-text-secondary mb-1">Product Title</label>
                  <input
                    id="prodName"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary text-xs"
                    placeholder="Enter product title"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="prodDesc" className="block font-semibold text-text-secondary mb-1">Description</label>
                  <textarea
                    id="prodDesc"
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary text-xs resize-none"
                    placeholder="Enter detailed specifications and usage details"
                  />
                </div>

                {/* Brand & Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="prodBrand" className="block font-semibold text-text-secondary mb-1">Brand</label>
                    <input
                      id="prodBrand"
                      type="text"
                      required
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary text-xs"
                      placeholder="e.g. Sony"
                    />
                  </div>
                  <div>
                    <label htmlFor="prodCat" className="block font-semibold text-text-secondary mb-1">Category</label>
                    <select
                      id="prodCat"
                      value={formData.categoryName}
                      onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-white outline-none focus:border-primary text-xs"
                    >
                      {categoriesList.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pricing & Stock */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="prodPrice" className="block font-semibold text-text-secondary mb-1">Base Price</label>
                    <input
                      id="prodPrice"
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary text-xs"
                      placeholder="Rs."
                    />
                  </div>
                  <div>
                    <label htmlFor="prodDiscount" className="block font-semibold text-text-secondary mb-1">Discount Price</label>
                    <input
                      id="prodDiscount"
                      type="number"
                      value={formData.discountPrice}
                      onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary text-xs"
                      placeholder="Rs. (Optional)"
                    />
                  </div>
                  <div>
                    <label htmlFor="prodStock" className="block font-semibold text-text-secondary mb-1">Stock Qty</label>
                    <input
                      id="prodStock"
                      type="number"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary text-xs"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label htmlFor="prodImg" className="block font-semibold text-text-secondary mb-1">Product Image</label>
                  <input
                    id="prodImg"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover"
                  />
                  {formData.image && (
                    <div className="mt-2 w-20 h-20 border border-border rounded overflow-hidden bg-bg-primary flex items-center justify-center relative">
                      <img src={formData.image} alt="Preview" className="object-cover w-full h-full" />
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-border flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-2.5 border border-border rounded-lg font-bold text-text-secondary hover:bg-bg-primary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold text-xs shadow"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
