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

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  status.textContent = 'Invio in corso...';

  // populate subject hidden input
  const data = Object.fromEntries(new FormData(form).entries());
  const subjectInput = document.querySelector('#_subject');
  if (subjectInput) {
    subjectInput.value = `Richiesta preventivo — ${data.service || ''}`;
  }

  // Send via fetch to the form action (FormSubmit)
  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      status.innerHTML = 'Messaggio inviato. Ti risponderò al più presto.';
      form.reset();
    } else {
      const text = await res.text();
      console.error('Form submit error', res.status, text);
      status.innerHTML = 'Errore nell\'invio. Riprovare o usare il link di backup.';
    }
  } catch (err) {
    console.error(err);
    status.innerHTML = 'Errore di rete. Riprovare più tardi.';
  }
});


