'use client';

import { useState } from 'react';
import CreateBranchModal from './CreatebranchModal';

export default function FloatingCreateBranchButton({ documentId }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg flex items-center justify-center font-medium"
          style={{ minWidth: "150px" }}
        >
          Create Branch
        </button>
      </div>

      {isModalOpen && (
        <CreateBranchModal 
          documentId={documentId} 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}