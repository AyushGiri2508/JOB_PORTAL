import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const useAuthStore = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthStore must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const clearUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        setLoading,
        error,
        setError,
        updateUser,
        clearUser,
        isAuthenticated: !!user,
        isRecruiter: user?.role === 'recruiter',
        isJobseeker: user?.role === 'jobseeker',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
