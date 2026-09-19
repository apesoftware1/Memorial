"use client";

import { useState, Suspense, useCallback } from "react";
import BranchButton from "@/components/BranchButton";
import VideoModal from "@/components/VideoModal";
import Footer from "@/components/Footer";
import { PageLoader } from "@/components/ui/loader";
import ManufacturerProfileEditor from "../ManufacturerProfileEditor";

export default function ManufacturerProfileClient({ company, listings, isFullLoaded, totalListingCount }) {
  const [showVideoModal, setShowVideoModal] = useState(false);

  const handleVideoClick = () => setShowVideoModal(true);

  const handleBranchSelect = useCallback((branch) => {
    // ManufacturerProfileEditor reads branch state via searchParams useEffect;
    // BranchButton also writes ?branch= into the URL (see handleBranchSelect there),
    // so the editor's useEffect at L423 will auto-sync selectedBranch + branchFromUrl.
    if (typeof window !== "undefined") {
      // Force a microtask refresh so listeners downstream fire even without re-render timing
      const evt = new Event("manufacturer:branch-selected", { bubbles: false });
      evt.detail = branch;
      window.dispatchEvent(evt);
    }
  }, []);

  return (
    <div>
      <Suspense fallback={<PageLoader text="Loading profile..." />}>
        <ManufacturerProfileEditor
          isOwner={false}
          company={company}
          listings={Array.isArray(listings) ? listings : []}
          isFullLoaded={Boolean(isFullLoaded)}
          onVideoClick={handleVideoClick}
          externalBranchSelect={handleBranchSelect}
          branchButton={<BranchButton company={company} onBranchSelect={handleBranchSelect} />}
          totalListingCount={totalListingCount}
        />
      </Suspense>

      <VideoModal isOpen={showVideoModal} onClose={() => setShowVideoModal(false)} videoUrl={company?.videoUrl} />

      <Footer />
    </div>
  );
}

