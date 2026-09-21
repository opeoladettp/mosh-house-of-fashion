/**
 * MOSH HOUSE OF FASHION - JAVASCRIPT CONTROLLER
 * Author: Adekunle Olalekan Moshood Brand Portal
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 0. Dynamic Navbar Height → CSS Variable ---
  const navbar = document.getElementById('navbar');

  function syncNavbarHeight() {
    if (!navbar) return;
    const h = navbar.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--navbar-h', `${h}px`);
  }

  syncNavbarHeight();
  window.addEventListener('resize', syncNavbarHeight);
  // Also re-sync after fonts load to account for layout shift
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncNavbarHeight);
  }

  // --- 1. Sticky Navigation & Scroll State ---
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active link highlighting on scroll
    let scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });

  // --- 2. Mobile Navigation Toggle ---
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navLinks');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = mobileToggle.querySelector('.material-symbols-outlined');
      if (navMenu.classList.contains('active')) {
        icon.textContent = 'close';
      } else {
        icon.textContent = 'menu';
      }
    });

    // Close mobile menu when clicking any nav link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const icon = mobileToggle.querySelector('.material-symbols-outlined');
        if (icon) icon.textContent = 'menu';
      });
    });
  }

  // --- 3. Collection Filter Tabs ---
  const filterBtns = document.querySelectorAll('.filter-btn');
  const lookbookItems = document.querySelectorAll('.lookbook-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      lookbookItems.forEach(item => {
        if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
          item.style.display = 'flex';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'translateY(20px)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 250);
        }
      });
    });
  });

  // --- 4. Interactive Bespoke Consultation Form & Modal ---
  const contactForm = document.getElementById('bespokeConsultationForm');
  const successModal = document.getElementById('successModal');
  const closeModalBtn = document.getElementById('closeModalBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Form validation
      const name = document.getElementById('clientName').value.trim();
      const email = document.getElementById('clientEmail').value.trim();
      const phone = document.getElementById('clientPhone').value.trim();
      const garmentType = document.getElementById('garmentType').value;
      const notes = document.getElementById('clientNotes').value.trim();

      if (!name || !email || !garmentType) {
        alert('Please provide your name, valid email address, and desired garment type.');
        return;
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.innerHTML = '<span class="material-symbols-outlined" style="animation: spin 1s linear infinite;">sync</span> Processing Request...';
      submitBtn.disabled = true;

      // Collect optional fields for the message body
      const fittingLocation = document.getElementById('fittingLocation')?.value || '';
      const fittingTimeline = document.getElementById('fittingTimeline')?.value || '';

      // Build a rich message body; extra fields are forwarded by FormSend as extra rows
      const messageBody = [
        notes && `Design Preferences / Notes:\n${notes}`,
        fittingLocation && `Preferred Fitting Location: ${fittingLocation}`,
        fittingTimeline && `Target Completion Date: ${fittingTimeline}`,
      ].filter(Boolean).join('\n\n') || '(No additional notes provided.)';

      fetch('https://api.formsend.ezeroandone.io/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: '5c8dff6384fbae96286bd4d378eea30eb3efac3b7df49a30160c6d3d5e85eb03',
          name,
          email,
          subject: `Bespoke Consultation Request — ${garmentType}`,
          message: messageBody,
          // Extra fields forwarded as additional rows in the notification email
          phone: phone || undefined,
          garment_commission: garmentType,
          fitting_location: fittingLocation || undefined,
          target_completion: fittingTimeline || undefined,
        }),
      })
        .then(res => res.json())
        .then(data => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;

          if (data.success) {
            contactForm.reset();

            // Populate client name in confirmation modal
            const clientSpan = document.getElementById('modalClientName');
            if (clientSpan) clientSpan.textContent = name;

            // Open Success Modal
            if (successModal) {
              successModal.classList.add('active');
            }
          } else {
            alert(`Submission error: ${data.message || 'Please try again.'}`);
          }
        })
        .catch(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          alert('A network error occurred. Please check your connection and try again.');
        });
    });
  }

  if (closeModalBtn && successModal) {
    closeModalBtn.addEventListener('click', () => {
      successModal.classList.remove('active');
    });

    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) {
        successModal.classList.remove('active');
      }
    });
  }
});
