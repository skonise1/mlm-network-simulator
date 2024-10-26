import React from 'react'; // Importing React
import Tree from 'react-d3-tree'; // Importing the Tree component from react-d3-tree for visualization

function NetworkTree({ data }) {
  // Check if the data is available
  if (!data) {
    return <div>Network data not available</div>; // Render a message if data is not provided
  }

  // Transform the data into a format suitable for react-d3-tree
  const treeData = {
    name: data.uid, // Display the UID for the root node
    sales: data.sales, // Store sales information for the node
    children: data.downlines.map((downline) => ({
      name: downline.name || downline.uid, // Display the downline's name or UID
      sales: downline.sales, // Store sales information for the downline
      // Recursively fetch children downlines if they exist
      children: downline.downlines ? downline.downlines.map(subDownline => ({
        name: subDownline.name || subDownline.uid, // Display the name or UID of the sub-downline
        sales: subDownline.sales, // Store sales information for the sub-downline
      })) : [], // If no sub-downlines, return an empty array
    })),
  };

  return (
    <div>
      <h3>Your Network Tree</h3> {/* Heading for the network tree */}
      <Tree data={treeData} /> {/* Render the tree using the transformed data */}
    </div>
  );
}

export default NetworkTree; // Export the NetworkTree component for use in other parts of the application
