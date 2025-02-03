import html2pdf from "html2pdf.js";
import React, { useRef, useState } from "react";

const EditText2 = () => {
  const [extractedData, setExtractedData] = useState([]);
  const file = useRef();
  const pdfContainer = useRef();

  // Sends a PDF file to the backend and receives HTML response
  const submitFile = async () => {
    const formData = new FormData();
    formData.append("file", file.current.files[0]);
    const raw = await fetch("http://localhost:3000/api/upload", {
      method: "POST",
      body: formData,
    });

    const res = await raw.json();

    const filteredData = [];
    for (let i = 0; i < res.length; i++) {
      filteredData.push(res[i]);
      // Adding "Scope of Work" table
      if (
        res[i] ===
        "<b>Scope&nbsp;of&nbsp;Work&nbsp;(________________)&nbsp;<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>__________,&nbsp;_______________________,&nbsp;________________&nbsp;</b>"
      )
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
              <td class="border-black border-x p-1" contentEditable>Data </td>
              <td class="border-black border-x p-1" contentEditable>Data </td>
            </tr>
          </table>
      <p>&nbsp;</p>
      <p>&nbsp;</p>
      <p>&nbsp;</p>`);
      if (
        res[i] ===
        "<b>Annexure&nbsp;I&nbsp;:&nbsp;Cost&nbsp;of&nbsp;stock images&nbsp;</b>"
      )
        break;
    }
    // Adding Stock image chart
    filteredData.push(`
      <p>&nbsp;</p>
      <p>&nbsp;</p>
      <p>&nbsp;</p>
      <p>&nbsp;</p>
      <table class="border-black border-x border-t border-collapse w-full">
            <tr class= "border-black border-b">
              <th class="border-black border-x border-collapse p-1" colSpan="3">Shutterstock</th>
            </tr>
            <tr class= "border-black border-b">
              <td class="border-black  border-x border-collapse p-1">Upto 2 images</td>
              <td class="border-black  border-x border-collapse p-1">Upto 5 images</td>
              <td class="border-black  border-x border-collapse p-1">Upto 25 images</td>
            </tr>
            <tr class= "border-black border-b">
              <td class="border-black  border-x border-collapse p-1">USD 29</td>
              <td class="border-black border-x border-collapse p-1">USD 49</td>
              <td class="border-black border-x border-collapse p-1">USD 229</td>
            </tr>

            <tr class= "border-black border-b">
              <th colSpan="3">iStock</th>
            </tr>
            <tr class= "border-black border-b">
              <td class="border-black border-x border-collapse p-1">Upto 10 images</td>
              <td class="border-black border-x border-collapse p-1">Upto 25 images</td>
              <td class="border-black border-x border-collapse p-1">Upto 50 images</td>
            </tr>
            <tr class= "border-black border-b">
              <td class="border-black border-x border-collapse p-1">INR 1,700</td>
              <td class="border-black border-x border-collapse p-1">INR 4,250</td>
              <td class="border-black border-x border-collapse p-1">INR 6,750</td>
            </tr>

            <tr class= "border-black border-b">
              <th colSpan="3">Getty</th>
            </tr>
            <tr class= "border-black border-b">
              <td class="border-black border-x border-collapse text-center p-1" colSpan="3">-------------------------- Client to provide  ----------------------------- </td>
            </tr>

            <tr class= "border-black border-b">
              <th colSpan="3">Images Bazaar</th>
            </tr>
            <tr class= "border-black border-b">
              <td class="border-black border-x border-collapse text-center p-1" colSpan="3"}>-------------------------- Client to provide  ----------------------------- </td>
            </tr>
          </table>`);
    setExtractedData(filteredData);
  };
  const pageHeaderImage = useRef();

  const saveFile = async () => {
    // Adding header to the first page
    const firstPageHeader = document.createElement("img");
    firstPageHeader.src = "/header.jpg";
    firstPageHeader.style.paddingTop = "10px";
    pdfContainer.current.insertBefore(
      firstPageHeader,
      pdfContainer.current.firstChild
    );

    // Logic to add page breaks dynamically
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
        // Adding page break class to the end of the page
        // Addding header image to the top of the page
        endDelimeter.classList.add("html2pdf__page-break");

        // Adding top margin of page
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
      <input type="file" name="file" ref={file} />
      <button
        className="rounded-md mr-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black"
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
      {/* Dummmy image for gettting the size of the page rendered */}
      <img src="/header.jpg" ref={pageHeaderImage} hidden />
      <div className="flex justify-center">
        <div
          contentEditable={true}
          className="w-[800px] px-8"
          ref={pdfContainer}
        >
          {extractedData.map((data, index) =>
            page_end_delimeter.test(data) ? (
              <span key={index}></span>
            ) : (
              <p key={index} dangerouslySetInnerHTML={{ __html: data }}></p>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default EditText2;

const page_end_delimeter = /<i>\d+\/\d+&nbsp;<\/i>/i;
