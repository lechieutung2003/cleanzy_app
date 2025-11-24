import React, { createContext, useContext, useMemo, useState } from 'react';

export type Role = 'guest' | 'employee';

type AuthContextValue = {
    role: Role;
    setRole: (r: Role) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [role, setRole] = useState<Role>('guest');

    const value = useMemo(() => ({ role, setRole }), [role]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};