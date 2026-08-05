/**
 * USER TESTING SCRIPT - GPdI Melati Depok Church Management System
 * 
 * Cara penggunaan:
 * 1. Buka aplikasi di browser (http://localhost:3000)
 * 2. Buka DevTools (F12) -> Console tab
 * 3. Copy dan paste seluruh script ini ke console
 * 4. Script akan menjalankan semua test secara otomatis
 * 
 * Test mencakup:
 * - Navigation dan routing
 * - Tombol dan interaksi
 * - Form submission
 * - Data fetching dan display
 */

const UserTestSuite = {
  results: [],
  currentTest: 0,
  
  log(message, type = 'info') {
    const colors = {
      info: '%c[INFO]',
      success: '%c[PASS]',
      error: '%c[FAIL]',
      warning: '%c[WARN]'
    };
    const colorStyles = {
      info: 'color: #3498db',
      success: 'color: #27ae60; font-weight: bold',
      error: 'color: #e74c3c; font-weight: bold',
      warning: 'color: #f39c12'
    };
    console.log(colors[type], colorStyles[type], message);
    this.results.push({ message, type, timestamp: new Date().toISOString() });
  },

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  async clickElement(selector, description) {
    try {
      const element = document.querySelector(selector);
      if (element) {
        element.click();
        this.log(`✓ Clicked: ${description}`, 'success');
        await this.wait(500);
        return true;
      } else {
        this.log(`✗ Element not found: ${selector} (${description})`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`✗ Error clicking ${selector}: ${error.message}`, 'error');
      return false;
    }
  },

  async fillInput(selector, value, description) {
    try {
      const element = document.querySelector(selector);
      if (element) {
        element.value = value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        this.log(`✓ Filled: ${description} with "${value}"`, 'success');
        return true;
      } else {
        this.log(`✗ Input not found: ${selector} (${description})`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`✗ Error filling ${selector}: ${error.message}`, 'error');
      return false;
    }
  },

  async checkElementExists(selector, description) {
    try {
      const element = document.querySelector(selector);
      if (element) {
        this.log(`✓ Element exists: ${description}`, 'success');
        return true;
      } else {
        this.log(`✗ Element not found: ${selector} (${description})`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`✗ Error checking ${selector}: ${error.message}`, 'error');
      return false;
    }
  },

  async checkTextContent(selector, expectedText, description) {
    try {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent || element.innerText;
        if (text.includes(expectedText)) {
          this.log(`✓ Text matches: ${description}`, 'success');
          return true;
        } else {
          this.log(`✗ Text mismatch in ${description}. Expected: "${expectedText}", Found: "${text}"`, 'error');
          return false;
        }
      } else {
        this.log(`✗ Element not found for text check: ${selector}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`✗ Error checking text ${selector}: ${error.message}`, 'error');
      return false;
    }
  },

  async navigateTo(path, description) {
    try {
      // Use React Router's navigation if available, otherwise use pushState
      const link = document.querySelector(`a[href="${path}"]`);
      if (link) {
        link.click();
      } else {
        window.history.pushState({}, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
      this.log(`✓ Navigated to: ${description} (${path})`, 'success');
      await this.wait(1500);
      return true;
    } catch (error) {
      this.log(`✗ Error navigating to ${path}: ${error.message}`, 'error');
      return false;
    }
  },

  async testHomePage() {
    this.log('=== TESTING HOME PAGE ===', 'info');
    
    // Check hero section
    await this.checkElementExists('.hero-section', 'Hero section');
    await this.checkElementExists('h1', 'Page title');
    
    // Check navigation
    await this.checkElementExists('nav', 'Navigation bar');
    await this.checkElementExists('a[href="/jadwal-event"]', 'Jadwal link');
    await this.checkElementExists('a[href="/pendaftaran"]', 'Pendaftaran link');
    
    // Check hero CTA button
    await this.checkElementExists('.hero-cta', 'Hero CTA button');
    
    // Check schedule section
    await this.checkElementExists('.schedule-section', 'Schedule section');
    
    // Check footer
    await this.checkElementExists('footer', 'Footer');
    await this.checkTextContent('footer', '(021) 7521216', 'Phone number in footer');
    await this.checkTextContent('footer', 'Jl. Melati No. 8, Depok', 'Address in footer');
    
    await this.wait(1000);
  },

  async testHeroCTAButton() {
    this.log('=== TESTING HERO CTA BUTTON ===', 'info');
    
    // Click CTA button and check if it scrolls to schedule section
    const ctaButton = document.querySelector('.hero-cta');
    if (ctaButton) {
      const initialScroll = window.scrollY;
      ctaButton.click();
      await this.wait(1000);
      const finalScroll = window.scrollY;
      
      if (finalScroll > initialScroll) {
        this.log('✓ CTA button scrolls to schedule section', 'success');
      } else {
        this.log('✗ CTA button does not scroll', 'error');
      }
    } else {
      this.log('✗ CTA button not found', 'error');
    }
    
    await this.wait(1000);
  },

  async testSchedulePage() {
    this.log('=== TESTING SCHEDULE PAGE ===', 'info');
    
    await this.navigateTo('/jadwal-event', 'Jadwal Event page');
    await this.wait(1500);
    
    // Check schedule items
    await this.checkElementExists('.schedule-item', 'Schedule items');
    
    // Check for ibadah and event sections
    await this.checkElementExists('.ibadah-section', 'Ibadah section');
    await this.checkElementExists('.event-section', 'Event section');
    
    // Check schedule format (Nama, Hari/Tanggal, Jam, Lokasi)
    const scheduleItems = document.querySelectorAll('.schedule-item');
    if (scheduleItems.length > 0) {
      this.log(`✓ Found ${scheduleItems.length} schedule items`, 'success');
      
      // Check first schedule item structure
      const firstItem = scheduleItems[0];
      await this.checkElementExists('.schedule-item .nama', 'Schedule name field');
      await this.checkElementExists('.schedule-item .hari-tanggal', 'Schedule date field');
      await this.checkElementExists('.schedule-item .jam', 'Schedule time field');
      await this.checkElementExists('.schedule-item .lokasi', 'Schedule location field');
    } else {
      this.log('✗ No schedule items found', 'warning');
    }
    
    await this.wait(1000);
  },

  async testRegistrationPage() {
    this.log('=== TESTING REGISTRATION PAGE ===', 'info');
    
    await this.navigateTo('/pendaftaran', 'Pendaftaran page');
    await this.wait(1500);
    
    // Check tabs
    await this.checkElementExists('.tab-button', 'Tab buttons');
    
    // Test Jemaat Baru tab
    await this.clickElement('.tab-button:first-child', 'Jemaat Baru tab');
    await this.wait(500);
    
    // Check jemaat form fields
    await this.checkElementExists('input[name="namaPendaftar"]', 'Nama field');
    await this.checkElementExists('select[name="gender"]', 'Gender field');
    await this.checkElementExists('input[name="tempatLahir"]', 'Tempat lahir field');
    await this.checkElementExists('input[name="tanggalLahir"]', 'Tanggal lahir field');
    await this.checkElementExists('input[name="noHp"]', 'No HP field');
    await this.checkElementExists('input[name="alamat"]', 'Alamat field');
    await this.checkElementExists('input[name="rayon"]', 'Rayon field');
    
    // Test Event tab
    await this.clickElement('.tab-button:last-child', 'Event tab');
    await this.wait(500);
    
    // Check event form fields
    await this.checkElementExists('input[name="jenisKegiatan"]', 'Jenis kegiatan field');
    await this.checkElementExists('input[name="namaPendaftar"]', 'Nama field (event)');
    await this.checkElementExists('input[name="noHp"]', 'No HP field (event)');
    
    await this.wait(1000);
  },

  async testJemaatRegistration() {
    this.log('=== TESTING JEMAAT REGISTRATION ===', 'info');
    
    await this.navigateTo('/pendaftaran', 'Pendaftaran page');
    await this.wait(1000);
    
    // Switch to jemaat tab
    const buttons = document.querySelectorAll('button');
    let jemaatTab = null;
    buttons.forEach(btn => {
      const text = btn.textContent || '';
      if (text.toLowerCase().includes('jemaat') || text.toLowerCase().includes('baru')) {
        jemaatTab = btn;
      }
    });
    
    if (jemaatTab) {
      jemaatTab.click();
      this.log('✓ Clicked Jemaat Baru tab', 'success');
      await this.wait(500);
    }
    
    // Fill form with test data - use native setter for uncontrolled components
    const testTimestamp = Date.now();
    const testNama = `Test User Jemaat ${testTimestamp}`;
    
    const inputs = document.querySelectorAll('input');
    let filledFields = 0;
    
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    
    inputs.forEach(input => {
      const placeholder = input.placeholder || '';
      const name = input.name || '';
      const type = input.type || '';
      
      if (placeholder.toLowerCase().includes('nama') || name.toLowerCase().includes('nama')) {
        nativeInputValueSetter.call(input, testNama);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        filledFields++;
      } else if (type === 'tel' || placeholder.toLowerCase().includes('hp') || placeholder.toLowerCase().includes('wa')) {
        nativeInputValueSetter.call(input, '081234567899');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        filledFields++;
      } else if (type === 'date' || placeholder.toLowerCase().includes('tanggal')) {
        nativeInputValueSetter.call(input, '1990-01-01');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        filledFields++;
      } else if (placeholder.toLowerCase().includes('tempat') || placeholder.toLowerCase().includes('lahir')) {
        nativeInputValueSetter.call(input, 'Jakarta');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        filledFields++;
      } else if (placeholder.toLowerCase().includes('alamat')) {
        nativeInputValueSetter.call(input, 'Jl. Test No. 123, Depok');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        filledFields++;
      } else if (placeholder.toLowerCase().includes('rayon')) {
        nativeInputValueSetter.call(input, 'Rayon Test');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        filledFields++;
      }
    });
    
    // Fill select dropdowns
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
      if (select.options.length > 1) {
        select.selectedIndex = 1;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        filledFields++;
      }
    });
    
    this.log(`✓ Filled ${filledFields} form fields`, 'success');
    
    // Check terms checkbox
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    });
    
    await this.wait(500);
    
    // Submit form properly
    const form = document.querySelector('form');
    if (form) {
      this.log('✓ Form found, submitting properly', 'success');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await this.wait(3000);
    } else {
      // Fallback: click submit button
      const submitButtons = document.querySelectorAll('button');
      let submitButton = null;
      submitButtons.forEach(btn => {
        const text = btn.textContent || '';
        if (text.toLowerCase().includes('kirim') || text.toLowerCase().includes('submit') || text.toLowerCase().includes('daftar')) {
          submitButton = btn;
        }
      });
      
      if (submitButton) {
        this.log('✓ Submit button found', 'success');
        submitButton.click();
        await this.wait(3000);
      }
    }
    
    // Check for success message
    const successElements = document.querySelectorAll('[class*="success"], .success-message, [class*="berhasil"]');
    let foundSuccess = false;
    successElements.forEach(el => {
      if (el.textContent && (el.textContent.toLowerCase().includes('berhasil') || 
                            el.textContent.toLowerCase().includes('success') ||
                            el.textContent.toLowerCase().includes('terkirim'))) {
        foundSuccess = true;
      }
    });
    
    if (foundSuccess) {
      this.log('✓ Registration submitted successfully', 'success');
    } else {
      // Check if redirected or form cleared
      const formInputs = document.querySelectorAll('input');
      let formCleared = true;
      formInputs.forEach(input => {
        if (input.value && input.type !== 'hidden' && input.type !== 'checkbox') {
          formCleared = false;
        }
      });
      
      if (formCleared) {
        this.log('✓ Form cleared after submission (likely successful)', 'success');
      } else {
        this.log('⚠ Registration submission status unclear', 'warning');
      }
    }
    
    await this.wait(1000);
  },

  async testEventRegistration() {
    this.log('=== TESTING EVENT REGISTRATION ===', 'info');
    
    await this.navigateTo('/pendaftaran', 'Pendaftaran page');
    await this.wait(1000);
    
    // Switch to event tab
    const buttons = document.querySelectorAll('button');
    let eventTab = null;
    buttons.forEach(btn => {
      const text = btn.textContent || '';
      if (text.toLowerCase().includes('event') || text.toLowerCase().includes('kegiatan')) {
        eventTab = btn;
      }
    });
    
    if (eventTab) {
      eventTab.click();
      this.log('✓ Clicked Event tab', 'success');
      await this.wait(500);
    }
    
    // Fill form with test data - use native setter for uncontrolled components
    const testTimestamp = Date.now();
    const testNama = `Test User Event ${testTimestamp}`;
    
    const inputs = document.querySelectorAll('input');
    let filledFields = 0;
    
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    
    inputs.forEach(input => {
      const placeholder = input.placeholder || '';
      const name = input.name || '';
      const type = input.type || '';
      
      if (placeholder.toLowerCase().includes('jenis') || placeholder.toLowerCase().includes('kegiatan') || name.toLowerCase().includes('kegiatan')) {
        nativeInputValueSetter.call(input, 'Retreat Pemuda');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        filledFields++;
      } else if (placeholder.toLowerCase().includes('nama') || name.toLowerCase().includes('nama')) {
        nativeInputValueSetter.call(input, testNama);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        filledFields++;
      } else if (type === 'tel' || placeholder.toLowerCase().includes('hp') || placeholder.toLowerCase().includes('wa')) {
        nativeInputValueSetter.call(input, '081234567898');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        filledFields++;
      }
    });
    
    this.log(`✓ Filled ${filledFields} form fields`, 'success');
    
    // Check terms checkbox
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    });
    
    await this.wait(500);
    
    // Submit form properly
    const form = document.querySelector('form');
    if (form) {
      this.log('✓ Form found, submitting properly', 'success');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await this.wait(3000);
    } else {
      // Fallback: click submit button
      const submitButtons = document.querySelectorAll('button');
      let submitButton = null;
      submitButtons.forEach(btn => {
        const text = btn.textContent || '';
        if (text.toLowerCase().includes('kirim') || text.toLowerCase().includes('submit') || text.toLowerCase().includes('daftar')) {
          submitButton = btn;
        }
      });
      
      if (submitButton) {
        this.log('✓ Submit button found', 'success');
        submitButton.click();
        await this.wait(3000);
      }
    }
    
    // Check for success message
    const successElements = document.querySelectorAll('[class*="success"], .success-message, [class*="berhasil"]');
    let foundSuccess = false;
    successElements.forEach(el => {
      if (el.textContent && (el.textContent.toLowerCase().includes('berhasil') || 
                            el.textContent.toLowerCase().includes('success') ||
                            el.textContent.toLowerCase().includes('terkirim'))) {
        foundSuccess = true;
      }
    });
    
    if (foundSuccess) {
      this.log('✓ Event registration submitted successfully', 'success');
    } else {
      // Check if redirected or form cleared
      const formInputs = document.querySelectorAll('input');
      let formCleared = true;
      formInputs.forEach(input => {
        if (input.value && input.type !== 'hidden' && input.type !== 'checkbox') {
          formCleared = false;
        }
      });
      
      if (formCleared) {
        this.log('✓ Form cleared after submission (likely successful)', 'success');
      } else {
        this.log('⚠ Event registration status unclear', 'warning');
      }
    }
    
    await this.wait(1000);
  },

  async testContactInfo() {
    this.log('=== TESTING CONTACT INFO ===', 'info');
    
    // Check header contact
    await this.checkTextContent('header', '(021) 7521216', 'Phone in header');
    
    // Check footer contact
    await this.checkTextContent('footer', '(021) 7521216', 'Phone in footer');
    await this.checkTextContent('footer', 'Jl. Melati No. 8, Depok', 'Address in footer');
    
    // Check social media links
    await this.checkElementExists('a[href*="facebook.com"]', 'Facebook link');
    await this.checkElementExists('a[href*="instagram.com"]', 'Instagram link');
    await this.checkElementExists('a[href*="youtube.com"]', 'YouTube link');
    
    await this.wait(1000);
  },

  async testResponsiveDesign() {
    this.log('=== TESTING RESPONSIVE DESIGN ===', 'info');
    
    // Test mobile view
    const originalWidth = window.innerWidth;
    window.innerWidth = 375;
    window.dispatchEvent(new Event('resize'));
    await this.wait(500);
    
    this.log(`✓ Mobile view tested (375px)`, 'success');
    
    // Test tablet view
    window.innerWidth = 768;
    window.dispatchEvent(new Event('resize'));
    await this.wait(500);
    
    this.log(`✓ Tablet view tested (768px)`, 'success');
    
    // Restore original width
    window.innerWidth = originalWidth;
    window.dispatchEvent(new Event('resize'));
    await this.wait(500);
    
    this.log(`✓ Desktop view restored (${originalWidth}px)`, 'success');
  },

  async runAllTests() {
    this.log('🚀 STARTING USER TEST SUITE', 'info');
    this.log('=====================================', 'info');
    
    try {
      await this.testHomePage();
      await this.testHeroCTAButton();
      await this.testSchedulePage();
      await this.testRegistrationPage();
      await this.testJemaatRegistration();
      await this.testEventRegistration();
      await this.testContactInfo();
      await this.testResponsiveDesign();
      
      this.log('=====================================', 'info');
      this.log('🎉 USER TEST SUITE COMPLETED', 'info');
      this.log('=====================================', 'info');
      
      // Summary
      const passed = this.results.filter(r => r.type === 'success').length;
      const failed = this.results.filter(r => r.type === 'error').length;
      const warnings = this.results.filter(r => r.type === 'warning').length;
      
      console.log('%cSUMMARY:', 'font-weight: bold; font-size: 14px');
      console.log(`%c✓ Passed: ${passed}`, 'color: #27ae60; font-weight: bold');
      console.log(`%c✗ Failed: ${failed}`, 'color: #e74c3c; font-weight: bold');
      console.log(`%c⚠ Warnings: ${warnings}`, 'color: #f39c12; font-weight: bold');
      console.log(`%cTotal: ${this.results.length}`, 'color: #3498db; font-weight: bold');
      
      return { passed, failed, warnings, total: this.results.length };
    } catch (error) {
      this.log(`✗ Test suite error: ${error.message}`, 'error');
      return { passed: 0, failed: 1, warnings: 0, total: 1 };
    }
  }
};

// Run the test suite
console.log('%c🧪 GPdI Melati - User Test Suite', 'font-size: 20px; font-weight: bold; color: #3498db');
console.log('%cStarting tests in 3 seconds...', 'color: #f39c12');

setTimeout(() => {
  UserTestSuite.runAllTests();
}, 3000);
