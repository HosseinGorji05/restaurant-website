const menuResponse = await fetch('http://localhost:3000/menu/items'); // makes the request to the server
const menuData = await menuResponse.json();  // converts the response body from json to Js object 

menuData.items.forEach(item => {
    console.log(item.name);
});

const isLoggedIn = localStorage.getItem('isLoggedIn');
const userId = localStorage.getItem('userId');

if (isLoggedIn === 'true' && userId){
    console.log("user is logged in with ID: ", userId);
} else {
    showNotification("please log in to see favorites!")
}




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

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }