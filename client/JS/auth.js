console.log('JavaScript file loaded!');

// Helper function to show messages
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
    
    // Hide message after 5 seconds
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up event listeners...');
    
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    console.log('Elements found:', {
        loginTab: !!loginTab,
        signupTab: !!signupTab,
        loginForm: !!loginForm,
        signupForm: !!signupForm
    });

    // Tab switching functionality
    if (loginTab) {
        loginTab.addEventListener('click', function() {
            loginTab.classList.add('active');
            signupTab.classList.remove('active');
            loginForm.classList.add('active');
            signupForm.classList.remove('active');
        });
    }

    if (signupTab) {
        signupTab.addEventListener('click', function() {
            signupTab.classList.add('active');
            loginTab.classList.remove('active');
            signupForm.classList.add('active');
            loginForm.classList.remove('active');
        });
    }
    

    // Login form handler with double-submit protection
    const loginFormElement = document.getElementById('loginFormElement');
    let isLoginSubmitting = false; // PROTECTION FLAG
    
    if (loginFormElement) {
        console.log('Setting up login form listener...');
        loginFormElement.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // PREVENT DOUBLE SUBMISSION
            if (isLoginSubmitting) {
                console.log('Login already in progress, ignoring...');
                return;
            }
            
            isLoginSubmitting = true; // SET FLAG
            console.log('Login form submitted!');
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const messageDiv = document.getElementById('loginMessage');
            const submitButton = loginFormElement.querySelector('button[type="submit"]');
            
            // DISABLE SUBMIT BUTTON
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'در حال ورود...';
            }
            
            console.log('Login attempt:', { email, passwordLength: password.length });
            
            try {
                console.log('Making login request...');
                const response = await fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                console.log('Login response:', { status: response.status, data });

                if (response.ok) {
                    // Success
                    localStorage.setItem('userEmail', data.email);
                    localStorage.setItem('isLoggedIn', 'true');

                    showMessage(messageDiv, data.message, 'success');
                    // Redirect to home page after successful login
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                    localStorage.setItem('userId', data.userId);
                } else {
                    // Error
                    showMessage(messageDiv, data.error, 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                showMessage(messageDiv, 'خطا در اتصال به سرور', 'error');
            } finally {
                // ALWAYS RESET THE FORM STATE
                isLoginSubmitting = false;
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'ورود';
                }
            }
        });
    } else {
        console.error('loginFormElement not found!');
    }

    // Signup form handler with double-submit protection - UPDATED FOR NEW BACKEND
    const signupFormElement = document.getElementById('signupFormElement');
    let isSignupSubmitting = false; // PROTECTION FLAG
    
    if (signupFormElement) {
        console.log('Setting up signup form listener...');
        signupFormElement.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // PREVENT DOUBLE SUBMISSION
            if (isSignupSubmitting) {
                console.log('Signup already in progress, ignoring...');
                return;
            }
            
            isSignupSubmitting = true; // SET FLAG
            console.log('Signup form submitted!');
            
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const messageDiv = document.getElementById('signupMessage');
            const submitButton = signupFormElement.querySelector('button[type="submit"]');
            
            // DISABLE SUBMIT BUTTON
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'در حال ثبت نام...';
            }
            
            console.log('Signup attempt:', { email, passwordLength: password.length });

            try {
                console.log('Making signup request...');
                const response = await fetch('http://localhost:3000/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                console.log('Signup response:', { status: response.status, data });

                // Handle different response statuses
                if (response.status === 201) {
                    // SUCCESS - User created successfully
                    showMessage(messageDiv, 'حساب کاربری با موفقیت ایجاد شد!', 'success');
                    // Clear form
                    signupFormElement.reset();
                    // Switch to login form after success
                    setTimeout(() => {
                        loginTab.click();
                    }, 1500);
                    
                } else if (response.status === 409) {
                    // CONFLICT - Email already exists
                    showMessage(messageDiv, 'این ایمیل قبلاً ثبت شده است. لطفاً وارد شوید یا ایمیل دیگری استفاده کنید.', 'error');
                    
                } else if (response.status === 400) {
                    // BAD REQUEST - Validation errors
                    let errorMessage = data.error || data.message;
                    if (errorMessage === 'Email and password required') {
                        errorMessage = 'ایمیل و رمز عبور الزامی است';
                    } else if (errorMessage === 'Password must be at least 6 characters') {
                        errorMessage = 'رمز عبور باید حداقل ۶ کاراکتر باشد';
                    }
                    showMessage(messageDiv, errorMessage, 'error');
                    
                } else {
                    // OTHER ERRORS (500, etc.)
                    let errorMessage = data.message || data.error || 'خطا در ثبت نام';
                    showMessage(messageDiv, errorMessage, 'error');
                }
                
            } catch (error) {
                console.error('Signup error:', error);
                showMessage(messageDiv, 'خطا در اتصال به سرور. لطفاً دوباره تلاش کنید.', 'error');
            } finally {
                // ALWAYS RESET THE FORM STATE
                isSignupSubmitting = false;
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'ثبت نام';
                }
            }
        });
    } else {
        console.error('signupFormElement not found!');
    }
});

