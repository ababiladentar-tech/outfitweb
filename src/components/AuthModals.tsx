'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AuthModalsProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (userData: { username: string; name?: string; birthDate?: string }) => void;
}

type AuthStep = 'welcome_signup' | 'login' | 'custom_username' | 'birthday_date';

export const AuthModals: React.FC<AuthModalsProps> = ({
  isOpen,
  onClose,
  onAuthSuccess
}) => {
  const [currentStep, setCurrentStep] = useState<AuthStep>('welcome_signup');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    emailOrUsername: '',
    email: '',
    password: '',
    agreeTerms: true,
    username: '',
    birthDay: '15',
    birthMonth: '08',
    birthYear: '02'
  });

  if (!isOpen) return null;

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('custom_username');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuthSuccess({
      username: formData.emailOrUsername || 'UserGaya',
      name: formData.emailOrUsername
    });
    onClose();
  };

  const handleUsernameConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      setFormData(prev => ({ ...prev, username: 'styleuser' }));
    }
    setCurrentStep('birthday_date');
  };

  const handleBirthdayConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const birthDate = `${formData.birthDay}-${formData.birthMonth}-${formData.birthYear}`;
    onAuthSuccess({
      username: formData.username || formData.firstName || 'UserGaya',
      name: `${formData.firstName} ${formData.lastName}`.trim() || formData.username,
      birthDate
    });
    onClose();
  };

  const handleGuestSignIn = () => {
    onAuthSuccess({
      username: 'GuestUser',
      name: 'Guest Fashion Enthusiast'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Blurred Fashion Background Wallpaper from Canva asset */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-cover bg-center transition-opacity"
        style={{
          backgroundImage: 'url(/elements/background%20home.jpg)',
          filter: 'brightness(0.35) blur(6px)'
        }}
      />
      <div className="fixed inset-0 bg-[#162D24]/60 backdrop-blur-sm pointer-events-none" />

      {/* Floating Dark Green Modal Card */}
      <div className="relative w-full max-w-xl bg-[#1E3A2F] text-white rounded-3xl p-6 sm:p-10 border border-[#2F4F42] shadow-2xl z-10 animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* STEP 1: Page 2 - Welcome / Sign Up */}
        {currentStep === 'welcome_signup' && (
          <div className="space-y-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
              Welcome !
            </h2>

            {/* Social Logins */}
            <div className="flex items-center justify-center gap-3 pt-1">
              {/* Google Button */}
              <button
                type="button"
                onClick={() => setCurrentStep('custom_username')}
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#8EA89D] hover:bg-[#7D988D] text-[#162D24] text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#162D24"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#162D24"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#162D24"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#162D24"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign In With Google</span>
              </button>

              {/* Facebook Button */}
              <button
                type="button"
                onClick={() => setCurrentStep('custom_username')}
                className="w-10 h-10 rounded-full border border-neutral-400/50 bg-[#162D24] hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer shadow-sm text-white"
                title="Sign In with Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>

              {/* Twitter / X Button */}
              <button
                type="button"
                onClick={() => setCurrentStep('custom_username')}
                className="w-10 h-10 rounded-full border border-neutral-400/50 bg-[#162D24] hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer shadow-sm text-white"
                title="Sign In with X / Twitter"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
            </div>

            {/* OR Divider */}
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-neutral-400">
              <div className="flex-1 h-px bg-neutral-600/60" />
              <span>OR</span>
              <div className="flex-1 h-px bg-neutral-600/60" />
            </div>

            {/* Sign Up Form */}
            <form onSubmit={handleSignUpSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    Nama Depan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Type Here...."
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full bg-[#162D24] border border-[#3A5E50] text-xs text-white placeholder:text-neutral-500 focus:border-[#8EA89D] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    Nama Belakang
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Type Here...."
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full bg-[#162D24] border border-[#3A5E50] text-xs text-white placeholder:text-neutral-500 focus:border-[#8EA89D] outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Type Here...."
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full bg-[#162D24] border border-[#3A5E50] text-xs text-white placeholder:text-neutral-500 focus:border-[#8EA89D] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Type Here...."
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full bg-[#162D24] border border-[#3A5E50] text-xs text-white placeholder:text-neutral-500 focus:border-[#8EA89D] outline-hidden"
                  />
                </div>
              </div>

              {/* Checkbox */}
              <label className="flex items-center gap-2 text-[11px] text-neutral-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={e => setFormData({ ...formData, agreeTerms: e.target.checked })}
                  className="rounded-sm accent-[#8EA89D]"
                />
                <span>I agree Terms of Service and Privacy Policy</span>
              </label>

              {/* Submit Button */}
              <div className="pt-2 text-center">
                <button
                  type="submit"
                  className="px-10 py-2.5 rounded-full bg-[#8EA89D] hover:bg-[#7D988D] text-[#162D24] font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            </form>

            {/* Bottom Links */}
            <div className="pt-2 text-xs text-neutral-400 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep('login')}
                className="hover:text-white underline font-semibold cursor-pointer"
              >
                Log in
              </button>
              <span>|</span>
              <button
                type="button"
                onClick={handleGuestSignIn}
                className="hover:text-white underline cursor-pointer"
              >
                Sign in as a guest
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Page 3 - Login Modal */}
        {currentStep === 'login' && (
          <div className="space-y-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
              Login
            </h2>

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  Email or Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="Type Here...."
                  value={formData.emailOrUsername}
                  onChange={e => setFormData({ ...formData, emailOrUsername: e.target.value })}
                  className="w-full px-4 py-3 rounded-full bg-[#162D24] border border-[#3A5E50] text-xs text-white placeholder:text-neutral-500 focus:border-[#8EA89D] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Type Here...."
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-full bg-[#162D24] border border-[#3A5E50] text-xs text-white placeholder:text-neutral-500 focus:border-[#8EA89D] outline-hidden"
                />
              </div>

              <label className="flex items-center gap-2 text-[11px] text-neutral-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={e => setFormData({ ...formData, agreeTerms: e.target.checked })}
                  className="rounded-sm accent-[#8EA89D]"
                />
                <span>I agree Terms of Service and Privacy Policy</span>
              </label>

              <div className="pt-2 text-center">
                <button
                  type="submit"
                  className="px-10 py-2.5 rounded-full bg-[#8EA89D] hover:bg-[#7D988D] text-[#162D24] font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                >
                  Login
                </button>
              </div>
            </form>

            <div className="pt-2 text-xs text-neutral-400 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep('welcome_signup')}
                className="hover:text-white underline font-semibold cursor-pointer"
              >
                Sign up
              </button>
              <span>|</span>
              <button
                type="button"
                onClick={handleGuestSignIn}
                className="hover:text-white underline cursor-pointer"
              >
                Sign in as a guest
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Page 4 - Custom Your Username */}
        {currentStep === 'custom_username' && (
          <div className="space-y-6 text-center py-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans leading-tight">
              Custom Your
              <br />
              Username!
            </h2>

            <form onSubmit={handleUsernameConfirm} className="space-y-6 max-w-sm mx-auto">
              <input
                type="text"
                required
                placeholder="Type Here...."
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 rounded-full bg-[#162D24] border border-[#3A5E50] text-center text-sm text-white placeholder:text-neutral-500 focus:border-[#8EA89D] outline-hidden"
              />

              <button
                type="submit"
                className="px-10 py-2.5 rounded-full bg-[#8EA89D] hover:bg-[#7D988D] text-[#162D24] font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                Confirm
              </button>
            </form>
          </div>
        )}

        {/* STEP 4: Page 5 - Pick Your Birthday Date */}
        {currentStep === 'birthday_date' && (
          <div className="space-y-6 text-center py-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans leading-tight">
              Pick Your
              <br />
              Birthday Date!
            </h2>

            <form onSubmit={handleBirthdayConfirm} className="space-y-6 max-w-sm mx-auto">
              <div className="flex items-center justify-center gap-2 text-2xl font-bold font-mono">
                <input
                  type="text"
                  maxLength={2}
                  value={formData.birthDay}
                  onChange={e => setFormData({ ...formData, birthDay: e.target.value })}
                  className="w-16 py-3 text-center rounded-2xl bg-[#162D24] border border-[#3A5E50] text-white focus:border-[#8EA89D] outline-hidden"
                />
                <span className="text-[#8EA89D] font-bold">-</span>
                <input
                  type="text"
                  maxLength={2}
                  value={formData.birthMonth}
                  onChange={e => setFormData({ ...formData, birthMonth: e.target.value })}
                  className="w-16 py-3 text-center rounded-2xl bg-[#162D24] border border-[#3A5E50] text-white focus:border-[#8EA89D] outline-hidden"
                />
                <span className="text-[#8EA89D] font-bold">-</span>
                <input
                  type="text"
                  maxLength={2}
                  value={formData.birthYear}
                  onChange={e => setFormData({ ...formData, birthYear: e.target.value })}
                  className="w-16 py-3 text-center rounded-2xl bg-[#162D24] border border-[#3A5E50] text-white focus:border-[#8EA89D] outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="px-10 py-2.5 rounded-full bg-[#8EA89D] hover:bg-[#7D988D] text-[#162D24] font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                Confirm
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
