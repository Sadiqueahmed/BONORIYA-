'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, MapPin, Clock, Phone, Instagram, ExternalLink, 
  Leaf, Heart, ChefHat, Users, ArrowRight, Menu as MenuIcon, X,
  Check, Utensils, Package, Shield, MessageCircle, Send, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { useAuth, useUser, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
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
  category: Category;
}

interface Testimonial {
  id: string;
  name: string;
  rating: number;
  comment: string;
  source: string | null;
  customer?: {
    name: string | null;
    imageUrl: string | null;
  } | null;
  createdAt?: string;
}

interface Branch {
  id: string;
  name: string;
  address: string;
  landmark: string | null;
  phone: string | null;
  openTime: string;
  closeTime: string;
  daysOpen: string;
  isMain: boolean;
}

interface Settings {
  siteName?: string;
  tagline?: string;
  instagram?: string;
  zomato?: string;
  swiggy?: string;
}

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function HomePage() {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [settings, setSettings] = useState<Settings>({});
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [vegFilter, setVegFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  
  // Review submission state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [allReviewsModalOpen, setAllReviewsModalOpen] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    source: '',
  });

  // Carousel state
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, menuRes, testRes, branchRes, settingsRes] = await Promise.all([
          fetch('/api/menu/categories'),
          fetch('/api/menu/items'),
          fetch('/api/testimonials'),
          fetch('/api/branches'),
          fetch('/api/settings')
        ]);

        const [cats, menus, tests, branchs, sets] = await Promise.all([
          catRes.json(),
          menuRes.json(),
          testRes.json(),
          branchRes.json(),
          settingsRes.json()
        ]);

        setCategories(cats);
        setMenuItems(menus);
        setTestimonials(tests);
        setBranches(branchs);
        setSettings(sets);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Sync customer data when user signs in
  useEffect(() => {
    if (isSignedIn && user) {
      fetch('/api/customers', { method: 'POST' }).catch(console.error);
    }
  }, [isSignedIn, user]);

  // Memoized filtered menu items for better performance
  const filteredMenuItems = useMemo(() => {
    if (!menuItems || menuItems.length === 0) return [];
    
    return menuItems.filter(item => {
      // Safely check category match
      const itemCategorySlug = item.category?.slug || '';
      const categoryMatch = activeCategory === 'all' || itemCategorySlug === activeCategory;
      
      // Check veg filter
      const vegMatch = vegFilter === 'all' || 
        (vegFilter === 'veg' && item.isVeg) || 
        (vegFilter === 'nonveg' && !item.isVeg);
      
      return categoryMatch && vegMatch;
    });
  }, [menuItems, activeCategory, vegFilter]);

  // Get visible testimonials (max 10)
  const visibleTestimonials = testimonials.slice(0, 10);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setMobileMenuOpen(false);
  };

  // Fetch testimonials (refresh)
  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials');
      const data = await res.json();
      setTestimonials(data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  // Open review modal
  const openReviewModal = () => {
    setReviewSuccess(false);
    setReviewForm({ rating: 5, comment: '', source: '' });
    setReviewModalOpen(true);
  };

  // Submit review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSignedIn) {
      return;
    }
    
    setReviewSubmitting(true);
    
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reviewForm,
          name: user?.firstName || user?.username || 'Anonymous',
          email: user?.primaryEmailAddress?.emailAddress,
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setReviewSuccess(true);
        // If server returns updated testimonials, use them immediately
        if (data.testimonials) {
          setTestimonials(data.testimonials);
        } else {
          // Otherwise refresh testimonials
          fetchTestimonials();
        }
      } else {
        alert(data.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Carousel navigation
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 350;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Check scroll buttons
  const checkScrollButtons = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', checkScrollButtons);
      checkScrollButtons();
      return () => carousel.removeEventListener('scroll', checkScrollButtons);
    }
  }, [testimonials]);

  // Auto-scroll carousel
  useEffect(() => {
    if (testimonials.length > 3) {
      const interval = setInterval(() => {
        if (carouselRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
          if (scrollLeft >= scrollWidth - clientWidth - 10) {
            carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            carouselRef.current.scrollBy({ left: 350, behavior: 'smooth' });
          }
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [testimonials]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-16 h-16 border-4 border-[#5D6D3F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5D6D3F] font-medium">Loading Bonoriya...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] tribal-pattern">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F5F1E8]/95 backdrop-blur-sm border-b border-[#D4C8B8]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-[#5D6D3F]">
                <Image 
                  src="/logo.jpg" 
                  alt="Bonoriya Logo" 
                  fill 
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#3E2723]">Bonoriya</h1>
                <p className="text-[10px] sm:text-xs text-[#5D6D3F] hidden sm:block">বনরিয়া</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              {[
                { label: 'Home', id: 'hero' },
                { label: 'About', id: 'about' },
                { label: 'Menu', id: 'menu' },
                { label: 'Reviews', id: 'testimonials' },
                { label: 'Contact', id: 'contact' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-[#3E2723] hover:text-[#C65D3B] transition-colors font-medium text-sm xl:text-base"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Right Side - Auth & Order */}
            <div className="hidden lg:flex items-center gap-4">
              {isSignedIn ? (
                <div className="flex items-center gap-3">
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10",
                        userButtonTrigger: "focus:shadow-none"
                      }
                    }}
                  />
                  <Button
                    onClick={() => scrollToSection('menu')}
                    className="bg-[#C65D3B] hover:bg-[#B04D2B] text-white"
                  >
                    Order Now
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <SignInButton mode="modal">
                    <Button variant="ghost" className="text-[#5D6D3F] hover:text-[#3E2723]">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button className="bg-[#5D6D3F] hover:bg-[#4A5A2F] text-white">
                      Sign Up
                    </Button>
                  </SignUpButton>
                  <Button
                    onClick={() => scrollToSection('menu')}
                    className="bg-[#C65D3B] hover:bg-[#B04D2B] text-white"
                  >
                    Order Now
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#3E2723] touch-manipulation"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-[#F5F1E8] border-t border-[#D4C8B8] overflow-hidden"
            >
              <nav className="flex flex-col p-4 gap-1">
                {[
                  { label: 'Home', id: 'hero' },
                  { label: 'About', id: 'about' },
                  { label: 'Menu', id: 'menu' },
                  { label: 'Reviews', id: 'testimonials' },
                  { label: 'Contact', id: 'contact' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="text-[#3E2723] hover:text-[#C65D3B] hover:bg-[#E8E4DB] transition-colors font-medium py-3 px-4 text-left rounded-lg active:bg-[#D4C8B8] touch-manipulation"
                  >
                    {item.label}
                  </button>
                ))}
                
                {/* Mobile Auth Buttons */}
                <div className="pt-3 border-t border-[#D4C8B8] mt-3">
                  {isSignedIn ? (
                    <div className="flex items-center gap-3 px-4 py-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.imageUrl} />
                        <AvatarFallback>{user?.firstName?.[0] || user?.username?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <span className="text-[#3E2723] font-medium">{user?.firstName || user?.username}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => signOut()}
                        className="ml-auto text-[#6B5B4F]"
                      >
                        <LogOut className="w-4 h-4 mr-1" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2 px-4">
                      <SignInButton mode="modal">
                        <Button variant="outline" className="flex-1 border-[#5D6D3F] text-[#5D6D3F]">
                          Sign In
                        </Button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <Button className="flex-1 bg-[#5D6D3F] text-white">
                          Sign Up
                        </Button>
                      </SignUpButton>
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={() => scrollToSection('menu')}
                  className="bg-[#C65D3B] hover:bg-[#B04D2B] text-white mt-2 py-6 text-base touch-manipulation"
                >
                  Order Now
                </Button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section id="hero" className="pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-24 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="text-center lg:text-left order-2 lg:order-1"
            >
              <motion.div variants={fadeInUp}>
                <Badge className="bg-[#5D6D3F] text-white mb-3 sm:mb-4 text-xs sm:text-sm">
                  <Leaf className="w-3 h-3 mr-1" />
                  Eco-Friendly Restaurant
                </Badge>
              </motion.div>
              
              <motion.h1 
                variants={fadeInUp}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#3E2723] mb-3 sm:mb-4 leading-tight px-2 sm:px-0"
              >
                Authentic Ethnic Bowls,{' '}
                <span className="text-[#C65D3B]">Made with Love</span>
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className="text-base sm:text-lg md:text-xl text-[#6B5B4F] mb-6 sm:mb-8 px-2 sm:px-0"
              >
                {settings.tagline || 'Ethnic rice bowls for modern lives'}. Healthy, homely North Eastern cuisine served fresh in eco-friendly packaging.
              </motion.p>
              
              <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start px-4 sm:px-0"
              >
                <Button
                  size="lg"
                  onClick={() => scrollToSection('menu')}
                  className="bg-[#C65D3B] hover:bg-[#B04D2B] text-white text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 touch-manipulation"
                >
                  View Menu <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollToSection('contact')}
                  className="border-2 border-[#5D6D3F] text-[#5D6D3F] hover:bg-[#5D6D3F] hover:text-white text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 touch-manipulation"
                >
                  Find Us
                </Button>
              </motion.div>

              {/* Trust Badges */}
              <motion.div 
                variants={fadeInUp}
                className="flex items-center justify-center lg:justify-start gap-4 sm:gap-6 mt-6 sm:mt-8 flex-wrap"
              >
                <div className="flex items-center gap-1 bg-white/50 px-3 py-2 rounded-full">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-[#3E2723] text-sm sm:text-base">4.8</span>
                  <span className="text-[#6B5B4F] text-xs sm:text-sm">Rating</span>
                </div>
                <div className="flex items-center gap-1 bg-white/50 px-3 py-2 rounded-full">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#5D6D3F]" />
                  <span className="font-bold text-[#3E2723] text-sm sm:text-base">{testimonials.length}+</span>
                  <span className="text-[#6B5B4F] text-xs sm:text-sm">Reviews</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative order-1 lg:order-2 px-2 sm:px-0"
            >
              <div className="relative w-full max-w-md mx-auto aspect-square lg:aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/logo.jpg"
                  alt="Bonoriya - Ethnic Rice Bowls"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723]/40 to-transparent"></div>
              </div>
              
              {/* Floating Card - Hidden on mobile */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="hidden sm:block absolute -bottom-4 -left-4 md:-left-8 bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#5D6D3F] rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-[#3E2723] text-sm sm:text-base">Eco-Friendly</p>
                    <p className="text-xs sm:text-sm text-[#6B5B4F]">Sustainable Packaging</p>
                  </div>
                </div>
              </motion.div>

              {/* Mobile Eco Badge */}
              <div className="sm:hidden absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-[#5D6D3F] text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span className="text-sm font-medium">Eco-Friendly Packaging</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 sm:py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-8 sm:mb-12"
          >
            <motion.h2 variants={fadeInUp} className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#3E2723] mb-3 sm:mb-4">
              About Bonoriya
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-base sm:text-lg text-[#6B5B4F] max-w-2xl mx-auto px-2">
              Bringing authentic tribal and ethnic flavors of Assam to modern food lovers
            </motion.p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4 sm:space-y-6 px-2 sm:px-0"
            >
              <p className="text-sm sm:text-base text-[#6B5B4F] leading-relaxed">
                <span className="text-lg sm:text-xl font-semibold text-[#3E2723]">Bonoriya</span> (বনরিয়া) was born from a passion to preserve and share the authentic flavors of Assam&apos;s tribal cuisine. Our name reflects our commitment to bringing forest-fresh, ethnic flavors to your bowl.
              </p>
              <p className="text-sm sm:text-base text-[#6B5B4F] leading-relaxed">
                We serve healthy, home-style cooked meals with generous portions at affordable prices. Every dish is prepared with care, using traditional recipes passed down through generations, adapted for the modern palate.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2 sm:pt-4">
                <div className="flex items-start gap-3 bg-[#F5F1E8] p-3 sm:p-4 rounded-xl">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#5D6D3F]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-[#5D6D3F]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#3E2723] text-sm sm:text-base">Homely Taste</p>
                    <p className="text-xs sm:text-sm text-[#6B5B4F]">Food that reminds you of home</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-[#F5F1E8] p-3 sm:p-4 rounded-xl">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#C65D3B]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-[#C65D3B]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#3E2723] text-sm sm:text-base">Eco-Friendly</p>
                    <p className="text-xs sm:text-sm text-[#6B5B4F]">Sustainable packaging</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-3 sm:gap-4"
            >
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-[#5D6D3F] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
                  <ChefHat className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3" />
                  <h3 className="text-xl sm:text-2xl font-bold">100%</h3>
                  <p className="text-white/80 text-sm sm:text-base">Authentic Recipes</p>
                </div>
                <div className="bg-[#F5F1E8] rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-[#5D6D3F] mb-2 sm:mb-3" />
                  <h3 className="text-xl sm:text-2xl font-bold text-[#3E2723]">Hygienic</h3>
                  <p className="text-[#6B5B4F] text-sm sm:text-base">Clean Kitchen</p>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4 mt-4 sm:mt-8">
                <div className="bg-[#C65D3B] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
                  <Utensils className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3" />
                  <h3 className="text-xl sm:text-2xl font-bold">Generous</h3>
                  <p className="text-white/80 text-sm sm:text-base">Portion Sizes</p>
                </div>
                <div className="bg-[#F5F1E8] rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <p className="text-2xl sm:text-3xl font-bold text-[#5D6D3F]">₹1-200</p>
                  <p className="text-[#6B5B4F] text-sm sm:text-base">Budget Friendly</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-12 sm:py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-8 sm:mb-12"
          >
            <motion.h2 variants={fadeInUp} className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#3E2723] mb-3 sm:mb-4">
              Our Menu
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-base sm:text-lg text-[#6B5B4F] max-w-2xl mx-auto px-2">
              Explore our authentic ethnic rice bowls and more
            </motion.p>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
            {/* Category Tabs - Horizontal Scroll on Mobile */}
            <div className="w-full overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
              <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap sm:justify-center">
                <Button
                  onClick={() => setActiveCategory('all')}
                  variant={activeCategory === 'all' ? 'default' : 'outline'}
                  className={`${activeCategory === 'all' ? 'bg-[#5D6D3F] text-white' : 'border-[#D4C8B8] text-[#3E2723]'} text-sm sm:text-base touch-manipulation`}
                  size="sm"
                >
                  All
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.slug)}
                    variant={activeCategory === cat.slug ? 'default' : 'outline'}
                    className={`${activeCategory === cat.slug ? 'bg-[#5D6D3F] text-white' : 'border-[#D4C8B8] text-[#3E2723]'} text-sm sm:text-base touch-manipulation`}
                    size="sm"
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Veg/Non-Veg Filter */}
            <div className="flex justify-center gap-2">
              <Button
                onClick={() => setVegFilter('all')}
                variant={vegFilter === 'all' ? 'default' : 'outline'}
                className={`${vegFilter === 'all' ? 'bg-[#5D6D3F] text-white' : 'border-[#D4C8B8] text-[#3E2723]'} text-sm touch-manipulation`}
                size="sm"
              >
                All
              </Button>
              <Button
                onClick={() => setVegFilter('veg')}
                variant={vegFilter === 'veg' ? 'default' : 'outline'}
                className={`${vegFilter === 'veg' ? 'bg-green-600 text-white' : 'border-[#D4C8B8] text-[#3E2723]'} text-sm touch-manipulation`}
                size="sm"
              >
                <span className="w-3 h-3 border-2 border-current mr-1 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                </span>
                Veg
              </Button>
              <Button
                onClick={() => setVegFilter('nonveg')}
                variant={vegFilter === 'nonveg' ? 'default' : 'outline'}
                className={`${vegFilter === 'nonveg' ? 'bg-red-600 text-white' : 'border-[#D4C8B8] text-[#3E2723]'} text-sm touch-manipulation`}
                size="sm"
              >
                <span className="w-3 h-3 border-2 border-current mr-1 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                </span>
                Non-Veg
              </Button>
            </div>
          </div>

          {/* Menu Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory + vegFilter} // Force re-render on filter change
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              {filteredMenuItems.map((item) => (
                <motion.div key={item.id} variants={fadeInUp}>
                <Card className="group bg-white hover:shadow-xl transition-all duration-300 overflow-hidden border border-[#D4C8B8]">
                  <div className="relative aspect-[4/3] sm:aspect-video bg-[#E8E4DB]">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Utensils className="w-10 h-10 sm:w-12 sm:h-12 text-[#5D6D3F]/30" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex gap-1 sm:gap-2">
                      <Badge className={`${item.isVeg ? 'bg-green-600' : 'bg-red-600'} text-white text-xs sm:text-sm px-2 py-0.5`}>
                        {item.isVeg ? 'Veg' : 'Non-Veg'}
                      </Badge>
                      {item.isPopular && (
                        <Badge className="bg-[#C65D3B] text-white text-xs sm:text-sm px-2 py-0.5">
                          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 fill-current" />
                          Popular
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex justify-between items-start mb-1.5 sm:mb-2 gap-2">
                      <h3 className="font-bold text-base sm:text-lg text-[#3E2723] line-clamp-1">{item.name}</h3>
                      <span className="text-lg sm:text-xl font-bold text-[#C65D3B] whitespace-nowrap">₹{item.price}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#6B5B4F] line-clamp-2 mb-2 sm:mb-3">{item.description}</p>
                    <Badge variant="outline" className="border-[#5D6D3F] text-[#5D6D3F] text-xs">
                      {item.category.name}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            </motion.div>
          </AnimatePresence>

          {/* Order CTA */}
          <div className="text-center mt-8 sm:mt-12 px-2">
            <p className="text-[#6B5B4F] mb-3 sm:mb-4 text-sm sm:text-base">Order online through our partners</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md mx-auto sm:max-w-none">
              <Button
                size="lg"
                className="bg-red-500 hover:bg-red-600 text-white py-5 sm:py-6 touch-manipulation"
                onClick={() => window.open(settings.zomato || '#', '_blank')}
              >
                Order on Zomato <ExternalLink className="ml-2 w-4 h-4" />
              </Button>
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white py-5 sm:py-6 touch-manipulation"
                onClick={() => window.open(settings.swiggy || '#', '_blank')}
              >
                Order on Swiggy <ExternalLink className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 sm:py-16 md:py-24 bg-[#5D6D3F] text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-8 sm:mb-12"
          >
            <motion.h2 variants={fadeInUp} className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Why Choose Bonoriya?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto px-2">
              We&apos;re not just about food, we&apos;re about an experience
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {[
              { icon: Heart, title: 'Homely Taste', desc: 'Food that reminds you of home, made with love and care' },
              { icon: Package, title: 'Generous Portions', desc: 'Value-for-money servings that satisfy your hunger' },
              { icon: Leaf, title: 'Eco-Friendly', desc: 'Sustainable packaging that cares for the environment' },
              { icon: ChefHat, title: 'Authentic Recipes', desc: 'Traditional ethnic recipes with modern presentation' },
              { icon: Shield, title: 'Affordable Prices', desc: 'Best price in the locality without compromising quality' },
              { icon: Check, title: 'Healthy Options', desc: 'Balanced spices, health-conscious preparation methods' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:bg-white/20 transition-colors"
              >
                <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 mb-3 sm:mb-4 text-[#F5F1E8]" />
                <h3 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2">{feature.title}</h3>
                <p className="text-white/70 text-sm sm:text-base">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials - Horizontal Scrolling Carousel */}
      <section id="testimonials" className="py-12 sm:py-16 md:py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-8 sm:mb-12"
          >
            <motion.h2 variants={fadeInUp} className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#3E2723] mb-3 sm:mb-4">
              What Our Customers Say
            </motion.h2>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <span className="text-sm sm:text-lg text-[#6B5B4F]">4.8 average from {testimonials.length}+ reviews</span>
              </div>
              <div className="flex gap-2">
                {isSignedIn ? (
                  <Button
                    onClick={openReviewModal}
                    className="bg-[#C65D3B] hover:bg-[#B04D2B] text-white touch-manipulation"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Write a Review
                  </Button>
                ) : (
                  <SignInButton mode="modal">
                    <Button className="bg-[#C65D3B] hover:bg-[#B04D2B] text-white touch-manipulation">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Sign In to Review
                    </Button>
                  </SignInButton>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* Carousel Container */}
          <div className="relative">
            {/* Left Arrow */}
            {canScrollLeft && (
              <button
                onClick={() => scrollCarousel('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 sm:p-3 touch-manipulation"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#3E2723]" />
              </button>
            )}

            {/* Right Arrow */}
            {canScrollRight && (
              <button
                onClick={() => scrollCarousel('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 sm:p-3 touch-manipulation"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#3E2723]" />
              </button>
            )}

            {/* Scrolling Container */}
            <div
              ref={carouselRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-4 px-2 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {visibleTestimonials.map((testimonial) => (
                <motion.div
                  key={testimonial.id}
                  variants={fadeInUp}
                  className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[350px]"
                >
                  <Card className="h-full bg-[#F5F1E8] border-[#D4C8B8] hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-0.5 sm:gap-1 mb-2 sm:mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                              i < testimonial.rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[#6B5B4F] mb-3 sm:mb-4 italic text-sm sm:text-base line-clamp-4">&quot;{testimonial.comment}&quot;</p>
                      <div className="flex items-center gap-2">
                        {testimonial.customer?.imageUrl ? (
                          <img 
                            src={testimonial.customer.imageUrl} 
                            alt={testimonial.name}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#5D6D3F] flex items-center justify-center text-white font-medium text-sm sm:text-base">
                            {testimonial.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-[#3E2723] text-sm sm:text-base">{testimonial.name}</p>
                          {testimonial.source && (
                            <p className="text-xs sm:text-sm text-[#6B5B4F]">via {testimonial.source}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Show All Reviews Button */}
          {testimonials.length > 10 && (
            <div className="text-center mt-6 sm:mt-8">
              <Button
                variant="outline"
                onClick={() => setAllReviewsModalOpen(true)}
                className="border-[#5D6D3F] text-[#5D6D3F] hover:bg-[#5D6D3F] hover:text-white"
              >
                See All {testimonials.length} Reviews
              </Button>
            </div>
          )}

          {/* Empty State */}
          {testimonials.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-[#D4C8B8] mx-auto mb-4" />
              <p className="text-[#6B5B4F] mb-4">Be the first to share your experience!</p>
              {isSignedIn ? (
                <Button onClick={openReviewModal} className="bg-[#C65D3B] hover:bg-[#B04D2B] text-white">
                  Write a Review
                </Button>
              ) : (
                <SignInButton mode="modal">
                  <Button className="bg-[#C65D3B] hover:bg-[#B04D2B] text-white">
                    Sign In to Review
                  </Button>
                </SignInButton>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 sm:py-16 md:py-24 bg-[#F5F1E8]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-8 sm:mb-12"
          >
            <motion.h2 variants={fadeInUp} className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#3E2723] mb-3 sm:mb-4">
              Find Us
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-base sm:text-lg text-[#6B5B4F] max-w-2xl mx-auto px-2">
              Visit us at our locations or order online
            </motion.p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Branches */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4 sm:space-y-6"
            >
              {branches.map((branch) => (
                <Card key={branch.id} className={`${branch.isMain ? 'border-[#5D6D3F] border-2' : 'border-[#D4C8B8]'} bg-white`}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${branch.isMain ? 'bg-[#5D6D3F]' : 'bg-[#E8E4DB]'}`}>
                        <MapPin className={`w-5 h-5 sm:w-6 sm:h-6 ${branch.isMain ? 'text-white' : 'text-[#5D6D3F]'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-base sm:text-lg text-[#3E2723]">{branch.name}</h3>
                          {branch.isMain && (
                            <Badge className="bg-[#C65D3B] text-white text-xs">Main Branch</Badge>
                          )}
                        </div>
                        <p className="text-[#6B5B4F] mb-1.5 sm:mb-2 text-sm sm:text-base">{branch.address}</p>
                        {branch.landmark && (
                          <p className="text-xs sm:text-sm text-[#6B5B4F]">Landmark: {branch.landmark}</p>
                        )}
                        <div className="flex flex-wrap gap-2 sm:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm">
                          <div className="flex items-center gap-1 text-[#5D6D3F]">
                            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>{branch.openTime} - {branch.closeTime}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[#5D6D3F]">
                            <span>{branch.daysOpen}</span>
                          </div>
                        </div>
                        {branch.phone && (
                          <div className="flex items-center gap-1 mt-1.5 sm:mt-2 text-[#6B5B4F] text-xs sm:text-sm">
                            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>{branch.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            {/* Map & Social */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Map placeholder */}
              <Card className="overflow-hidden border-[#D4C8B8]">
                <div className="aspect-[16/10] sm:aspect-video bg-[#E8E4DB] flex items-center justify-center">
                  <div className="text-center p-4 sm:p-8">
                    <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-[#5D6D3F] mx-auto mb-3 sm:mb-4" />
                    <p className="text-[#6B5B4F] mb-3 sm:mb-4 text-sm sm:text-base">Find us on Google Maps</p>
                    <Button
                      className="bg-[#5D6D3F] hover:bg-[#4A5A2F] text-white touch-manipulation"
                      onClick={() => window.open('https://maps.google.com/?q=Bonoriya+Guwahati', '_blank')}
                    >
                      Open in Google Maps <ExternalLink className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Social Links */}
              <Card className="border-[#D4C8B8] bg-white">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="font-bold text-base sm:text-lg text-[#3E2723] mb-3 sm:mb-4">Follow Us</h3>
                  <div className="flex gap-3 sm:gap-4">
                    <Button
                      variant="outline"
                      className="flex-1 border-[#E1306C] text-[#E1306C] hover:bg-[#E1306C] hover:text-white touch-manipulation py-5 sm:py-6"
                      onClick={() => window.open(`https://instagram.com/${settings.instagram?.replace('@', '') || 'bonoriyafood'}`, '_blank')}
                    >
                      <Instagram className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Instagram
                    </Button>
                  </div>
                  {settings.instagram && (
                    <p className="text-center mt-3 sm:mt-4 text-[#6B5B4F] text-sm sm:text-base">
                      {settings.instagram}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Review Submission Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="bg-white max-w-md w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-[#3E2723] text-xl">
              {reviewSuccess ? 'Thank You!' : 'Share Your Experience'}
            </DialogTitle>
          </DialogHeader>
          
          {reviewSuccess ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-[#6B5B4F] mb-4">
                Thank you for your review! It has been submitted successfully.
              </p>
              <Button
                onClick={() => setReviewModalOpen(false)}
                className="bg-[#5D6D3F] hover:bg-[#4A5A2F] text-white"
              >
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-[#F5F1E8] rounded-lg">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user?.imageUrl} />
                  <AvatarFallback>{user?.firstName?.[0] || user?.username?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-[#3E2723]">{user?.firstName || user?.username || 'Anonymous'}</p>
                  <p className="text-xs text-[#6B5B4F]">{user?.primaryEmailAddress?.emailAddress}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[#3E2723]">Rating *</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="p-1 touch-manipulation"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= reviewForm.rating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="review-comment" className="text-[#3E2723]">Your Review *</Label>
                <Textarea
                  id="review-comment"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="border-[#D4C8B8] focus:border-[#5D6D3F] min-h-[100px]"
                  placeholder="Tell us about your experience..."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="review-source" className="text-[#3E2723]">How did you find us?</Label>
                <Select
                  value={reviewForm.source}
                  onValueChange={(value) => setReviewForm({ ...reviewForm, source: value })}
                >
                  <SelectTrigger className="border-[#D4C8B8] focus:border-[#5D6D3F]">
                    <SelectValue placeholder="Select (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Google">Google</SelectItem>
                    <SelectItem value="Zomato">Zomato</SelectItem>
                    <SelectItem value="Swiggy">Swiggy</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Friend">Friend Recommendation</SelectItem>
                    <SelectItem value="Walk-in">Walk-in</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReviewModalOpen(false)}
                  className="flex-1 border-[#D4C8B8]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#C65D3B] hover:bg-[#B04D2B] text-white"
                  disabled={reviewSubmitting || !reviewForm.comment}
                >
                  {reviewSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Review
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* All Reviews Modal */}
      <Dialog open={allReviewsModalOpen} onOpenChange={setAllReviewsModalOpen}>
        <DialogContent className="bg-white max-w-4xl w-[95vw] sm:w-full max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-[#3E2723] text-xl">
              All Reviews ({testimonials.length})
            </DialogTitle>
          </DialogHeader>
          
          <div className="overflow-y-auto flex-1 -mx-6 px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="bg-[#F5F1E8] border-[#D4C8B8]">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-0.5 sm:gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < testimonial.rating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[#6B5B4F] mb-3 italic text-sm">&quot;{testimonial.comment}&quot;</p>
                    <div className="flex items-center gap-2">
                      {testimonial.customer?.imageUrl ? (
                        <img 
                          src={testimonial.customer.imageUrl} 
                          alt={testimonial.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#5D6D3F] flex items-center justify-center text-white font-medium text-sm">
                          {testimonial.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-[#3E2723] text-sm">{testimonial.name}</p>
                        {testimonial.source && (
                          <p className="text-xs text-[#6B5B4F]">via {testimonial.source}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-[#3E2723] text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Brand */}
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-3 mb-4 justify-center sm:justify-start">
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white/30">
                  <Image 
                    src="/logo.jpg" 
                    alt="Bonoriya Logo" 
                    fill 
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold">Bonoriya</h3>
                  <p className="text-xs text-white/60">বনরিয়া</p>
                </div>
              </div>
              <p className="text-white/70 text-sm">
                Ethnic rice bowls for modern lives. Authentic North Eastern cuisine served with love.
              </p>
            </div>

            {/* Quick Links */}
            <div className="text-center sm:text-left">
              <h4 className="font-bold mb-3 sm:mb-4">Quick Links</h4>
              <ul className="space-y-2 text-white/70">
                <li><button onClick={() => scrollToSection('hero')} className="hover:text-white transition-colors text-sm sm:text-base">Home</button></li>
                <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors text-sm sm:text-base">About Us</button></li>
                <li><button onClick={() => scrollToSection('menu')} className="hover:text-white transition-colors text-sm sm:text-base">Menu</button></li>
                <li><button onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors text-sm sm:text-base">Contact</button></li>
                <li><a href="/admin" className="hover:text-[#7A8B5A] transition-colors text-sm sm:text-base flex items-center gap-1 justify-center sm:justify-start">🔐 Admin</a></li>
              </ul>
            </div>

            {/* Order Links */}
            <div className="text-center sm:text-left">
              <h4 className="font-bold mb-3 sm:mb-4">Order Online</h4>
              <div className="space-y-2 sm:space-y-3 max-w-xs mx-auto sm:max-w-none">
                <Button
                  className="w-full bg-red-500 hover:bg-red-600 text-white touch-manipulation"
                  onClick={() => window.open(settings.zomato || '#', '_blank')}
                >
                  Order on Zomato
                </Button>
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white touch-manipulation"
                  onClick={() => window.open(settings.swiggy || '#', '_blank')}
                >
                  Order on Swiggy
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/50 text-sm">
            <p>© {new Date().getFullYear()} Bonoriya. All rights reserved.</p>
            <p className="mt-1">Made with ❤️ in Assam</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Calendar icon for contact section
function LogOut({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}
