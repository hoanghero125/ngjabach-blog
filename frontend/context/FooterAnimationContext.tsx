import { createContext, useContext, useState, ReactNode } from 'react';

interface FooterAnimationContextType {
  triggerFooterAnimation: boolean;
  setTriggerFooterAnimation: (value: boolean) => void;
}

const FooterAnimationContext = createContext<FooterAnimationContextType | undefined>(undefined);

export const FooterAnimationProvider = ({ children }: { children: ReactNode }) => {
  const [triggerFooterAnimation, setTriggerFooterAnimation] = useState(false);

  return (
    <FooterAnimationContext.Provider value={{ triggerFooterAnimation, setTriggerFooterAnimation }}>
      {children}
    </FooterAnimationContext.Provider>
  );
};

export const useFooterAnimation = () => {
  const context = useContext(FooterAnimationContext);
  if (!context) {
    throw new Error('useFooterAnimation must be used within a FooterAnimationProvider');
  }
  return context;
};