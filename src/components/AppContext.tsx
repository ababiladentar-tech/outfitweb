'use client';

import type { AccountRole } from '@/lib/types';

import { createContext, useContext } from 'react';
import type { ViewKey } from '@/lib/types';

export interface AppActions {
  view: ViewKey;
  go: (v: ViewKey) => void;
  openProduct: (id: string) => void;
  openStore: (id: string) => void;
  openAuth: (tab?: 'login' | 'signup', role?: AccountRole) => void;
  openOnboarding: () => void;
  openMeasurements: () => void;
  openCompare: (a?: string, b?: string) => void;
  openSaved: () => void;
  openHelp: () => void;
  openComments: (productId: string) => void;
  openReport: (productId: string) => void;
}

const noop = (): void => undefined;

export const AppContext = createContext<AppActions>({
  view: 'home',
  go: noop,
  openProduct: noop,
  openStore: noop,
  openAuth: noop,
  openOnboarding: noop,
  openMeasurements: noop,
  openCompare: noop,
  openSaved: noop,
  openHelp: noop,
  openComments: noop,
  openReport: noop,
});

export const useApp = (): AppActions => useContext(AppContext);
