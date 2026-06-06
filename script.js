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

  status.textContent = 'Invio richiesta in corso...';

  try {
    const formData = new FormData(form);
    // Add FormSubmit hidden fields
    formData.append('_subject', `Richiesta preventivo — ${formData.get('service')}`);
    formData.append('_template', 'table');
    formData.append('_captcha', 'false');
    // Append any selected files (from the improved UI)
    if (selectedFiles && selectedFiles.length) {
      selectedFiles.forEach((f) => formData.append('attachments[]', f));
    }

    const response = await fetch('https://formsubmit.co/gigiomuratore@gmail.com', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Invio non riuscito');
    }

    status.textContent = 'Richiesta inviata con successo. Ti rispondo appena possibile.';
    form.reset();
    // revoke object URLs and clear selected files
    objectUrls.forEach((u) => { if (u) URL.revokeObjectURL(u); });
    selectedFiles = [];
    objectUrls = [];
    renderFileList();
    updateChooseCount();
  } catch (error) {
    status.textContent = "Errore durante l'invio. Riprova tra poco.";
  }
});

// Enhanced selected files UI and management
const attachmentsInput = null; // persistent input removed; we create a temporary one on demand
const fileListContainer = document.querySelector('#fileList');
const fileSummary = document.querySelector('#fileSummary');
const fileListItems = document.querySelector('#fileListItems');
const chooseFilesBtn = document.querySelector('#chooseFilesBtn');
const chooseFilesCount = document.querySelector('#chooseFilesCount');

let selectedFiles = [];
let objectUrls = [];

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function renderFileList() {
  if (!fileListContainer || !fileSummary || !fileListItems) return;
  fileListItems.innerHTML = '';

  if (selectedFiles.length === 0) {
    fileSummary.textContent = 'Nessun file selezionato.';
    fileListItems.setAttribute('aria-hidden', 'true');
    return;
  }

  const totalBytes = selectedFiles.reduce((s, f) => s + f.size, 0);
  fileSummary.textContent = `${selectedFiles.length} file selezionato${selectedFiles.length > 1 ? 'i' : ''} — ${formatSize(totalBytes)}`;
  fileListItems.setAttribute('aria-hidden', 'false');

  selectedFiles.forEach((file, idx) => {
    const li = document.createElement('li');
    li.className = 'file-item';

    const meta = document.createElement('div');
    meta.className = 'file-meta';

    // thumbnail for images
    if (objectUrls[idx]) {
      const img = document.createElement('img');
      img.src = objectUrls[idx];
      img.alt = file.name;
      img.width = 48;
      img.height = 48;
      img.className = 'file-thumb';
      li.appendChild(img);
    }

    const name = document.createElement('div');
    name.className = 'file-name';
    name.textContent = `${file.name} (${formatSize(file.size)})`;
    meta.appendChild(name);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'file-remove';
    removeBtn.textContent = 'Rimuovi';
    removeBtn.addEventListener('click', () => removeFile(idx));

    li.appendChild(meta);
    li.appendChild(removeBtn);
    fileListItems.appendChild(li);
  });
  updateChooseCount();
}

function removeFile(index) {
  if (objectUrls[index]) {
    URL.revokeObjectURL(objectUrls[index]);
  }
  selectedFiles.splice(index, 1);
  objectUrls.splice(index, 1);
  renderFileList();
}

// Create a temporary file input when the user clicks the custom button
chooseFilesBtn?.addEventListener('click', () => {
  const tmp = document.createElement('input');
  tmp.type = 'file';
  tmp.multiple = true;
  tmp.accept = '.stl,.step,.stp,.dxf,.svg,.pdf,.zip,image/*';
  tmp.style.position = 'absolute';
  tmp.style.left = '-9999px';
  // When running in Chrome the input must be in the DOM for click() to open the dialog
  document.body.appendChild(tmp);

  tmp.addEventListener('change', () => {
    const files = Array.from(tmp.files || []);
    files.forEach((f) => {
      selectedFiles.push(f);
      if (f.type.startsWith('image/')) objectUrls.push(URL.createObjectURL(f));
      else objectUrls.push(null);
    });
    renderFileList();
    updateChooseCount();
    // cleanup
    tmp.value = '';
    tmp.remove();
  });

  // trigger dialog
  tmp.click();
  // If user cancels the dialog, remove the tmp input after a short delay to avoid leftovers
  setTimeout(() => { if (document.body.contains(tmp)) tmp.remove(); }, 2000);
});

function updateChooseCount() {
  if (!chooseFilesCount) return;
  if (selectedFiles.length === 0) chooseFilesCount.textContent = 'Nessun file';
  else chooseFilesCount.textContent = `${selectedFiles.length} file`;
}

// Update submit to append selectedFiles
const originalSubmitHandler = form?.onsubmit; // not used but kept for safety
// We already build formData in submit handler above; adjust that handler to append selected files
// (the submit handler constructs a FormData from the form and then appends files below)

// Debug helper removed

