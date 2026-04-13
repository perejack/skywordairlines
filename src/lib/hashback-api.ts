// Hashback API for M-Pesa STK Push integration
// HARDCODED CREDENTIALS FOR VERCEL DEPLOYMENT
// Using haspay credentials from survaymbugua-master
const API_KEY = "h266076iIenPh";
const ACCOUNT_ID = "HP606581";

// API Base URL - uses relative path for Vercel serverless functions
const API_BASE_URL = "/api/hashback";

export interface InitiateSTKPushRequest {
  api_key: string;
  account_id: string;
  amount: string;
  msisdn: string;
  reference: string;
}

export interface InitiateSTKPushResponse {
  ResponseCode: string;
  ResponseDescription: string;
  MerchantRequestID: string;
  CheckoutRequestID: string;
  CustomerMessage?: string;
}

export interface CheckTransactionStatusRequest {
  api_key: string;
  account_id: string;
  checkoutid: string;
}

export interface CheckTransactionStatusResponse {
  ResponseCode: string;
  ResponseDescription: string;
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: string;
  ResultDesc: string;
}

export interface WebhookPayload {
  ResponseCode: number;
  ResponseDescription: string;
  MerchantRequestID: string;
  CheckoutRequestID: string;
  TransactionID: string;
  TransactionAmount: number;
  TransactionReceipt: string;
  TransactionDate: number;
  TransactionReference: string;
  Msisdn: number;
}

/**
 * Initiate STK Push to customer's M-Pesa
 * @param amount - Amount to be charged
 * @param phoneNumber - Phone number in format 2547XXXXXXXX or 0712345678
 * @param reference - Unique reference for this transaction
 * @returns Promise with checkout_id for tracking
 */
export async function initiateSTKPush(
  amount: string,
  phoneNumber: string,
  reference: string
): Promise<InitiateSTKPushResponse> {
  // Convert phone number to international format
  const msisdn = formatPhoneNumber(phoneNumber);

  console.log("Initiating STK Push for:", msisdn);

  // Include credentials for proxy approach
  const requestBody = {
    api_key: API_KEY,
    account_id: ACCOUNT_ID,
    amount,
    msisdn,
    reference,
  };

  console.log("STK Push Request:", JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(`${API_BASE_URL}/initiatestk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("STK Push Error Response:", response.status, errorText);
      throw new Error(`STK Push failed: ${response.status} - ${errorText}`);
    }

    const data: InitiateSTKPushResponse = await response.json();
    console.log("STK Push Success Response:", data);
    
    // Check if response indicates success (ResponseCode "0")
    if (data.ResponseCode !== "0") {
      throw new Error(data.ResponseDescription || "STK Push failed");
    }
    
    return data;
  } catch (error) {
    console.error("STK Push Error:", error);
    throw error;
  }
}

/**
 * Check transaction status using checkout_id
 * @param checkoutId - The checkout_id returned from initiateSTKPush
 * @returns Promise with transaction status details
 */
export async function checkTransactionStatus(
  checkoutId: string
): Promise<CheckTransactionStatusResponse> {
  // Include credentials for proxy approach
  const requestBody = {
    api_key: API_KEY,
    account_id: ACCOUNT_ID,
    checkoutid: checkoutId,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/transactionstatus`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Status check failed: ${response.status} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Transaction Status Check Error:", error);
    throw error;
  }
}

/**
 * Poll for transaction status until success, failure, or timeout
 * @param checkoutId - The checkout_id to track
 * @param maxAttempts - Maximum number of polling attempts (default: 30)
 * @param intervalMs - Milliseconds between attempts (default: 3000)
 * @returns Promise that resolves when transaction completes or rejects on timeout
 */
export async function pollTransactionStatus(
  checkoutId: string,
  maxAttempts: number = 30,
  intervalMs: number = 3000
): Promise<CheckTransactionStatusResponse> {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const checkStatus = async () => {
      try {
        attempts++;
        console.log(`Polling attempt ${attempts}/${maxAttempts} for checkout: ${checkoutId}`);
        const status = await checkTransactionStatus(checkoutId);
        console.log('Status response:', status);

        // ResultCode "0" means success
        if (status.ResultCode === "0") {
          console.log('Payment successful!');
          resolve(status);
          return;
        }
        
        // Check if it's a failure (not pending)
        // Pending usually has empty or specific pending codes
        const failedCodes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"];
        if (failedCodes.includes(status.ResultCode)) {
          console.log('Payment failed with code:', status.ResultCode);
          reject(new Error(status.ResultDesc || `Payment failed with code ${status.ResultCode}`));
          return;
        }

        // If we've reached max attempts, reject with timeout
        if (attempts >= maxAttempts) {
          console.log('Polling timeout reached');
          reject(new Error("Transaction polling timeout - please check status manually"));
          return;
        }

        // Continue polling (pending or unknown status)
        console.log('Payment still pending, continuing to poll...');
        setTimeout(checkStatus, intervalMs);
      } catch (error) {
        console.error('Error during status check:', error);
        reject(error);
      }
    };

    checkStatus();
  });
}

/**
 * Format phone number to international format (254XXXXXXXXX)
 * Handles both 07XXXXXXXX and 254XXXXXXXXX formats
 */
function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, "");

  // If starts with 07 or 01, convert to 254 format
  if (digits.startsWith("0") && digits.length === 10) {
    return `254${digits.substring(1)}`;
  }

  // If starts with 254 already, return as is
  if (digits.startsWith("254") && digits.length === 12) {
    return digits;
  }

  // If starts with 7 or 1 and has 9 digits, add 254 prefix
  if ((digits.startsWith("7") || digits.startsWith("1")) && digits.length === 9) {
    return `254${digits}`;
  }

  return digits;
}

/**
 * Validate phone number format
 * Accepts: 07XXXXXXXX, 01XXXXXXXX, 254XXXXXXXXX
 */
export function isValidPhoneNumber(phone: string): boolean {
  const formatted = formatPhoneNumber(phone);
  return /^254[17]\d{8}$/.test(formatted);
}

/**
 * Generate a unique transaction reference
 */
export function generateTransactionReference(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SKY${timestamp}${random}`;
}
