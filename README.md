Restaurant Website
A full-stack restaurant website with a responsive frontend and backend support for user accounts and favorites. This project is the English and upgraded version of my earlier Pizzakolbe project, now featuring authentication and database integration.
🚀 Features

📱 Responsive Design - Optimized for desktop, tablet, and mobile devices
👤 User Authentication - Secure login & signup with bcrypt password hashing
⭐ Favorites System - Save and manage favorite menu items
🍽️ Dynamic Menu - Real-time menu display with backend integration
🔐 Secure Architecture - Password hashing and protected API endpoints
🛒 Menu Management - Browse pizzas, burgers, sandwiches, and sides
🔍 User-Friendly Interface - Clean, intuitive design with tab-based navigation
⚡ Fast Performance - Built with modern web technologies

🛠️ Tech Stack
Frontend

HTML5 - Semantic markup and structure
CSS3 - Custom styling with Flexbox/Grid and animations
JavaScript (ES6+) - Interactive functionality and API integration

Backend

Node.js - JavaScript runtime environment
Express.js - Web application framework
bcrypt - Password hashing for security
CORS - Cross-origin resource sharing

Database

SQLite3 - Lightweight SQL database for user data and favorites

Development Tools

Nodemon - Development server with auto-restart
VS Code - Development environment

📁 Project Structure
restaurant-website/
├── client/                 # Frontend files
│   ├── css/               # Stylesheets
│   ├── images/            # Image assets
│   ├── JS/                # JavaScript files
│   ├── index.html         # Main homepage
│   ├── about.html         # About page
│   ├── contact.html       # Contact page
│   ├── favorites.html     # User favorites page
│   ├── menu.html          # Menu display
│   └── signup.html        # Authentication page
├── back-end/              # Backend files
│   ├── server.js          # Main server file
│   ├── database.js        # Database configuration
│   ├── package.json       # Dependencies
│   └── package-lock.json  # Dependency lock file
├── index.html             # Root redirect file
├── .gitignore             # Git ignore rules
└── README.md              # Project documentation
_________________________________________________________________________

🚀 Getting Started
Prerequisites

Node.js (v14 or higher)
npm or yarn package manager

Installation

Clone the repository
bashgit clone https://github.com/yourusername/restaurant-website.git
cd restaurant-website

Install backend dependencies
bashcd back-end
npm install

Start the backend server
bashnpm start
# or for development with auto-restart
npm run dev

Open the frontend

Navigate to the client folder
Open index.html in your browser
Or serve it using a local server (recommended)



Database Setup
The SQLite database will be automatically created when you first run the server. The application will create the necessary tables for users and favorites.
📊 API Endpoints
Authentication

POST /api/register - User registration
POST /api/login - User login

Favorites

POST /favorites/add - Add item to favorites
GET /favorites/user/:userId - Get user's favorites
DELETE /favorites/:favoriteId - Remove from favorites

Menu

GET /menu/items - Get all menu items

🔐 Security Features

Password hashing with bcrypt
Input validation and sanitization
SQL injection protection with parameterized queries
CORS configuration for secure cross-origin requests
Duplicate registration prevention

🌟 Menu Categories

Pizzas - Margherita, Pepperoni, Veggie, and specialty pizzas
Burgers - Classic, cheeseburgers, and gourmet options
Hot Dogs & Sandwiches - Various styles and toppings
Sides - Fries, salads, and appetizers

🤝 Contributing

Fork the project
Create your feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.
📞 Contact
Hossein Gorji - hoseingorji1383@gmail.com
Project Link: https://github.com/hosseingorji05/restaurant-website
🙏 Acknowledgments

Built as an evolution of the original Pizzakolbe project
Icons and images used with proper licensing
Inspired by modern restaurant website designs
