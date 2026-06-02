import React, {
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";

import API from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (!savedUser || !savedToken) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setLoading(false);
      return;
    }

    // Keep the authenticated user visible while the session is verified
    try {
      setUser(JSON.parse(savedUser));
    } catch (parseError) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setLoading(false);
      return;
    }

    const verifySession = async () => {
      try {
        const response = await API.get("/auth/me");
        if (response.data && response.data.success) {
          setUser(response.data.user);
          localStorage.setItem("user", JSON.stringify(response.data.user));
        } else {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setUser(null);
        }
      } catch (err) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (email, password) => {
    setError(null);

    try {
      const response = await API.post("/auth/login", {
        email,
        password,
      });

      const data = response.data;

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);

        return { success: true };
      }

      return {
        success: false,
        message: data.message || "Login failed",
      };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Login failed. Check your inputs.";

      setError(message);

      return {
        success: false,
        message,
      };
    }
  };

  const register = async (name, email, password) => {
    setError(null);

    try {
      const response = await API.post("/auth/register", {
        name,
        email,
        password,
      });

      const data = response.data;

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);

        return { success: true };
      }

      return {
        success: false,
        message: data.message || "Registration failed",
      };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Registration failed. Check inputs.";

      setError(message);

      return {
        success: false,
        message,
      };
    }
  };

  const completeOnboarding = async (onboardingData) => {
    setError(null);

    try {
      const response = await API.put(
        "/auth/onboarding",
        onboardingData
      );

      const data = response.data;

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);

        return { success: true };
      }

      return {
        success: false,
        message: data.message || "Onboarding failed",
      };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to save onboarding.";

      setError(message);

      return {
        success: false,
        message,
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const addExperiencePoints = (amount) => {
    setUser((prev) => {
      if (!prev) return null;

      const currentXP = prev.totalXP || 0;
      const currentLevel = prev.level || 1;
      const newXP = currentXP + amount;
      const xpNeeded = currentLevel * 500;

      if (newXP >= xpNeeded) {
        return {
          ...prev,
          totalXP: newXP - xpNeeded,
          level: currentLevel + 1,
        };
      }

      return {
        ...prev,
        totalXP: newXP,
      };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        completeOnboarding,
        logout,
        addExperiencePoints,
        setError,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be inside AuthProvider");
  }

  return context;
};
