import { createContext, useContext } from 'react';

interface LayoutUIContextValue {
  toggleSidebar?: () => void;
}

export const LayoutUIContext = createContext<LayoutUIContextValue>({});

export const useLayoutUI = () => useContext(LayoutUIContext);