/* Front-end demonstration login. Real account authentication requires a secure backend. */
(() => {
  'use strict';
  const form = document.getElementById('clientLoginForm');
  if (!form) return;
  const email = document.getElementById('clientEmail');
  const password = document.getElementById('clientPassword');
  const notice = document.getElementById('loginNotice');
  const toggle = document.getElementById('toggleClientPassword');

  const showNotice = (message, type) => {
    notice.textContent = message;
    notice.className = `login-notice is-visible ${type}`;
  };
  const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

  toggle?.addEventListener('click', () => {
    const showing = password.type === 'text';
    password.type = showing ? 'password' : 'text';
    toggle.textContent = showing ? 'Show' : 'Hide';
    toggle.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    email.classList.toggle('is-invalid', !validEmail(email.value));
    password.classList.toggle('is-invalid', password.value.length < 6);
    if (!validEmail(email.value)) {
      showNotice('Please enter a valid email address.', 'error');
      email.focus(); return;
    }
    if (password.value.length < 6) {
      showNotice('Password must contain at least 6 characters.', 'error');
      password.focus(); return;
    }

    // Demo-only session marker; this does not verify credentials with a server.
    const session = { email: email.value.trim(), signedInAt: new Date().toISOString() };
    try {
      const storage = document.getElementById('rememberClient').checked ? localStorage : sessionStorage;
      storage.setItem('kicksLabClientSession', JSON.stringify(session));
    } catch (error) {
      showNotice('Your browser blocked session storage. You can still browse as a guest.', 'error');
      return;
    }
    showNotice('Demo sign-in successful. Welcome to KicksLab!', 'success');
    form.querySelector('button[type="submit"]').disabled = true;
    window.setTimeout(() => { window.location.href = 'index.html'; }, 900);
  });

  [email, password].forEach(field => field.addEventListener('input', () => {
    field.classList.remove('is-invalid');
    if (notice.classList.contains('error')) notice.className = 'login-notice';
  }));
})();


/* Front-end demonstration registration. Accounts are stored only in this browser. */
(() => {
  'use strict';
  const form = document.getElementById('clientRegisterForm');
  if (!form) return;
  const name = document.getElementById('registerName');
  const email = document.getElementById('registerEmail');
  const phone = document.getElementById('registerPhone');
  const password = document.getElementById('registerPassword');
  const confirmPassword = document.getElementById('confirmRegisterPassword');
  const terms = document.getElementById('registerTerms');
  const notice = document.getElementById('registerNotice');
  const showNotice = (message, type) => {
    notice.textContent = message;
    notice.className = `login-notice is-visible ${type}`;
  };
  const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

  document.querySelectorAll('[data-toggle-password]').forEach(button => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.togglePassword);
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      button.textContent = show ? 'Hide' : 'Show';
      button.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const checks = [
      [name, name.value.trim().length >= 2],
      [email, validEmail(email.value)],
      [phone, /^\d{10}$/.test(phone.value.trim())],
      [password, password.value.length >= 8],
      [confirmPassword, confirmPassword.value === password.value && confirmPassword.value.length > 0]
    ];
    checks.forEach(([field, valid]) => field.classList.toggle('is-invalid', !valid));
    if (!checks.every(([, valid]) => valid)) {
      const first = checks.find(([, valid]) => !valid)[0];
      const messages = new Map([
        [name, 'Please enter your full name (at least 2 characters).'],
        [email, 'Please enter a valid email address.'],
        [phone, 'Enter a valid 10-digit mobile number.'],
        [password, 'Password must contain at least 8 characters.'],
        [confirmPassword, 'Both passwords must match.']
      ]);
      showNotice(messages.get(first), 'error'); first.focus(); return;
    }
    if (!terms.checked) {
      showNotice('Please accept the terms to create your account.', 'error'); terms.focus(); return;
    }
    let accounts;
    try {
      accounts = JSON.parse(localStorage.getItem('kicksLabClientAccounts') || '[]');
      if (!Array.isArray(accounts)) accounts = [];
      if (accounts.some(account => account.email.toLowerCase() === email.value.trim().toLowerCase())) {
        showNotice('An account with this email already exists. Please sign in.', 'error'); email.focus(); return;
      }
      accounts.push({ name: name.value.trim(), email: email.value.trim().toLowerCase(), phone: phone.value.trim(), password: password.value, createdAt: new Date().toISOString() });
      localStorage.setItem('kicksLabClientAccounts', JSON.stringify(accounts));
    } catch (error) {
      showNotice('Unable to save your account in this browser. Check storage settings.', 'error'); return;
    }
    showNotice('Account created successfully! Redirecting to login…', 'success');
    form.querySelector('button[type="submit"]').disabled = true;
    window.setTimeout(() => { window.location.href = 'login.html'; }, 1000);
  });

  [name, email, phone, password, confirmPassword].forEach(field => field.addEventListener('input', () => {
    field.classList.remove('is-invalid');
    if (notice.classList.contains('error')) notice.className = 'login-notice';
  }));
})();
