import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import "./Donate.css";

// Internal components
const DonationCard = ({ mode, setMode, amount, setAmount, customAmount, setCustomAmount, message, setMessage, name, setName, handleDonate }) => {
  const presetAmounts = [500, 1000, 2500, 5000];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="donation-card"
    >
      <h2 className="donation-title">Make a Donation</h2>

      {/* Toggle: Anonymous / With Name */}
      <div className="form-group">
        <div className="toggle-container">
          <button
            onClick={() => setMode("anonymous")}
            className={`toggle-button ${mode === "anonymous" ? "toggle-button-active" : ""}`}
          >
            Anonymous
          </button>
          <button
            onClick={() => setMode("withName")}
            className={`toggle-button ${mode === "withName" ? "toggle-button-active" : ""}`}
          >
            With Name
          </button>
        </div>
      </div>

      {/* Name Input - Show when "With Name" is selected */}
      {mode === "withName" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="form-group"
        >
          <label className="form-label">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="form-input"
          />
        </motion.div>
      )}

      {/* Preset Amount Chips */}
      <div className="form-group">
        <label className="form-label">Select Amount</label>
        <div className="amount-grid">
          {presetAmounts.map((preset) => (
            <motion.button
              key={preset}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setAmount(preset);
                setCustomAmount("");
              }}
              className={`amount-button ${amount === preset ? "amount-button-active" : ""}`}
            >
              ₹{preset.toLocaleString()}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Custom Amount Input */}
      <div className="form-group">
        <label className="form-label">Custom Amount</label>
        <div className="amount-input-wrapper">
          <span className="rupee-symbol">₹</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={customAmount}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, "");
              // Allow empty string for clearing
              if (value === "") {
                setCustomAmount("");
                setAmount(null);
                return;
              }
              // Only allow positive numbers
              const numValue = parseInt(value);
              if (!isNaN(numValue) && numValue >= 0) {
                setCustomAmount(value);
                setAmount(null);
              }
            }}
            onBlur={(e) => {
              const value = parseInt(e.target.value);
              if (isNaN(value) || value < 1000) {
                setCustomAmount("");
              }
            }}
            placeholder="Enter amount"
            className="form-input form-input-amount"
          />
        </div>
        <p className="form-hint">Minimum donation: ₹1,000</p>
      </div>

      {/* Optional Message */}
      <div className="form-group">
        <label className="form-label">Message (Optional)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add a personal message..."
          rows="4"
          className="form-textarea"
        />
      </div>

      {/* CTA Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleDonate}
        disabled={!amount && !customAmount}
        className="donate-button"
      >
        Donate Securely
      </motion.button>

      {/* Trust Indicators */}
      <div className="trust-indicators">
        <TrustRow />
      </div>
    </motion.div>
  );
};

const TrustRow = () => {
  const trustItems = [
    { icon: "🔒", text: "Secure Payment" },
    { icon: "✓", text: "Verified Institution" },
    { icon: "💳", text: "Multiple Payment Methods" },
  ];

  return (
    <div className="trust-row">
      {trustItems.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 + index * 0.1 }}
          className="trust-item"
        >
          <span className="trust-icon">{item.icon}</span>
          <span className="trust-text">{item.text}</span>
        </motion.div>
      ))}
    </div>
  );
};

const ImpactSection = () => {
  const impactPoints = [
    { icon: "🎓", title: "Scholarship Support", description: "Help students access quality education" },
    { icon: "📚", title: "Resource Access", description: "Provide learning materials and tools" },
    { icon: "🌟", title: "Future Opportunities", description: "Create pathways for success" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="impact-section"
    >
      <h1 className="impact-title">Support a Student's Future</h1>
      <p className="impact-description">
        Your contribution makes a lasting impact. Every donation helps students achieve their educational dreams and build a brighter tomorrow.
      </p>

      <div className="impact-points">
        {impactPoints.map((point, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
            className="impact-point"
          >
            <div className="impact-icon">{point.icon}</div>
            <div className="impact-content">
              <h3 className="impact-point-title">{point.title}</h3>
              <p className="impact-point-description">{point.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default function Donate() {
  const [mode, setMode] = useState("anonymous");
  const [amount, setAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");

  const handleDonate = () => {
    // Validate name if "With Name" mode is selected
    if (mode === "withName" && !name.trim()) {
      alert("Please enter your name");
      return;
    }

    const donationAmount = amount || parseInt(customAmount);
    if (!donationAmount || donationAmount < 1000) {
      alert("Please enter a valid amount (minimum ₹1,000)");
      return;
    }
    // Handle donation logic here
    console.log("Donation:", { mode, name, amount: donationAmount, message });
    alert(`Thank you for your donation of ₹${donationAmount.toLocaleString()}!`);
  };

  return (
    <>
      <Navbar showAuthButtons={false} />
      <div className="donate-page-wrapper">
        <div className="donate-page-container">
          {/* Left Section - Impact */}
          <div className="donate-impact-section">
            <ImpactSection />
          </div>

          {/* Right Section - Donation Card */}
          <div className="donate-card-section">
            <DonationCard
              mode={mode}
              setMode={setMode}
              amount={amount}
              setAmount={setAmount}
              customAmount={customAmount}
              setCustomAmount={setCustomAmount}
              message={message}
              setMessage={setMessage}
              name={name}
              setName={setName}
              handleDonate={handleDonate}
            />
          </div>
        </div>
      </div>
    </>
  );
}

