"use client";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
};

type ToastFunction = (props: ToastProps) => void;

export function useToast(): { toast: ToastFunction } {
  const toast: ToastFunction = ({ title, description, variant = "default" }) => {
    // Simple toast implementation using browser alert for now
    // This can be replaced with a proper toast library later
    const message = title + (description ? `\n${description}` : "");
    
    if (variant === "destructive") {
      console.error("❌", message);
      // You can also use window.alert for debugging
      // alert(`❌ ${message}`);
    } else {
      console.log("✅", message);
      // alert(`✅ ${message}`);
    }
  };

  return { toast };
}
