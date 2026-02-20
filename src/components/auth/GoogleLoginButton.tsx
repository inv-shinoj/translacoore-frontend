"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useAppDispatch } from "@/store/hooks";
import { googleLogin } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";


export default function GoogleLoginButton() {
  
  const dispatch = useAppDispatch();
  const router = useRouter();

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <GoogleLogin
        onSuccess={cred => {
          if (cred.credential) {
            dispatch(googleLogin(cred.credential));
            console.log("Redirecting to dashboard")
            router.replace("/admin/dashboard");
          }
        }}
        onError={() => {
          console.error("Google login failed");
        }}
      />
    </div>
  );
}
