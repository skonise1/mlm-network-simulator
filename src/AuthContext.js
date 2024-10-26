import { createContext, useContext, useState } from "react"; // Importing necessary hooks and functions
import { auth } from "./firebase"; // Importing the Firebase authentication instance
import { signInWithEmailAndPassword, signOut } from "firebase/auth"; // Importing authentication methods from Firebase

// Creating a context for authentication
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);

// Provider component for managing authentication state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // State variable to store the authenticated user

  // Function to log in a user using email and password
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password) // Firebase function to sign in
      .then((userCredential) => {
        setUser(userCredential.user); // Update user state on successful login
      });
  };

  // Function to log out the currently authenticated user
  const logout = () => {
    return signOut(auth) // Firebase function to sign out
      .then(() => setUser(null)); // Clear user state on successful logout
  };

  // Providing the user state and authentication methods to the children components
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
