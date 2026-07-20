import { PowHome } from "@/components/pow-home";

export default function Page() {
  return <PowHome workerOnboardingEnabled={process.env.WORKER_ONBOARD_ENABLED === "true"} />;
}
