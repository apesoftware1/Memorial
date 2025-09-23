"use client";

import { useState, useEffect } from "react";
import { createBranch } from "@/graphql/mutations/createBranch";

export default function CreateBranchModal({ documentId, isOpen = false, onClose }) {
  const [modalOpen, setModalOpen] = useState(isOpen);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(false);

  // Detect user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
        },
        (err) => {
          console.warn("Geolocation not available or denied", err);
        }
      );
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      data: {
        name,
        location: {
          address,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        },
        company: {
          connect: [{ documentId }], // must be array even if only 1
        },
      },
    };

    try {
      const result = await createBranch(payload);
      console.log("Branch created:", result);
      setModalOpen(false);
      if (onClose) onClose();
      setName("");
      setAddress("");
      setLatitude("");
      setLongitude("");
    } catch (err) {
      console.error("Failed to create branch:", err);
      alert("Failed to create branch. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create Branch</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Branch Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter address manually or leave for auto-detect"
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block mb-1 font-medium">Latitude</label>
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-medium">Longitude</label>
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    if (onClose) onClose();
                  }}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}