"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useAppDispatch } from "@/store/hooks";
import { googleLogin } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { getRoleHome } from "@/lib/roleHome";
import { toast } from "sonner";


export default function GoogleLoginButton() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <GoogleLogin
        onSuccess={async (cred) => {
          if (!cred.credential) return;

          const result = await dispatch(googleLogin(cred.credential));

          if (googleLogin.fulfilled.match(result)) {
            const dest = getRoleHome(result.payload.user.role);
            console.log(`[GoogleLogin] Role "${result.payload.user.role}" → redirecting to ${dest}`);
            router.replace(dest);
          } else {
            toast.error((result.payload as string) ?? "Google login failed.");
          }
        }}
        onError={() => {
          console.error("Google login failed");
          toast.error("Google login failed. Please try again.");
        }}
      />
    </div>
  );
}
