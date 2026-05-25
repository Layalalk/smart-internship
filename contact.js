document.addEventListener("DOMContentLoaded", async function () {
  const form = document.querySelector(".contact-form");

  if (!form) return;

  const firstName = document.getElementById("firstName");
  const lastName = document.getElementById("lastName");
  const gender = document.getElementById("gender");
  const mobile = document.getElementById("mobile");
  const dob = document.getElementById("dob");
  const email = document.getElementById("email");
  const language = document.getElementById("language");
  const category = document.getElementById("category");
  const message = document.getElementById("message");

  const isArabic = document.documentElement.lang === "ar";
  let isLoggedIn = false;

  const texts = {
    loginRequired: isArabic
      ? "يجب تسجيل الدخول أو إنشاء حساب أولاً قبل إرسال الرسالة"
      : "You must login or create an account first before sending the message",

    firstName: isArabic ? "الاسم الأول" : "First name",
    lastName: isArabic ? "اسم العائلة" : "Last name",

    requiredName: (fieldName) =>
      isArabic
        ? `${fieldName} مطلوب`
        : `${fieldName} is required`,

    shortName: (fieldName) =>
      isArabic
        ? `${fieldName} يجب أن يكون حرفين على الأقل`
        : `${fieldName} must be at least 2 characters`,

    lettersOnly: (fieldName) =>
      isArabic
        ? `${fieldName} يجب أن يحتوي على حروف فقط`
        : `${fieldName} must contain letters only`,

    genderRequired: isArabic
      ? "يرجى اختيار الجنس"
      : "Please select gender",

    mobileRequired: isArabic
      ? "رقم الجوال مطلوب"
      : "Mobile number is required",

    mobileInvalid: isArabic
      ? "رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام"
      : "Mobile must start with 05 and contain 10 digits",

    dobRequired: isArabic
      ? "تاريخ الميلاد مطلوب"
      : "Date of birth is required",

    dobFuture: isArabic
      ? "تاريخ الميلاد لا يمكن أن يكون في المستقبل"
      : "Date of birth cannot be in the future",

    emailRequired: isArabic
      ? "البريد الإلكتروني مطلوب"
      : "Email is required",

    emailInvalid: isArabic
      ? "أدخل بريدًا إلكترونيًا صحيحًا"
      : "Enter a valid email address",

    languageRequired: isArabic
      ? "يرجى اختيار لغة التواصل"
      : "Please select a preferred language",

    categoryRequired: isArabic
      ? "يرجى اختيار موضوع الرسالة"
      : "Please select a message topic",

    messageRequired: isArabic
      ? "نص الرسالة مطلوب"
      : "Message is required",

    messageShort: isArabic
      ? "نص الرسالة يجب أن يكون 10 أحرف على الأقل"
      : "Message must be at least 10 characters",

    sendError: isArabic
      ? "حدث خطأ أثناء إرسال البيانات"
      : "An error occurred while sending the data",

    sendSuccess: isArabic
      ? "تم إرسال رسالتك بنجاح"
      : "Your message has been sent successfully",

    serverError: isArabic
      ? "تعذر الاتصال بالسيرفر"
      : "Unable to connect to the server"
  };

  try {
    const response = await fetch("/current-user", {
      method: "GET",
      credentials: "same-origin"
    });

    const data = await response.json();

    if (response.ok && data.user) {
      isLoggedIn = true;
    }
  } catch (error) {
    console.log("User is not logged in");
  }

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
    clearFormMessage();

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

  function clearFormMessage() {
    const oldMessage = document.querySelector(".form-message");
    if (oldMessage) {
      oldMessage.remove();
    }
  }

  function validateName(input, fieldName) {
    const value = input.value.trim();
    const nameRegex = /^[A-Za-z\u0600-\u06FF\s]+$/;

    clearError(input);

    if (value === "") {
      showError(input, texts.requiredName(fieldName));
      return false;
    }

    if (value.length < 2) {
      showError(input, texts.shortName(fieldName));
      return false;
    }

    if (!nameRegex.test(value)) {
      showError(input, texts.lettersOnly(fieldName));
      return false;
    }

    return true;
  }

  function validateGender() {
    clearError(gender);

    if (!gender.value) {
      showError(gender, texts.genderRequired);
      return false;
    }

    return true;
  }

  function validateMobile() {
    const value = mobile.value.trim();
    const mobileRegex = /^05[0-9]{8}$/;

    clearError(mobile);

    if (value === "") {
      showError(mobile, texts.mobileRequired);
      return false;
    }

    if (!mobileRegex.test(value)) {
      showError(mobile, texts.mobileInvalid);
      return false;
    }

    return true;
  }

  function validateDOB() {
    clearError(dob);

    if (!dob.value) {
      showError(dob, texts.dobRequired);
      return false;
    }

    const birthDate = new Date(dob.value);
    const today = new Date();

    if (birthDate > today) {
      showError(dob, texts.dobFuture);
      return false;
    }

    return true;
  }

  function validateEmail() {
    const value = email.value.trim();
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

    clearError(email);

    if (value === "") {
      showError(email, texts.emailRequired);
      return false;
    }

    if (!emailRegex.test(value)) {
      showError(email, texts.emailInvalid);
      return false;
    }

    return true;
  }

  function validateLanguage() {
    clearError(language);

    if (!language.value) {
      showError(language, texts.languageRequired);
      return false;
    }

    return true;
  }

  function validateCategory() {
    clearError(category);

    if (!category.value) {
      showError(category, texts.categoryRequired);
      return false;
    }

    return true;
  }

  function validateMessage() {
    const value = message.value.trim();

    clearError(message);

    if (value === "") {
      showError(message, texts.messageRequired);
      return false;
    }

    if (value.length < 10) {
      showError(message, texts.messageShort);
      return false;
    }

    return true;
  }

  firstName.addEventListener("blur", function () {
    validateName(firstName, texts.firstName);
  });

  lastName.addEventListener("blur", function () {
    validateName(lastName, texts.lastName);
  });

  gender.addEventListener("change", validateGender);
  mobile.addEventListener("blur", validateMobile);
  dob.addEventListener("change", validateDOB);
  email.addEventListener("blur", validateEmail);
  language.addEventListener("change", validateLanguage);
  category.addEventListener("change", validateCategory);
  message.addEventListener("blur", validateMessage);

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    clearFormMessage();

    if (!isLoggedIn) {
      showMessage(texts.loginRequired, "error");
      return;
    }

    const isFirstNameValid = validateName(firstName, texts.firstName);
    const isLastNameValid = validateName(lastName, texts.lastName);
    const isGenderValid = validateGender();
    const isMobileValid = validateMobile();
    const isDOBValid = validateDOB();
    const isEmailValid = validateEmail();
    const isLanguageValid = validateLanguage();
    const isCategoryValid = validateCategory();
    const isMessageValid = validateMessage();

    const isFormValid =
      isFirstNameValid &&
      isLastNameValid &&
      isGenderValid &&
      isMobileValid &&
      isDOBValid &&
      isEmailValid &&
      isLanguageValid &&
      isCategoryValid &&
      isMessageValid;

    if (!isFormValid) {
      return;
    }

    const formData = {
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      gender: gender.value,
      mobile: mobile.value.trim(),
      dob: dob.value,
      email: email.value.trim(),
      language: language.value,
      category: category.value,
      message: message.value.trim()
    };

    try {
      const response = await fetch("/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        showMessage(result.message || texts.sendError, "error");
        return;
      }

      showMessage(result.message || texts.sendSuccess, "success");
      form.reset();
    } catch (error) {
      console.error("Error:", error);
      showMessage(texts.serverError, "error");
    }
  });

  form.addEventListener("reset", function () {
    clearFormMessage();

    const inputs = [
      firstName,
      lastName,
      gender,
      mobile,
      dob,
      email,
      language,
      category,
      message
    ];

    inputs.forEach(clearError);
  });
});