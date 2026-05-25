document.addEventListener("DOMContentLoaded", async function () {
  const fileInput = document.getElementById("cvFile");
  const fileNameText = document.getElementById("fileName");
  const removeBtn = document.getElementById("removeFile");
  const uploadTitle = document.querySelector(".upload-title");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const protectedButtons = document.querySelectorAll(".protected-action");

  const analysisBox = document.getElementById("analysisBox");
  const analysisSummary = document.getElementById("analysisSummary");
  const skillsList = document.getElementById("skillsList");
  const recommendationsSection = document.getElementById("recommendationsSection");
  const recommendationsGrid = document.getElementById("recommendationsGrid");

  const isArabic = document.documentElement.lang === "ar";
  let selectedFile = null;
  let isLoggedIn = false;

  const internshipsData = [
    {
      id: "alj",
      title: "برنامج التدريب التعاوني",
      titleEn: "COOP Training Program",
      company: "عبداللطيف جميل",
      companyEn: "Abdul Latif Jameel",
      location: "حضوري",
      locationEn: "On-site",
      type: "تدريب تعاوني",
      typeEn: "COOP Training",
      companyType: "قطاع خاص",
      companyTypeEn: "Private Sector",
      duration: "شهرين",
      durationEn: "2 months",
      description: "برنامج تدريب تعاوني مخصص لطلاب الجامعات لاكتساب الخبرة العملية في بيئة مهنية في مجالات إدارية وتقنية وهندسية ومالية.",
      descriptionEn: "A COOP training program for university students to gain practical experience in a professional environment across administrative, technical, engineering, and financial fields.",
      reason: "مناسب للمهارات التقنية والإدارية والتواصل والعمل في بيئة مهنية.",
      reasonEn: "Suitable for technical, administrative, communication, and professional workplace skills.",
      skills: ["it", "software", "business", "management", "engineering", "communication", "office"],
      link: "https://careers.alj.com/Mobility/job/Jeddah-COOP-Training/857143623/"
    },
    {
      id: "kapl",
      title: "برنامج التدريب التعاوني",
      titleEn: "COOP Training Program",
      company: "مكتبة الملك عبدالعزيز العامة",
      companyEn: "King Abdulaziz Public Library",
      location: "حضوري",
      locationEn: "On-site",
      type: "تدريب تعاوني",
      typeEn: "COOP Training",
      companyType: "قطاع حكومي",
      companyTypeEn: "Government Sector",
      duration: "شهرين",
      durationEn: "2 months",
      description: "فرصة تدريب تعاوني لاكتساب خبرة عملية في تنظيم المعلومات والبحث والتحليل والتواصل.",
      descriptionEn: "A COOP training opportunity to gain practical experience in information organization, research, analysis, and communication.",
      reason: "مناسب للمهارات المتعلقة بالبحث والتحليل وتنظيم المعلومات والعمل الجماعي.",
      reasonEn: "Suitable for research, analysis, information organization, and teamwork skills.",
      skills: ["research", "analysis", "communication", "teamwork", "computer"],
      link: "https://www.kapl.org.sa/e-services/53/collaborative-training"
    },
    {
      id: "emdad",
      title: "برنامج التدريب التعاوني – تطوير الأعمال التقنية",
      titleEn: "Technical Business Development COOP",
      company: "إمداد الخبرات (علم)",
      companyEn: "Emdad Al Khebrat",
      location: "حضوري",
      locationEn: "On-site",
      type: "تدريب تعاوني",
      typeEn: "COOP Training",
      companyType: "قطاع تقني",
      companyTypeEn: "Technology Sector",
      duration: "4 إلى 7 أشهر",
      durationEn: "4 to 7 months",
      description: "برنامج تدريبي في مجال تطوير الأعمال التقنية لاكتساب الخبرة العملية في بيئة احترافية.",
      descriptionEn: "A training program in technical business development to gain practical experience in a professional environment.",
      reason: "مناسب لتخصصات علوم الحاسب وتقنية المعلومات وهندسة البرمجيات ونظم المعلومات.",
      reasonEn: "Suitable for computer science, IT, software engineering, and information systems backgrounds.",
      skills: ["programming", "software", "it", "computer science", "node", "java", "javascript", "sql", "ui", "ux", "web"],
      link: "https://people-ksa.com/job/725"
    }
  ];

  if (!fileInput || !fileNameText || !removeBtn || !uploadTitle || !analyzeBtn) return;

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

  function requireLoginMessage() {
    alert(
      isArabic
        ? "لا يمكنك إكمال هذا الإجراء إلا بعد تسجيل الدخول أو إنشاء حساب."
        : "You must log in or create an account first."
    );
  }

  function resetPageResult() {
    if (analysisBox) analysisBox.classList.add("hidden");
    if (recommendationsSection) recommendationsSection.classList.add("hidden");

    if (analysisSummary) {
      analysisSummary.innerHTML = isArabic
        ? "سيتم عرض ملخص التحليل هنا."
        : "The analysis summary will appear here.";
    }

    if (skillsList) skillsList.innerHTML = "";
    if (recommendationsGrid) recommendationsGrid.innerHTML = "";
  }

  function resetFile() {
    fileInput.value = "";
    selectedFile = null;
    fileNameText.textContent = "";
    removeBtn.classList.add("hidden");
    uploadTitle.textContent = isArabic ? "اختر ملف السيرة الذاتية" : "Choose your CV file";
    resetPageResult();
  }

  function parseResult(data) {
    let result = data.result;

    if (typeof result === "string") {
      result = result
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      try {
        result = JSON.parse(result);
      } catch (error) {
        result = {
          isCV: false,
          message: isArabic
            ? "تعذر قراءة الملف. الرجاء رفع سيرة ذاتية صحيحة."
            : "Could not read the file. Please upload a valid CV."
        };
      }
    }

    return result;
  }

  function normalizeText(text) {
    return String(text || "").toLowerCase().trim();
  }

  function parseMatchValue(value) {
    if (typeof value === "number") return value;

    const number = parseInt(String(value || "").replace("%", "").trim(), 10);

    if (Number.isNaN(number)) return null;
    if (number > 100) return 100;
    if (number < 0) return 0;

    return number;
  }

  function calculateFallbackMatch(job, extractedSkills) {
    if (!extractedSkills || extractedSkills.length === 0) {
      return 75;
    }

    let score = 70;

    extractedSkills.forEach(function (skill) {
      const skillLower = normalizeText(skill);

      job.skills.forEach(function (jobSkill) {
        if (skillLower.includes(jobSkill) || jobSkill.includes(skillLower)) {
          score += 8;
        }
      });
    });

    if (score > 97) score = 97;
    return score;
  }

  function getAiMatch(job, result) {
    const aiItems = [
      ...(result.companyMatches || []),
      ...(result.matches || []),
      ...(result.recommendations || [])
    ];

    const jobArabic = normalizeText(job.title + " " + job.company);
    const jobEnglish = normalizeText(job.titleEn + " " + job.companyEn);
    const jobId = normalizeText(job.id);

    const found = aiItems.find(function (item) {
      const itemText = normalizeText(
        (item.id || "") + " " +
        (item.title || "") + " " +
        (item.company || "") + " " +
        (item.companyName || "")
      );

      return (
        itemText.includes(jobId) ||
        jobArabic.includes(itemText) ||
        jobEnglish.includes(itemText) ||
        itemText.includes(normalizeText(job.company)) ||
        itemText.includes(normalizeText(job.companyEn))
      );
    });

    if (found) {
      const aiMatch = parseMatchValue(found.match);
      if (aiMatch !== null) return aiMatch;
    }

    return calculateFallbackMatch(job, result.skills || []);
  }

  function getAiReason(job, result) {
    const aiItems = [
      ...(result.companyMatches || []),
      ...(result.matches || []),
      ...(result.recommendations || [])
    ];

    const jobId = normalizeText(job.id);

    const found = aiItems.find(function (item) {
      const itemText = normalizeText(
        (item.id || "") + " " +
        (item.title || "") + " " +
        (item.company || "") + " " +
        (item.companyName || "")
      );

      return (
        itemText.includes(jobId) ||
        itemText.includes(normalizeText(job.company)) ||
        itemText.includes(normalizeText(job.companyEn))
      );
    });

    if (found && found.reason) return found.reason;

    return isArabic ? job.reason : job.reasonEn;
  }

  function renderRealInternshipCards(result) {
    if (!recommendationsGrid) return;

    recommendationsGrid.innerHTML = "";

    const sortedJobs = internshipsData
      .map(function (job) {
        return {
          ...job,
          calculatedMatch: getAiMatch(job, result),
          displayReason: getAiReason(job, result)
        };
      })
      .sort(function (a, b) {
        return b.calculatedMatch - a.calculatedMatch;
      });

    sortedJobs.forEach(function (job) {
      const card = document.createElement("article");
      card.className = "internship-card";

      card.innerHTML = `
        <div class="match-score">${job.calculatedMatch}%</div>

        <div class="internship-header">
          <h3 class="internship-title">${isArabic ? job.title : job.titleEn}</h3>
          <p class="internship-company">${isArabic ? job.company : job.companyEn}</p>
        </div>

        <div class="internship-meta">
          <span class="meta-tag">📍 ${isArabic ? "مدينة جدة" : "Jeddah"}</span>
          <span class="meta-tag">🏢 ${isArabic ? job.location : job.locationEn}</span>
          <span class="meta-tag">⏱️ ${isArabic ? job.type : job.typeEn}</span>
          <span class="meta-tag">🏢 ${isArabic ? job.companyType : job.companyTypeEn}</span>
        </div>

        <p class="internship-description">
          ${isArabic ? job.description : job.descriptionEn}
        </p>

        <div class="ai-explanation">
          <strong>${isArabic ? "سبب التوصية:" : "Why recommended:"}</strong>
          ${job.displayReason}
        </div>

        <div class="internship-footer">
          <a class="btn btn-primary apply-btn protected-action" href="${job.link}" target="_blank">
            ${isArabic ? "تقديم" : "Apply"}
          </a>
          <span class="meta-tag">📅 ${isArabic ? job.duration : job.durationEn}</span>
        </div>
      `;

      recommendationsGrid.appendChild(card);
    });
  }

  function showAnalysisResult(data) {
    const result = parseResult(data);

    if (result.isCV === false) {
      alert(
        isArabic
          ? "الملف المرفوع لا يبدو سيرة ذاتية. الرجاء رفع CV صحيح."
          : "The uploaded file does not appear to be a CV. Please upload a valid CV."
      );

      resetPageResult();
      return;
    }

    if (analysisBox) analysisBox.classList.remove("hidden");
    if (recommendationsSection) recommendationsSection.classList.remove("hidden");

    if (analysisSummary) {
      analysisSummary.innerHTML =
        result.summary ||
        (isArabic ? "تم تحليل السيرة الذاتية بنجاح." : "The CV has been analyzed successfully.");
    }

    if (skillsList) {
      skillsList.innerHTML = "";

      const skills = result.skills || [];

      if (skills.length === 0) {
        skillsList.innerHTML = `<span class="meta-tag">${isArabic ? "لا توجد مهارات مستخرجة" : "No extracted skills"}</span>`;
      } else {
        skills.forEach(function (skill) {
          const skillTag = document.createElement("span");
          skillTag.className = "meta-tag";
          skillTag.textContent = skill;
          skillsList.appendChild(skillTag);
        });
      }
    }

    renderRealInternshipCards(result);

    alert(isArabic ? "تم تحليل السيرة الذاتية بنجاح" : "CV analyzed successfully");

    if (analysisBox) {
      analysisBox.scrollIntoView({ behavior: "smooth" });
    }
  }

  fileInput.addEventListener("change", function () {
    const file = fileInput.files[0];
    if (!file) return;

    const fileSizeMB = file.size / 1024 / 1024;
    const fileName = file.name.toLowerCase();

    const validExtension =
      fileName.endsWith(".pdf") ||
      fileName.endsWith(".doc") ||
      fileName.endsWith(".docx");

    if (!validExtension) {
      alert(isArabic ? "نوع الملف غير مدعوم" : "Invalid file type");
      resetFile();
      return;
    }

    if (fileSizeMB > 5) {
      alert(isArabic ? "حجم الملف كبير (أكثر من 5MB)" : "File is too large (more than 5MB)");
      resetFile();
      return;
    }

    selectedFile = file;
    fileNameText.textContent = file.name;
    uploadTitle.textContent = isArabic ? "تم اختيار الملف" : "File selected";
    removeBtn.classList.remove("hidden");

    resetPageResult();
  });

  removeBtn.addEventListener("click", function () {
    resetFile();
    alert(isArabic ? "تم حذف الملف" : "File removed");
  });

  analyzeBtn.addEventListener("click", async function () {
    if (!isLoggedIn) {
      requireLoginMessage();
      return;
    }

    if (!selectedFile) {
      alert(isArabic ? "يرجى اختيار ملف أولاً" : "Please select a file first");
      return;
    }

    const oldText = analyzeBtn.textContent;
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = isArabic ? "جاري التحليل..." : "Analyzing...";

    try {
      const formData = new FormData();
      formData.append("cv", selectedFile);

      const response = await fetch("/analyze-cv", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || (isArabic ? "حدث خطأ أثناء التحليل" : "An error occurred during analysis"));
        return;
      }

      showAnalysisResult(data);
    } catch (error) {
      console.log("Analyze error:", error);
      alert(isArabic ? "تعذر الاتصال بالسيرفر" : "Unable to connect to the server");
    } finally {
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = oldText;
    }
  });

  protectedButtons.forEach(function (button) {
    button.addEventListener("click", function (event) {
      if (isLoggedIn) return;

      event.preventDefault();
      requireLoginMessage();
    });
  });
});