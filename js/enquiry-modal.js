/* ==========================================================================
   REVA PHOENIX QUOTATION & ENQUIRY DISPATCHER
   Interactive RFQ Modal, Scope & Document Upload, and Direct Owner WhatsApp Routing
   Target Owner WhatsApp: +91 99405 64261
   ========================================================================== */

(function () {
  const OWNER_WHATSAPP_NUMBER = '919940564261'; // Reva Phoenix Owner WhatsApp (+91 99405 64261)

  const quoteModal = document.getElementById('quote-modal');
  const quoteModalClose = document.getElementById('quote-modal-close');
  const quoteForm = document.getElementById('quote-form');
  const inlineContactForm = document.getElementById('inline-contact-form');
  const toastNotice = document.getElementById('toast-notice');
  const toastMessage = document.getElementById('toast-message');

  // File upload elements
  const dropzone = document.getElementById('file-upload-dropzone');
  const fileInput = document.getElementById('quote-file');
  const uploadPrompt = document.getElementById('file-upload-prompt');
  const uploadPreview = document.getElementById('file-upload-preview');
  const uploadFileName = document.getElementById('file-upload-name');
  const uploadFileRemove = document.getElementById('file-upload-remove');

  let selectedQuoteFile = null;

  function showToast(message, duration = 5000) {
    if (!toastNotice) return;
    toastMessage.textContent = message;
    toastNotice.classList.add('show');
    setTimeout(() => {
      toastNotice.classList.remove('show');
    }, duration);
  }

  // Format file size helper
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  }

  // Set selected file UI
  function setFile(file) {
    selectedQuoteFile = file;
    if (file) {
      if (uploadFileName) uploadFileName.textContent = `${file.name} (${formatFileSize(file.size)})`;
      if (uploadPrompt) uploadPrompt.style.display = 'none';
      if (uploadPreview) uploadPreview.style.display = 'flex';
      if (dropzone) dropzone.style.borderColor = 'var(--orange-primary)';
    } else {
      if (fileInput) fileInput.value = '';
      if (uploadPrompt) uploadPrompt.style.display = 'flex';
      if (uploadPreview) uploadPreview.style.display = 'none';
      if (dropzone) dropzone.style.borderColor = 'var(--orange-border)';
    }
  }

  // Setup file upload interactions
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', (e) => {
      if (e.target.closest('#file-upload-remove')) return;
      fileInput.click();
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0]) {
        setFile(fileInput.files[0]);
      }
    });

    if (uploadFileRemove) {
      uploadFileRemove.addEventListener('click', (e) => {
        e.stopPropagation();
        setFile(null);
      });
    }

    // Drag and Drop
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.style.borderColor = 'var(--orange-primary)';
        dropzone.style.background = 'rgba(255, 85, 0, 0.1)';
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.style.background = 'rgba(255, 85, 0, 0.04)';
        if (!selectedQuoteFile) {
          dropzone.style.borderColor = 'var(--orange-border)';
        }
      });
    });

    dropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        fileInput.files = e.dataTransfer.files;
        setFile(e.dataTransfer.files[0]);
      }
    });
  }

  function openQuoteModal(serviceName = '', labData = null) {
    if (!quoteModal) return;
    if (serviceName) {
      const select = document.getElementById('quote-service-select');
      if (select) {
        let found = false;
        for (let i = 0; i < select.options.length; i++) {
          if (select.options[i].text.toLowerCase().includes(serviceName.toLowerCase()) || 
              select.options[i].value.toLowerCase().includes(serviceName.toLowerCase())) {
            select.selectedIndex = i;
            found = true;
            break;
          }
        }
        if (!found) {
          const newOpt = new Option(serviceName, serviceName, true, true);
          select.add(newOpt, 0);
          select.selectedIndex = 0;
        }
      }
    }

    const subtitle = document.getElementById('quote-modal-subtitle');
    if (subtitle) {
      if (serviceName) {
        subtitle.innerHTML = `Submit your specifications for <strong style="color:var(--orange-primary);">${serviceName}</strong> directly to the Owner WhatsApp (<strong style="color:#25D366;">+91 99405 64261</strong>).`;
      } else {
        subtitle.innerHTML = `Submit your calibration details directly to the Owner WhatsApp (<strong style="color:#25D366;">+91 99405 64261</strong>) for instant review and pricing.`;
      }
    }

    if (labData) {
      const notesEl = document.getElementById('quote-notes');
      if (notesEl && !notesEl.value && labData.scope) {
        notesEl.placeholder = `Requirements for ${labData.name}: e.g. ${labData.scope.substring(0, 90)}...`;
      }
      if (labData.onSite && !labData.labBased) {
        const siteRadio = document.querySelector('input[name="quote-mode"][value="On-Site Calibration at Client Plant"]');
        if (siteRadio) siteRadio.checked = true;
      } else if (!labData.onSite && labData.labBased) {
        const labRadio = document.querySelector('input[name="quote-mode"][value="Permanent Facility Lab-Based"]');
        if (labRadio) labRadio.checked = true;
      }
    }

    quoteModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeQuoteModal() {
    if (!quoteModal) return;
    quoteModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Handle Quote Form Submit -> Dispatch to Owner WhatsApp (9940564261)
  if (quoteForm) {
    quoteForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const name = document.getElementById('quote-name').value.trim();
      const company = document.getElementById('quote-company').value.trim();
      const email = document.getElementById('quote-email').value.trim();
      const phone = document.getElementById('quote-phone').value.trim();
      const serviceSelect = document.getElementById('quote-service-select');
      const service = serviceSelect ? (serviceSelect.options[serviceSelect.selectedIndex]?.text || serviceSelect.value) : '';
      const modeRadio = document.querySelector('input[name="quote-mode"]:checked');
      const mode = modeRadio ? modeRadio.value : 'Permanent Facility Lab';
      const notesEl = document.getElementById('quote-notes');
      const message = notesEl ? notesEl.value.trim() : '';

      if (!name || !email || !phone) {
        showToast('Please fill in all mandatory contact coordinates (Name, Email, Phone).');
        return;
      }

      // Submit to Supabase DB if configured
      if (window.SupabaseDB && window.SupabaseDB.isConfigured()) {
        try {
          await window.SupabaseDB.submitEnquiry({
            name,
            company,
            email,
            phone,
            message: `[Service: ${service}] [Mode: ${mode}] ${selectedQuoteFile ? '[Attached: ' + selectedQuoteFile.name + '] ' : ''}${message}`.trim()
          });
        } catch (err) {
          console.warn('[Supabase] Enquiry dispatch warning:', err);
        }
      }

      // Format WhatsApp Message to Owner (9940564261)
      let waText = `*NEW CALIBRATION QUOTATION REQUEST*\n` +
                  `━━━━━━━━━━━━━━━━━━━━\n` +
                  `👤 *Client Name:* ${name}\n` +
                  `🏢 *Company / Org:* ${company}\n` +
                  `📧 *Official Email:* ${email}\n` +
                  `📞 *Contact / WhatsApp:* ${phone}\n` +
                  `🔬 *Laboratory / Service:* ${service}\n` +
                  `📍 *Calibration Mode:* ${mode}\n`;

      if (message) {
        waText += `📝 *Scope Requirements & Notes:*\n${message}\n`;
      }

      if (selectedQuoteFile) {
        waText += `📎 *Attached Scope Document:* ${selectedQuoteFile.name} (${formatFileSize(selectedQuoteFile.size)})\n` +
                  `_(Kindly send this document in our chat after clicking send)_\n`;
      }

      waText += `━━━━━━━━━━━━━━━━━━━━\n` +
                `🌐 _Directed via Reva Phoenix Calibration Portal_`;

      const waUrl = `https://api.whatsapp.com/send?phone=${OWNER_WHATSAPP_NUMBER}&text=${encodeURIComponent(waText)}`;

      // Feedback to client
      showToast(`Quotation registered! Opening Owner WhatsApp (+91 99405 64261)...`);

      // Open Owner WhatsApp in new window/tab
      window.open(waUrl, '_blank');

      // Reset and close
      closeQuoteModal();
      quoteForm.reset();
      setFile(null);
    });
  }

  // Handle Inline Contact Form Submit -> Also route to Owner WhatsApp (9940564261)
  if (inlineContactForm) {
    inlineContactForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const name = document.getElementById('contact-name').value.trim();
      const company = document.getElementById('contact-company') ? document.getElementById('contact-company').value.trim() : '';
      const email = document.getElementById('contact-email').value.trim();
      const phone = document.getElementById('contact-phone').value.trim();
      const serviceSelect = document.getElementById('contact-service');
      const service = serviceSelect ? (serviceSelect.options[serviceSelect.selectedIndex]?.text || serviceSelect.value) : '';
      const messageEl = document.getElementById('contact-message');
      const message = messageEl ? messageEl.value.trim() : '';

      if (!name || !email || !phone) {
        showToast('Please provide your name, official email, and phone number.');
        return;
      }

      // Submit to Supabase DB if configured
      if (window.SupabaseDB && window.SupabaseDB.isConfigured()) {
        try {
          await window.SupabaseDB.submitEnquiry({
            name,
            company,
            email,
            phone,
            message: `[Service: ${service}] ${message}`.trim()
          });
        } catch (err) {
          console.warn('[Supabase] Enquiry dispatch warning:', err);
        }
      }

      let waText = `*NEW TECHNICAL ENQUIRY*\n` +
                  `━━━━━━━━━━━━━━━━━━━━\n` +
                  `👤 *Name:* ${name}\n` +
                  (company ? `🏢 *Company:* ${company}\n` : '') +
                  `📧 *Email:* ${email}\n` +
                  `📞 *Phone:* ${phone}\n` +
                  (service ? `🔬 *Discipline:* ${service}\n` : '') +
                  (message ? `📝 *Requirements:*\n${message}\n` : '') +
                  `━━━━━━━━━━━━━━━━━━━━\n` +
                  `🌐 _Directed via Reva Phoenix Calibration Portal_`;

      const waUrl = `https://api.whatsapp.com/send?phone=${OWNER_WHATSAPP_NUMBER}&text=${encodeURIComponent(waText)}`;

      showToast(`Thank you, ${name}. Directing your request to the Owner WhatsApp (+91 99405 64261)...`);
      window.open(waUrl, '_blank');

      inlineContactForm.reset();
    });
  }

  // Delegated listener for buttons with data-open-quote (works for dynamic and static elements)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open-quote]');
    if (btn) {
      e.preventDefault();
      const service = btn.getAttribute('data-open-quote') || '';
      openQuoteModal(service);
    }
  });

  if (quoteModalClose) {
    quoteModalClose.addEventListener('click', closeQuoteModal);
  }

  if (quoteModal) {
    quoteModal.addEventListener('click', (e) => {
      if (e.target === quoteModal) closeQuoteModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && quoteModal && quoteModal.classList.contains('active')) {
      closeQuoteModal();
    }
  });

  // Global helper exports
  window.openQuoteModal = openQuoteModal;
  window.showToastNotice = showToast;
})();
