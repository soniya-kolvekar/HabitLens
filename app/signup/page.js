"use client";

import { createAccount } from "../core/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignUp = async () => {
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password should be at least 6 characters");
      return;
    }

    try {
      await createAccount(email, password);
      router.replace("/login");
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Please log in instead.");
      } else {
        setError(err.message || "Failed to create account.");
      }
    }
  };

  return (
    <div className=" bg-gradient-to-b from-[#5A2A6E] to-[#B58BC6] min-h-screen">
      <h1 className="text-black text-6xl ml-50 font-bold font-[marcellus] py-16">
        Habit Consequence Simulator
      </h1>
      <div className="flex flex-row">
        <div className="  w-full  -py-20"> <h6 className="text-gray-500  ml-65  ">Enter your credentials</h6></div>
        <div className="flex flex-col -ml-335">
          {error && <p className="text-red-600 mb-2">{error}</p>}
          <input className="md:w-90 w-70 h-13 bg-[#E3E8F0] text-black rounded-[5px] mt-10 px-7 " type="email" placeholder="Email*" onChange={(e) => setEmail(e.target.value)}
          />
          <input className="md:w-90 w-70 h-13 bg-[#E3E8F0] text-black rounded-[5px] mt-5 items-center justify-center px-7 " type="password" placeholder="Set Password" onChange={(e) => setPassword(e.target.value)}
          />
          <input className="md:w-90 w-70 h-13 bg-[#E3E8F0] text-black rounded-[5px] mt-5 items-center justify-center px-7 " type="password" placeholder="Confirm Password" onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button className="md:w-50 w-40 h-13  bg-[#C9A3D9] rounded-[5px] mt-5 text-black hover:text-white justify-center items-center md:mx-20   hover:bg-[#5A2A6E]" onClick={handleSignUp}
          >Sign Up
          </button>
          <button className="md:w-50 w-40 h-13 flex flex-col bg-[#C9A3D9] rounded-[5px] mt-5 text-black hover:text-white justify-center items-center md:mx-20   hover:bg-[#5A2A6E]" onClick={() => {

            router.replace('/')
          }}
          >Back
          </button>
        </div>


      </div>

    </div>

  );
}
