import React, { useState } from "react";
import { saveAs } from "file-saver";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

const DocxViewer = () => {
  const [fileName, setFileName] = useState("");
  const [docContent, setDocContent] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      try {
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
        const text = doc.getFullText(); // Extract styled text
        setDocContent(text);
      } catch (error) {
        console.error("Error parsing .docx file:", error);
        alert("Failed to load document.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSave = () => {
    const zip = new PizZip();
    const doc = new Docxtemplater(zip);
    doc.setData({ content: docContent }); // Updated content
    doc.render();
    const blob = doc.getZip().generate({ type: "blob" });
    saveAs(blob, fileName || "document.docx");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <label htmlFor="fileInput" style={{ fontWeight: "bold" }}>
        Upload a .docx file:
      </label>
      <input
        type="file"
        accept=".docx"
        id="fileInput"
        onChange={handleFileUpload}
        style={{ display: "block", margin: "10px 0" }}
      />
      {docContent && (
        <>
          <textarea
            style={{
              width: "100%",
              height: "300px",
              fontSize: "16px",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              lineHeight: "1.6",
            }}
            value={docContent}
            onChange={(e) => setDocContent(e.target.value)}
          />
          <button
            onClick={handleSave}
            style={{
              marginTop: "10px",
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Save Document
          </button>
        </>
      )}
    </div>
  );
};

export default DocxViewer;
