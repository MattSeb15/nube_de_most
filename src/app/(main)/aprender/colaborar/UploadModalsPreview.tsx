"use client";

import { MultiPdfUploadModal } from "@/components/apuntes/MultiPdfUploadModal";
import { MultiImageUploadModal } from "@/components/apuntes/MultiImageUploadModal";

export function PdfModalPreview() {
  return (
    <MultiPdfUploadModal 
      isOpen={true} 
      inline={true} 
      files={[]} 
      onClose={() => {}} 
      onUpload={async () => {}} 
    />
  );
}

export function ImageModalPreview() {
  return (
    <MultiImageUploadModal 
      isOpen={true} 
      inline={true} 
      files={[]} 
      onClose={() => {}} 
      onUpload={async () => {}} 
    />
  );
}
