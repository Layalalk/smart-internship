document.addEventListener("DOMContentLoaded", async function () {
  const isArabic = document.documentElement.lang === "ar";

  const texts = {
    loginPage: isArabic ? "login.html" : "login-en.html",
    homePage: isArabic ? "index.html" : "index-en.html",
    updateError: isArabic ? "خطأ" : "Error",
    updateSuccess: isArabic ? "تم التحديث بنجاح" : "Updated successfully",
    updateFail: isArabic ? "حدث خطأ أثناء التحديث" : "An error occurred while updating",
    passwordRequired: isArabic ? "كل حقول كلمة المرور مطلوبة" : "All password fields are required",
    passwordShort: isArabic ? "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" : "New password must be at least 6 characters",
    passwordMismatch: isArabic ? "كلمة المرور الجديدة غير متطابقة" : "New passwords do not match",
    passwordError: isArabic ? "حدث خطأ" : "Error",
    passwordSuccess: isArabic ? "تم تغيير كلمة المرور بنجاح" : "Password changed successfully",
    passwordFail: isArabic ? "حدث خطأ أثناء تغيير كلمة المرور" : "An error occurred while changing password"
  };

  const nameEl = document.getElementById("profileName");
  const emailEl = document.getElementById("profileEmail");
  const logoutBtn = document.getElementById("logoutBtn");

  const editBtn = document.getElementById("editBtn");
  const editForm = document.getElementById("editForm");
  const editName = document.getElementById("editName");
  const editEmail = document.getElementById("editEmail");
  const saveBtn = document.getElementById("saveBtn");
  const cancelEditBtn = document.getElementById("cancelEditBtn");

  const passwordBtn = document.getElementById("passwordBtn");
  const passwordForm = document.getElementById("passwordForm");
  const currentPassword = document.getElementById("currentPassword");
  const newPassword = document.getElementById("newPassword");
  const confirmNewPassword = document.getElementById("confirmNewPassword");
  const savePasswordBtn = document.getElementById("savePasswordBtn");
  const cancelPasswordBtn = document.getElementById("cancelPasswordBtn");

  let currentUser = null;

  try {
    const response = await fetch("/current-user");
    const data = await response.json();

    if (!response.ok || !data.user) {
      window.location.href = texts.loginPage;
      return;
    }

    currentUser = data.user;
    nameEl.textContent = data.user.name;
    emailEl.textContent = data.user.email;
  } catch (error) {
    window.location.href = texts.loginPage;
  }

  editBtn.addEventListener("click", function () {
    editForm.classList.toggle("hidden");
    passwordForm.classList.add("hidden");

    editName.value = currentUser.name;
    editEmail.value = currentUser.email;
  });

  cancelEditBtn.addEventListener("click", function () {
    editForm.classList.add("hidden");
    editName.value = "";
    editEmail.value = "";
  });

  saveBtn.addEventListener("click", async function () {
    const updatedData = {
      name: editName.value.trim(),
      email: editEmail.value.trim()
    };

    try {
      const response = await fetch("/update-user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedData)
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || texts.updateError);
        return;
      }

      currentUser = result.user;
      nameEl.textContent = result.user.name;
      emailEl.textContent = result.user.email;
      editForm.classList.add("hidden");

      alert(texts.updateSuccess);
    } catch (error) {
      console.log(error);
      alert(texts.updateFail);
    }
  });

  passwordBtn.addEventListener("click", function () {
    passwordForm.classList.toggle("hidden");
    editForm.classList.add("hidden");
  });

  cancelPasswordBtn.addEventListener("click", function () {
    passwordForm.classList.add("hidden");
    currentPassword.value = "";
    newPassword.value = "";
    confirmNewPassword.value = "";
  });

  savePasswordBtn.addEventListener("click", async function () {
    if (!currentPassword.value.trim() || !newPassword.value.trim() || !confirmNewPassword.value.trim()) {
      alert(texts.passwordRequired);
      return;
    }

    if (newPassword.value.trim().length < 6) {
      alert(texts.passwordShort);
      return;
    }

    if (newPassword.value.trim() !== confirmNewPassword.value.trim()) {
      alert(texts.passwordMismatch);
      return;
    }

    try {
      const response = await fetch("/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          currentPassword: currentPassword.value.trim(),
          newPassword: newPassword.value.trim()
        })
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || texts.passwordError);
        return;
      }

      currentPassword.value = "";
      newPassword.value = "";
      confirmNewPassword.value = "";
      passwordForm.classList.add("hidden");

      alert(texts.passwordSuccess);
    } catch (error) {
      console.log(error);
      alert(texts.passwordFail);
    }
  });

  logoutBtn.addEventListener("click", async function () {
    await fetch("/logout", { method: "POST" });
    window.location.href = texts.homePage;
  });
});
const langBtn = document.getElementById("langSwitch");

if (langBtn) {
  langBtn.addEventListener("click", function (e) {
    e.preventDefault();

    const currentPage = window.location.pathname;

    if (document.documentElement.lang === "ar") {
      window.location.href = currentPage.replace(".html", "-en.html");
    } else {
      window.location.href = currentPage.replace("-en.html", ".html");
    }
  });
}