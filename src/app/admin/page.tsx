'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, Menu as MenuIcon, X, Plus, Pencil, Trash2, Upload, 
  Save, Loader2, Image as ImageIcon,
  Utensils, FolderOpen, MessageSquare, MapPin, Home,
  AlertCircle, ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Image from 'next/image';

// Types
interface Admin {
  id: string;
  email: string;
  name: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  order: number;
  active: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  isVeg: boolean;
  isPopular: boolean;
  isAvailable: boolean;
  categoryId: string;
  order: number;
  category: Category;
}

interface Testimonial {
  id: string;
  name: string;
  rating: number;
  comment: string;
  source: string | null;
  active: boolean;
  order: number;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('menu');
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  // Modal states
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [testimonialModalOpen, setTestimonialModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string } | null>(null);

  // Edit states
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);

  // Form states
  const [menuItemForm, setMenuItemForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    isVeg: true,
    isPopular: false,
    isAvailable: true,
    categoryId: '',
    order: 0,
  });
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    icon: '',
    order: 0,
    active: true,
  });
  const [testimonialForm, setTestimonialForm] = useState({
    name: '',
    rating: 5,
    comment: '',
    source: '',
    active: true,
    order: 0,
  });

  // Upload state
  const [uploading, setUploading] = useState(false);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Close sidebar when tab changes on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [activeTab]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/auth/check');
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        setAdmin(data.admin);
        fetchAllData();
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    await Promise.all([
      fetchCategories(),
      fetchMenuItems(),
      fetchTestimonials(),
    ]);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const res = await fetch('/api/admin/menu');
      const data = await res.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/admin/testimonials');
      const data = await res.json();
      setTestimonials(data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();

      if (data.success) {
        setIsAuthenticated(true);
        setAdmin(data.admin);
        fetchAllData();
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (error) {
      setLoginError('Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setAdmin(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setMenuItemForm({ ...menuItemForm, image: data.url });
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  // Menu Item CRUD
  const handleSaveMenuItem = async () => {
    try {
      const url = editingMenuItem ? `/api/admin/menu/${editingMenuItem.id}` : '/api/admin/menu';
      const method = editingMenuItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuItemForm),
      });

      if (res.ok) {
        fetchMenuItems();
        setMenuModalOpen(false);
        resetMenuItemForm();
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/menu/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchMenuItems();
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
    }
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const resetMenuItemForm = () => {
    setMenuItemForm({
      name: '',
      description: '',
      price: '',
      image: '',
      isVeg: true,
      isPopular: false,
      isAvailable: true,
      categoryId: categories[0]?.id || '',
      order: 0,
    });
    setEditingMenuItem(null);
  };

  const openEditMenuItem = (item: MenuItem) => {
    setEditingMenuItem(item);
    setMenuItemForm({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      image: item.image || '',
      isVeg: item.isVeg,
      isPopular: item.isPopular,
      isAvailable: item.isAvailable,
      categoryId: item.categoryId,
      order: item.order,
    });
    setMenuModalOpen(true);
  };

  // Category CRUD
  const handleSaveCategory = async () => {
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      });

      if (res.ok) {
        fetchCategories();
        setCategoryModalOpen(false);
        resetCategoryForm();
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      slug: '',
      icon: '',
      order: 0,
      active: true,
    });
  };

  // Testimonial CRUD
  const handleSaveTestimonial = async () => {
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testimonialForm),
      });

      if (res.ok) {
        fetchTestimonials();
        setTestimonialModalOpen(false);
        resetTestimonialForm();
      }
    } catch (error) {
      console.error('Error saving testimonial:', error);
    }
  };

  const resetTestimonialForm = () => {
    setTestimonialForm({
      name: '',
      rating: 5,
      comment: '',
      source: '',
      active: true,
      order: 0,
    });
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1612] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#7A8B5A]" />
      </div>
    );
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1A1612] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#2A2420] border-[#4A4440]">
          <CardHeader className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full overflow-hidden border-2 border-[#7A8B5A]">
              <Image src="/logo.jpg" alt="Bonoriya" width={80} height={80} className="object-cover w-full h-full" />
            </div>
            <CardTitle className="text-[#F5F1E8] text-xl sm:text-2xl">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#F5F1E8]">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="bg-[#3A3430] border-[#4A4440] text-[#F5F1E8] h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#F5F1E8]">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="bg-[#3A3430] border-[#4A4440] text-[#F5F1E8] h-11"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#7A8B5A] hover:bg-[#5D6D3F] text-[#1A1612] h-11"
                disabled={loginLoading}
              >
                {loginLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Login
              </Button>
            </form>
            <p className="text-center text-[#B8A898] text-sm mt-4">
              <a href="/" className="hover:text-[#7A8B5A] touch-manipulation">← Back to Website</a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1612]">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#2A2420] border-b border-[#4A4440] z-50 flex items-center justify-between px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-[#B8A898] hover:text-[#F5F1E8] touch-manipulation"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#7A8B5A]">
            <Image src="/logo.jpg" alt="Bonoriya" width={32} height={32} className="object-cover" />
          </div>
          <span className="text-[#F5F1E8] font-semibold text-sm">Admin</span>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-[#B8A898] hover:text-red-400 touch-manipulation"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-[#2A2420] border-r border-[#4A4440] z-50 transition-transform duration-300 w-64 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-4 flex items-center justify-between border-b border-[#4A4440]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#7A8B5A]">
              <Image src="/logo.jpg" alt="Bonoriya" width={40} height={40} className="object-cover" />
            </div>
            <span className="text-[#F5F1E8] font-bold">Bonoriya Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-[#B8A898] hover:text-[#F5F1E8] md:hidden touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {[
            { id: 'menu', icon: Utensils, label: 'Menu Items' },
            { id: 'categories', icon: FolderOpen, label: 'Categories' },
            { id: 'testimonials', icon: MessageSquare, label: 'Reviews' },
            { id: 'branches', icon: MapPin, label: 'Branches' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors touch-manipulation ${
                activeTab === item.id
                  ? 'bg-[#7A8B5A] text-[#1A1612]'
                  : 'text-[#B8A898] hover:bg-[#3A3430] hover:text-[#F5F1E8]'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#4A4440]">
          <div className="flex items-center justify-between">
            <div className="text-[#B8A898] text-sm truncate">
              {admin?.name || admin?.email}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-[#B8A898] hover:text-red-400 touch-manipulation"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="transition-all duration-300 md:ml-64 pt-14 md:pt-0">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#F5F1E8] capitalize">{activeTab}</h1>
              <p className="text-[#B8A898] text-sm">Manage your restaurant data</p>
            </div>
            <Button
              variant="outline"
              className="border-[#4A4440] text-[#B8A898] hover:text-[#F5F1E8] w-full sm:w-auto touch-manipulation"
              onClick={() => window.open('/', '_blank')}
            >
              <Home className="w-4 h-4 mr-2" />
              View Website
            </Button>
          </div>

          {/* Menu Items Tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'menu' && (
              <motion.div
                key="menu"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                  <h2 className="text-base sm:text-lg font-semibold text-[#F5F1E8]">Menu Items ({menuItems.length})</h2>
                  <Button
                    className="bg-[#7A8B5A] hover:bg-[#5D6D3F] text-[#1A1612] w-full sm:w-auto touch-manipulation"
                    onClick={() => {
                      resetMenuItemForm();
                      setMenuModalOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                <div className="grid gap-3 sm:gap-4">
                  {menuItems.map((item) => (
                    <Card key={item.id} className="bg-[#2A2420] border-[#4A4440]">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#3A3430] rounded-lg overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <Image src={item.image} alt={item.name} width={64} height={64} className="object-cover w-full h-full" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#6B5B4F]" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-semibold text-[#F5F1E8] text-sm sm:text-base">{item.name}</h3>
                              <Badge className={`${item.isVeg ? 'bg-green-600' : 'bg-red-600'} text-white text-xs`}>
                                {item.isVeg ? 'Veg' : 'Non-Veg'}
                              </Badge>
                              {item.isPopular && (
                                <Badge className="bg-[#C65D3B] text-white text-xs">Popular</Badge>
                              )}
                              {!item.isAvailable && (
                                <Badge className="bg-gray-600 text-white text-xs">Unavailable</Badge>
                              )}
                            </div>
                            <p className="text-[#B8A898] text-xs sm:text-sm truncate mb-1">{item.description}</p>
                            <p className="text-[#7A8B5A] font-semibold text-sm">₹{item.price}</p>
                          </div>
                          <div className="flex gap-2 ml-auto sm:ml-0 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#4A4440] text-[#B8A898] hover:text-[#F5F1E8] h-9 w-9 p-0 touch-manipulation"
                              onClick={() => openEditMenuItem(item)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500/50 text-red-400 hover:bg-red-500/20 h-9 w-9 p-0 touch-manipulation"
                              onClick={() => {
                                setDeleteTarget({ type: 'menuItem', id: item.id });
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'categories' && (
              <motion.div
                key="categories"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                  <h2 className="text-base sm:text-lg font-semibold text-[#F5F1E8]">Categories ({categories.length})</h2>
                  <Button
                    className="bg-[#7A8B5A] hover:bg-[#5D6D3F] text-[#1A1612] w-full sm:w-auto touch-manipulation"
                    onClick={() => {
                      resetCategoryForm();
                      setCategoryModalOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {categories.map((category) => (
                    <Card key={category.id} className="bg-[#2A2420] border-[#4A4440]">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-[#F5F1E8] text-sm sm:text-base">{category.name}</h3>
                            <p className="text-[#B8A898] text-xs sm:text-sm">{category.slug}</p>
                            <p className="text-[#B8A898] text-xs mt-1">
                              {menuItems.filter(i => i.categoryId === category.id).length} items
                            </p>
                          </div>
                          <Badge className={`${category.active ? 'bg-green-600' : 'bg-gray-600'} text-white text-xs`}>
                            {category.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'testimonials' && (
              <motion.div
                key="testimonials"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                  <h2 className="text-base sm:text-lg font-semibold text-[#F5F1E8]">Reviews ({testimonials.length})</h2>
                  <Button
                    className="bg-[#7A8B5A] hover:bg-[#5D6D3F] text-[#1A1612] w-full sm:w-auto touch-manipulation"
                    onClick={() => {
                      resetTestimonialForm();
                      setTestimonialModalOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Review
                  </Button>
                </div>

                <div className="grid gap-3 sm:gap-4">
                  {testimonials.map((testimonial) => (
                    <Card key={testimonial.id} className="bg-[#2A2420] border-[#4A4440]">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-semibold text-[#F5F1E8] text-sm sm:text-base">{testimonial.name}</h3>
                              {testimonial.source && (
                                <Badge variant="outline" className="border-[#4A4440] text-[#B8A898] text-xs">
                                  via {testimonial.source}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-0.5 my-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className={`text-xs sm:text-sm ${i < testimonial.rating ? 'text-yellow-500' : 'text-gray-600'}`}>★</span>
                              ))}
                            </div>
                            <p className="text-[#B8A898] text-xs sm:text-sm line-clamp-3">{testimonial.comment}</p>
                          </div>
                          <div className="flex flex-col gap-2 items-end flex-shrink-0">
                            <Badge className={`${testimonial.active ? 'bg-green-600' : 'bg-gray-600'} text-white text-xs`}>
                              {testimonial.active ? 'Approved' : 'Pending'}
                            </Badge>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className={`${testimonial.active ? 'border-orange-500/50 text-orange-400 hover:bg-orange-500/20' : 'border-green-500/50 text-green-400 hover:bg-green-500/20'} h-8 px-3 touch-manipulation`}
                                onClick={async () => {
                                  try {
                                    const res = await fetch(`/api/admin/testimonials/${testimonial.id}`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ active: !testimonial.active }),
                                    });
                                    if (res.ok) {
                                      fetchTestimonials();
                                    }
                                  } catch (error) {
                                    console.error('Error updating testimonial:', error);
                                  }
                                }}
                              >
                                {testimonial.active ? 'Disapprove' : 'Approve'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500/50 text-red-400 hover:bg-red-500/20 h-8 w-8 p-0 touch-manipulation"
                                onClick={async () => {
                                  if (confirm('Are you sure you want to delete this review?')) {
                                    try {
                                      const res = await fetch(`/api/admin/testimonials/${testimonial.id}`, {
                                        method: 'DELETE',
                                      });
                                      if (res.ok) {
                                        fetchTestimonials();
                                      }
                                    } catch (error) {
                                      console.error('Error deleting testimonial:', error);
                                    }
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'branches' && (
              <motion.div
                key="branches"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="text-center py-8 sm:py-12 px-4">
                  <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-[#6B5B4F] mx-auto mb-4" />
                  <h2 className="text-base sm:text-lg font-semibold text-[#F5F1E8] mb-2">Branch Management</h2>
                  <p className="text-[#B8A898] text-sm">Branch management is configured through the database.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Menu Item Modal */}
      <Dialog open={menuModalOpen} onOpenChange={setMenuModalOpen}>
        <DialogContent className="bg-[#2A2420] border-[#4A4440] max-w-lg max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-[#F5F1E8] text-lg">
              {editingMenuItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#F5F1E8] text-sm">Name *</Label>
              <Input
                value={menuItemForm.name}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, name: e.target.value })}
                className="bg-[#3A3430] border-[#4A4440] text-[#F5F1E8] h-11"
                placeholder="Item name"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[#F5F1E8] text-sm">Description</Label>
              <Textarea
                value={menuItemForm.description}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, description: e.target.value })}
                className="bg-[#3A3430] border-[#4A4440] text-[#F5F1E8] min-h-[80px]"
                placeholder="Item description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label className="text-[#F5F1E8] text-sm">Price (₹) *</Label>
                <Input
                  type="number"
                  value={menuItemForm.price}
                  onChange={(e) => setMenuItemForm({ ...menuItemForm, price: e.target.value })}
                  className="bg-[#3A3430] border-[#4A4440] text-[#F5F1E8] h-11"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#F5F1E8] text-sm">Category *</Label>
                <Select
                  value={menuItemForm.categoryId}
                  onValueChange={(value) => setMenuItemForm({ ...menuItemForm, categoryId: value })}
                >
                  <SelectTrigger className="bg-[#3A3430] border-[#4A4440] text-[#F5F1E8] h-11">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#3A3430] border-[#4A4440]">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="text-[#F5F1E8]">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#F5F1E8] text-sm">Image</Label>
              <div className="flex flex-col sm:flex-row gap-3 items-start">
                <div className="w-full sm:w-20 h-20 bg-[#3A3430] rounded-lg overflow-hidden flex-shrink-0">
                  {menuItemForm.image ? (
                    <Image src={menuItemForm.image} alt="Preview" width={80} height={80} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-[#6B5B4F]" />
                    </div>
                  )}
                </div>
                <div className="flex-1 w-full sm:w-auto">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="bg-[#3A3430] border-[#4A4440] text-[#F5F1E8]"
                    disabled={uploading}
                  />
                  {uploading && <p className="text-xs text-[#B8A898] mt-1">Uploading...</p>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={menuItemForm.isVeg}
                  onCheckedChange={(checked) => setMenuItemForm({ ...menuItemForm, isVeg: checked })}
                />
                <Label className="text-[#F5F1E8] text-sm">Veg</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={menuItemForm.isPopular}
                  onCheckedChange={(checked) => setMenuItemForm({ ...menuItemForm, isPopular: checked })}
                />
                <Label className="text-[#F5F1E8] text-sm">Popular</Label>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <Switch
                  checked={menuItemForm.isAvailable}
                  onCheckedChange={(checked) => setMenuItemForm({ ...menuItemForm, isAvailable: checked })}
                />
                <Label className="text-[#F5F1E8] text-sm">Available</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#F5F1E8] text-sm">Display Order</Label>
              <Input
                type="number"
                value={menuItemForm.order}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, order: parseInt(e.target.value) || 0 })}
                className="bg-[#3A3430] border-[#4A4440] text-[#F5F1E8] h-11"
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setMenuModalOpen(false)}
              className="border-[#4A4440] text-[#B8A898] w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              className="bg-[#7A8B5A] hover:bg-[#5D6D3F] text-[#1A1612] w-full sm:w-auto"
              onClick={handleSaveMenuItem}
              disabled={!menuItemForm.name || !menuItemForm.price || !menuItemForm.categoryId}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Modal */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent className="bg-[#2A2420] border-[#4A4440] w-[95vw] sm:w-full max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#F5F1E8] text-lg">Add Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#F5F1E8] text-sm">Name *</Label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="bg-[#3A3430] border-[#4A4440] text-[#F5F1E8] h-11"
                placeholder="Category name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#F5F1E8] text-sm">Slug *</Label>
              <Input
                value={categoryForm.slug}
                onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                className="bg-[#3A3430] border-[#4A4440] text-[#F5F1E8] h-11"
                placeholder="category-slug"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={categoryForm.active}
                onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, active: checked })}
              />
              <Label className="text-[#F5F1E8] text-sm">Active</Label>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setCategoryModalOpen(false)}
              className="border-[#4A4440] text-[#B8A898] w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              className="bg-[#7A8B5A] hover:bg-[#5D6D3F] text-[#1A1612] w-full sm:w-auto"
              onClick={handleSaveCategory}
              disabled={!categoryForm.name || !categoryForm.slug}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Testimonial Modal */}
      <Dialog open={testimonialModalOpen} onOpenChange={setTestimonialModalOpen}>
        <DialogContent className="bg-[#2A2420] border-[#4A4440] w-[95vw] sm:w-full max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#F5F1E8] text-lg">Add Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label className="text-[#F5F1E8] text-sm">Name *</Label>
                <Input
                  value={testimonialForm.name}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                  className="bg-[#3A3430] border-[#4A4440] text-[#F5F1E8] h-11"
                  placeholder="Customer"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#F5F1E8] text-sm">Rating</Label>
                <Select
                  value={testimonialForm.rating.toString()}
                  onValueChange={(value) => setTestimonialForm({ ...testimonialForm, rating: parseInt(value) })}
                >
                  <SelectTrigger className="bg-[#3A3430] border-[#4A4440] text-[#F5F1E8] h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#3A3430] border-[#4A4440]">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <SelectItem key={rating} value={rating.toString()} className="text-[#F5F1E8]">
                        {rating} Stars
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[#F5F1E8] text-sm">Comment *</Label>
              <Textarea
                value={testimonialForm.comment}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, comment: e.target.value })}
                className="bg-[#3A3430] border-[#4A4440] text-[#F5F1E8] min-h-[80px]"
                placeholder="Customer review"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#F5F1E8] text-sm">Source</Label>
              <Select
                value={testimonialForm.source}
                onValueChange={(value) => setTestimonialForm({ ...testimonialForm, source: value })}
              >
                <SelectTrigger className="bg-[#3A3430] border-[#4A4440] text-[#F5F1E8] h-11">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent className="bg-[#3A3430] border-[#4A4440]">
                  <SelectItem value="Google" className="text-[#F5F1E8]">Google</SelectItem>
                  <SelectItem value="Zomato" className="text-[#F5F1E8]">Zomato</SelectItem>
                  <SelectItem value="Swiggy" className="text-[#F5F1E8]">Swiggy</SelectItem>
                  <SelectItem value="Direct" className="text-[#F5F1E8]">Direct</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={testimonialForm.active}
                onCheckedChange={(checked) => setTestimonialForm({ ...testimonialForm, active: checked })}
              />
              <Label className="text-[#F5F1E8] text-sm">Active</Label>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setTestimonialModalOpen(false)}
              className="border-[#4A4440] text-[#B8A898] w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              className="bg-[#7A8B5A] hover:bg-[#5D6D3F] text-[#1A1612] w-full sm:w-auto"
              onClick={handleSaveTestimonial}
              disabled={!testimonialForm.name || !testimonialForm.comment}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#2A2420] border-[#4A4440] w-[95vw] sm:w-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#F5F1E8]">Delete Item</AlertDialogTitle>
            <AlertDialogDescription className="text-[#B8A898]">
              Are you sure you want to delete this item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="bg-[#3A3430] border-[#4A4440] text-[#F5F1E8] w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
              onClick={() => {
                if (deleteTarget?.type === 'menuItem') {
                  handleDeleteMenuItem(deleteTarget.id);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
