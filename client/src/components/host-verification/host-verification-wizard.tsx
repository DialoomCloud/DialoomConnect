import { useEffect, useState } from "react";
import { Step1Basics } from "./step1-basics";
import { Step2Document } from "./step2-document";
import { Step3Stripe } from "./step3-stripe";

export function HostVerificationWizard() {
  const [step, setStep] = useState(() => {
    const stored = sessionStorage.getItem('host-verification-step');
    return stored ? parseInt(stored, 10) : 1;
    // step 1 default
  });

  useEffect(() => {
    sessionStorage.setItem('host-verification-step', step.toString());
  }, [step]);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));

  if (step === 1) {
    return <Step1Basics onNext={nextStep} />;
  }
  if (step === 2) {
    return <Step2Document onNext={nextStep} />;
  }
  return <Step3Stripe />;
}

