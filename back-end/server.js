require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const db = require('./database');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const pendingRegistrations = new Map();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

const allowedOrigins = [
  'https://www.pizzakolbe.com',
  'https://pizzakolbe.com',
];

app.use(cors({
  origin(origin, callback) {
    if (!origin || process.env.NODE_ENV !== 'production') return callback(null, true);
    if (allowedOrigins.includes(origin) || /\.railway\.app$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
}));

app.use(express.json({ limit: '10kb' }));
app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);
app.use('/favorites', apiLimiter);
app.use(express.static(path.join(__dirname, '..')));

app.get('/', (req, res) => {
  res.redirect('/client/index.html');
});

app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ ok: true, database: 'connected' });
  } catch (err) {
    console.error('Health check failed:', err.message);
    res.status(500).json({ ok: false, database: 'error' });
  }
});

app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const registrationKey = `${email}-${password}`;
  if (pendingRegistrations.has(registrationKey)) {
    return res.status(429).json({
      error: 'DUPLICATE_REQUEST',
      message: 'Registration request already in progress',
    });
  }

  pendingRegistrations.set(registrationKey, true);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (email, password) VALUES (?, ?) RETURNING id',
      [email, hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      userId: result.rows[0].id,
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({
        error: 'EMAIL_EXISTS',
        message: 'An account with this email already exists',
      });
    }
    console.error('Registration error:', err.message);
    res.status(500).json({
      error: 'REGISTRATION_FAILED',
      message: 'Registration failed. Please try again.',
    });
  } finally {
    pendingRegistrations.delete(registrationKey);
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    res.json({
      message: 'Login successful',
      userId: user.id,
      email: user.email,
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/favorites/add', async (req, res) => {
  const { userId, itemId } = req.body;

  try {
    const existing = await db.query(
      'SELECT id FROM user_favorites WHERE user_id = ? AND menu_item_id = ?',
      [userId, itemId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Item already in favorites',
        message: 'This item is already in your favorites',
      });
    }

    const result = await db.query(
      'INSERT INTO user_favorites (user_id, menu_item_id) VALUES (?, ?) RETURNING id',
      [userId, itemId]
    );

    res.json({ success: true, favoriteId: result.rows[0].id });
  } catch (err) {
    console.error('Add favorite error:', err.message);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

app.get('/favorites/status/:userId/:itemId', async (req, res) => {
  const { userId, itemId } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM user_favorites WHERE user_id = ? AND menu_item_id = ?',
      [userId, itemId]
    );
    const favorite = result.rows[0];

    res.json({
      isfavorited: !!favorite,
      favoriteId: favorite?.id,
    });
  } catch (err) {
    console.error('Favorite status error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/favorites/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM user_favorites WHERE user_id = ?',
      [userId]
    );

    const enrichedFavorites = result.rows.map((favorite) => ({
      ...favorite,
      ...menuItems[favorite.menu_item_id],
    }));

    res.json({
      success: true,
      favorites: enrichedFavorites,
      count: enrichedFavorites.length,
    });
  } catch (err) {
    console.error('Fetch favorites error:', err.message);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

app.delete('/favorites/:favoriteId', async (req, res) => {
  const { favoriteId } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM user_favorites WHERE id = ?',
      [favoriteId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({
      success: true,
      message: 'Favorite removed successfully',
      deletedId: favoriteId,
    });
  } catch (err) {
    console.error('Delete favorite error:', err.message);
    res.status(500).json({ error: 'Failed to delete favorite' });
  }
});

const menuItems = {
  110: {
    name: 'Margherita',
    price: 600000,
    image: 'images/margheritapizza.jpg',
    description: 'Fresh basil, Mozzarella, Tomato sauce',
    sizes: { single: 500000, twoPersons: 600000, family: 900000 },
  },
  111: {
    name: 'Pepperoni',
    price: 550000,
    image: 'images/istockphoto-1442417585-612x612.jpg',
    description: 'Spicy, Hot',
    sizes: { medium: 550000, twoPersons: 700000, family: 950000 },
  },
  112: {
    name: 'Veggie Pizza',
    price: 420000,
    image: 'images/1712661.jpg',
    description: 'Vegetarian, Fresh vegetables, Cheesy',
    sizes: { medium: 420000, twoPersons: 550000, family: 800000 },
  },
  113: {
    name: 'Chicken and Mushroom Pizza',
    price: 580000,
    image: 'images/dcd061ae-d693-4dc5-a117-aabb6c48a952.jpeg',
    description: 'Grilled chicken, Fresh mushrooms, Cheesy',
    sizes: { single: 400000, medium: 580000, twoPersons: 740000, family: 1100000 },
  },
  114: {
    name: 'Roast Beef Pizza',
    price: 400000,
    image: 'images/61f67055e1c10.jpg',
    description: 'Roast beef, Bell pepper, Mozzarella',
    sizes: { single: 500000, medium: 400000, family: 1300000 },
  },
  115: {
    name: 'Kolbe Special Pizza',
    price: 550000,
    image: 'images/pizzzza.jpg',
    description: 'Cold cuts, Sausage, Olives',
    sizes: { single: 400000, medium: 550000, twoPersons: 720000, family: 1000000 },
  },
  116: {
    name: 'Meat and Mushroom Pizza',
    price: 380000,
    image: 'images/meat-and-mushroom.jpg',
    description: 'Ground beef, Fresh mushrooms, Special sauce',
    sizes: { single: 455000, medium: 380000, twoPersons: 800000, family: 1200000 },
  },
  117: {
    name: 'Chorizo Pizza',
    price: 550000,
    image: 'images/AH5_5643-scaled.jpg',
    description: 'Chorizo sausage, Red hot pepper, Stretchy cheese',
    sizes: { medium: 550000, twoPersons: 700000, family: 1050000 },
  },
  118: {
    name: 'Mixed Pizza',
    price: 530000,
    image: 'images/puzzzza.png',
    description: 'Beef and chicken ham, Black olives, Pizza cheese',
    sizes: { single: 370000, medium: 530000, twoPersons: 700000, family: 950000 },
  },
  119: {
    name: 'Regular Burger',
    price: 250000,
    image: 'images/crispy-comte-cheesburgers-FT-RECIPE0921-6166c6552b7148e8a8561f7765ddf20b.jpg',
    description: 'Grilled beef',
  },
  120: {
    name: 'Cheeseburger',
    price: 270000,
    image: 'images/cheezburger.jpg',
    description: 'Melted cheese, Fresh beef',
  },
  121: {
    name: 'Kolbe Special Burger',
    price: 600000,
    image: 'images/1199662_180-1024x684.jpg',
    description: 'Special sauce, Premium ingredients, House specialty',
  },
  122: {
    name: 'Double Special Burger',
    price: 900000,
    image: 'images/mushroom_and_cheese_hamburger_w_hese_tazegi.jpg',
    description: 'Fresh mushrooms, Mozzarella, Garlic sauce',
  },
  123: {
    name: 'Chorizo Burger',
    price: 650000,
    image: 'images/2_1699867666_7976.jpg',
    description: 'Chorizo sausage, Spicy, Smoky chili sauce',
  },
  124: {
    name: 'Hot Dog',
    price: 240000,
    image: 'images/هات-داگ.jpg',
    description: 'Classic hot dog, Mustard & ketchup, Fresh bun',
  },
  125: {
    name: 'Mushroom and Cheese Hot Dog',
    price: 350000,
    image: 'images/طرز-تهیه-هات-داگ-خانگی.jpg',
    description: 'Mushrooms and cheese, Gourmet style',
  },
  126: {
    name: 'Krakow',
    price: 400000,
    image: 'images/img_9618.jpg',
    description: 'Krakow sausage, Traditional recipe',
  },
  127: {
    name: 'Cocktail',
    price: 240000,
    image: 'images/132638092866500.jpg',
    description: 'Cocktail sausage, Perfect appetizer',
  },
  128: {
    name: 'Beef Ham',
    price: 250000,
    image: 'images/ساندویچ-ژامبون-گوشت.jpg',
    description: 'Beef ham, Cheese, Lettuce and mayonnaise',
  },
  129: {
    name: 'Chicken Ham',
    price: 250000,
    image: 'images/0026188_-_550.jpeg',
    description: 'Chicken ham, White sauce, Fresh vegetables',
  },
  130: {
    name: 'Roasted Ham',
    price: 350000,
    image: 'images/janbon-tanori.jpg',
    description: 'Roasted ham, Mozzarella, Grilled to perfection',
  },
  131: {
    name: 'Kolbe Special Fries',
    price: 300000,
    image: 'images/sibzamini-paniri.jpg',
    description: 'House special seasoning, Crispy texture, Perfect side dish',
  },
  132: {
    name: 'Baked Potato',
    price: 230000,
    image: 'images/img_682617.jpeg',
    description: 'Fresh baked, Butter and herbs, Healthy option',
  },
  133: {
    name: 'French Fries',
    price: 150000,
    image: 'images/سیب-زمینی-سرخ-کرده.webp',
    description: 'Great with burgers, Golden crispy, Classic side',
  },
  134: {
    name: 'Garlic Bread',
    price: 250000,
    image: 'images/calindairy-blog-garlic-bread-030920-002.webp',
    description: 'Fresh baked, Garlic butter, Perfect starter',
  },
  135: {
    name: 'Caesar Salad',
    price: null,
    image: 'images/Caesar-salad-1.jpg',
    description: 'Grilled or fried chicken, Fresh romaine, Caesar dressing',
  },
  136: {
    name: 'Garden Salad',
    price: null,
    image: 'images/salad-fasl-min.jpg',
    description: 'Seasonal vegetables mix (lettuce, cucumber, tomato, carrot), Light diet friendly, Fresh and healthy',
  },
};

app.get('/menu/items', (req, res) => {
  res.json({ success: true, items: menuItems });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
