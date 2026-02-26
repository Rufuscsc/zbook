"use client";

import React from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { toolbarPlugin, ToolbarProps, ToolbarSlot } from "@react-pdf-viewer/toolbar";

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/toolbar/lib/styles/index.css';

type PdfViewerProps = {
  fileUrl: string;
};

export default function PdfViewer({ fileUrl }: PdfViewerProps) {
  // 1. Initialize both plugins
  // We use the toolbar plugin separately for the floating bar
  const toolbarPluginInstance = toolbarPlugin();
  const { Toolbar } = toolbarPluginInstance;

  // We use the default layout for the sidebars (thumbnails, etc.)
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    // IMPORTANT: We tell the default layout NOT to render its own toolbar
    renderToolbar: () => <React.Fragment />, 
  });

  // 2. Loading Guard to prevent the "Invalid parameter" crash
  if (!fileUrl) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ border: '3px solid #e2e8f0', borderTop: '3px solid #3b82f6', borderRadius: '50%', width: '24px', height: '24px', animation: 'spin 1s linear infinite', margin: '0 auto 10px' }} />
          <p style={{ color: '#64748b', fontSize: '14px' }}>Loading eBook...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div 
      style={{ 
        height: "100vh", 
        width: "100%", 
        position: "relative", // Root must be relative
        overflow: "hidden",
        backgroundColor: "#f1f5f9",
      }}
    >
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        {/* The Viewer container */}
        <div style={{ height: "100%", width: "100%", position: "relative" }}>
          <Viewer
            fileUrl={fileUrl}
            // Use BOTH plugins
            plugins={[defaultLayoutPluginInstance, toolbarPluginInstance]}
          />

          {/* 3. The Floating Toolbar: Placed OUTSIDE the Viewer but INSIDE the relative container */}
          <div
            style={{
              position: 'absolute',
              bottom: '100px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 100, // Highest layer
              display: 'flex',
              justifyContent: 'center',
              pointerEvents: 'none',
              width: '100%',
            }}
          >
            <div style={{ pointerEvents: 'auto' }}>
              <Toolbar>
                {(slots: ToolbarSlot) => {
                  const {
                    CurrentPageInput,
                    GoToNextPage,
                    GoToPreviousPage,
                    NumberOfPages,
                    ShowSearchPopover,
                    Zoom,
                    ZoomIn,
                    ZoomOut,
                  } = slots; // Note: Print and Download are excluded
                  
                  return (
                    <div
                      style={{
                        alignItems: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '9999px',
                        display: 'flex',
                        padding: '6px 20px',
                        gap: '12px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <ShowSearchPopover />
                      <div style={{ width: '1px', height: '20px', backgroundColor: '#e2e8f0' }} />
                      
                      <GoToPreviousPage />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', minWidth: '80px', justifyContent: 'center' }}>
                        <div style={{ width: '35px' }}><CurrentPageInput /></div>
                        <span style={{ color: '#94a3b8' }}>/</span>
                        <NumberOfPages />
                      </div>
                      <GoToNextPage />
                      
                      <div style={{ width: '1px', height: '20px', backgroundColor: '#e2e8f0' }} />
                      
                      <ZoomOut />
                      <div style={{ width: '60px', textAlign: 'center' }}><Zoom /></div>
                      <ZoomIn />
                    </div>
                  );
                }}
              </Toolbar>
            </div>
          </div>
        </div>
      </Worker>
    </div>
  );
}