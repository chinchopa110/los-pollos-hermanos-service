(function () {
  'use strict';

  const STORAGE_KEY = 'pollosReviews';
  let reviews = [];

  function loadReviews() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      reviews = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(reviews)) reviews = [];
    } catch (e) {
      reviews = [];
    }
  }

  function saveReviews() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  }

  function toStars(n) {
    const v = Math.max(1, Math.min(5, Number(n) || 0));
    return '★'.repeat(v) + '☆'.repeat(5 - v);
  }

  function instantiateReview(review, index) {
    const tpl = document.getElementById('reviewTemplate');
    if (!tpl) return document.createDocumentFragment();
    const fragment = tpl.content.cloneNode(true);
    const article = fragment.querySelector('.review-card');
    if (article) article.dataset.index = String(index);

    const nameEl = fragment.querySelector('.review-name');
    const emailEl = fragment.querySelector('.review-email');
    const ratingEl = fragment.querySelector('.review-rating');
    const commentEl = fragment.querySelector('.review-comment');

    if (nameEl) nameEl.textContent = review.name;
    if (emailEl) emailEl.textContent = ` • ${review.email}`;
    if (ratingEl) ratingEl.textContent = `Оценка: ${review.rating}/5 ${toStars(review.rating)}`;
    if (commentEl) commentEl.textContent = review.comment;

    const editBtn = fragment.querySelector('.review-edit');
    const delBtn = fragment.querySelector('.review-delete');
    if (editBtn) editBtn.addEventListener('click', () => beginEdit(index));
    if (delBtn) delBtn.addEventListener('click', () => {
      reviews.splice(index, 1);
      saveReviews();
      render();
    });

    return fragment;
  }

  function render() {
    const list = document.getElementById('reviewsList');
    const empty = document.getElementById('reviewsEmpty');
    if (!list || !empty) return;
    list.innerHTML = '';
    if (reviews.length === 0) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    reviews.forEach((r, i) => {
      list.appendChild(instantiateReview(r, i));
    });
  }

  function setupForm() {
    const form = document.getElementById('reviewForm');
    if (!form) return;

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const ratingSelect = document.getElementById('rating');
    const commentInput = document.getElementById('comment');
    const editIndexInput = document.getElementById('editIndex');
    const submitBtn = document.getElementById('submitBtn');

    const namePattern = new RegExp("^[A-Za-zА-Яа-яЁё\\s\\-']{2,}$");

    function clearValidity() {
      [nameInput, emailInput, ratingSelect, commentInput].forEach(el => el && el.setCustomValidity(''));
    }

    function validate() {
      clearValidity();
      let valid = true;
      const name = (nameInput.value || '').trim();
      const email = (emailInput.value || '').trim();
      const rating = Number(ratingSelect.value);
      const comment = (commentInput.value || '').trim();

      if (!namePattern.test(name) || name.length < 2 || name.length > 50) {
        nameInput.setCustomValidity('Введите имя (2-50 символов) без цифр.');
        valid = false;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailInput.setCustomValidity('Введите корректный email.');
        valid = false;
      }
      if (!(rating >= 1 && rating <= 5)) {
        ratingSelect.setCustomValidity('Выберите оценку от 1 до 5.');
        valid = false;
      }
      if (comment.length < 5 || comment.length > 500) {
        commentInput.setCustomValidity('Комментарий от 5 до 500 символов.');
        valid = false;
      }
      return valid;
    }

    ['input', 'change', 'blur'].forEach(evt => {
      [nameInput, emailInput, ratingSelect, commentInput].forEach(el => {
        el && el.addEventListener(evt, () => el.setCustomValidity(''));
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const html5Valid = form.checkValidity();
      const jsValid = validate();
      if (!html5Valid || !jsValid) {
        form.reportValidity();
        return;
      }

      const data = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        rating: Number(ratingSelect.value),
        comment: commentInput.value.trim(),
        ts: Date.now()
      };

      const idxStr = (editIndexInput.value || '').trim();
      if (idxStr !== '') {
        const idx = Number(idxStr);
        if (!Number.isNaN(idx) && idx >= 0 && idx < reviews.length) {
          reviews[idx] = data;
        } else {
          reviews.push(data);
        }
      } else {
        reviews.push(data);
      }

      saveReviews();
      resetForm();
      render();

      try {
        const headerH = (document.querySelector('.header')?.offsetHeight) || 0;
        const listTop = document.getElementById('reviewsList')?.getBoundingClientRect().top || 0;
        window.scrollTo({ top: window.pageYOffset + listTop - headerH, behavior: 'smooth' });
      } catch (_) {}
    });

    function resetForm() {
      form.reset();
      editIndexInput.value = '';
      if (submitBtn) submitBtn.textContent = 'Добавить отзыв';
    }

    window.beginEdit = function (index) {
      const i = Number(index);
      if (Number.isNaN(i) || i < 0 || i >= reviews.length) return;
      const r = reviews[i];
      nameInput.value = r.name;
      emailInput.value = r.email;
      ratingSelect.value = String(r.rating);
      commentInput.value = r.comment;
      editIndexInput.value = String(i);
      if (submitBtn) submitBtn.textContent = 'Сохранить изменения';
      nameInput.focus();
    };
  }

  window.addDOMContentLoadedHandler(function () {
    loadReviews();
    setupForm();
    render();
  });

})();