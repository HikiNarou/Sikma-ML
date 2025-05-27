// Automation script for testing registration and login flow

const TestAuthFlow = {
  testUserData: {
    fullName: "Test User",
    email: "test@example.com",
    nim: "12345678",
    semester: "5",
    password: "password123",
  },

  fillRegistrationForm: function () {
    const { fullName, email, nim, semester, password } = this.testUserData;

    const nameInput = document.querySelector("#register_nama_lengkap");
    const emailInput = document.querySelector("#register_email");
    const nimInput = document.querySelector("#register_nim");
    const semesterSelect = document.querySelector("#register_semester");
    const passwordInput = document.querySelector("#register_password");
    const confirmPasswordInput = document.querySelector(
      "#register_confirm_password"
    );
    const termsCheckbox = document.querySelector("#register_terms");

    if (
      !nameInput ||
      !emailInput ||
      !nimInput ||
      !semesterSelect ||
      !passwordInput ||
      !confirmPasswordInput ||
      !termsCheckbox
    ) {
      console.error("Registration form elements not found");
      return false;
    }

    nameInput.value = fullName;
    emailInput.value = email;
    nimInput.value = nim;
    semesterSelect.value = semester;
    passwordInput.value = password;
    confirmPasswordInput.value = password;
    termsCheckbox.checked = true;

    // Trigger change event for semester select if needed
    const event = new Event("change", { bubbles: true });
    semesterSelect.dispatchEvent(event);

    return true;
  },

  submitRegistrationForm: function () {
    const registerForm = document.querySelector("#registerForm");
    if (!registerForm) {
      console.error("Registration form not found");
      return false;
    }
    registerForm.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );
    return true;
  },

  fillLoginForm: function () {
    const { email, password } = this.testUserData;

    const loginEmailInput = document.querySelector("#login_email_nim");
    const loginPasswordInput = document.querySelector("#login_password");

    if (!loginEmailInput || !loginPasswordInput) {
      console.error("Login form elements not found");
      return false;
    }

    loginEmailInput.value = email;
    loginPasswordInput.value = password;

    return true;
  },

  submitLoginForm: function () {
    const loginForm = document.querySelector("#loginForm");
    if (!loginForm) {
      console.error("Login form not found");
      return false;
    }
    loginForm.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );
    return true;
  },

  runTest: async function () {
    console.log("Starting registration and login test...");

    // Show registration form if not visible
    const registerForm = document.querySelector("#registerForm");
    const loginForm = document.querySelector("#loginForm");
    if (registerForm && registerForm.style.display === "none") {
      const switchToRegisterLink = document.querySelector("#switchToRegister");
      if (switchToRegisterLink) {
        switchToRegisterLink.click();
        await new Promise((resolve) => setTimeout(resolve, 500)); // wait for form to show
      }
    }

    if (!this.fillRegistrationForm()) {
      console.error("Failed to fill registration form");
      return;
    }

    this.submitRegistrationForm();

    // Wait for registration to complete and switch to login form
    await new Promise((resolve) => setTimeout(resolve, 4000));

    if (!this.fillLoginForm()) {
      console.error("Failed to fill login form");
      return;
    }

    this.submitLoginForm();

    console.log("Registration and login test submitted.");
  },
};

// To run the test, call TestAuthFlow.runTest() in the browser console or integrate as needed.
