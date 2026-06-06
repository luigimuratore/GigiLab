const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('[data-nav-links]');

navToggle?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

const form = document.querySelector('#quoteForm');
const status = document.querySelector('#formStatus');

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const subject = encodeURIComponent(`Richiesta preventivo — ${data.service}`);
  const body = encodeURIComponent(
    `Nome: ${data.name}\nEmail: ${data.email}\nServizio: ${data.service}\n\nDescrizione:\n${data.description}\n\nLink file/foto:\n${data.files || 'Nessuno'}`
  );

  status.innerHTML = `Anteprima pronta. <a href="mailto:ciao@example.com?subject=${subject}&body=${body}">Apri email precompilata</a>`;
});
