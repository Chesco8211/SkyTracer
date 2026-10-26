
document.addEventListener("DOMContentLoaded", function () {
  const bookingForm = document.querySelector("#booking-form");
  const tripType = document.querySelector("#trip-type");
  const departureDate = document.querySelector("#flight-date");
  const returnDate = document.querySelector("#return-date");
  const returnDateError = document.querySelector("#return-date-error");
  const bookingMessage = document.querySelector("#booking-message");

  if (
    !bookingForm ||
    !tripType ||
    !departureDate ||
    !returnDate ||
    !returnDateError
  ) {
    console.error("Booking form fields were not found.");
    return;
  }

  // Validate the form ourselves so the custom error can appear.
  bookingForm.noValidate = true;

  function getToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function updateDates() {
    const today = getToday();
    const isRoundTrip = tripType.value === "round-trip";

    // Rule 1: departure cannot be before today.
    departureDate.min = today;

    if (departureDate.value && departureDate.value < today) {
      departureDate.value = "";
    }

    // Rules 2 and 3: return is enabled only for Round Trip,
    // after a valid departure date has been selected.
    const canChooseReturn =
      isRoundTrip &&
      departureDate.value !== "" &&
      departureDate.value >= today;

    returnDate.disabled = !canChooseReturn;
    returnDate.required = isRoundTrip;
    returnDate.min = departureDate.value || today;

    // Rule 4: return cannot be earlier than departure.
    if (
      returnDate.value &&
      returnDate.value < returnDate.min
    ) {
      returnDate.value = "";
    }

    // One Way never keeps a return date.
    if (!isRoundTrip) {
      returnDate.value = "";
    }

    // Show the custom error after the user tries to submit.
    if (returnDate.value !== "") {
      returnDateError.classList.remove("show");
    }
  }

  tripType.addEventListener("change", function () {
    returnDateError.classList.remove("show");
    updateDates();
  });

  departureDate.addEventListener("change", function () {
    updateDates();
  });

  departureDate.addEventListener("input", updateDates);
  returnDate.addEventListener("change", updateDates);
  returnDate.addEventListener("input", updateDates);

  bookingForm.addEventListener("submit", function (event) {
    updateDates();

    const isRoundTrip = tripType.value === "round-trip";
    const today = getToday();

    // Block past departure dates.
    if (
      !departureDate.value ||
      departureDate.value < today
    ) {
      event.preventDefault();
      departureDate.setCustomValidity(
        "Choose today or a future departure date."
      );
      departureDate.reportValidity();
      return;
    }

    departureDate.setCustomValidity("");

    // Rule 5: show the red message if Round Trip has no return date.
    if (isRoundTrip && !returnDate.value) {
      event.preventDefault();
      returnDateError.classList.add("show");

      if (!returnDate.disabled) {
        returnDate.focus();
      } else {
        departureDate.focus();
      }
      return;
    }

    // Block a return date earlier than departure.
    if (
      isRoundTrip &&
      returnDate.value < departureDate.value
    ) {
      event.preventDefault();
      returnDate.value = "";
      returnDateError.classList.add("show");
      returnDate.focus();
      return;
    }

    // Validate all other required fields.
    if (!bookingForm.checkValidity()) {
      event.preventDefault();
      bookingForm.reportValidity();
      return;
    }

    // This is a demo: no real booking request is sent.
    event.preventDefault();

    if (bookingMessage) {
      bookingMessage.textContent =
        "Thank you! Your request is ready for submission. Flight confirmation is still required.";
    }
  });

  // Apply the rules immediately when the page loads.
  updateDates();
});
