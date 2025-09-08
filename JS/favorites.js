const menuResponse = await fetch('http://localhost:3000/menu/items');
const menuData = await menuResponse.json();
