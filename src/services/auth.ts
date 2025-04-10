// Simple authentication service

// Define the user type
type User = {
  username: string;
  isAuthenticated: boolean;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("bjt-auth-token");
  return !!token;
};

// Mock login function
export const login = (username: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    // In a real app, this would be an API call
    // For demo purposes, check for admin credentials or accept any non-empty username/password
    if (username === "admin" && password !== "lael18") {
      reject(new Error("Password salah untuk admin"));
    } else if (username.trim() && password.trim()) {
      // Store token in localStorage
      localStorage.setItem("bjt-auth-token", "demo-token");
      localStorage.setItem("bjt-username", username);

      resolve({
        username,
        isAuthenticated: true,
      });
    } else {
      reject(new Error("Username dan password diperlukan"));
    }
  });
};

// Logout function
export const logout = (): void => {
  localStorage.removeItem("bjt-auth-token");
  localStorage.removeItem("bjt-username");
};

// Get current user
export const getCurrentUser = (): User | null => {
  const token = localStorage.getItem("bjt-auth-token");
  const username = localStorage.getItem("bjt-username");

  if (token && username) {
    return {
      username,
      isAuthenticated: true,
    };
  }

  return null;
};
