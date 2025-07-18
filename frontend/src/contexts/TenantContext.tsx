import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

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
  return (
    <TenantContext.Provider value={{ user, tenant, setUser, setTenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
} 