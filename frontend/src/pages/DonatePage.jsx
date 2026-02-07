import { useState } from "react";
import DonateToggle from "../components/Donate/DonateToggle";
import DonationForm from "../components/Donate/DonationForm";
import AdminDonationStatus from "../components/Admin/AdminDonationStatus";
import Navbar from "../components/Navbar";
import "../styles/donate.css";

export default function DonatePage() {
  const [mode, setMode] = useState("anonymous");
  const isAdmin = true;

  return (
    <>
      <Navbar showAuthButtons={false} />

      <div className="donate-wrapper">
        <div className="donate-container">

          <div className="donate-card">
            <h2 className="donate-title">Support a Student</h2>
            <p className="donate-subtitle">
              Your contribution helps students continue their education.
            </p>

            <DonateToggle mode={mode} setMode={setMode} />
            <DonationForm mode={mode} />
          </div>

          {isAdmin && (
            <div className="admin-panel">
              <AdminDonationStatus />
            </div>
          )}

        </div>
      </div>
    </>
  );
}
  