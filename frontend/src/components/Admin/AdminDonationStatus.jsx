export default function AdminDonationStatus() {
  return (
    <div className="card">
      <h4 className="admin-label">Admin Overview</h4>
      <h3>Ongoing Donation</h3>
      <p>Student: <strong>Rahul Sharma</strong></p>
      <p>Goal: ₹1,00,000</p>
      <p>Collected: ₹42,500</p>
      <progress value="42500" max="100000" />
    </div>
  );
}
