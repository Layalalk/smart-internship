document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");

  if (!form) return;

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  const isArabic = document.documentElement.lang === "ar";

  const texts = {
    emailRequired: isArabic ? "البريد الإلكتروني مطلوب" : "Email is required",
    emailInvalid: isArabic ? "أدخل بريدًا إلكترونيًا صحيحًا" : "Enter a valid email address",
    passwordRequired: isArabic ? "كلمة المرور مطلوبة" : "Password is required",
    passwordShort: isArabic ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters",
    loginSuccess: isArabic ? "تم تسجيل الدخول بنجاح ✅" : "Login successful ✅",
    loginError: isArabic ? "حدث خطأ أثناء تسجيل الدخول" : "An error occurred while logging in",
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

  emailInput.addEventListener("blur", validateEmail);
  passwordInput.addEventListener("blur", validatePassword);

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    clearMessage();

    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    const formData = {
      email: emailInput.value.trim(),
      password: passwordInput.value.trim()
    };

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        showMessage(result.message || texts.loginError, "error");
        return;
      }

      showMessage(result.message || texts.loginSuccess, "success");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    } catch (error) {
      console.error("Error:", error);
      showMessage(texts.serverError, "error");
    }
  });

  form.addEventListener("reset", function () {
    clearMessage();
    [emailInput, passwordInput].forEach(clearError);
  });
});