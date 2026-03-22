"use client";

import { useRouter } from "next/navigation";
import { useWeb3 } from "../context/Web3Context";

export default function Home() {
  const router = useRouter();
  const { account, role } = useWeb3();

  const handleRoute = (type) => {
    if (!account) {
      alert("Connect wallet first");
      return;
    }

    if (role !== type) {
      alert(`You are not a ${type}`);
      return;
    }

    router.push(`/${type}`);
  };
  console.log("Account:", account);
  console.log("Role:", role);

  return (
    <div className="flex flex-col items-center mt-20 gap-6">
      <h1 className="text-3xl font-bold">MedTrack</h1>

      <button onClick={() => handleRoute("patient")}>
        Patient
      </button>

      <button onClick={() => handleRoute("doctor")}>
        Doctor
      </button>

      <button onClick={() => handleRoute("admin")}>
        Admin
      </button>
    </div>
  );
}