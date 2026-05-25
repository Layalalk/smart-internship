document.addEventListener("DOMContentLoaded", async function () {
  const authSection = document.getElementById("authSection");
  const userSection = document.getElementById("userSection");
  const userName = document.getElementById("userName");
  const userInfo = document.getElementById("userInfo");
  const userDropdown = document.getElementById("userDropdown");
  const logoutBtn = document.getElementById("logoutBtn");

  const isArabic = document.documentElement.lang === "ar";

  async function loadCurrentUser() {
    try {
      const response = await fetch("/current-user", {
        method: "GET",
        credentials: "same-origin"
      });

      const data = await response.json();

      if (!response.ok || !data.user) {
        return;
      }

      if (authSection) {
        authSection.classList.add("hidden");
      }

      if (userSection) {
        userSection.classList.remove("hidden");
      }

      if (userName) {
        userName.textContent = data.user.name;
      }
    } catch (error) {
      console.log("No user logged in");
    }
  }

  await loadCurrentUser();

  if (userInfo && userDropdown) {
    userInfo.addEventListener("click", function () {
      userDropdown.classList.toggle("hidden");
    });

    userInfo.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        userDropdown.classList.toggle("hidden");
      }
    });

    document.addEventListener("click", function (event) {
      const clickedInsideUserBox =
        userInfo.contains(event.target) || userDropdown.contains(event.target);

      if (!clickedInsideUserBox) {
        userDropdown.classList.add("hidden");
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async function (event) {
      event.preventDefault();

      try {
        const response = await fetch("/logout", {
          method: "POST",
          credentials: "same-origin"
        });

        if (response.ok) {
          window.location.href = isArabic ? "/index.html" : "/index-en.html";
        }
      } catch (error) {
        console.log("Logout error:", error);
      }
    });
  }
});