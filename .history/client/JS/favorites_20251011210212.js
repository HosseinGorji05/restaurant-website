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
    showNotification()
}
