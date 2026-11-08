/* ==========================================================================
   TRAINING & CONSULTANCY SCRIPT — REVA PHOENIX CALIBRATION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  // 1. Sticky Subnav Active Pill Tracking on Scroll
  const pills = document.querySelectorAll('.training-pill');
  const sections = document.querySelectorAll('.training-section, .training-hero');

  function updateActivePill() {
    let currentId = '';
    const scrollPos = window.scrollY + 180;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    if (currentId) {
      pills.forEach(pill => {
        const href = pill.getAttribute('href');
        if (href === '#' + currentId) {
          pill.classList.add('active');
        } else {
          pill.classList.remove('active');
        }
      });
    }
  }

  window.addEventListener('scroll', updateActivePill, { passive: true });

  // 2. Training Quote Dispatcher
  window.selectTrainingProgram = function (programName) {
    const quoteModal = document.getElementById('quote-modal');
    if (quoteModal) {
      const serviceSelect = document.getElementById('quote-service-select');
      if (serviceSelect && programName) {
        for (let i = 0; i < serviceSelect.options.length; i++) {
          if (serviceSelect.options[i].text.toLowerCase().includes(programName.toLowerCase()) || 
              serviceSelect.options[i].value.toLowerCase().includes(programName.toLowerCase())) {
            serviceSelect.selectedIndex = i;
            break;
          }
        }
      }
      quoteModal.classList.add('open');
      quoteModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.submitTrainingEnquiry = function (channel) {
    const name = document.getElementById('enroll-name')?.value.trim();
    const email = document.getElementById('enroll-email')?.value.trim();
    const phone = document.getElementById('enroll-phone')?.value.trim();
    const company = document.getElementById('enroll-company')?.value.trim() || 'Individual';
    const program = document.getElementById('enroll-program')?.value || 'General Training Enquiry';
    const participants = document.getElementById('enroll-participants')?.value || '1';
    const mode = document.getElementById('enroll-mode')?.value || 'Classroom @ Reva Phoenix Complex';
    const notes = document.getElementById('enroll-notes')?.value.trim() || 'N/A';

    if (!name || !email || !phone) {
      showToast('Please provide your Name, Email, and Phone Number.');
      return;
    }

    const formattedSummary = 
      `REVA PHOENIX TRAINING & CONSULTANCY ENROLLMENT\n` +
      `====================================================\n\n` +
      `Candidate / Contact : ${name}\n` +
      `Company / Institute : ${company}\n` +
      `Official Email      : ${email}\n` +
      `Phone Number        : ${phone}\n` +
      `Selected Program    : ${program}\n` +
      `No. of Participants : ${participants}\n` +
      `Preferred Mode      : ${mode}\n` +
      `Specific Needs      : ${notes}\n\n` +
      `====================================================\n` +
      `Submitted via: Reva Phoenix Training Portal (revacalibration.com/training.html)\n` +
      `Direct Email: enquiry@revaphoenix.com\n` +
      `Direct Phone: +91 98406 72352 / +91 99405 64261`;

    if (channel === 'whatsapp') {
      const waUrl = 'https://wa.me/919940564261?text=' + encodeURIComponent(formattedSummary);
      window.open(waUrl, '_blank');
      showToast('Redirecting to WhatsApp for instant training registration...');
    } else {
      const mailtoUrl = 'mailto:enquiry@revaphoenix.com?subject=' + 
        encodeURIComponent(`Training Enrollment: ${program} - ${name} (${company})`) + 
        '&body=' + encodeURIComponent(formattedSummary);
      window.location.href = mailtoUrl;
      showToast('Opening default email client to send training registration...');
    }
  };

  // Toast Helper
  function showToast(msg) {
    const toast = document.getElementById('toast-notice');
    const toastMsg = document.getElementById('toast-message');
    if (toast && toastMsg) {
      toastMsg.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 4000);
    } else {
      alert(msg);
    }
  }
});
