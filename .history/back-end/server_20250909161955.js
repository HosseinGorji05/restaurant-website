const express = require('express');
const db = require('./database')
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
const pendingRegistrations = new Map();

app.use(cors());
app.use(express.static('.'));
app.use(express.json());

// Basic database connection test
app.get('/test-db', (req, res) => {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ tables });
      }
    });
});


app.get('/debug-users', (req, res) => {
    db.all('SELECT id, email, password, created_at FROM users', (err, users) => {
      if (err) {
        console.log('Debug users error:', err.message);
        return res.status(500).json({ error: err.message });
      }
      console.log('All users in database:', users);
      res.json({ users });
    });
});

app.get('/check-schema', (req, res) => {
    db.all('PRAGMA table_info(users)', (err, columns) => {
        if (err) {
            console.log('Schema check error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log('Table schema:', columns);
        res.json({ columns });
    });
});

app.get('/nuclear-reset', (req, res) => {
    console.log('NUCLEAR RESET: Dropping and recreating users table...');
    db.serialize(() => {
        db.run('DROP TABLE IF EXISTS users', (dropErr) => {
            if (dropErr) {
                console.log('Drop error:', dropErr);
                return res.status(500).json({ error: dropErr.message });
            }
            
            console.log('Table dropped, creating new one...');
            
            db.run(`CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (createErr) => {
                if (createErr) {
                    console.log('Create error:', createErr);
                    return res.status(500).json({ error: createErr.message });
                }
                
                console.log('Fresh table created successfully');
                res.json({ message: 'Database completely reset - try registration now' });
            });
        });
    });
});

app.get('/api/users', (req, res) => {
    console.log('📋 Fetching all users...');
    db.all('SELECT id, email, created_at FROM users', (err, users) => {
      if (err) {
        console.log('❌ Error fetching users:', err.message);
        return res.status(500).json({ error: err.message });
      }
      console.log(`✅ Found ${users.length} users`);
      res.json({ users });
    });
});


app.listen(PORT , () => {
    console.log(`Server is running on  http://localhost:${PORT}`);
});

// Enhanced User registration endpoint with detailed logging
app.post('/api/register', async (req, res) => {
  console.log('=== REGISTRATION REQUEST START ===');
  console.log('Request body received:', req.body);
  
  const {email, password } = req.body;
  
  console.log('Extracted values:', { 
      email: email, 
      password: password ? `[${password.length} chars]` : '[MISSING]',
      emailType: typeof email,
      passwordType: typeof password
  });
  
  // Simple validation
  if (!email || !password) {
      console.log('❌ Validation failed: missing email or password');
      return res.status(400).json({ error: 'Email and password required' });
  }
  
  if (password.length < 6) {
      console.log('❌ Validation failed: password too short');
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  
  // SERVER-SIDE DEDUPLICATION CHECK
  const registrationKey = `${email}-${password}`;
  if (pendingRegistrations.has(registrationKey)) {
      console.log('🚫 Duplicate registration request detected, blocking...');
      return res.status(429).json({ 
          error: 'DUPLICATE_REQUEST',
          message: 'Registration request already in progress' 
      });
  }
  
  // Mark this registration as in progress
  pendingRegistrations.set(registrationKey, true);
  console.log('✅ Validation passed, proceeding with registration...');
  
  try {
      // Hash the password first
      console.log('🔐 Hashing password...');
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('✅ Password hashed successfully');
      
      // Try to insert directly - let database handle uniqueness
      console.log('💾 Inserting user into database...');
      console.log('Insert parameters:', { email, hashedPasswordLength: hashedPassword.length });
      
      db.run('INSERT INTO users (email, password) VALUES (?, ?)', 
          [email, hashedPassword], 
          function(insertErr) {
              console.log('Insert operation result:', { 
                  error: insertErr?.message,
                  lastID: this?.lastID,
                  changes: this?.changes 
              });
              
              // ALWAYS remove from pending map when done
              pendingRegistrations.delete(registrationKey);
              
              if (insertErr) {
                  console.log('❌ Database insert error:', insertErr.message);
                  
                  // Handle UNIQUE constraint violation
                  if (insertErr.code === 'SQLITE_CONSTRAINT' && insertErr.message.includes('UNIQUE constraint failed')) {
                      console.log('⚠️ Email already registered (caught by database constraint)');
                      return res.status(409).json({ 
                          error: 'EMAIL_EXISTS',
                          message: 'An account with this email already exists' 
                      });
                  }
                  
                  // Handle other database errors
                  console.log('❌ Unexpected database error:', insertErr.message);
                  return res.status(500).json({ 
                      error: 'REGISTRATION_FAILED',
                      message: 'Registration failed. Please try again.' 
                  });
              }
              
              // Success!
              console.log('✅ User created successfully with ID:', this.lastID);
              console.log('=== REGISTRATION REQUEST SUCCESS ===');
              res.status(201).json({ 
                  success: true,
                  message: 'User created successfully', 
                  userId: this.lastID 
              });
          }
      );
      
  } catch (hashError) {
      // ALWAYS remove from pending map on error
      pendingRegistrations.delete(registrationKey);
      console.log('❌ Password hashing error:', hashError);
      console.log('=== REGISTRATION REQUEST FAILED ===');
      res.status(500).json({ 
          error: 'SERVER_ERROR',
          message: 'Server error during registration' 
      });
  }
});

// User login endpoint
app.post('/api/login', async (req, res) => {
    console.log('=== LOGIN REQUEST START ===');
    console.log('Login attempt for:', req.body.email);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('❌ Login validation failed: missing credentials');
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Find user in database
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      console.log('User lookup result:', { 
          error: err?.message, 
          userFound: !!user,
          userId: user?.id 
      });
      
      if (err) {
        console.log('❌ Database error during login:', err.message);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!user) {
        console.log('❌ User not found for email:', email);
        return res.status(400).json({ error: 'Invalid email or password' });
      }
      
      try {
        // Compare password with hashed version
        console.log('🔐 Comparing passwords...');
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
          console.log('❌ Invalid password for user:', user.id);
          return res.status(400).json({ error: 'Invalid email or password' });
        }
        
        // Login successful
        console.log('✅ Login successful for user:', user.id);
        console.log('=== LOGIN REQUEST SUCCESS ===');
        res.json({ 
          message: 'Login successful', 
          userId: user.id,
          email: user.email,
        });
        
      } catch (error) {
        console.log('❌ Password comparison error:', error);
        console.log('=== LOGIN REQUEST FAILED ===');
        res.status(500).json({ error: 'Server error' });
      }
    });
});

// Favorites endpoints
app.post("/favorites/add", (req, res) => {
  const userId = req.body.userId;
  const itemId = req.body.itemId;

  // First check if this item is already favorited by this user
  db.get(
    "SELECT id FROM user_favorites WHERE user_id = ? AND menu_item_id = ?",
    [userId, itemId],
    function(err, existingFavorite) {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }

      if (existingFavorite) {
        // Item is already favorited
        return res.status(409).json({ 
          success: false, 
          error: "Item already in favorites",
          message: "This item is already in your favorites"
        });
      }

      // Item not favorited yet, so add it
      db.run(
        "INSERT INTO user_favorites (user_id, menu_item_id) VALUES (?, ?)",
        [userId, itemId], 
        function(err) {
          if (err) {
            return res.status(500).json({ error: "Failed to add favorite" });
          }
          res.json({ success: true, favoriteId: this.lastID });
        }
      );
    }
  );
});

app.get("/favorites/user/:userId", (req, res) => {
  const userId = req.params.userId;
  db.all(
    "SELECT * FROM user_favorites WHERE user_id = ?", 
    [userId],
    function(err, favorites){
      if(err){
        console.log('❌ Error fetching favorites:', err.message);
        return res.status(500).json({error: "Failed to fetch favorites"});
      }

      console.log(`✅ Found ${favorites.length} favorites for user ${userId}`);
      res.json({ 
        success: true, 
        favorites: favorites,
        count: favorites.length
      });
    }
  );
});

app.delete("/favorites/:favoriteId", (req, res) => {
  const favoriteId = req.params.favoriteId;
  db.run(
    "DELETE FROM user_favorites WHERE id = ?",
    [favoriteId],
    function(err){
      if(err){
        console.log('❌ Error deleting favorite:', err.message);
        return res.status(500).json({error: "Failed to delete favorite" })
      }
      if (this.changes === 0) {
        // No rows were deleted (favorite didn't exist)
        return res.status(404).json({ error: "Favorite not found" });
      }

      console.log(`✅ Deleted favorite with ID: ${favoriteId}`);
      res.json({
        success: true, 
        message: "Favorite removed successfully",
        deletedId: favoriteId
      })
    }
  );
});

// Menu items data
const menuItems = {
  110: { 
    name: "Margherita", 
    price: 20.30, 
    image: "images/margheritapizza.jpg", 
    description: "Fresh basil, Mozzarella, Tomato sauce",
    singlePrice: 20.30,
    doublePrice: 30.00
  },
  111: { 
    name: "Pepperoni", 
    price: 25.00, 
    image: "images/istockphoto-1442417585-612x612.jpg", 
    description: "Spicy, Hot",
    singlePrice: 25.00,
    doublePrice: 35.00
  },
  112: { 
    name: "Veggie Pizza", 
    price: 30.00, 
    image: "images/1712661.jpg", 
    description: "Vegetarian, Fresh vegetables, Cheesy",
    singlePrice: 30.00,
    doublePrice: 40.00
  },
  113: { 
    name: "Chicken and Mushroom Pizza", 
    price: 22.00, 
    image: "images/dcd061ae-d693-4dc5-a117-aabb6c48a952.jpeg", 
    description: "Grilled chicken, Fresh mushrooms, Cheesy",
    singlePrice: 22.00,
    doublePrice: 32.00
  },
  114: { 
    name: "Roast Beef Pizza", 
    price: 20.00, 
    image: "images/61f67055e1c10.jpg", 
    description: "Roast beef, Bell pepper, Mozzarella",
    singlePrice: 20.00,
    doublePrice: 30.00
  },
  115: { 
    name: "Kolbe Special Pizza", 
    price: 12.00, 
    image: "images/pizzzza.jpg", 
    description: "Cold cuts, Sausage, Olives",
    singlePrice: 12.00,
    doublePrice: 22.00
  },
  116: { 
    name: "Meat and Mushroom Pizza", 
    price: 18.00, 
    image: "images/meat-and-mushroom.jpg", 
    description: "Ground beef, Fresh mushrooms, Special sauce",
    singlePrice: 18.00,
    doublePrice: 28.00
  },
  117: { 
    name: "Chorizo Pizza", 
    price: 18.00, 
    image: "images/AH5_5643-scaled.jpg", 
    description: "Chorizo sausage, Red hot pepper, Stretchy cheese",
    singlePrice: 18.00,
    doublePrice: 28.00
  },
  118: { 
    name: "Mixed Pizza", 
    price: 18.00, 
    image: "images/puzzzza.png", 
    description: "Beef and chicken ham, Black olives, Pizza cheese",
    singlePrice: 18.00,
    doublePrice: 28.00
  },
  119: { 
    name: "Regular Burger", 
    price: 18.00, 
    image: "images/crispy-comte-cheesburgers-FT-RECIPE0921-6166c6552b7148e8a8561f7765ddf20b.jpg", 
    description: "Grilled beef"
  },
  120: { 
    name: "Cheeseburger", 
    price: 20.00, 
    image: "images/cheezburger.jpg", 
    description: "Melted cheese, Fresh beef"
  },
  121: { 
    name: "Kolbe Special Burger", 
    price: 22.00, 
    image: "images/1199662_180-1024x684.jpg", 
    description: "Special sauce, Premium ingredients, House specialty"
  },
  122: { 
    name: "Mushroom and Cheese Burger", 
    price: 22.00, 
    image: "images/mushroom_and_cheese_hamburger_w_hese_tazegi.jpg", 
    description: "Fresh mushrooms, Mozzarella, Garlic sauce"
  },
  123: { 
    name: "Chorizo Burger", 
    price: 22.00, 
    image: "images/2_1699867666_7976.jpg", 
    description: "Chorizo sausage, Spicy, Smoky chili sauce"
  },
  124: { 
    name: "Hot Dog", 
    price: 8.00, 
    image: "images/هات-داگ.jpg", 
    description: "Classic hot dog, Mustard & ketchup, Fresh bun"
  },
  125: { 
    name: "Mushroom and Cheese Hot Dog", 
    price: 10.00, 
    image: "images/طرز-تهیه-هات-داگ-خانگی.jpg", 
    description: "Mushrooms and cheese, Gourmet style"
  },
  126: { 
    name: "Krakow", 
    price: 12.00, 
    image: "images/pooooza.png", 
    description: "Krakow sausage, Traditional recipe"
  },
  127: { 
    name: "Cocktail", 
    price: 8.00, 
    image: "images/132638092866500.jpg", 
    description: "Cocktail sausage, Perfect appetizer"
  },
  128: { 
    name: "Beef Ham", 
    price: 15.00, 
    image: "images/ساندویچ-ژامبون-گوشت.jpg", 
    description: "Beef ham, Cheese, Lettuce and mayonnaise"
  },
  129: { 
    name: "Chicken Ham", 
    price: 14.00, 
    image: "images/0026188_-_550.jpeg", 
    description: "Chicken ham, White sauce, Fresh vegetables"
  },
  130: { 
    name: "Roasted Ham", 
    price: 16.00, 
    image: "images/janbon-tanori.jpg", 
    description: "Roasted ham, Mozzarella, Grilled to perfection"
  },
  131: { 
    name: "Kolbe Special Fries", 
    price: 8.00, 
    image: "images/sibzamini-paniri.jpg", 
    description: "House special seasoning, Crispy texture, Perfect side dish"
  },
  132: { 
    name: "Baked Potato", 
    price: 6.00, 
    image: "images/img_682617.jpeg", 
    description: "Fresh baked, Butter and herbs, Healthy option"
  },
  133: { 
    name: "French Fries", 
    price: 5.00, 
    image: "images/سیب-زمینی-سرخ-کرده.webp", 
    description: "Great with burgers, Golden crispy, Classic side"
  },
  134: { 
    name: "Garlic Bread", 
    price: 4.00, 
    image: "images/calindairy-blog-garlic-bread-030920-002.webp", 
    description: "Fresh baked, Garlic butter, Perfect starter"
  },
  135: { 
    name: "Caesar Salad", 
    price: 12.00, 
    image: "images/Caesar-salad-1.jpg", 
    description: "Grilled or fried chicken, Fresh romaine, Caesar dressing"
  },
  136: { 
    name: "Garden Salad", 
    price: 10.00, 
    image: "images/salad-fasl-min.jpg", 
    description: "Seasonal vegetables mix (lettuce, cucumber, tomato, carrot), Light diet friendly, Fresh and healthy"
  }
};

app.get('/menu/items', (req, res) => {
  res.json({success: true, items: menuItems});
});
