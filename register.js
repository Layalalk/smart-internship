document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registerForm");

  if (!form) return;

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  const isArabic = document.documentElement.lang === "ar";

  const texts = {
    nameRequired: isArabic ? "الاسم مطلوب" : "Name is required",
    nameInvalid: isArabic ? "الاسم يجب أن يحتوي على حرفين على الأقل" : "Name must be at least 2 characters",
    emailRequired: isArabic ? "البريد الإلكتروني مطلوب" : "Email is required",
    emailInvalid: isArabic ? "أدخل بريدًا إلكترونيًا صحيحًا" : "Enter a valid email address",
    passwordRequired: isArabic ? "كلمة المرور مطلوبة" : "Password is required",
    passwordShort: isArabic ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters",
    confirmRequired: isArabic ? "تأكيد كلمة المرور مطلوب" : "Confirm password is required",
    passwordMismatch: isArabic ? "كلمتا المرور غير متطابقتين" : "Passwords do not match",
    registerSuccess: isArabic ? "تم إنشاء الحساب بنجاح " : "Account created successfully ",
    registerError: isArabic ? "حدث خطأ أثناء إنشاء الحساب" : "An error occurred while creating the account",
    serverError: isArabic ? "تعذر الاتصال بالسيرفر" : "Unable to connect to the server"
  };

  function showError(input, messageText) {
    clearError(input);

    const error = document.createElement("small");
    error.className = "error-message";
    error.textContent = messageText;
    error.style.color = "#ef4444";
    error.style.display = "block";
    error.style.marginTop = "0.35rem";
    error.style.fontWeight = "700";

    input.style.borderColor = "#ef4444";
    input.parentElement.appendChild(error);
  }

  function clearError(input) {
    input.style.borderColor = "";
    const oldError = input.parentElement.querySelector(".error-message");
    if (oldError) {
      oldError.remove();
    }
  }

  function showMessage(messageText, type) {
    clearMessage();

    const box = document.createElement("div");
    box.className = "form-message";
    box.textContent = messageText;
    box.style.padding = "0.9rem 1rem";
    box.style.borderRadius = "10px";
    box.style.marginTop = "1rem";
    box.style.fontWeight = "800";
    box.style.textAlign = "center";

    if (type === "success") {
      box.style.backgroundColor = "#d1fae5";
      box.style.color = "#065f46";
    } else {
      box.style.backgroundColor = "#fee2e2";
      box.style.color = "#991b1b";
    }

    form.appendChild(box);
  }

  function clearMessage() {
    const oldMessage = document.querySelector(".form-message");
    if (oldMessage) {
      oldMessage.remove();
    }
  }

  function validateName() {
    const value = nameInput.value.trim();

    clearError(nameInput);

    if (value === "") {
      showError(nameInput, texts.nameRequired);
      return false;
    }

    if (value.length < 2) {
      showError(nameInput, texts.nameInvalid);
      return false;
    }

    return true;
  }

  function validateEmail() {
    const value = emailInput.value.trim();
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

    clearError(emailInput);

    if (value === "") {
      showError(emailInput, texts.emailRequired);
      return false;
    }

    if (!emailRegex.test(value)) {
      showError(emailInput, texts.emailInvalid);
      return false;
    }

    return true;
  }

  function validatePassword() {
    const value = passwordInput.value.trim();

    clearError(passwordInput);

    if (value === "") {
      showError(passwordInput, texts.passwordRequired);
      return false;
    }

    if (value.length < 6) {
      showError(passwordInput, texts.passwordShort);
      return false;
    }

    return true;
  }

  function validateConfirmPassword() {
    const value = confirmPasswordInput.value.trim();

    clearError(confirmPasswordInput);

    if (value === "") {
      showError(confirmPasswordInput, texts.confirmRequired);
      return false;
    }

    if (value !== passwordInput.value.trim()) {
      showError(confirmPasswordInput, texts.passwordMismatch);
      return false;
    }

    return true;
  }

  nameInput.addEventListener("blur", validateName);
  emailInput.addEventListener("blur", validateEmail);
  passwordInput.addEventListener("blur", validatePassword);
  confirmPasswordInput.addEventListener("blur", validateConfirmPassword);

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    clearMessage();

    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    const isFormValid =
      isNameValid &&
      isEmailValid &&
      isPasswordValid &&
      isConfirmPasswordValid;

    if (!isFormValid) {
      return;
    }

    const formData = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      password: passwordInput.value.trim()
    };

    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        showMessage(result.message || texts.registerError, "error");
        return;
      }

      showMessage(result.message || texts.registerSuccess, "success");

      setTimeout(() => {
        window.location.href = isArabic ? "/index.html" : "/index-en.html";
      }, 800);
    } catch (error) {
      console.error("Error:", error);
      showMessage(texts.serverError, "error");
    }
  });

  form.addEventListener("reset", function () {
    clearMessage();

    const inputs = [
      nameInput,
      emailInput,
      passwordInput,
      confirmPasswordInput
    ];

    inputs.forEach(clearError);
  });
});