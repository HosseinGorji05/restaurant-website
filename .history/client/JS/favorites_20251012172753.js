document.addEventListener('DOMContentLoaded' , function(){

      const isLoggedIn = localStorage.getItem('isLoggedIn');
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      
      

      if (isLoggedIn === 'true' && userId && userEmail){
          console.log("✅ User is logged in with ID:", userId);
          const userName = userEmail.split('@')[0];
          console.log("user name is: " ,  userName);
          welcomeMessage(userName);
          fetchUserFavorites(userId);
        
      } else {
          console.log("❌ User is NOT logged in");
          showNotification("Please log in to see favorites", "error");
      }


  })

  function welcomeMessage(userName){
    console.log("Hello " , userName);
    const notification = document.createElement('div');
    notification.textContent = `Hello ${userName}`;

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






async function fetchUserFavorites(userId) {
  try{
    const response = await fetch(`http://localhost:3000/favorites/user/${userId}`);
    const data = await response.json();
    console.log("Favorite data: " ,  data);

    const favoritesContainer = document.getElementById("favoritesList");


    if(data.favorites.length === 0){
      favoritesContainer.innerHTML = '<p> No favorites yet. Add some items from menu!</p>';
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
         <h3> ${favorite.name}</h>
         <p class="favorite-description">${favorite.description}</p>
         <p class="favorite-price">$${favorite.price}</p>
         <button class="remove-favorite" data-favorite-id="${favorite.id}">Remove</button>
         </div>
     </div>

      `
      favoritesContainer.appendChild(favoriteElement);
    });

  } catch(error){
    console.log("Error fetching favorites:" , error);
  }
  
}


document.addEventListener('DOMContentLoaded' , function(){
  const remvBut = document.querySelectorAll('.remove-favorite');
  remvBut.forEach(button => {
    button.addEventListener('click' , async function(e) {
      e.preventDefault();
      if(!userId){
        alert('User ID not found');
        return
      };
      try{
        const response = await fetch(`http://localhost:3000/favorites/${favoriteId}` , {
          method: 'DELETE' , 
          headers: {
            'Content-Type' : 'application/json' , 

          },
          body:  JSON.stringify({userId: userId , favoriteId: this.getAttribute('data-item-id')})
          

        });


        if(response.ok){
          showNotification('Item removed' , 'success');
          console.log("item removed");
                    this.closest('.favorite-item')?.remove();

        } else {
          showNotification('Failed to remove the item' , 'error')
          console.log(error)
        }


      }

     catch(error){
      console.log('Error' , error);
      showNotification("Error removing favorite" , 'error');
     }




      
    })
  } )

})