const form = document.querySelector("form");
const errorOutput = document.getElementById("form-error");
const infoOutput = document.getElementById("form-info");

const nameField = document.getElementById("name");
const emailField = document.getElementById("email");
const messageField = document.getElementById("message");
const messageRemaining = document.getElementById("message-remaining");

const form_errors = []; // global error log

// --- helper to show temporary error for illegal chars (not stored in form_errors) ---
let illegalTimer = null;
function showIllegalCharMessage(message) {
  errorOutput.textContent = message;
  if (illegalTimer) clearTimeout(illegalTimer);
  illegalTimer = setTimeout(() => {
    // only clear if we haven't overwritten with another error
    if (errorOutput.textContent === message) {
      errorOutput.textContent = "";
    }
  }, 2000);
}

// --- helper to flash a field visually ---
function flashField(field) {
  field.classList.add("field-flash");
  setTimeout(() => field.classList.remove("field-flash"), 200);
}

// --- character countdown for textarea ---
const maxChars = parseInt(messageField.getAttribute("maxlength"), 10);
function updateRemaining() {
  const used = messageField.value.length;
  const left = maxChars - used;

  messageRemaining.textContent = `${left} characters remaining`;

  messageRemaining.classList.remove("char-remaining--warn", "char-remaining--over");

  if (left <= 40 && left >= 0) {
    messageRemaining.classList.add("char-remaining--warn");
  } else if (left < 0) {
    messageRemaining.classList.add("char-remaining--over");
  }
}
messageField.addEventListener("input", updateRemaining);
messageField.addEventListener("focus", updateRemaining);
updateRemaining();

// Also use info output as a small "tip" when message is focused (for Part 3(g))
messageField.addEventListener("focus", () => {
  infoOutput.textContent = "You can write up to 300 characters in the comment box.";
});

// --- discourage illegal characters on NAME field ---
let lastValidName = "";
const nameAllowedRegex = /^[A-Za-z\s'-]*$/;

nameField.addEventListener("input", () => {
  const current = nameField.value;

  if (nameAllowedRegex.test(current)) {
    // valid so far
    lastValidName = current;
    return;
  }

  // illegal char typed: revert and warn (but DO NOT add to form_errors)
  flashField(nameField);
  showIllegalCharMessage("Illegal character in name. Only letters, spaces, apostrophes, and hyphens are allowed.");
  nameField.value = lastValidName;
});

// --- add an error to the form_errors array ---
function addFormError(field, message) {
  form_errors.push({
    fieldName: field.name,
    message,
    value: field.value,
    time: new Date().toISOString(),
  });
}

// --- clear outputs before each submit attempt ---
function clearOutputs() {
  errorOutput.textContent = "";
  infoOutput.textContent = "";
}

// --- main submit handler using Constraint Validation API ---
form.addEventListener("submit", (event) => {
  clearOutputs();

  let hasErrors = false;

  // Reset customValidity on all fields first
  const elements = Array.from(form.elements).filter(
    (el) => el instanceof HTMLElement && "checkValidity" in el
  );

  for (const el of elements) {
    el.setCustomValidity("");
  }

  for (const field of elements) {
    const validity = field.validity;

    if (!field.checkValidity()) {
      hasErrors = true;

      // Pick a nicer message based on the validity state
      let msg = "";

      if (validity.valueMissing) {
        msg = `Please fill out the ${field.name} field.`;
      } else if (validity.typeMismatch && field.type === "email") {
        msg = "Please enter a valid email address.";
      } else if (validity.tooShort) {
        msg = `The ${field.name} is too short. Minimum length is ${field.minLength} characters.`;
      } else if (validity.tooLong) {
        msg = `The ${field.name} is too long. Maximum length is ${field.maxLength} characters.`;
      } else if (validity.patternMismatch) {
        msg = `The ${field.name} contains characters that are not allowed.`;
      } else {
        msg = "This field is invalid.";
      }

      field.setCustomValidity(msg);
      addFormError(field, msg);
    }
  }

  if (hasErrors) {
    event.preventDefault();
    errorOutput.textContent = "There were errors with your submission. Please fix the highlighted fields.";
    // This will trigger the browser to show our custom messages
    form.reportValidity();
    return;
  }

  // No errors: attach form_errors to a hidden field, then submit
  let errorsField = form.querySelector("input[name='form-errors']");
  if (!errorsField) {
    errorsField = document.createElement("input");
    errorsField.type = "hidden";
    errorsField.name = "form-errors";
    form.appendChild(errorsField);
  }
  errorsField.value = JSON.stringify(form_errors);

  infoOutput.textContent = "Submitting form…";
});
