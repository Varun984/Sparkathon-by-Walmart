import { Dashboard } from "@/components/dashboard/dashboard";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

const Index = () => {
  return (
    <>
      <SignedIn>
        <Dashboard />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

export default Index;