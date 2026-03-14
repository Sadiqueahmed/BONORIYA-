import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] tribal-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#3E2723] mb-2">Welcome Back!</h1>
          <p className="text-[#6B5B4F]">Sign in to share your Bonoriya experience</p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-white shadow-xl border border-[#D4C8B8] rounded-2xl",
              headerTitle: "text-[#3E2723]",
              headerSubtitle: "text-[#6B5B4F]",
              formButtonPrimary: "bg-[#C65D3B] hover:bg-[#B04D2B] text-white",
              formFieldInput: "border-[#D4C8B8] focus:border-[#5D6D3F]",
              footerActionLink: "text-[#C65D3B] hover:text-[#B04D2B]",
            }
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/"
        />
      </div>
    </div>
  );
}
