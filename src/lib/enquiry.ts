import { enquiryTypes, type EnquiryType } from "@/content/navigation";

export type EnquiryInput = {
  fullName: string;
  company: string;
  email: string;
  phone: string;
  city: string;
  enquiryType: EnquiryType | "";
  message: string;
};

export type EnquiryErrors = Partial<Record<keyof EnquiryInput, string>>;

export const emptyEnquiry: EnquiryInput = {
  fullName: "",
  company: "",
  email: "",
  phone: "",
  city: "",
  enquiryType: "",
  message: "",
};

export const limits = {
  fullName: 100,
  company: 120,
  email: 160,
  phone: 30,
  city: 80,
  message: 3000,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Digits with optional +, spaces, dashes, brackets; 7–15 digits in total.
const PHONE_RE = /^\+?[\d\s\-()]+$/;

const isEnquiryType = (v: string): v is EnquiryType => enquiryTypes.some((t) => t.value === v);

/** Shared by the browser form and the API route so both enforce the same rules. */
export function validateEnquiry(input: EnquiryInput): EnquiryErrors {
  const errors: EnquiryErrors = {};
  const v = (k: keyof EnquiryInput) => input[k].trim();

  if (!v("fullName")) errors.fullName = "Enter your full name.";
  else if (v("fullName").length > limits.fullName) errors.fullName = `Use ${limits.fullName} characters or fewer.`;

  if (v("company").length > limits.company) errors.company = `Use ${limits.company} characters or fewer.`;

  if (!v("email")) errors.email = "Enter your email address.";
  else if (!EMAIL_RE.test(v("email")) || v("email").length > limits.email)
    errors.email = "Enter a valid email address, like name@company.com.";

  if (!v("phone")) errors.phone = "Enter a phone number so we can reach you.";
  else {
    const digits = v("phone").replace(/\D/g, "");
    if (!PHONE_RE.test(v("phone")) || digits.length < 7 || digits.length > 15)
      errors.phone = "Enter a valid phone number, like +92 300 1234567.";
  }

  if (!v("city")) errors.city = "Enter your city.";
  else if (v("city").length > limits.city) errors.city = `Use ${limits.city} characters or fewer.`;

  if (!isEnquiryType(v("enquiryType"))) errors.enquiryType = "Choose the type of enquiry.";

  if (v("message").length < 10) errors.message = "Tell us a little more — at least 10 characters.";
  else if (v("message").length > limits.message) errors.message = `Keep your message under ${limits.message} characters.`;

  return errors;
}

export function enquiryTypeLabel(value: string) {
  return enquiryTypes.find((t) => t.value === value)?.label ?? value;
}
