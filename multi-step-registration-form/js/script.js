const form = document.getElementById("registration-form");

const steps = document.querySelectorAll(".form-step");

const nextButtons = document.querySelectorAll(".next-button");

const previousButtons = document.querySelectorAll(".previous-button");

const progressText = document.getElementById("progress-text");

const progressBar = document.getElementById("progress-bar");

const reviewSection = document.getElementById("review-section");

const successMessage = document.getElementById("success-message");

let currentStep = 0;

function showStep(stepIndex) {
  steps.forEach((step, index) => {
    if (index === stepIndex) {
      step.classList.add("active");
    } else {
      step.classList.remove("active");
    }
  });

  updateProgress();

  const firstField = steps[stepIndex].querySelector(
    "input, select, textarea, button",
  );

  if (firstField) {
    firstField.focus();
  }
}

function updateProgress() {
  const stepNumber = currentStep + 1;

  progressText.textContent = `Step ${stepNumber} of ${steps.length}`;

  progressBar.value = stepNumber;

  progressBar.textContent = `${Math.round((stepNumber / steps.length) * 100)}%`;
}

function validateCurrentStep() {
  const currentFields = steps[currentStep].querySelectorAll(
    "input, select, textarea",
  );

  for (const field of currentFields) {
    if (!field.checkValidity()) {
      field.reportValidity();

      field.focus();

      return false;
    }
  }

  return true;
}

function populateReview() {
  const firstName = document.getElementById("first-name").value.trim();

  const lastName = document.getElementById("last-name").value.trim();

  const email = document.getElementById("email").value.trim();

  const phone = document.getElementById("phone").value.trim();

  const dob = document.getElementById("dob").value;

  const address = document.getElementById("address").value.trim();

  const city = document.getElementById("city").value.trim();

  const state = document.getElementById("state").value.trim();

  const zip = document.getElementById("zip").value.trim();

  const degree = document.getElementById("degree").value;

  const institution = document.getElementById("institution").value.trim();

  const graduationYear = document.getElementById("graduation-year").value;

  reviewSection.innerHTML = "";

  const personalHeading = document.createElement("h3");

  personalHeading.textContent = "Personal Information";

  reviewSection.appendChild(personalHeading);

  addReviewItem("Name", `${firstName} ${lastName}`);

  addReviewItem("Email", email);

  addReviewItem("Phone", phone);

  addReviewItem("Date of Birth", dob);

  const addressHeading = document.createElement("h3");

  addressHeading.textContent = "Address";

  reviewSection.appendChild(addressHeading);

  addReviewItem("Street Address", address);

  addReviewItem("City", city);

  addReviewItem("State", state);

  addReviewItem("ZIP Code", zip);

  const educationHeading = document.createElement("h3");

  educationHeading.textContent = "Education";

  reviewSection.appendChild(educationHeading);

  addReviewItem("Degree", degree);

  addReviewItem("Institution", institution);

  addReviewItem("Graduation Year", graduationYear);
}

function addReviewItem(label, value) {
  const paragraph = document.createElement("p");

  const strong = document.createElement("strong");

  strong.textContent = `${label}: `;

  paragraph.appendChild(strong);

  paragraph.appendChild(document.createTextNode(value));

  reviewSection.appendChild(paragraph);
}

nextButtons.forEach((button) => {
  button.addEventListener("click", () => {
    /*
     * Validate the current
     * step before continuing.
     */

    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < steps.length - 1) {
      currentStep++;

      /*
       * Generate the review when
       * reaching the final step.
       */

      if (currentStep === steps.length - 1) {
        populateReview();
      }

      showStep(currentStep);
    }
  });
});

previousButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (currentStep > 0) {
      currentStep--;

      showStep(currentStep);
    }
  });
});

form.addEventListener("keydown", (event) => {
  /*
   * A textarea should still allow
   * normal Enter key behavior.
   */

  if (
    event.key === "Enter" &&
    event.target.tagName !== "TEXTAREA" &&
    currentStep < steps.length - 1
  ) {
    event.preventDefault();

    if (!validateCurrentStep()) {
      return;
    }

    currentStep++;

    if (currentStep === steps.length - 1) {
      populateReview();
    }

    showStep(currentStep);
  }
});

form.addEventListener("submit", function (event) {
  event.preventDefault();

  if (!validateCurrentStep()) {
    return;
  }

  successMessage.hidden = false;

  form.reset();

  currentStep = 0;

  reviewSection.innerHTML = "";

  showStep(currentStep);
});

form.addEventListener("input", function () {
  successMessage.hidden = true;
});

showStep(currentStep);
