import React, { useState, useEffect } from "react";
import { auth } from "./firebaseConfig"; // Firebase Auth
import Login from "./Login";
import Dashboard from "./Dashboard";


function App() {
  const [user, setUser] = useState(null);

  // Listen for changes in the authentication state (logged in/logged out)
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user); // User is logged in
      } else {
        setUser(null); // User is logged out
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div className="App">
      <h1>MLM Network Simulator</h1>
      {/* If the user is logged in, show the Dashboard and AddDownline components. Otherwise, show the Login form */}
      {user ? (
        <div>
          <Dashboard />
          
        </div>
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;
