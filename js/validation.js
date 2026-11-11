/* KicksLab client-side form validation. Demo only; server-side validation is required in production. */
(() => {
  'use strict';
  const rules = {
    contactName: v => v.trim().length >= 2 && /^[\p{L}][\p{L}\s.'-]*$/u.test(v.trim()) || 'Enter a valid name (at least 2 characters).',
    contactEmail: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Enter a valid email address.',
    contactMessage: v => v.trim().length >= 10 || 'Please enter at least 10 characters.',
    pName: v => v.trim().length >= 2 || 'Product name must contain at least 2 characters.',
    pBrand: v => v.trim().length >= 2 || 'Brand must contain at least 2 characters.',
    pPrice: v => v !== '' && Number.isFinite(Number(v)) && Number(v) > 0 || 'Enter a price greater than ₹0.',
    pOldPrice: v => v === '' || (Number.isFinite(Number(v)) && Number(v) >= 0) || 'Enter a valid old price.',
    pStock: v => v !== '' && Number.isInteger(Number(v)) && Number(v) >= 0 || 'Stock must be a whole number (0 or more).',
    pImage: v => v === '' || /^https?:\/\/.+/i.test(v) || 'Image URL must start with http:// or https://.',
    username: v => v.trim().length >= 3 || 'Username must contain at least 3 characters.',
    password: v => v.length >= 6 || 'Password must contain at least 6 characters.'
  };
  const messageFor = (field) => {
    const id = field.id;
    if (rules[id]) return rules[id](field.value);
    if (field.type === 'email' && field.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(field.value.trim())) return 'Enter a valid email address.';
    return true;
  };
  function validate(field) {
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) return true;
    field.setCustomValidity('');
    const result = messageFor(field);
    if (result !== true) field.setCustomValidity(result);
    if (field.id === 'pOldPrice' && field.value !== '') {
      const price = document.querySelector('#pPrice');
      if (price && Number(field.value) <= Number(price.value)) field.setCustomValidity('Old price should be greater than the selling price.');
    }
    field.classList.toggle('is-invalid', !field.checkValidity());
    field.classList.toggle('is-valid', field.value.trim() !== '' && field.checkValidity());
    return field.checkValidity();
  }
  document.addEventListener('input', e => { if (e.target.matches('input,textarea,select')) validate(e.target); });
  document.addEventListener('change', e => { if (e.target.matches('input,textarea,select')) validate(e.target); });
  document.addEventListener('submit', e => {
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    const fields = [...form.querySelectorAll('input,textarea,select')];
    let valid = true;
    fields.forEach(field => { if (!validate(field)) valid = false; });
    if (!valid || !form.checkValidity()) {
      e.preventDefault();
      e.stopImmediatePropagation();
      form.reportValidity();
      const first = form.querySelector(':invalid');
      first?.focus();
    }
  }, true);
})();
