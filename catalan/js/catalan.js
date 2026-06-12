document.addEventListener('DOMContentLoaded', function () {
  // determine current file name (last path segment)
  var path = window.location.pathname.split('/').pop();
  if (!path) path = 'index.html';
  path = path.split('?')[0].split('#')[0];

  var items = document.querySelectorAll('.menu-item');
  items.forEach(function (el) {
    var href = el.getAttribute('href');
    if (!href) return;
    var name = href.split('/').pop();
    // normalize index default
    if (name === '') name = 'index.html';
    if (name === path) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  // Food page: card expand/collapse — make entire card clickable
  var cards = document.querySelectorAll('.food-grid .card');
  if (cards.length) {
    cards.forEach(function (card) {
      card.addEventListener('click', function (e) {
        // ignore clicks inside the expanded content to allow selecting links
        if (e.target.closest('.card-content')) return;
        // close other cards
        cards.forEach(function (c) { if (c !== card) c.classList.remove('expanded'); });
        card.classList.toggle('expanded');
        if (card.classList.contains('expanded')) card.scrollIntoView({behavior:'smooth',block:'center'});
      });
    });
  }
});
