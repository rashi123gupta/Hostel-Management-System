// src/app/profile/page.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';

function ProfilePage() {
  const { userProfile } = useAuth();
  return (
    <div>
      <h1>My Profile</h1>
      <p>Name: {userProfile?.name}</p>
      <p>Email: {userProfile?.email}</p>
      <p>Role: {userProfile?.role}</p>
      {userProfile?.role === 'student' && (
        <>
            <p>Roll Number: {userProfile?.rollNo}</p>
            <p>Hostel: {userProfile?.hostelNo}</p>
            <p>Room: {userProfile?.roomNo}</p>
        </>
      )}
      {/* Add a form here to allow users to edit their details */}
    </div>
  );
}

export default ProfilePage;
