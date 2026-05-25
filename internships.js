console.log("internships.js شغال");

document.addEventListener("DOMContentLoaded", async function () {
  const form = document.querySelector(".search-card form");
  const searchInput = document.getElementById("searchInput");
  const cityFilter = document.getElementById("cityFilter");
  const locationTypeFilter = document.getElementById("locationTypeFilter");
  const typeFilter = document.getElementById("typeFilter");
  const companyTypeFilter = document.getElementById("companyTypeFilter");
  const cards = document.querySelectorAll(".internship-card");
  const protectedButtons = document.querySelectorAll(".protected-action");

  let isLoggedIn = false;
  const isArabic = document.documentElement.lang === "ar";

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

  function containsAny(text, keywords) {
    return keywords.some(function (keyword) {
      return text.includes(keyword);
    });
  }

  function filterCards() {
    const searchValue = searchInput.value.trim().toLowerCase();
    const cityValue = cityFilter.value;
    const locationTypeValue = locationTypeFilter.value;
    const typeValue = typeFilter.value;
    const companyTypeValue = companyTypeFilter.value;

    cards.forEach(function (card) {
      const cardText = card.innerText.toLowerCase();
      let show = true;

      if (searchValue !== "" && !cardText.includes(searchValue)) {
        show = false;
      }

      if (
        cityValue === "jeddah" &&
        !containsAny(cardText, ["جدة", "jeddah"])
      ) {
        show = false;
      }

      if (
        cityValue === "remote" &&
        !containsAny(cardText, ["عن بُعد", "عن بعد", "remote"])
      ) {
        show = false;
      }

      if (
        locationTypeValue === "onsite" &&
        !containsAny(cardText, [
          "مقر الجهة",
          "مقر الشركة",
          "on-site",
          "onsite"
        ])
      ) {
        show = false;
      }

      if (
        locationTypeValue === "remote" &&
        !containsAny(cardText, ["عن بُعد", "عن بعد", "remote"])
      ) {
        show = false;
      }

      if (
        locationTypeValue === "flex" &&
        !containsAny(cardText, ["مرن", "نظام مرن", "flex", "flexible"])
      ) {
        show = false;
      }

      if (
        typeValue === "coop" &&
        !containsAny(cardText, ["تعاوني", "cooperative", "coop", "co-op"])
      ) {
        show = false;
      }

      if (
        typeValue === "summer" &&
        !containsAny(cardText, ["صيفي", "summer"])
      ) {
        show = false;
      }

      if (
        companyTypeValue === "startup" &&
        !containsAny(cardText, ["ريادية", "startup"])
      ) {
        show = false;
      }

      if (
        companyTypeValue === "sme" &&
        !containsAny(cardText, ["صغيرة", "متوسطة", "small", "medium", "sme"])
      ) {
        show = false;
      }

      if (
        companyTypeValue === "large" &&
        !containsAny(cardText, ["كبرى", "large", "enterprise"])
      ) {
        show = false;
      }

      if (
        companyTypeValue === "gov" &&
        !containsAny(cardText, ["حكومي", "government", "gov"])
      ) {
        show = false;
      }

      card.style.display = show ? "block" : "none";
    });
  }

  function handleProtectedActions() {
    protectedButtons.forEach(function (button) {
      button.addEventListener("click", function (event) {
        if (isLoggedIn) {
          return;
        }

        event.preventDefault();

        alert(
          isArabic
            ? "لا يمكنك إكمال هذا الإجراء إلا بعد تسجيل الدخول أو إنشاء حساب."
            : "You must log in or create an account first."
        );
      });
    });
  }

  handleProtectedActions();

  if (
    !form ||
    !searchInput ||
    !cityFilter ||
    !locationTypeFilter ||
    !typeFilter ||
    !companyTypeFilter ||
    cards.length === 0
  ) {
    return;
  }

  searchInput.addEventListener("input", filterCards);
  cityFilter.addEventListener("change", filterCards);
  locationTypeFilter.addEventListener("change", filterCards);
  typeFilter.addEventListener("change", filterCards);
  companyTypeFilter.addEventListener("change", filterCards);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    filterCards();
  });

  form.addEventListener("reset", function () {
    setTimeout(function () {
      filterCards();
    }, 0);
  });
});