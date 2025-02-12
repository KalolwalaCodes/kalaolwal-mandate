import React, { useRef, useState, useEffect } from "react";

// Now EditText2 receives a pdfUrl prop
const EditText2 = ({ pdfUrl, form }) => {
  const [extractedData, setExtractedData] = useState([]);
  const pdfContainer = useRef();

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

      // Process the response (this example reuses your filtering logic)
      const filteredData = [];
      for (let i = 0; i < res.length; i++) {
        let str = res[i];
        if (str.includes("<b>KAPL/__/25-26&nbsp;</b>"))
          str = str.replace(
            "<b>KAPL/__/25-26&nbsp;</b>",
            `<b>${form.kaplNumber}</b>`
          );
        if (
          str.includes(
            "is&nbsp;&nbsp;made&nbsp;effective&nbsp;&nbsp;on&nbsp;&nbsp;<b>__/__/20__</b>"
          )
        )
          str = str.replace(
            "is&nbsp;&nbsp;made&nbsp;effective&nbsp;&nbsp;on&nbsp;&nbsp;<b>__/__/20__</b>",
            `is&nbsp;&nbsp;made&nbsp;effective&nbsp;&nbsp;on&nbsp;&nbsp;<b>${form.agreementDate}</b>`
          );
        if (
          str.includes(
            "<b>________________</b>&nbsp;&nbsp;a&nbsp;&nbsp;Company"
          )
        )
          str = str.replace(
            "<b>________________</b>&nbsp;&nbsp;a&nbsp;&nbsp;Company",
            `<b>${form.clientName}</b>&nbsp;&nbsp;a&nbsp;&nbsp;Company`
          );
        if (str.includes("corporate&nbsp;office&nbsp;at&nbsp;__________"))
          str = str.replace(
            "corporate&nbsp;office&nbsp;at&nbsp;__________",
            `corporate&nbsp;office&nbsp;at&nbsp;<b>${form.clientOffice}</b>`
          );
        if (
          str.includes(
            "<b>WHEREAS,</b>&nbsp;the Client&nbsp;is&nbsp;engaged&nbsp;in&nbsp;the&nbsp;business&nbsp;of&nbsp;_______________.&nbsp;"
          )
        )
          str = str.replace(
            "<b>WHEREAS,</b>&nbsp;the Client&nbsp;is&nbsp;engaged&nbsp;in&nbsp;the&nbsp;business&nbsp;of&nbsp;_______________.&nbsp;",
            `<b>WHEREAS,</b>&nbsp;the Client&nbsp;is&nbsp;engaged&nbsp;in&nbsp;the&nbsp;business&nbsp;of&nbsp;<b>${form.clientBusiness}.</b>&nbsp;`
          );
        if (
          str.includes(
            "The&nbsp;&nbsp;seat&nbsp;&nbsp;or&nbsp;&nbsp;place&nbsp;&nbsp;of&nbsp;&nbsp;the&nbsp;&nbsp;arbitration&nbsp;&nbsp;shall&nbsp;&nbsp;be&nbsp;&nbsp;Kolkata/&nbsp;<br>____________.&nbsp;"
          )
        )
          str = str.replace(
            "The&nbsp;&nbsp;seat&nbsp;&nbsp;or&nbsp;&nbsp;place&nbsp;&nbsp;of&nbsp;&nbsp;the&nbsp;&nbsp;arbitration&nbsp;&nbsp;shall&nbsp;&nbsp;be&nbsp;&nbsp;Kolkata/&nbsp;<br>____________.&nbsp;",
            `The&nbsp;&nbsp;seat&nbsp;&nbsp;or&nbsp;&nbsp;place&nbsp;&nbsp;of&nbsp;&nbsp;the&nbsp;&nbsp;arbitration&nbsp;&nbsp;shall&nbsp;&nbsp;be&nbsp;&nbsp;Kolkata/&nbsp;<br><b>${form.arbitrationPlace}</b>.&nbsp;`
          );
        if (str.includes("&nbsp;<br>Name:&nbsp;___________________&nbsp;"))
          str = str.replace(
            "&nbsp;<br>Name:&nbsp;___________________&nbsp;",
            `&nbsp;<br>Name:&nbsp;${form.makerName}&nbsp;`
          );
        if (str.includes("&nbsp;<br>Designation:&nbsp;________________&nbsp;"))
          str = str.replace(
            "&nbsp;<br>Designation:&nbsp;________________&nbsp;",
            `&nbsp;<br>Designation:&nbsp;${form.makerDesignation}&nbsp;`
          );
        if (str.includes("&nbsp;<br>Date:&nbsp;___/___/20___&nbsp;"))
          str = str.replace(
            "&nbsp;<br>Date:&nbsp;___/___/20___&nbsp;",
            `&nbsp;<br>Date:&nbsp;${form.signatureDate}&nbsp;`
          );
        if (str.includes("Signature:&nbsp;&nbsp;"))
          str = str.replace(
            "Signature:&nbsp;&nbsp;",
            `Signature:&nbsp;&nbsp;<img style="height:50px; max-width: 300px; margin-left: 60px;" src="${form.stamp}"/>`
          );
        filteredData.push(str);
      }

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
    // Logic to add page breaks dynamically
    const children = pdfContainer.current.children;
    const maxPageHeight = 1050;
    for (let i = 0; i < children.length; i++) {
      if (
        children[i].offsetHeight > maxPageHeight
        //  - pageHeaderImage.current.offsetHeight
      ) {
        alert(
          "Element too big to fit in one page. Please divide it into smaller paragraphs."
        );
        return;
      }
    }
    // await html2pdf().from(pdfContainer.current).save();

    const raw = await fetch("http://localhost:4000/convert/html", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Set content type to JSON
      },
      body: JSON.stringify({ html: pdfContainer.current.innerHTML }),
    });
    const blob = await raw.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = "download";
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
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
            saveFile().then(() => {
              alert("File downloaded successfully.");
            });
          }}
        >
          Download
        </button>

        <button
          className="rounded-md px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black"
          onClick={(e) => {
            document.execCommand("bold", false, null);
          }}
        >
          <b>B</b>
        </button>

        <button
          className="rounded-md px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black"
          onClick={(e) => {
            document.execCommand("italic", false, null);
          }}
        >
          <i>I</i>
        </button>

        <button
          className="rounded-md px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black"
          onClick={(e) => {
            document.execCommand("underline", false, null);
          }}
        >
          <u>U</u>
        </button>

        <button
          className="rounded-md px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black"
          onClick={(e) => {
            e.preventDefault();
            document.execCommand("insertOrderedList");
          }}
        >
          OL
        </button>
        <button
          className="rounded-md px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black"
          onClick={(e) => {
            e.preventDefault();
            document.execCommand("insertUnorderedList");
          }}
        >
          UL
        </button>
      </div>
      <div className="flex justify-center h-[70vh] border-2 w-fit mx-auto">
        <div
          style={{
            width: "720px",
          }}
          contentEditable={true}
          className="px-6 overflow-auto border-none outline-none"
          ref={pdfContainer}
        >
          <div></div>

          {extractedData.map((data, index) =>
            page_end_delimeter.test(data) ? (
              <span key={index}></span>
            ) : (
              <p
                style={{
                  fontSize: "16px",
                  fontFamily: "Arial, Helvetica, sans-serif",
                  lineHeight: "22px",
                }}
                key={index}
                dangerouslySetInnerHTML={{ __html: data }}
              ></p>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default EditText2;

const page_end_delimeter = /<i>\d+\/\d+&nbsp;<\/i>/i;

function toDataURL(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    var reader = new FileReader();
    reader.onloadend = function () {
      callback(reader.result);
    };
    reader.readAsDataURL(xhr.response);
  };
  xhr.open("GET", url);
  xhr.responseType = "blob";
  xhr.send();
}

// toDataURL('https://www.gravatar.com/avatar/d50c83cc0c6523b4d3f6085295c953e0', function(dataUrl) {
//   console.log('RESULT:', dataUrl)
// })
