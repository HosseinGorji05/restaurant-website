const menuResponse = await fetch('http://localhost:3000/menu/items'); // makes the request to the server
const menuData = await menuResponse.json();  // converts the response body from json to Js object 
console.log(menuData);
