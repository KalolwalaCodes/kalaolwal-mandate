import html2pdf from "html2pdf.js";
import React, { useRef, useState, useEffect } from "react";

// Now EditText2 receives a pdfUrl prop
const EditText2 = ({ pdfUrl }) => {
  const [extractedData, setExtractedData] = useState([]);
  const pdfContainer = useRef();
  const pageHeaderImage = useRef();

  // Modified submitFile function: fetches PDF from URL instead of using a file input
  const submitFile = async () => {
    if (!pdfUrl) {
      console.error("No PDF URL provided.");
      return;
    }
    try {
      // Fetch the PDF from the given URL and convert to a blob
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF. Status: ${response.status}`);
      }
      const blob = await response.blob();

      // Prepare FormData with the PDF blob (optionally provide a filename)
      const formData = new FormData();
      formData.append("file", blob, "document.pdf");

      // Send the FormData to your backend
      const raw = await fetch("http://localhost:4000/api/upload", {
        method: "POST",
        body: formData,
      });
      const res = await raw.json();
      console.log("Response from backend:", res);

      // Process the response (this example reuses your filtering logic)
      const filteredData = [];
      for (let i = 0; i < res.length; i++) {
        filteredData.push(res[i]);
        // Example: if you detect a specific piece of text, insert extra HTML
        if (
          res[i] ===
          "<b>Scope&nbsp;of&nbsp;Work&nbsp;(________________)&nbsp;<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>__________,&nbsp;_______________________,&nbsp;________________&nbsp;</b>"
        ) {
          filteredData.push(`
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <table class="border-black border-x border-t border-collapse w-full">
              <tr class="border-black border-b border-collapse">
                <th class="border-black border-x w-[30%] p-1">Particulars</th>
                <th class="border-black border-x p-1">Scope of work</th>
              </tr>
              <tr class="border-black border-b border-collapse">
                <td class="border-black border-x p-1" contentEditable>Data</td>
                <td class="border-black border-x p-1" contentEditable>Data</td>
              </tr>
            </table>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
          `);
        }
        // Break out of the loop if a certain marker is reached
        if (
          res[i] === "<b>Annexure&nbsp;I&nbsp;:&nbsp;Cost&nbsp;of&nbsp;stock images&nbsp;</b>"
        ) {
          break;
        }
      }
      // Append extra HTML (for example, a stock image chart)
      filteredData.push(`
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <table class="border-black border-x border-t border-collapse w-full">
          <tr class="border-black border-b">
            <th class="border-black border-x border-collapse p-1" colSpan="3">Shutterstock</th>
          </tr>
          <tr class="border-black border-b">
            <td class="border-black border-x border-collapse p-1">Upto 2 images</td>
            <td class="border-black border-x border-collapse p-1">Upto 5 images</td>
            <td class="border-black border-x border-collapse p-1">Upto 25 images</td>
          </tr>
          <tr class="border-black border-b">
            <td class="border-black border-x border-collapse p-1">USD 29</td>
            <td class="border-black border-x border-collapse p-1">USD 49</td>
            <td class="border-black border-x border-collapse p-1">USD 229</td>
          </tr>
          <!-- Additional rows for iStock, Getty, Images Bazaar, etc. -->
        </table>
      `);
      setExtractedData(filteredData);
    } catch (error) {
      console.error("Error processing PDF:", error);
    }
  };

  // Optionally, you can auto-submit when the pdfUrl is provided:
  useEffect(() => {
    if (pdfUrl) {
      submitFile();
    }
  }, [pdfUrl]);

  // Existing saveFile functionality remains unchanged.
  const saveFile = async () => {
    // Insert a header image at the top of the PDF container
    const firstPageHeader = document.createElement("img");
    firstPageHeader.src = "/header.jpg";
    firstPageHeader.style.paddingTop = "10px";
    pdfContainer.current.insertBefore(
      firstPageHeader,
      pdfContainer.current.firstChild
    );

    // Dynamically add page breaks based on the container's children heights
    const children = pdfContainer.current.children;
    const maxPageHeight = 1070;
    let currentPageHeight = 0;
    for (let i = 0; i < children.length; i++) {
      if (
        children[i].offsetHeight >
        maxPageHeight - pageHeaderImage.current.offsetHeight
      ) {
        alert(
          "Element too big to fit in one page. Please divide it into smaller paragraphs."
        );
        return;
      }

      if (currentPageHeight + children[i].offsetHeight > maxPageHeight) {
        const endDelimeter = document.createElement("div");
        const headerImage = document.createElement("img");
        endDelimeter.classList.add("html2pdf__page-break");
        headerImage.classList.add("mt-3");
        headerImage.src = "/header.jpg";
        headerImage.style.paddingTop = "10px";
        children[i].parentNode.insertBefore(headerImage, children[i]);
        children[i].parentNode.insertBefore(endDelimeter, children[i]);
        currentPageHeight =
          children[i].offsetHeight + pageHeaderImage.current.offsetHeight;
      } else {
        currentPageHeight += children[i].offsetHeight;
      }
    }
    await html2pdf().from(pdfContainer.current).save();
  };

  return (
    <>
      {/* Removed the file input since we are using the URL */}
      <div className="flex justify-center gap-4 my-4">
        <button
          className="rounded-md px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black"
          onClick={submitFile}
        >
          Submit
        </button>
        <button
          className="rounded-md px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black"
          onClick={() => {
            saveFile().then(() => (pdfContainer.current.innerHTML = ""));
          }}
        >
          Download
        </button>
      </div>
      {/* Dummy image used to compute header height */}
      <img src="/header.jpg" ref={pageHeaderImage} hidden />
      <div className="flex justify-center">
        <div
          contentEditable={true}
          className="w-[800px] px-8"
          ref={pdfContainer}
        >
          {extractedData.map((data, index) =>
            // Using a regular paragraph for each HTML chunk; adjust as needed.
            <p key={index} dangerouslySetInnerHTML={{ __html: data }}></p>
          )}
        </div>
      </div>
    </>
  );
};

export default EditText2;
