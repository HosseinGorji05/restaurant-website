

  function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      color: white;
      font-weight: bold;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease;
      ${type === 'success' ? 'background-color: #27ae60;' : 
        type === 'error' ? 'background-color: #e74c3c;' : 
        'background-color: #3498db;'}
    `;

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);


    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
  
const isLoggedIn = localStorage.getItem('isLoggedIn');
const userId = localStorage.getItem('userId');


  

if (isLoggedIn === 'true' && userId){
    console.log("✅ User is logged in with ID:", userId);
} else {
    console.log("❌ User is NOT logged in");
    console.log("isLoggedIn value:", isLoggedIn);
    console.log("userId value:", userId);
    showNotification("Please log in to see favorites.", "error");
}


