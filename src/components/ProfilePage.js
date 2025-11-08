// components/ProfilePage.js
import React, { useEffect, useState } from "react";

const ProfilePage = ({ token }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Load profile data
  useEffect(() => {
    fetch("http://localhost:8000/api/profile/", {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  // Handle field change
  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  // Save updates
  const handleSave = () => {
    setSaving(true);
    fetch("http://localhost:8000/api/profile/", {   // ✅ fixed URL
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        username: profile.username || "",
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        app_password:profile.app_password || ""
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setSaving(false);
        alert("Profile updated!");
      })
      .catch((err) => {
        setError(err.message);
        setSaving(false);
      });
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className="text-red-600">Failed to load profile: {error}</p>;
  if (!profile) return <p>No profile data found.</p>;

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">My Profile</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={profile.email || ""}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Username</label>
          <input
            name="username"
            value={profile.username || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">First Name</label>
          <input
            name="first_name"
            value={profile.first_name || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Last Name</label>
          <input
            name="last_name"
            value={profile.last_name || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
  <label className="block text-sm font-medium">App Password</label>
  <input
    name="app_password"
    // type="password"
    value={profile.app_password || ""}
    onChange={handleChange}
    autoComplete="off"
    className="w-full border rounded px-3 py-2"
  />
</div>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
};

export default ProfilePage;
