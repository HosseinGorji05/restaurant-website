document.addEventListener('DOMContentLoaded' , function(){

      const isLoggedIn = localStorage.getItem('isLoggedIn');
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      
      

      if (isLoggedIn === 'true' && userId && userEmail){
          console.log("✅ User is logged in with ID:", userId);
          const userName = userEmail.split('@')[0];
          console.log("user name is: " ,  userName);
          
          if (!sessionStorage.getItem('welcomeShown')) {
              welcomeMessage(userName);
              sessionStorage.setItem('welcomeShown', 'true');
          }
          
          fetchUserFavorites(userId);
        
      } else {
          console.log("❌ User is NOT logged in");
          showNotification(t("Please log in to see favorites"), "error");
      }


  })

  function welcomeMessage(userName){
    console.log("Hello " , userName);
    const notification = document.createElement('div');
    notification.textContent = t('Hello {name}', { name: userName });

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
      background-color: #1aa335ff;
    `;

    document.body.appendChild(notification);


     setTimeout(() => {
      notification.remove();
    }, 3000);


  }


  function showNotification(message, type = 'info') {
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

    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);


    setTimeout(() => {
      notification.remove();
    }, 3000);
  }






async function fetchUserFavorites(userId) {
  try{
    const response = await fetch(`${window.API_BASE}/favorites/user/${userId}`);
    const data = await response.json();
    console.log("Favorite data: " ,  data);

    const favoritesContainer = document.getElementById("favoritesList");


    if(data.favorites.length === 0){
      favoritesContainer.innerHTML = `<p> ${t('No favorites yet. Add some items from menu!')}</p>`;
      return
    }

    favoritesContainer.innerHTML = '';

    data.favorites.forEach(favorite => {
      console.log("Favortie item: " , favorite);
      const favoriteElement = document.createElement('div');
      favoriteElement.className = 'favorite-item';
      favoriteElement.innerHTML = `
      <div class = "favorite-card">
      <img src = "${favorite.image}" alt = "${favorite.name}" class = "favorite-image">
         <div class = "favorite-info">
         <h3> ${t(favorite.name)}</h>
         <p class="favorite-description">${t(favorite.description)}</p>
         <p class="favorite-price">${typeof formatMenuPrice === 'function' ? formatMenuPrice(favorite.price) : favorite.price}</p>
         <button class="remove-favorite" data-favorite-id="${favorite.id}">${t('Remove')}</button>
         </div>
     </div>

      `
      favoritesContainer.appendChild(favoriteElement);
    });

  } catch(error){
    console.log("Error fetching favorites:" , error);
  }
  
}


document.addEventListener('DOMContentLoaded' , () => {
   const userId = localStorage.getItem('userId');

  document.addEventListener('click' , async function(e){
    if(e.target.classList.contains('remove-favorite')){
      e.preventDefault();
        
      if(!userId){
       alert(t('User ID not found'));
       return
     };

           const favoriteId = e.target.getAttribute('data-favorite-id');

           try{
             const response = await fetch(`${window.API_BASE}/favorites/${favoriteId}`, {
               method: 'DELETE' , 
               headers: {
                 'Content-Type' : 'application/json' , 
     
               },
               body:  JSON.stringify({userId: userId , favoriteId: favoriteId })
               
     
             });
     
             if(response.ok){
               const data = await response.json();
               showNotification(t('Item removed') , 'success');
               console.log("item removed");
               e.target.closest('.favorite-item')?.remove();
             } else {
               showNotification(t('Failed to remove the item') , 'error')
               console.log('Response status:', response.status);
             }
     
     
           }
     
          catch(error){
           console.log('Error' , error);
           showNotification(t("Error removing favorite") , 'error');
          }
     
        }
         } )
       })
      

      

    

