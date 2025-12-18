function showError(msg) {
  const errorDiv = document.getElementById('errorMessage');
  if (errorDiv) {
    errorDiv.textContent = msg;
    errorDiv.style.display = 'block';
  }
}

function clearError() {
  const errorDiv = document.getElementById('errorMessage');
  if (errorDiv) {
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
  }
}

// Fetch admin data from the API
async function loadAdminData() {
  try {
    clearError();
    
    const response = await fetch('/api/me');
    
    if (!response.ok) {
      if (response.status === 401) {
        showError('Not logged in. Please log in first.');
        setTimeout(() => {
          window.location.href = './login.html';
        }, 2000);
        return;
      }
      throw new Error(`API failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validate response data
    if (!data.userId || !data.name) {
      throw new Error('Invalid response from server');
    }
    
    // Update the DOM with fetched data
    document.getElementById('adminId').textContent = `#${String(data.userId).padStart(3, '0')}`;
    document.getElementById('adminUsername').textContent = data.name;
    
  } catch (error) {
    console.error('Error loading admin data:', error);
    showError('Failed to load admin information. Check server console.');
  }
}

// Load data when page is ready
window.addEventListener('DOMContentLoaded', loadAdminData);
