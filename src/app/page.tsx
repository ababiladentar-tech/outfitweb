'use client';

import React, { useState, useEffect } from 'react';
import { UserOnboardingProfile, UMKMProductPost, ActiveAppView, BodyMeasurements, MarketplaceOrder, WardrobeItem } from '@/types';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { AuthModals } from '@/components/AuthModals';
import { OnboardingModal } from '@/components/OnboardingModal';
import { ChatAIView } from '@/components/ChatAIView';
import { ReferenceFeedView } from '@/components/ReferenceFeedView';
import { SavedItemsView } from '@/components/SavedItemsView';
import { DashboardView } from '@/components/DashboardView';
import { SellerDashboardView } from '@/components/SellerDashboardView';
import { OrdersView } from '@/components/OrdersView';
import { WardrobeView } from '@/components/WardrobeView';
import { OutfitBuilderView } from '@/components/OutfitBuilderView';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { SmartSizeModal } from '@/components/SmartSizeModal';
import { SizeComparisonModal } from '@/components/SizeComparisonModal';
import { CheckoutModal } from '@/components/CheckoutModal';
import { ReportListingModal } from '@/components/ReportListingModal';
import { CreatePostModal } from '@/components/CreatePostModal';
import { HelpModal } from '@/components/HelpModal';
import { ToastContainer, ToastMessage } from '@/components/Toast';
import { getStoredProducts } from '@/data/marketplace-store';

export default function Home() {
  const [currentView, setCurrentView] = useState<ActiveAppView>('home');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSmartSizeOpen, setIsSmartSizeOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<UMKMProductPost | null>(null);
  const [comparisonProduct, setComparisonProduct] = useState<UMKMProductPost | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<UMKMProductPost | null>(null);
  const [reportProduct, setReportProduct] = useState<UMKMProductPost | null>(null);
  const [preselectedWardrobeItems, setPreselectedWardrobeItems] = useState<WardrobeItem[]>([]);

  const [userData, setUserData] = useState<{ username?: string; name?: string; birthDate?: string } | null>(null);
  const [userProfile, setUserProfile] = useState<UserOnboardingProfile | null>(null);
  const [savedPostIds, setSavedPostIds] = useState<string[]>(['prod-01', 'prod-02', 'prod-03']);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Helper
  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Restore persistence on mount
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem('outfitly_user_profile');
      if (storedProfile) {
        const parsed: UserOnboardingProfile = JSON.parse(storedProfile);
        setUserProfile(parsed);
        if (parsed.username) {
          setUserData({ username: parsed.username, name: parsed.name, birthDate: parsed.birthDate });
        }
      }

      const storedSaves = localStorage.getItem('outfitly_saved_posts');
      if (storedSaves) {
        setSavedPostIds(JSON.parse(storedSaves));
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  // Save changes to localStorage
  const updateSavedPosts = (ids: string[]) => {
    setSavedPostIds(ids);
    try {
      localStorage.setItem('outfitly_saved_posts', JSON.stringify(ids));
    } catch (e) {}
  };

  const updateUserProfile = (profile: UserOnboardingProfile) => {
    setUserProfile(profile);
    if (profile.username) {
      setUserData({ username: profile.username, name: profile.name, birthDate: profile.birthDate });
    }
    try {
      localStorage.setItem('outfitly_user_profile', JSON.stringify(profile));
    } catch (e) {}
  };

  const handleSaveMeasurements = (measurements: BodyMeasurements) => {
    const updated: UserOnboardingProfile = userProfile ? {
      ...userProfile,
      measurements
    } : {
      gender: 'girl',
      skinTone: 'warm',
      bodyShape: 'hourglass',
      preferredColors: ['#1C1C1C', '#8EA89D'],
      stylePreferences: ['casual', 'minimalist'],
      faceShape: 'oval',
      measurements
    };

    updateUserProfile(updated);
    showToast('Profil ukuran sentimeter (cm) Anda berhasil disimpan!');
  };

  // Handle Talk to AI Click
  const handleTalkToAI = () => {
    if (!userProfile) {
      setIsOnboardingOpen(true);
    } else {
      setCurrentView('chat');
    }
  };

  // Handle Onboarding Completion
  const handleOnboardingComplete = (profile: UserOnboardingProfile) => {
    updateUserProfile(profile);
    showToast('Profil gaya Anda berhasil disimpan!');
    setCurrentView('dashboard');
  };

  // Toggle Save Post
  const handleToggleSave = (id: string) => {
    const isCurrentlySaved = savedPostIds.includes(id);
    const updated = isCurrentlySaved
      ? savedPostIds.filter((x) => x !== id)
      : [...savedPostIds, id];

    updateSavedPosts(updated);
    showToast(isCurrentlySaved ? 'Dihapus dari outfit tersimpan' : 'Disimpan ke favorit! ❤️');
  };

  // Handle Size Comparison Trigger
  const handleOpenComparison = (product: UMKMProductPost) => {
    setComparisonProduct(product);
    setIsComparisonOpen(true);
  };

  // Handle Checkout Trigger
  const handleOpenCheckout = (product: UMKMProductPost) => {
    setCheckoutProduct(product);
    setIsCheckoutOpen(true);
  };

  // Handle Report Trigger
  const handleOpenReport = (product: UMKMProductPost) => {
    setReportProduct(product);
    setIsReportOpen(true);
  };

  const allProducts = getStoredProducts();

  return (
    <div className="min-h-screen flex flex-col bg-[#EFEFEA] text-[#162D24] font-sans antialiased selection:bg-[#8EA89D] selection:text-[#162D24]">
      {/* Top Header */}
      <Header
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        user={userData}
        savedCount={savedPostIds.length}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {currentView === 'home' && (
          <HeroSection
            onTalkToAI={handleTalkToAI}
            onReference={() => setCurrentView('reference')}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
          />
        )}

        {currentView === 'chat' && (
          <ChatAIView
            userProfile={userProfile}
            username={userData?.username || userData?.name}
            initialMode={preselectedWardrobeItems.length > 0 ? 'studio' : 'chat'}
            initialWardrobeItems={preselectedWardrobeItems}
            onNavigateHome={() => setCurrentView('home')}
            onNavigateReference={() => setCurrentView('reference')}
            onNavigateDashboard={() => setCurrentView('dashboard')}
            onOpenHelp={() => setIsHelpOpen(true)}
            onOpenSmartSize={() => setIsSmartSizeOpen(true)}
            onSelectProduct={(product) => setSelectedProduct(product)}
            onShowToast={showToast}
          />
        )}

        {currentView === 'reference' && (
          <ReferenceFeedView
            onSelectProduct={(product) => setSelectedProduct(product)}
            savedPostIds={savedPostIds}
            onToggleSave={handleToggleSave}
            userProfile={userProfile}
            onOpenSmartSize={() => setIsSmartSizeOpen(true)}
            onOpenComparison={handleOpenComparison}
            onOpenCreatePost={() => setIsCreatePostOpen(true)}
          />
        )}

        {currentView === 'saved' && (
          <SavedItemsView
            savedPostIds={savedPostIds}
            onToggleSave={handleToggleSave}
            onSelectProduct={(product) => setSelectedProduct(product)}
            onNavigateExplore={() => setCurrentView('reference')}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            userProfile={userProfile}
            username={userData?.username || userData?.name}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            onSelectProduct={(product) => setSelectedProduct(product)}
            onNavigateChat={() => setCurrentView('chat')}
            onNavigateExplore={() => setCurrentView('reference')}
            onOpenSmartSize={() => setIsSmartSizeOpen(true)}
            onNavigateOrders={() => setCurrentView('orders')}
            onNavigateSeller={() => setCurrentView('seller_dashboard')}
            onShowToast={showToast}
            onSelectWardrobeForStylist={(items) => {
              setPreselectedWardrobeItems(items);
              setCurrentView('chat');
            }}
          />
        )}

        {currentView === 'wardrobe' && (
          <WardrobeView
            currentUserId={userData?.username || 'user'}
            onNavigateOutfitBuilder={(items) => {
              if (items && items.length > 0) {
                setPreselectedWardrobeItems(items);
              }
              setCurrentView('chat');
            }}
            onShowToast={showToast}
          />
        )}

        {currentView === 'outfit_builder' && (
          <ChatAIView
            userProfile={userProfile}
            username={userData?.username || userData?.name}
            initialMode="studio"
            initialWardrobeItems={preselectedWardrobeItems}
            onNavigateHome={() => setCurrentView('home')}
            onNavigateReference={() => setCurrentView('reference')}
            onNavigateDashboard={() => setCurrentView('dashboard')}
            onOpenHelp={() => setIsHelpOpen(true)}
            onOpenSmartSize={() => setIsSmartSizeOpen(true)}
            onSelectProduct={(product) => setSelectedProduct(product)}
            onShowToast={showToast}
          />
        )}

        {currentView === 'seller_dashboard' && (
          <SellerDashboardView
            currentUsername={userData?.username || userData?.name || 'Penjual Outfitly'}
            onShowToast={showToast}
            onNavigateExplore={() => setCurrentView('reference')}
          />
        )}

        {currentView === 'orders' && (
          <OrdersView
            onNavigateExplore={() => setCurrentView('reference')}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Auth Modals */}
      <AuthModals
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setUserData(user);
          showToast(`Selamat datang, ${user.username}!`);
          if (!userProfile) {
            setIsOnboardingOpen(true);
          }
        }}
      />

      {/* Onboarding Questionnaire Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={handleOnboardingComplete}
        initialProfile={userProfile}
        username={userData?.username || userData?.name}
        birthDate={userData?.birthDate}
      />

      {/* Quick Outfit Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        currentUsername={userData?.username || userData?.name || 'Teman Gaya'}
        onPostCreated={(post) => {
          showToast('Postingan outfit Anda berhasil diterbitkan.');
        }}
      />

      {/* Product Detail Modal (Base full-view modal, z-50) */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSelectRelated={(p) => setSelectedProduct(p)}
        isSaved={selectedProduct ? savedPostIds.includes(selectedProduct.id) : false}
        onToggleSave={handleToggleSave}
        onShowToast={showToast}
        userMeasurements={userProfile?.measurements}
        onOpenSmartSize={() => setIsSmartSizeOpen(true)}
        onOpenComparison={handleOpenComparison}
        onOpenCheckout={handleOpenCheckout}
        onOpenReport={handleOpenReport}
      />

      {/* Smart Size (CM) Modal (Elevated z-[80]) */}
      <SmartSizeModal
        isOpen={isSmartSizeOpen}
        onClose={() => setIsSmartSizeOpen(false)}
        userProfile={userProfile}
        onSaveMeasurements={handleSaveMeasurements}
      />

      {/* Size Comparison Modal (Side-by-Side Category-Aware, Elevated z-[80]) */}
      <SizeComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        productA={comparisonProduct || allProducts[0]}
        allProducts={allProducts}
        userMeasurements={userProfile?.measurements}
        onOpenSmartSize={() => {
          setIsComparisonOpen(false);
          setIsSmartSizeOpen(true);
        }}
        onSelectProduct={(p) => {
          setIsComparisonOpen(false);
          setSelectedProduct(p);
        }}
      />

      {/* Checkout & Escrow Modal (Elevated z-[80]) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={checkoutProduct}
        userMeasurements={userProfile?.measurements}
        buyerName={userData?.name || userData?.username || 'Pembeli Outfitly'}
        onOrderCreated={(order) => {
          showToast(`Pesanan ${order.orderNumber} berhasil dibuat!`);
        }}
      />

      {/* Report Listing Modal (Elevated z-[80]) */}
      <ReportListingModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        product={reportProduct}
        reporterName={userData?.username || userData?.name}
        onSuccess={() => {
          showToast('Laporan Anda telah diterima oleh tim moderasi.');
        }}
      />

      {/* Help & FAQ Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onStartOnboarding={() => setIsOnboardingOpen(true)}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
