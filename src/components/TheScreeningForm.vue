<template>
  <div
    class="d-flex align-items-center justify-content-center"
    style="height: 100vh"
  >
    <form @submit.prevent="submitForm" class="w-50">
      <div v-if="errorMessage" class="mt-4 alert alert-danger">
        <p>{{ errorMessage }}</p>
      </div>

      <div v-if="successMessage" class="mt-2 alert alert-success">
        <p v-if="eligibilityConfirmation">{{ eligibilityConfirmation }}</p>
      </div>

      <h1 class="mb-4">Screening Form For Clinical Trial</h1>

      <div class="mb-3">
        <label for="first_name" class="form-label">First Name:</label>
        <input
          type="text"
          v-model="formData.first_name"
          class="form-control"
          required
        />
      </div>

      <div class="mb-3">
        <label for="date_of_birth" class="form-label">Date of Birth:</label>
        <input
          type="date"
          v-model="formData.date_of_birth"
          class="form-control"
          required
        />
      </div>

      <div class="mb-3">
        <label for="frequency" class="form-label"
          >Frequency of Migraine Headaches:</label
        >
        <select
          v-model="formData.frequency"
          class="form-control"
          required
          :disabled="isFrequencyDisabled"
        >
          <option value="1">Monthly</option>
          <option value="2">Weekly</option>
          <option value="3">Daily</option>
        </select>
        <p v-if="!isEligible" class="text-danger mt-2">
          Only individuals aged 18 years or older are eligible.
        </p>
      </div>

      <div class="mb-3" v-if="formData.frequency == 3">
        <label for="daily_frequency" class="form-label"
          >Daily Frequency (if Daily):</label
        >
        <select v-model="formData.daily_frequency" class="form-control">
          <option value="1">1-2</option>
          <option value="2">3-4</option>
          <option value="3">5+</option>
        </select>
      </div>

      <button :disabled="isSubmitting" type="submit" class="btn btn-primary">
        {{ isSubmitting ? "Submitting..." : "Submit" }}
      </button>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      formData: {
        first_name: "",
        date_of_birth: "",
        frequency: null,
        daily_frequency: null,
      },
      errorMessage: null,
      successMessage: null,
      eligibilityConfirmation: null,
      isSubmitting: false,
    };
  },
  computed: {
    maxEligibleDate() {
      const today = new Date();
      today.setFullYear(today.getFullYear() - 18);
      return today.toISOString().split("T")[0];
    },
    isEligible() {
      if (!this.formData.date_of_birth) return true;
      const birthDate = new Date(this.formData.date_of_birth);
      const maxDate = new Date(this.maxEligibleDate);
      return birthDate <= maxDate;
    },
    isFrequencyDisabled() {
      if (!this.formData.date_of_birth) return true;
      const birthDate = new Date(this.formData.date_of_birth);
      const maxDate = new Date(this.maxEligibleDate);
      return birthDate > maxDate;
    },
  },
  watch: {
    "formData.daily_frequency"(newVal) {
      this.formData.daily_frequency = parseInt(newVal);
    },
    "formData.frequency"(newVal) {
      this.formData.frequency = parseInt(newVal);
    },
  },
  methods: {
    submitForm() {
      this.isSubmitting = true;
      this.errorMessage = null;
      this.successMessage = null;
      axios
        .post(
          "http://localhost/api/v1/subjects",
          {
            data: {
              type: "subjects",
              attributes: Object.entries(this.formData).reduce(
                (a, [k, v]) => (v !== "" && v !== null ? ((a[k] = v), a) : a),
                {}
              ),
            },
          },
          {
            headers: {
              Accept: "application/vnd.api+json",
              "Content-Type": "application/vnd.api+json",
            },
          }
        )
        .then((response) => {
          console.log(response);
          this.successMessage = response.status === 201 ? true : false;
          this.eligibilityConfirmation =
            response.data.data.attributes.eligibility_confirmation;
        })
        .catch((error) => {
          console.error(error);
          if (error.response) {
            this.errorMessage = "An error occurred while submitting the form.";
          }
        })
        .finally(() => {
          this.isSubmitting = false;
        });
    },
  },
};
</script>
