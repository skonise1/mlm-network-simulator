import React, { useState } from 'react'; // Importing React and useState hook
import { auth, db } from './firebaseConfig'; // Importing authentication and database configuration
import { ref, set } from 'firebase/database'; // Importing necessary functions from Firebase database module

function AddDownline() {
  const [downlineName, setDownlineName] = useState(''); // State variable to hold the downline name input

  // Function to handle adding a new downline
  const handleAddDownline = () => {
    const user = auth.currentUser; // Get the currently authenticated user
    if (user) {
      // Check if user is authenticated
      const downlineRef = ref(db, `members/${user.uid}/downlines/${downlineName}`); // Reference to the downline in the database

      // Set the value to true, indicating the downline exists
      set(downlineRef, true) 
        .then(() => {
          alert(`Downline ${downlineName} added successfully.`); // Alert user on successful addition
          setDownlineName(''); // Clear the input field after successful addition
        })
        .catch((error) => {
          console.error("Error adding downline: ", error); // Log any errors that occur
        });
    } else {
      alert("User not authenticated."); // Alert if no user is authenticated
    }
  };

  return (
    <div>
      <input
        type="text"
        value={downlineName} // Controlled input field for downline name
        onChange={(e) => setDownlineName(e.target.value)} // Update state on input change
        placeholder="Downline Name" // Placeholder for input
      />
      <button onClick={handleAddDownline}>Add Downline</button> {/* Button to trigger downline addition */}
    </div>
  );
}

export default AddDownline; // Export the AddDownline component for use in other parts of the application
