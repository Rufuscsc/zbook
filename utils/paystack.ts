import PaystackPop, { PaystackOptions } from "@paystack/inline-js";

interface InitializePaymentParams {
  email: string;
  amount: number; // in naira
  onSuccess: (reference: string) => void;
  onClose?: () => void;
  metadata?: Record<string, unknown>;
}

export const initializePayment = ({
  email,
  amount,
  onSuccess,
  onClose,
  metadata,
}: InitializePaymentParams) => {
  const paystack = new PaystackPop();

  const options: PaystackOptions = {
    // key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY, // Vite
    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!, // Next.js
    email,
    amount: amount * 100, // convert to kobo
    currency: "NGN",
    metadata,
    callback: (response) => {
      onSuccess(response.reference);
    },
    onClose,
  };

  paystack.newTransaction(options);
};
