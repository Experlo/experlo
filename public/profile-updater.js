/**
 * Profile Updater Script
 * 
 * This script can be run in the browser console to directly update profile fields
 * without relying on the built-in profile editor.
 * 
 * Instructions:
 * 1. Open your profile page
 * 2. Open browser console (F12 or right-click > Inspect > Console)
 * 3. Copy and paste this entire script
 * 4. Modify the updateData object with your desired values
 * 5. Press Enter to run
 */

(async function() {
  // Edit these values to update your profile
  const updateData = {
    firstName: "Your First Name",  // Change this
    lastName: "Your Last Name",    // Change this
    gender: "female",             // "male" or "female"
    dateOfBirth: "1990-01-01"     // YYYY-MM-DD format
  };

  console.log('Updating profile with data:', updateData);

  try {
    // Call the API to update the profile
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update profile: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    console.log('Profile updated successfully:', result);
    
    // Show success message
    const successDiv = document.createElement('div');
    successDiv.style.position = 'fixed';
    successDiv.style.bottom = '20px';
    successDiv.style.right = '20px';
    successDiv.style.padding = '15px 20px';
    successDiv.style.backgroundColor = '#d1fae5';
    successDiv.style.border = '1px solid #34d399';
    successDiv.style.borderRadius = '5px';
    successDiv.style.color = '#047857';
    successDiv.style.fontWeight = 'bold';
    successDiv.style.zIndex = '9999';
    successDiv.textContent = 'Profile updated successfully! Refresh the page to see changes.';
    
    document.body.appendChild(successDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
      successDiv.remove();
    }, 5000);
    
    // Offer to refresh
    if (confirm('Profile updated successfully! Refresh page to see changes?')) {
      window.location.reload();
    }
    
  } catch (error) {
    console.error('Error updating profile:', error);
    alert('Error updating profile: ' + error.message);
  }
})();
