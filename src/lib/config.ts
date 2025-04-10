const getBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_INVOICE_ENDPOINT;

  if (!envUrl) {
    throw new Error(
      "NEXT_PUBLIC_INVOICE_ENDPOINT environment variable is not set"
    );
  }

  // Validate URL format
  try {
    new URL(envUrl);
  } catch (e) {
    throw new Error("NEXT_PUBLIC_INVOICE_ENDPOINT must be a valid URL");
  }

  return envUrl;
};

// Wrap initialization in try-catch
let baseURL: string;
try {
  baseURL = getBaseUrl();
} catch (error) {
  if (process.env.NODE_ENV === "development") {
    console.error("Error initializing baseURL:", error);
  }
  throw error;
}

export { baseURL };
