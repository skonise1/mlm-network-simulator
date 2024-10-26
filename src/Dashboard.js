import React, { useState, useEffect } from "react"; // Importing React and necessary hooks
import { auth, db } from "./firebaseConfig"; // Importing authentication and database configuration
import { signOut } from "firebase/auth"; // Importing signOut function from Firebase
import { ref, get, update } from "firebase/database"; // Importing necessary functions from Firebase database module
import AddDownline from "./AddDownline"; // Importing AddDownline component for adding downlines
import NetworkTree from "./NetworkTree"; // Importing NetworkTree component for visualizing the network

function Dashboard() {
  const [memberData, setMemberData] = useState(null); // State to hold member data
  const [newSales, setNewSales] = useState(""); // State for inputting new sales
  const [error, setError] = useState(""); // State for handling errors
  const [networkTree, setNetworkTree] = useState(null); // State for holding the network tree data

  // useEffect to fetch user data and network tree when component mounts
  useEffect(() => {
    const fetchTreeData = async (uid) => {
      if (!uid) return null; // Return null if no UID is provided
    
      try {
        const memberRef = ref(db, `members/${uid}`); // Reference to the member in the database
        const snapshot = await get(memberRef); // Fetch member data
    
        if (snapshot.exists()) {
          const member = snapshot.val(); // Get member data
          const tree = {
            uid: uid, // Set UID for the current member
            sales: member.sales || 0, // Set sales amount, default to 0 if undefined
            downlines: [], // Initialize empty downlines array
          };
    
          const downlines = member.downlines || {}; // Get downlines for the member
          for (const downlineName of Object.keys(downlines)) {
            const downlineTree = await fetchTreeData(downlineName); // Recursively fetch downline data
            if (downlineTree) {
              tree.downlines.push(downlineTree); // Push downline data to tree
            }
          }
    
          return tree; // Return the constructed tree
        } else {
          return null; // Return null if no data found
        }
      } catch (error) {
        console.error("Error fetching tree data:", error); // Log errors during fetching
        return null; // Return null in case of error
      }
    };

    const user = auth.currentUser; // Get currently authenticated user
    if (user) {
      const memberRef = ref(db, `members/${user.uid}`); // Reference to the user's member data
      get(memberRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            setMemberData(snapshot.val()); // Set member data in state
            fetchTreeData(user.uid).then((tree) => {
              if (tree) {
                setNetworkTree(tree); // Set network tree if successfully fetched
              } else {
                setError("Failed to fetch the network tree."); // Set error if tree fetching fails
              }
            });
          } else {
            setError("No data found for this user in the database."); // Handle case with no member data
          }
        })
        .catch((err) => setError("Failed to fetch data: " + err.message)); // Handle fetch errors
    } else {
      setError("User is not authenticated."); // Handle case where no user is authenticated
    }
  }, []); // Empty dependency array means this runs once on mount

  // Function to handle updating sales
  const handleSalesUpdate = () => {
    const user = auth.currentUser; // Get the current user
    const saleAmount = parseFloat(newSales); // Convert sales input to a number

    if (user && saleAmount) {
      const memberRef = ref(db, `members/${user.uid}`); // Reference to the user's member data
      get(memberRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const currentSales = snapshot.val().sales || 0; // Get current sales amount
            const updatedSales = currentSales + saleAmount; // Calculate new sales total

            update(memberRef, { sales: updatedSales }) // Update sales in the database
              .then(() => {
                distributeCommissions(user.uid, saleAmount); // Distribute commissions based on new sales
                setNewSales(""); // Clear the input field
              })
              .catch((err) => setError("Error updating sales: " + err.message)); // Handle update errors
          }
        })
        .catch((err) => setError("Error fetching current sales: " + err.message)); // Handle fetch errors
    }
  };

  // Function to distribute commissions to upline members
  const distributeCommissions = (uid, saleAmount) => {
    const commissionRates = [0.1, 0.05, 0.03]; // Commission rates for different levels
    let currentLevel = 0; // Track the current level in the upline

    const distributeToUpline = (uplineUID) => {
      if (uplineUID && currentLevel < commissionRates.length) { // Check if upline exists and level is valid
        const commission = saleAmount * commissionRates[currentLevel]; // Calculate commission for the level
        const uplineRef = ref(db, `members/${uplineUID}`); // Reference to the upline member

        get(uplineRef).then((snapshot) => {
          if (snapshot.exists()) {
            const uplineData = snapshot.val(); // Get upline member data
            const updatedSales = (uplineData.sales || 0) + commission; // Update upline sales with commission

            update(uplineRef, { sales: updatedSales }) // Update upline sales in the database
              .then(() => {
                currentLevel += 1; // Move to the next level
                if (uplineData.upline) {
                  distributeToUpline(uplineData.upline); // Recursively distribute to upline
                }
              })
              .catch((err) => {
                setError(`Failed to update upline ${uplineUID}: ${err.message}`); // Handle errors
              });
          } else {
            setError(`No data found for upline: ${uplineUID}`); // Handle case with no data
          }
        });
      }
    };

    const memberRef = ref(db, `members/${uid}/upline`); // Reference to the user's upline
    get(memberRef).then((snapshot) => {
      const uplineUID = snapshot.val(); // Get upline UID
      if (uplineUID) {
        distributeToUpline(uplineUID); // Start distributing commissions to the upline
      } else {
        setError(`No upline found for UID: ${uid}`); // Handle case with no upline
      }
    });
  };

  // Function to handle user sign-out
  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        setMemberData(null); // Clear member data on sign-out
      })
      .catch((err) => {
        setError("Error signing out: " + err.message); // Handle sign-out errors
      });
  };

  if (error) {
    return <div>Error: {error}</div>; // Render error message if there's an error
  }

  if (!memberData) {
    return <div>Loading...</div>; // Render loading state while fetching data
  }

  const downlinesArray =
    memberData.downlines && typeof memberData.downlines === "object"
      ? Object.keys(memberData.downlines) // Get only keys of downlines
      : [];

  return (
    <div>
      <h2>Dashboard</h2> {/* Dashboard title */}
      <p>Active Prospects: {memberData.activeProspects}</p> {/* Display active prospects */}
      <p>Personal Sales: ${memberData.sales}</p> {/* Display personal sales */}
      <p>
        Direct Downlines:{" "}
        {downlinesArray.length > 0 ? downlinesArray.join(", ") : "No downlines"} {/* Display downlines or message */}
      </p>
      <p>Upline: {memberData.upline}</p> {/* Display upline information */}
      <p>Commission: {memberData.commission !== undefined ? memberData.commission : "%"}%</p> {/* Display commission */}

      <h3>Update Sales</h3> {/* Sales update section */}
      <input
        type="number"
        value={newSales} // Controlled input for new sales amount
        placeholder="Enter sale amount" // Placeholder for input
        onChange={(e) => setNewSales(e.target.value)} // Update state on input change
      />
      <button onClick={handleSalesUpdate}>Record Sale</button> {/* Button to record sales */}

      {networkTree ? <NetworkTree data={networkTree} /> : <p>Loading network tree...</p>} {/* Render network tree if available */}

      <button onClick={handleSignOut}>Sign Out</button> {/* Button to sign out */}

      <AddDownline /> {/* Component to add downline */}
    </div>
  );
}

export default Dashboard; // Export the Dashboard component for use in other parts of the application
