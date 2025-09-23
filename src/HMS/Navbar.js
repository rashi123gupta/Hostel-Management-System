import "./Navbar.css";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-brand">HostelMS</div>
      <ul className="nav-links">
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/register">Register</Link></li>
        <li><Link to="/leave">Leave</Link></li>
        <li><Link to="/complaints">Complaints</Link></li>
      </ul>
    </nav>
  );
}
