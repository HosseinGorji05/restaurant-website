// Bilingual (English / Farsi) support for the Kolbe website.
// Self-contained: injects the language switcher, styles, font and applies
// translations + RTL based on the language saved in localStorage.

(function () {
  const STORAGE_KEY = "siteLang";

  // English -> Farsi dictionary for every visible string on the site.
  const FA = {
    // Navbar
    "Home": "خانه",
    "Menu": "منو",
    "Contact": "تماس",
    "About Us": "درباره ما",
    "Favorites": "علاقه‌مندی‌ها",
    "Login / Sign Up": "ورود / ثبت‌نام",
    "Log Out": "خروج",

    // Hero / home
    "Kolbeh": "کلبه",
    "Kolbe": "کلبه",
    "View Menu": "مشاهده منو",

    // Shared
    "Contact With Us": "با ما در تماس باشید",

    // Menu page
    "My Favorites": "علاقه‌مندی‌های من",
    "Choose:": "انتخاب کنید:",
    "Single": "تک",
    "Double": "دوبل",
    "Add to Favorites": "افزودن به علاقه‌مندی‌ها",
    "Added to Favorites!": "به علاقه‌مندی‌ها اضافه شد!",
    "Already Favorited!": "قبلاً اضافه شده!",
    "Remove": "حذف",

    // Item names
    "Margherita": "مارگاریتا",
    "Pepperoni": "پپرونی",
    "Veggie Pizza": "پیتزا سبزیجات",
    "Chicken and Mushroom Pizza": "پیتزا مرغ و قارچ",
    "Roast Beef Pizza": "پیتزا گوشت",
    "Kolbe Special Pizza": "پیتزا مخصوص کلبه",
    "Meat and Mushroom Pizza": "پیتزا گوشت و قارچ",
    "Chorizo Pizza": "پیتزا چوریزو",
    "Mixed Pizza": "پیتزا مخلوط",
    "Regular Burger": "برگر ساده",
    "Cheeseburger": "چیزبرگر",
    "Kolbe Special Burger": "برگر مخصوص کلبه",
    "Mushroom and Cheese Burger": "برگر قارچ و پنیر",
    "Chorizo Burger": "برگر چوریزو",
    "Hot Dog": "هات داگ",
    "Mushroom and Cheese Hot Dog": "هات داگ قارچ و پنیر",
    "Krakow": "کراکوف",
    "Cocktail": "کوکتل",
    "Beef Ham": "ژامبون گوشت",
    "Chicken Ham": "ژامبون مرغ",
    "Roasted Ham": "ژامبون سرخ‌شده",
    "Kolbe Special Fries": "سیب‌زمینی مخصوص کلبه",
    "Baked Potato": "سیب‌زمینی تنوری",
    "French Fries": "سیب‌زمینی سرخ‌کرده",
    "Garlic Bread": "نان سیر",
    "Caesar Salad": "سالاد سزار",
    "Garden Salad": "سالاد فصل",

    // Tags
    "Fresh basil": "ریحان تازه",
    "Mozzarella": "موزارلا",
    "Tomato sauce": "سس گوجه",
    "Spicy": "تند",
    "Hot": "داغ",
    "Vegetarian": "گیاهی",
    "Fresh vegetables": "سبزیجات تازه",
    "Cheesy": "پنیری",
    "Grilled chicken": "مرغ کبابی",
    "Fresh mushrooms": "قارچ تازه",
    "Roast beef": "گوشت رست",
    "Bell pepper": "فلفل دلمه‌ای",
    "Cold cuts": "کالباس",
    "Sausage": "سوسیس",
    "Olives": "زیتون",
    "Ground beef": "گوشت چرخ‌کرده",
    "Special sauce": "سس مخصوص",
    "Chorizo sausage": "سوسیس چوریزو",
    "Red hot pepper": "فلفل قرمز تند",
    "Stretchy cheese": "پنیر کشدار",
    "Beef and chicken ham": "ژامبون گوشت و مرغ",
    "Black olives": "زیتون سیاه",
    "Pizza cheese": "پنیر پیتزا",
    "Grilled beef": "گوشت کبابی",
    "Melted cheese": "پنیر ذوب‌شده",
    "Fresh beef": "گوشت تازه",
    "Premium ingredients": "مواد اولیه ممتاز",
    "House specialty": "ویژه رستوران",
    "Garlic sauce": "سس سیر",
    "Smoky chili sauce": "سس چیلی دودی",
    "Classic hot dog": "هات داگ کلاسیک",
    "Mustard & ketchup": "خردل و سس کچاپ",
    "Fresh bun": "نان تازه",
    "Mushrooms and cheese": "قارچ و پنیر",
    "Gourmet style": "سبک گورمه",
    "Krakow sausage": "سوسیس کراکوف",
    "Traditional recipe": "دستور سنتی",
    "Cocktail sausage": "سوسیس کوکتل",
    "Perfect appetizer": "پیش‌غذای عالی",
    "Beef ham": "ژامبون گوشت",
    "Cheese": "پنیر",
    "Lettuce and mayonnaise": "کاهو و سس مایونز",
    "Chicken ham": "ژامبون مرغ",
    "White sauce": "سس سفید",
    "Roasted ham": "ژامبون سرخ‌شده",
    "Grilled to perfection": "کاملاً کبابی",
    "House special seasoning": "چاشنی مخصوص رستوران",
    "Crispy texture": "بافت ترد",
    "Perfect side dish": "مخلفات عالی",
    "Fresh baked": "تازه پخته‌شده",
    "Butter and herbs": "کره و سبزیجات معطر",
    "Healthy option": "گزینه سالم",
    "Great with burgers": "عالی با برگر",
    "Golden crispy": "طلایی و ترد",
    "Classic side": "مخلفات کلاسیک",
    "Garlic butter": "کره سیر",
    "Perfect starter": "پیش‌غذای عالی",
    "Grilled or fried chicken": "مرغ کبابی یا سرخ‌شده",
    "Fresh romaine": "کاهو رومی تازه",
    "Caesar dressing": "سس سزار",
    "Seasonal vegetables mix (lettuce, cucumber, tomato, carrot)":
      "ترکیب سبزیجات فصل (کاهو، خیار، گوجه، هویج)",
    "Light diet friendly": "مناسب رژیم سبک",
    "Fresh and healthy": "تازه و سالم",

    // Menu item descriptions (used on the favorites page)
    "Fresh basil, Mozzarella, Tomato sauce": "ریحان تازه، موزارلا، سس گوجه",
    "Spicy, Hot": "تند، داغ",
    "Vegetarian, Fresh vegetables, Cheesy": "گیاهی، سبزیجات تازه، پنیری",
    "Grilled chicken, Fresh mushrooms, Cheesy": "مرغ کبابی، قارچ تازه، پنیری",
    "Roast beef, Bell pepper, Mozzarella": "گوشت رست، فلفل دلمه‌ای، موزارلا",
    "Cold cuts, Sausage, Olives": "کالباس، سوسیس، زیتون",
    "Ground beef, Fresh mushrooms, Special sauce":
      "گوشت چرخ‌کرده، قارچ تازه، سس مخصوص",
    "Chorizo sausage, Red hot pepper, Stretchy cheese":
      "سوسیس چوریزو، فلفل قرمز تند، پنیر کشدار",
    "Beef and chicken ham, Black olives, Pizza cheese":
      "ژامبون گوشت و مرغ، زیتون سیاه، پنیر پیتزا",
    "Grilled beef": "گوشت کبابی",
    "Melted cheese, Fresh beef": "پنیر ذوب‌شده، گوشت تازه",
    "Special sauce, Premium ingredients, House specialty":
      "سس مخصوص، مواد اولیه ممتاز، ویژه رستوران",
    "Fresh mushrooms, Mozzarella, Garlic sauce":
      "قارچ تازه، موزارلا، سس سیر",
    "Chorizo sausage, Spicy, Smoky chili sauce":
      "سوسیس چوریزو، تند، سس چیلی دودی",
    "Classic hot dog, Mustard & ketchup, Fresh bun":
      "هات داگ کلاسیک، خردل و سس کچاپ، نان تازه",
    "Mushrooms and cheese, Gourmet style": "قارچ و پنیر، سبک گورمه",
    "Krakow sausage, Traditional recipe": "سوسیس کراکوف، دستور سنتی",
    "Cocktail sausage, Perfect appetizer": "سوسیس کوکتل، پیش‌غذای عالی",
    "Beef ham, Cheese, Lettuce and mayonnaise":
      "ژامبون گوشت، پنیر، کاهو و سس مایونز",
    "Chicken ham, White sauce, Fresh vegetables":
      "ژامبون مرغ، سس سفید، سبزیجات تازه",
    "Roasted ham, Mozzarella, Grilled to perfection":
      "ژامبون سرخ‌شده، موزارلا، کاملاً کبابی",
    "House special seasoning, Crispy texture, Perfect side dish":
      "چاشنی مخصوص رستوران، بافت ترد، مخلفات عالی",
    "Fresh baked, Butter and herbs, Healthy option":
      "تازه پخته‌شده، کره و سبزیجات معطر، گزینه سالم",
    "Great with burgers, Golden crispy, Classic side":
      "عالی با برگر، طلایی و ترد، مخلفات کلاسیک",
    "Fresh baked, Garlic butter, Perfect starter":
      "تازه پخته‌شده، کره سیر، پیش‌غذای عالی",
    "Grilled or fried chicken, Fresh romaine, Caesar dressing":
      "مرغ کبابی یا سرخ‌شده، کاهو رومی تازه، سس سزار",
    "Seasonal vegetables mix (lettuce, cucumber, tomato, carrot), Light diet friendly, Fresh and healthy":
      "ترکیب سبزیجات فصل (کاهو، خیار، گوجه، هویج)، مناسب رژیم سبک، تازه و سالم",

    // About page
    "Welcome to Kolbe Pizza; a cozy spot in the heart of Tehran to experience the real taste of pizza. Using fresh, high-quality ingredients, we offer you a menu that blends traditional and modern flavors. Whether you're looking for a classic Margherita or a spicy Pepperoni, our goal is to serve you a warm, delicious, and memorable meal. At Kolbe Pizza, every slice tells a story of passion and taste.":
      "به پیتزا کلبه خوش آمدید؛ مکانی دنج در قلب تهران برای تجربه طعم واقعی پیتزا. ما با استفاده از مواد اولیه تازه و باکیفیت، منویی به شما ارائه می‌دهیم که طعم‌های سنتی و مدرن را در هم می‌آمیزد. چه به دنبال یک مارگاریتای کلاسیک باشید و چه یک پپرونی تند، هدف ما این است که وعده‌ای گرم، خوشمزه و به‌یادماندنی برایتان سرو کنیم. در پیتزا کلبه، هر برش داستانی از عشق و طعم را روایت می‌کند.",

    // Contact page
    "Phone Number": "شماره تلفن",
    "Instagram": "اینستاگرام",
    "Address": "آدرس",
    "Intersection of Sheikh Safi and Kalim Kashani":
      "تقاطع شیخ صفی و کلیم کاشانی",

    // Signup / login page
    "Login": "ورود",
    "Sign Up": "ثبت‌نام",
    "Log in to your account": "به حساب خود وارد شوید",
    "Create a new account": "ساخت حساب جدید",
    "Email": "ایمیل",
    "Password": "رمز عبور",
    "Password (at least 6 characters)": "رمز عبور (حداقل ۶ کاراکتر)",
    "Logging in...": "در حال ورود...",
    "Signing up...": "در حال ثبت‌نام...",

    // Notifications / dynamic messages
    "Please log in to add favorites": "برای افزودن به علاقه‌مندی‌ها وارد شوید",
    "Please log in to see favorites":
      "برای مشاهده علاقه‌مندی‌ها وارد شوید",
    "User ID not found": "شناسه کاربر یافت نشد",
    "Item already in favorites!": "این مورد از قبل در علاقه‌مندی‌هاست!",
    "Added to favorites!": "به علاقه‌مندی‌ها اضافه شد!",
    "Failed to add to favorites": "افزودن به علاقه‌مندی‌ها ناموفق بود",
    "Error adding to favorites": "خطا در افزودن به علاقه‌مندی‌ها",
    "Item removed": "مورد حذف شد",
    "Failed to remove the item": "حذف مورد ناموفق بود",
    "Error removing favorite": "خطا در حذف علاقه‌مندی",
    "No favorites yet. Add some items from menu!":
      "هنوز علاقه‌مندی‌ای ندارید. از منو موارد دلخواه را اضافه کنید!",
    "Hello {name}": "سلام {name}",
    "Do you want to log out?": "آیا می‌خواهید خارج شوید؟",
    "Account created successfully!": "حساب با موفقیت ساخته شد!",
    "This email is already registered. Please login or use a different email.":
      "این ایمیل قبلاً ثبت شده است. لطفاً وارد شوید یا از ایمیل دیگری استفاده کنید.",
    "Email and password are required": "ایمیل و رمز عبور الزامی است",
    "Password must be at least 6 characters":
      "رمز عبور باید حداقل ۶ کاراکتر باشد",
    "Error connecting to server": "خطا در اتصال به سرور",
    "Error connecting to server. Please try again.":
      "خطا در اتصال به سرور. لطفاً دوباره تلاش کنید.",
    "Error during registration": "خطا هنگام ثبت‌نام",
    "Login successful": "ورود موفق",
    "Invalid email or password": "ایمیل یا رمز عبور نادرست",
    "Email and password required": "ایمیل و رمز عبور الزامی است",

    // Page titles
    "kolbeh": "کلبه",
    "Kolbe - Menu": "کلبه - منو",
    "Contact": "تماس",
    "Login / Sign Up - Kolbe": "ورود / ثبت‌نام - کلبه",
    "favorites": "علاقه‌مندی‌ها",
  };

  const HERO_FA_HTML =
    "طعم اصیل و واقعی. <br /> فضایی گرم و دلنشین. <br />تجربه‌ای فراموش‌نشدنی.";

  function getLang() {
    return localStorage.getItem(STORAGE_KEY) === "fa" ? "fa" : "en";
  }

  // Global translation helper used by other scripts for dynamic strings.
  window.t = function (text, vars) {
    let out = text;
    if (getLang() === "fa" && FA[text]) {
      out = FA[text];
    }
    if (vars) {
      Object.keys(vars).forEach((k) => {
        out = out.replace("{" + k + "}", vars[k]);
      });
    }
    return out;
  };

  function injectAssets() {
    const font = document.createElement("link");
    font.rel = "stylesheet";
    font.href =
      "https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css";
    document.head.appendChild(font);

    const style = document.createElement("style");
    style.textContent = `
      .lang-switch {
        color: white;
        background: #444;
        border: 1px solid rgba(255, 255, 255, 0.3);
        padding: 8px 14px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: 600;
        font-size: 15px;
        white-space: nowrap;
        transition: background 0.3s;
      }
      .lang-switch:hover { background: #ff6b35; }
      [dir="rtl"] body,
      body.rtl { font-family: "Vazirmatn", Tahoma, sans-serif; }
      [dir="rtl"] .nav-links { padding-right: 0; }
      [dir="rtl"] .auth-links { margin-left: 0; margin-right: auto; }
      [dir="rtl"] .tags { direction: rtl; }
    `;
    document.head.appendChild(style);
  }

  function injectSwitcher() {
    const container = document.querySelector(".auth-links");
    if (!container || container.querySelector(".lang-switch")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "lang-switch";
    btn.textContent = getLang() === "fa" ? "English" : "فارسی";
    btn.addEventListener("click", function () {
      const next = getLang() === "fa" ? "en" : "fa";
      localStorage.setItem(STORAGE_KEY, next);
      location.reload();
    });
    container.appendChild(btn);
  }

  function translatePage() {
    const lang = getLang();

    const textSelectors = [
      ".nav-links a",
      ".auth-link",
      ".hero h2",
      ".hero-btn",
      ".contact-box h2",
      ".contact-box2 h2",
      ".menu-item h3",
      ".menu-item .tag",
      ".menu-item label",
      ".menu-item .choice option",
      ".add-to-cart",
      ".favorites-display h2",
      ".favorites-container h1",
      ".content p",
      ".contact-info .label",
      ".icon-text span",
      ".tab-btn",
      ".auth-form h2",
      ".auth-form button[type='submit']",
    ].join(",");

    document.querySelectorAll(textSelectors).forEach((el) => {
      if (el.dataset.i18nEn === undefined) el.dataset.i18nEn = el.textContent;
      const original = el.dataset.i18nEn;
      const key = original.trim().replace(/\s+/g, " ");
      if (lang === "fa" && FA[key]) {
        el.textContent = FA[key];
      } else {
        el.textContent = original;
      }
    });

    document.querySelectorAll("input[placeholder]").forEach((el) => {
      if (el.dataset.i18nPh === undefined)
        el.dataset.i18nPh = el.getAttribute("placeholder");
      const original = el.dataset.i18nPh;
      const key = original.trim().replace(/\s+/g, " ");
      el.setAttribute(
        "placeholder",
        lang === "fa" && FA[key] ? FA[key] : original
      );
    });

    const heroP = document.querySelector(".hero p");
    if (heroP) {
      if (heroP.dataset.i18nHtml === undefined)
        heroP.dataset.i18nHtml = heroP.innerHTML;
      heroP.innerHTML = lang === "fa" ? HERO_FA_HTML : heroP.dataset.i18nHtml;
    }

    if (document.documentElement.dataset.i18nTitle === undefined)
      document.documentElement.dataset.i18nTitle = document.title;
    const title0 = document.documentElement.dataset.i18nTitle.trim();
    document.title =
      lang === "fa" && FA[title0]
        ? FA[title0]
        : document.documentElement.dataset.i18nTitle;

    document.documentElement.lang = lang === "fa" ? "fa" : "en";
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
    document.body.classList.toggle("rtl", lang === "fa");
  }

  injectAssets();
  document.addEventListener("DOMContentLoaded", function () {
    injectSwitcher();
    translatePage();
  });
})();
