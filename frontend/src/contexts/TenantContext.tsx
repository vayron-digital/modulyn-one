import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useMemo } from 'react';

type TenantType = {
  trial_start: string | null;
  trial_ends: string | null;
  feature_flags: Record<string, any>;
  [key: string]: any;
} | null;

type TenantContextType = {
  user: any;
  tenant: TenantType;
  setUser: Dispatch<SetStateAction<any>>;
  setTenant: Dispatch<SetStateAction<TenantType>>;
};

export const TenantContext = createContext<TenantContextType>({
  user: null,
  tenant: null,
  setUser: () => {},
  setTenant: () => {},
});

export function TenantProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [tenant, setTenant] = useState<TenantType>(null);
  
  const value = useMemo(() => ({ 
    user, 
    tenant, 
    setUser, 
    setTenant 
  }), [user, tenant, setUser, setTenant]);
  
  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
} 