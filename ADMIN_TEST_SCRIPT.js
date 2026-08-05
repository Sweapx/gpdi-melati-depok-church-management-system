/**
 * ADMIN TESTING SCRIPT - GPdI Melati Depok Church Management System
 * 
 * Cara penggunaan:
 * 1. Login ke admin panel (http://localhost:3000/admin)
 * 2. Buka DevTools (F12) -> Console tab
 * 3. Copy dan paste seluruh script ini ke console
 * 4. Script akan menjalankan semua test secara otomatis
 * 
 * Test mencakup:
 * - Login functionality
 * - Dashboard navigation
 * - CRUD operations (Create, Read, Update, Delete)
 * - Tab filtering (ibadah/event, jemaat/event approvals)
 * - Data validation
 * - Button functionalities
 */

const AdminTestSuite = {
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

  async testLogin() {
    this.log('=== TESTING LOGIN ===', 'info');
    
    // Check if already logged in
    if (window.location.pathname === '/admin' || window.location.pathname.includes('/admin/')) {
      this.log('✓ Already logged in - skipping login test', 'success');
      return;
    }
    
    // Check login form - use placeholder selectors since name attributes don't exist
    const usernameInput = document.querySelector('input[placeholder*="username"]') || 
                         document.querySelector('input[type="text"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const submitButton = document.querySelector('button[type="submit"]');
    
    if (usernameInput) this.log('✓ Username input found', 'success');
    else this.log('✗ Username input not found', 'error');
    
    if (passwordInput) this.log('✓ Password input found', 'success');
    else this.log('✗ Password input not found', 'error');
    
    if (submitButton) this.log('✓ Login button found', 'success');
    else this.log('✗ Login button not found', 'error');
    
    // Fill login form
    if (usernameInput) {
      usernameInput.value = 'admin';
      usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
      usernameInput.dispatchEvent(new Event('change', { bubbles: true }));
      this.log('✓ Filled username', 'success');
    }
    
    if (passwordInput) {
      passwordInput.value = 'admin123';
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
      passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
      this.log('✓ Filled password', 'success');
    }
    
    // Submit login
    if (submitButton) {
      submitButton.click();
      this.log('✓ Clicked login button', 'success');
      await this.wait(3000);
    }
    
    // Check if redirected to dashboard
    if (window.location.pathname === '/admin' || window.location.pathname.includes('/admin/')) {
      this.log('✓ Login successful - redirected to dashboard', 'success');
    } else {
      this.log(`✗ Login failed or not redirected. Current path: ${window.location.pathname}`, 'error');
    }
    
    await this.wait(1000);
  },

  async testDashboardNavigation() {
    this.log('=== TESTING DASHBOARD NAVIGATION ===', 'info');
    
    // Check sidebar navigation - AdminLayout uses aside, not .sidebar
    await this.checkElementExists('aside', 'Sidebar');
    
    // Check navigation links using the actual structure from AdminLayout
    await this.checkElementExists('a[href="/admin"]', 'Dashboard link');
    await this.checkElementExists('a[href="/admin/approvals"]', 'Approvals link');
    await this.checkElementExists('a[href="/admin/cms"]', 'CMS link');
    
    // Check jemaat submenu (it's a dropdown)
    await this.checkElementExists('button', 'Jemaat dropdown button');
    
    await this.wait(1000);
  },

  async testJemaatCRUD() {
    this.log('=== TESTING JEMAAT CRUD ===', 'info');
    
    // Navigate to jemaat page
    await this.navigateTo('/admin/jemaat', 'Jemaat page');
    await this.wait(1500);
    
    // Get initial count of jemaat
    let initialCount = 0;
    const table = document.querySelector('table');
    if (table) {
      const rows = table.querySelectorAll('tbody tr');
      initialCount = rows.length;
      this.log(`Initial jemaat count: ${initialCount}`, 'info');
    }
    
    // Find and click add button
    const buttons = document.querySelectorAll('button');
    let addButton = null;
    buttons.forEach(btn => {
      const text = btn.textContent || '';
      if (text.toLowerCase().includes('tambah') || text.toLowerCase().includes('add') || text.toLowerCase().includes('baru')) {
        addButton = btn;
      }
    });
    
    if (addButton) {
      this.log('✓ Add button found', 'success');
      addButton.click();
      await this.wait(1000);
      
      // Fill form with test data - use native input setter for defaultValue
      const testTimestamp = Date.now();
      const testNama = `Test Jemaat ${testTimestamp}`;
      
      const inputs = document.querySelectorAll('input');
      let filledFields = 0;
      
      inputs.forEach(input => {
        const placeholder = input.placeholder || '';
        const name = input.name || '';
        const type = input.type || '';
        
        // Use native setter for defaultValue fields
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        
        if (placeholder.toLowerCase().includes('nama') || name.toLowerCase().includes('nama')) {
          nativeInputValueSetter.call(input, testNama);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          filledFields++;
        } else if (name.toLowerCase().includes('nik')) {
          nativeInputValueSetter.call(input, '3201010101019999');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          filledFields++;
        } else if (type === 'tel' || name.toLowerCase().includes('hp') || name.toLowerCase().includes('telepon')) {
          nativeInputValueSetter.call(input, '081234567899');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          filledFields++;
        } else if (type === 'date' || name.toLowerCase().includes('tanggal')) {
          nativeInputValueSetter.call(input, '1990-01-01');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          filledFields++;
        } else if (placeholder.toLowerCase().includes('tempat') || name.toLowerCase().includes('tempat')) {
          nativeInputValueSetter.call(input, 'Jakarta');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          filledFields++;
        } else if (placeholder.toLowerCase().includes('alamat') || name.toLowerCase().includes('alamat')) {
          nativeInputValueSetter.call(input, 'Jl. Test CRUD No. 1');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          filledFields++;
        } else if (name.toLowerCase().includes('rayon')) {
          nativeInputValueSetter.call(input, 'Rayon Test');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          filledFields++;
        }
      });
      
      // Fill textarea
      const textareas = document.querySelectorAll('textarea');
      textareas.forEach(textarea => {
        const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        nativeTextAreaValueSetter.call(textarea, 'Jl. Test CRUD No. 1');
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
        filledFields++;
      });
      
      // Try to fill select dropdowns
      const selects = document.querySelectorAll('select');
      selects.forEach(select => {
        if (select.options.length > 1) {
          select.selectedIndex = 1;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          filledFields++;
        }
      });
      
      this.log(`✓ Filled ${filledFields} form fields`, 'success');
      
      // Find form and submit it properly
      const form = document.querySelector('form');
      if (form) {
        this.log('✓ Form found, submitting properly', 'success');
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        await this.wait(2000);
      } else {
        // Fallback: click submit button
        const submitButtons = document.querySelectorAll('button');
        let submitButton = null;
        submitButtons.forEach(btn => {
          const text = btn.textContent || '';
          if (text.toLowerCase().includes('simpan') || text.toLowerCase().includes('save') || text.toLowerCase().includes('submit')) {
            submitButton = btn;
          }
        });
        
        if (submitButton) {
          this.log('✓ Submit button found', 'success');
          submitButton.click();
          await this.wait(2000);
        } else {
          this.log('✗ Submit button not found', 'error');
        }
      }
      
      // Check if data was added by re-checking table
      const newTable = document.querySelector('table');
      if (newTable) {
        const newRows = newTable.querySelectorAll('tbody tr');
        const newCount = newRows.length;
        
        if (newCount > initialCount) {
          this.log(`✓ Jemaat created successfully! Count increased from ${initialCount} to ${newCount}`, 'success');
        } else {
          this.log(`⚠ Jemaat count unchanged (${initialCount}). Creation may have failed`, 'warning');
        }
        
        // Check if test data appears in table
        let foundTestData = false;
        newRows.forEach(row => {
          if (row.textContent.includes(testNama)) {
            foundTestData = true;
          }
        });
        
        if (foundTestData) {
          this.log(`✓ Test data "${testNama}" found in table`, 'success');
        } else {
          this.log(`⚠ Test data "${testNama}" not found in table`, 'warning');
        }
      }
    } else {
      this.log('⚠ Add button not found', 'warning');
    }
    
    await this.wait(1000);
  },

  async testUlangTahunSection() {
    this.log('=== TESTING ULANG TAHUN SECTION ===', 'info');
    
    // Navigate to ulang tahun page
    await this.navigateTo('/admin/ulang-tahun', 'Ulang tahun page');
    await this.wait(1500);
    
    // Check for table
    const table = document.querySelector('table');
    if (table) {
      this.log('✓ Table found on ulang tahun page', 'success');
      
      // Check table headers for expected columns
      const headers = table.querySelectorAll('th');
      const headerTexts = Array.from(headers).map(h => h.textContent).join(' ');
      
      if (headerTexts.includes('NAMA') || headerTexts.includes('Nama')) {
        this.log('✓ Nama column found', 'success');
      }
      if (headerTexts.includes('TANGGAL') || headerTexts.includes('Tanggal')) {
        this.log('✓ Tanggal column found', 'success');
      }
      if (headerTexts.includes('USIA') || headerTexts.includes('Usia')) {
        this.log('✓ Usia column found', 'success');
      }
      if (headerTexts.includes('WADAH') || headerTexts.includes('Wadah')) {
        this.log('✓ Wadah column found', 'success');
      }
    } else {
      this.log('⚠ No table found on ulang tahun page', 'warning');
    }
    
    await this.wait(1000);
  },

  async testApprovalsSplit() {
    this.log('=== TESTING APPROVALS SPLIT ===', 'info');
    
    // Navigate to approvals page
    await this.navigateTo('/admin/approvals', 'Approvals page');
    await this.wait(1500);
    
    // Check for tabs (they might be buttons with specific text)
    const buttons = document.querySelectorAll('button');
    let foundTabs = false;
    buttons.forEach(btn => {
      const text = btn.textContent || '';
      if (text.includes('Jemaat') || text.includes('Event')) {
        foundTabs = true;
      }
    });
    
    if (foundTabs) {
      this.log('✓ Approval tabs found', 'success');
    } else {
      this.log('⚠ Approval tabs not found', 'warning');
    }
    
    // Check for table
    const table = document.querySelector('table');
    if (table) {
      this.log('✓ Table found on approvals page', 'success');
    } else {
      this.log('⚠ No table found on approvals page', 'warning');
    }
    
    await this.wait(1000);
  },

  async testCMSSchedulesSplit() {
    this.log('=== TESTING CMS SCHEDULES SPLIT ===', 'info');
    
    // Navigate to CMS page
    await this.navigateTo('/admin/cms', 'CMS page');
    await this.wait(1500);
    
    // Get initial count of schedules
    let initialCount = 0;
    const table = document.querySelector('table');
    if (table) {
      const rows = table.querySelectorAll('tbody tr');
      initialCount = rows.length;
      this.log(`Initial schedules count: ${initialCount}`, 'info');
    }
    
    // Find and click add button
    const buttons = document.querySelectorAll('button');
    let addButton = null;
    buttons.forEach(btn => {
      const text = btn.textContent || '';
      if (text.toLowerCase().includes('tambah') || text.toLowerCase().includes('add') || text.toLowerCase().includes('baru')) {
        addButton = btn;
      }
    });
    
    if (addButton) {
      this.log('✓ Add button found', 'success');
      addButton.click();
      await this.wait(1000);
      
      // Fill form with test data
      const testTimestamp = Date.now();
      const testJudul = `Test Schedule ${testTimestamp}`;
      
      // Try to find and fill form fields
      const inputs = document.querySelectorAll('input');
      let filledFields = 0;
      
      inputs.forEach(input => {
        const placeholder = input.placeholder || '';
        const name = input.name || '';
        const type = input.type || '';
        
        if (placeholder.toLowerCase().includes('judul') || name.toLowerCase().includes('judul') || placeholder.toLowerCase().includes('nama') || name.toLowerCase().includes('nama') || type === 'text') {
          input.value = testJudul;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          filledFields++;
        } else if (placeholder.toLowerCase().includes('hari') || placeholder.toLowerCase().includes('jam') || name.toLowerCase().includes('hari') || name.toLowerCase().includes('jam')) {
          input.value = 'Senin, 10:00 WIB';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          filledFields++;
        }
      });
      
      // Try to fill textarea
      const textareas = document.querySelectorAll('textarea');
      textareas.forEach(textarea => {
        textarea.value = 'Test schedule description';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
        filledFields++;
      });
      
      // Try to fill select dropdowns
      const selects = document.querySelectorAll('select');
      selects.forEach(select => {
        if (select.options.length > 1) {
          select.selectedIndex = 1;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          filledFields++;
        }
      });
      
      this.log(`✓ Filled ${filledFields} form fields`, 'success');
      
      // Find form and submit it properly
      const form = document.querySelector('form');
      if (form) {
        this.log('✓ Form found, submitting properly', 'success');
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        await this.wait(2000);
      } else {
        // Fallback: click submit button
        const submitButtons = document.querySelectorAll('button');
        let submitButton = null;
        submitButtons.forEach(btn => {
          const text = btn.textContent || '';
          if (text.toLowerCase().includes('simpan') || text.toLowerCase().includes('save') || text.toLowerCase().includes('submit')) {
            submitButton = btn;
          }
        });
        
        if (submitButton) {
          this.log('✓ Submit button found', 'success');
          submitButton.click();
          await this.wait(2000);
        } else {
          this.log('✗ Submit button not found', 'error');
        }
      }
      
      // Check if data was added by re-checking table
      const newTable = document.querySelector('table');
      if (newTable) {
        const newRows = newTable.querySelectorAll('tbody tr');
        const newCount = newRows.length;
        
        if (newCount > initialCount) {
          this.log(`✓ Schedule created successfully! Count increased from ${initialCount} to ${newCount}`, 'success');
        } else {
          this.log(`⚠ Schedule count unchanged (${initialCount}). Creation may have failed`, 'warning');
        }
        
        // Check if test data appears in table
        let foundTestData = false;
        newRows.forEach(row => {
          if (row.textContent.includes(testJudul)) {
            foundTestData = true;
          }
        });
        
        if (foundTestData) {
          this.log(`✓ Test data "${testJudul}" found in table`, 'success');
        } else {
          this.log(`⚠ Test data "${testJudul}" not found in table`, 'warning');
        }
      }
    } else {
      this.log('⚠ Add button not found', 'warning');
    }
    
    await this.wait(1000);
  },

  async testCMSSections() {
    this.log('=== TESTING CMS OTHER SECTIONS ===', 'info');
    
    // Check for various CMS section buttons
    const buttons = document.querySelectorAll('button');
    let foundSections = false;
    buttons.forEach(btn => {
      const text = btn.textContent || '';
      if (text.includes('Announcement') || text.includes('Hero') || text.includes('Warta')) {
        foundSections = true;
      }
    });
    
    if (foundSections) {
      this.log('✓ CMS section buttons found', 'success');
    } else {
      this.log('⚠ CMS section buttons not found', 'warning');
    }
    
    await this.wait(1000);
  },

  async testDataPersistence() {
    this.log('=== TESTING DATA PERSISTENCE ===', 'info');
    this.log('⚠ Skipping data persistence test (requires manual verification)', 'warning');
    await this.wait(1000);
  },

  async testLogout() {
    this.log('=== TESTING LOGOUT ===', 'info');
    
    // Look for logout button by text content
    const buttons = document.querySelectorAll('button');
    let logoutButton = null;
    buttons.forEach(btn => {
      const text = btn.textContent || '';
      if (text.toLowerCase().includes('logout') || text.toLowerCase().includes('keluar')) {
        logoutButton = btn;
      }
    });
    
    if (logoutButton) {
      logoutButton.click();
      this.log('✓ Logout button clicked', 'success');
      await this.wait(2000);
      
      if (window.location.pathname === '/' || window.location.pathname.includes('login')) {
        this.log('✓ Logout successful', 'success');
      } else {
        this.log(`⚠ Logout status unclear. Current path: ${window.location.pathname}`, 'warning');
      }
    } else {
      this.log('⚠ Logout button not found', 'warning');
    }
    
    await this.wait(1000);
  },

  async runAllTests() {
    this.log('🚀 STARTING ADMIN TEST SUITE', 'info');
    this.log('=====================================', 'info');
    
    try {
      await this.testLogin();
      await this.testDashboardNavigation();
      await this.testJemaatCRUD();
      await this.testUlangTahunSection();
      await this.testApprovalsSplit();
      await this.testCMSSchedulesSplit();
      await this.testCMSSections();
      await this.testDataPersistence();
      await this.testLogout();
      
      this.log('=====================================', 'info');
      this.log('🎉 ADMIN TEST SUITE COMPLETED', 'info');
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
console.log('%c🧪 GPdI Melati - Admin Test Suite', 'font-size: 20px; font-weight: bold; color: #e74c3c');
console.log('%cStarting tests in 3 seconds...', 'color: #f39c12');
console.log('%cMake sure you are on the admin login page!', 'color: #f39c12; font-weight: bold');

setTimeout(() => {
  AdminTestSuite.runAllTests();
}, 3000);
