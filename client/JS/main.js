document.querySelectorAll('nav.navbar .nav-links a').forEach(link => {
  link.addEventListener('click', function (e) {
    const url = link.getAttribute("href");
    if (!url.startsWith("#") && !url.startsWith("http")) {
      e.preventDefault();
      document.body.classList.remove('fade-in');
      document.body.classList.add('fade-out');
      setTimeout(() => {
        window.location.href = url;
      }, 400);
    }
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const loginButton = document.getElementById("loginButton");
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const userEmail = localStorage.getItem('userEmail');

  if (loginButton && isLoggedIn === 'true' && userEmail) {
    loginButton.textContent = typeof t === 'function' ? t("Log Out") : "Log Out";
    loginButton.href = '#';
    loginButton.addEventListener('click', function (e) {
      e.preventDefault();
      const shouldLogout = confirm(t("Do you want to log out?"));
      if (shouldLogout) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        location.reload();
      }
    });
  }

  highlightActiveNav();
  initNavbarScroll();
});

window.addEventListener('load', () => {
  document.body.classList.remove('fade-out');
  document.body.classList.add('fade-in');
});

function highlightActiveNav() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

window.formatMenuPrice = function (amount) {
  if (!amount && amount !== 0) return typeof t === 'function' ? t('Price on request') : 'Price on request';
  const lang = localStorage.getItem('siteLang') === 'fa' ? 'fa-IR' : 'en-US';
  const formatted = Number(amount).toLocaleString(lang);
  const suffix = lang === 'fa-IR' ? ' تومان' : ' Toman';
  return formatted + suffix;
};

function getDatasetPrice(select, key) {
  const value = select.dataset[key];
  const price = parseInt(value, 10);
  return Number.isFinite(price) ? price : 0;
}

function getChoicePrice(select) {
  const key = select.value;
  if (key === 'single') return getDatasetPrice(select, 'single');
  if (key === 'medium') return getDatasetPrice(select, 'medium');
  if (key === 'twoPersons') return getDatasetPrice(select, 'twoPersons');
  if (key === 'family') return getDatasetPrice(select, 'family');
  return 0;
}

function initMenuPrices() {
  document.querySelectorAll('.menu-item').forEach(item => {
    const select = item.querySelector('.choice');
    const priceDisplay = item.querySelector('.price');
    if (!select || !priceDisplay) return;

    function updatePrice() {
      const price = getChoicePrice(select);
      priceDisplay.textContent = price ? formatMenuPrice(price) : formatMenuPrice(null);
    }

    if (!select.dataset.priceBound) {
      select.dataset.priceBound = '1';
      select.addEventListener('change', updatePrice);
    }
    updatePrice();
  });
}

window.initMenuPrices = initMenuPrices;
document.addEventListener("DOMContentLoaded", initMenuPrices);

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', function (e) {
    if (e.target && e.target.classList && e.target.classList.contains('add-to-cart')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  });

  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', async function (e) {
      e.preventDefault();
      e.stopPropagation();

      const isLoggedIn = localStorage.getItem('isLoggedIn');
      if (!isLoggedIn || isLoggedIn !== 'true') {
        showNotification(t('Please log in to add favorites'), 'error');
        return;
      }

      const userId = localStorage.getItem('userId');
      if (!userId) {
        alert(t('User ID not found'));
        return;
      }

      const itemId = button.getAttribute('data-item-id') || '1';
      try {
        const response = await fetch('http://localhost:3000/favorites/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, itemId })
        });
        const data = await response.json();

        if (response.status === 409) {
          showNotification(t('Item already in favorites!'), 'info');
          button.textContent = t('Already Favorited!');
          button.classList.add('favorited');
          return;
        }

        if (data.success) {
          showNotification(t('Added to favorites!'), 'success');
          button.textContent = t('Added to Favorites!');
          button.classList.add('favorited');
        } else {
          showNotification(t('Failed to add to favorites'), 'error');
        }
      } catch (error) {
        console.error('Error:', error);
        showNotification(t('Error adding to favorites'), 'error');
      }
    });
  });
});

function showNotification(message, type = 'info') {
  document.querySelectorAll('.notification').forEach(n => n.remove());

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 3200);
}
