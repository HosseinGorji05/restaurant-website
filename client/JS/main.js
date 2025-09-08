  document.querySelectorAll('nav.navbar .nav-links a').forEach(link => {    
    link.addEventListener('click', function (e) {
      const url = link.getAttribute("href");
      if (!url.startsWith("#") && !url.startsWith("http")) {
        e.preventDefault(); 

        document.body.classList.remove('fade-in');
        document.body.classList.add('fade-out');

        setTimeout(() => {
          window.location.href = url;
        }, 500); 
      }
    });
  });

    document.addEventListener('DOMContentLoaded' , function(){

      const loginButton = document.querySelector('.auth-link');
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      const userEmail = localStorage.getItem('userEmail');

      if (isLoggedIn == 'true' && userEmail){
        loginButton.textContent = "Log Out";
        loginButton.href = '#';
        loginButton.addEventListener('click' , function(e){
          e.preventDefault();
          const shouldLogout = confirm("Do you want to log out?");
          if(shouldLogout){
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userId');
            location.reload();
  
          }
  
        })
      } 

    })


    window.addEventListener('load', () => {
    document.body.classList.remove('fade-out');
    document.body.classList.add('fade-in');

  });


   document.addEventListener("DOMContentLoaded", function () {
 
    document.querySelectorAll('.menu-item').forEach(item => {
      const select = item.querySelector('.choice');
      const priceDisplay = item.querySelector('.price');

          if (!select || !priceDisplay) return;
    
      function updatePrice() {
      let price = 0;
      if (select.value === "single") {
        price = parseInt(select.dataset.single);
      } else if (select.value === "double") {
        price = parseInt(select.dataset.double);
      }
      priceDisplay.innerText =  `$${price}.00`;
    }

    select.addEventListener('change', updatePrice);
    updatePrice();
      });
    });


    document.addEventListener('DOMContentLoaded' , () => {
      // Test: Simple click prevention first
      document.addEventListener('click', function(e) {
        if (e.target && e.target.classList && e.target.classList.contains('add-to-cart')) {
          console.log('Button clicked - preventing default');
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      });
      
      const favButtons = document.querySelectorAll('.add-to-cart');

      favButtons.forEach(button => {
        button.addEventListener('click' , async function(e){
          e.preventDefault();
          e.stopPropagation();
          
          const isLoggedIn = localStorage.getItem('isLoggedIn');
          if(!isLoggedIn || isLoggedIn !== 'true'){
            showNotification('Please log in to add favorites', 'error');
            return;
          }

          const userId = localStorage.getItem('userId');
          if(!userId){
            alert('User ID not found');
            return;
          }

          const itemId = button.getAttribute('data-item-id') || '1';

          try{
            const response = await fetch('http://localhost:3000/favorites/add' , {
              method: 'POST' , 
              headers: {
                'Content-Type': 'application/json' , 
              } , 
              body: JSON.stringify({
                userId: userId,
                itemId: itemId
              })
            });
            const data = await response.json();
            
            if(response.status === 409) {
              showNotification(data.message || 'Item already in favorites!', 'info');
              button.textContent = 'Already Favorited!';
              button.style.backgroundColor = '#27ae60';
              return;
            }
            
            if(data.success){
              showNotification('Added to favorites!', 'success');
              button.textContent = 'Added to Favorites!';
              button.style.backgroundColor = '#27ae60';
            } else {
              showNotification(data.error || 'Failed to add to favorites', 'error');
            }
          } catch (error){
            console.error('Error:', error);
            showNotification('Error adding to favorites', 'error');
          }
        })
      })
    });
   

  // Notification function for better user experience
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

