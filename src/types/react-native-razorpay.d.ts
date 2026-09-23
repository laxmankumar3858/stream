// Type declarations for react-native-razorpay (no official @types package)
declare module 'react-native-razorpay' {
  export interface RazorpayOptions {
    description: string;
    image?: string;
    currency: string;
    key: string;
    amount: string;
    order_id: string;
    name: string;
    prefill?: {
      email?: string;
      contact?: string;
      name?: string;
    };
    theme?: {
      color?: string;
    };
    hidden?: {
      contact?: boolean;
      email?: boolean;
    };
    readonly?: {
      contact?: boolean;
      email?: boolean;
    };
    // Custom checkout display config (UPI QR, method selection, etc.)
    config?: {
      display?: {
        blocks?: Record<string, {
          name: string;
          instruments: Array<{
            method: string;
            flows?: string[];
          }>;
        }>;
        sequence?: string[];
        preferences?: {
          show_default_blocks?: boolean;
        };
      };
    };
  }

  export interface RazorpaySuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  export interface RazorpayErrorResponse {
    code: number;
    description: string;
    source?: string;
    step?: string;
    reason?: string;
    metadata?: {
      order_id?: string;
      payment_id?: string;
    };
  }

  const RazorpayCheckout: {
    open(options: RazorpayOptions): Promise<RazorpaySuccessResponse>;
  };

  export default RazorpayCheckout;
}
