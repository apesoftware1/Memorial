"use client";

import { useState, Suspense } from "react";
import BranchButton from "@/components/BranchButton";
import VideoModal from "@/components/VideoModal";
import Footer from "@/components/Footer";
import { PageLoader } from "@/components/ui/loader";
import ManufacturerProfileEditor from "../ManufacturerProfileEditor";

export default function ManufacturerProfileClient({ company, listings, isFullLoaded }) {
  const [showVideoModal, setShowVideoModal] = useState(false);

  const handleVideoClick = () => setShowVideoModal(true);

  return (
    <div>
      <Suspense fallback={<PageLoader text="Loading profile..." />}>
        <ManufacturerProfileEditor
          isOwner={false}
          company={company}
          listings={Array.isArray(listings) ? listings : []}
          isFullLoaded={Boolean(isFullLoaded)}
          onVideoClick={handleVideoClick}
          branchButton={<BranchButton company={company} />}
        />
      </Suspense>

      <VideoModal isOpen={showVideoModal} onClose={() => setShowVideoModal(false)} videoUrl={company?.videoUrl} />

      <Footer />
    </div>
  );
}

