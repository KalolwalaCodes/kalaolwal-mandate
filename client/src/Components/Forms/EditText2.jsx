import React, { useRef, useState, useEffect } from "react";
import DynamicTableForm from "./DynamicTableForm";

// Now EditText2 receives a pdfUrl prop
const EditText2 = ({ pdfUrl, form, setMandateEditingView }) => {
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
    {/* <DynamicTableForm/> */}
      {/* Removed the file input since we are using the URL */}
      <div className="flex flex-wrap justify-center gap-4 my-4 items-center">
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
          onMouseDown={(e) => {
            e.preventDefault();
            document.execCommand("bold", false, null);
          }}
        >
          <b>B</b>
        </button>

        <button
          className="rounded-md px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black"
          onMouseDown={(e) => {
            e.preventDefault();
            document.execCommand("italic", false, null);
          }}
        >
          <i>I</i>
        </button>

        <button
          className="rounded-md px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black"
          onMouseDown={(e) => {
            e.preventDefault();
            document.execCommand("underline", false, null);
          }}
        >
          <u>U</u>
        </button>

        <button
          className="rounded-md px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black"
          onMouseDown={(e) => {
            e.preventDefault();
            document.execCommand("insertOrderedList");
          }}
        >
          OL
        </button>
        <button
          className="rounded-md px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black"
          onMouseDown={(e) => {
            e.preventDefault();
            document.execCommand("insertUnorderedList");
          }}
        >
          UL
        </button>
        <button
          className="rounded-md px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black"
          onMouseDown={(e) => {
            e.preventDefault();
            document.execCommand("insertHTML", false, costOfImagesTable);
          }}
        >
          Cost of Images Table
        </button>

        <button
          className="rounded-md px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black"
          onMouseDown={(e) => {
            e.preventDefault();
            document.execCommand("insertHTML", false, paymentTable);
          }}
        >
          Payment Table
        </button>

        <button
          className="rounded-md px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black"
          onMouseDown={(e) => {
            e.preventDefault();
            document.execCommand("insertHTML", false, scopeOfWork);
          }}
        >
          Scope of work Table
        </button>
        {/* <DropdownMenuDemo /> */}
      </div>
      <div className="w-[800px] flex justify-center h-[70vh] border-2 mx-auto">
        <div
          contentEditable={true}
          className="overflow-auto border-none outline-none px-6"
          ref={pdfContainer}
        >
          {extractedData.map((data, index) =>
            page_end_delimeter.test(data) ? (
              <span key={index}></span>
            ) : (
              <pre
                style={{
                  fontSize: "16px",
                  fontFamily: "Arial, Helvetica, sans-serif",
                  width: "100%",
                  whiteSpace: "pre-wrap",
                }}
                key={index}
                dangerouslySetInnerHTML={{
                  __html: data.replaceAll("&nbsp;", " ").replaceAll("<br>", ""),
                }}
              ></pre>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default EditText2;

const page_end_delimeter = /<i>\d+\/\d+&nbsp;<\/i>/i;

const costOfImagesTable = `<table style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; borderCollapse: collapse; margin: auto">
<tr>
<th style="border: 1px solid black; padding: 5px 10px" colSpan="3">Shutterstock</th>
</tr>
<tr>
<td style="border: 1px solid black; padding: 5px 10px">Upto 2 images</td>
<td style="border: 1px solid black; padding: 5px 10px">Upto 5 images</td>
<td style="border: 1px solid black; padding: 5px 10px">Upto 25 images</td>
</tr>
<tr>
<td style="border: 1px solid black; padding: 5px 10px">USD 29</td>
<td style="border: 1px solid black; padding: 5px 10px">USD 49</td>
<td style="border: 1px solid black; padding: 5px 10px">USD 229</td>
</tr>
<tr>
<th style="border: 1px solid black; padding: 5px 10px" colSpan="3">iStock</th>
</tr>
<tr>
<td style="border: 1px solid black; padding: 5px 10px">Upto 10 images</td>
<td style="border: 1px solid black; padding: 5px 10px">Upto 25 images</td>
<td style="border: 1px solid black; padding: 5px 10px">Upto 50 images</td>
</tr>
<tr>
<td style="border: 1px solid black; padding: 5px 10px">INR 1,700</td>
<td style="border: 1px solid black; padding: 5px 10px">INR 4,250</td>
<td style="border: 1px solid black; padding: 5px 10px">INR 6,750</td>
</tr>
<tr>
<th style="border: 1px solid black; padding: 5px 10px" colSpan="3">Getty</th>
</tr>
<tr>
<td style="border: 1px solid black; padding: 5px 10px" colSpan="3">
-------------------------- Client to provide -----------------------------
</td>
</tr>
<tr>
<th style="border: 1px solid black; padding: 5px 10px" colSpan="3">Images Bazar</th>
</tr>
<tr>
<td style="border: 1px solid black; padding: 5px 10px" colSpan="3">
-------------------------- Client to provide -----------------------------
</td>
</tr>
</table>`;

const paymentTable = `
<table style="font-family: Arial, Helvetica, sans-serif; borderCollapse: collapse; margin: auto">
<tr>
<th style="border: 1px solid black; padding: 5px 10px">Milestones</th>
<th style="border: 1px solid black; padding: 5px 10px">Payment</th>
</tr>

<tr>
<td style="border: 1px solid black; padding: 5px 10px">At  the  time  of  signing  of  the  contract  / 
Purchase Order</td>
<td style="border: 1px solid black; padding: 5px 10px">50%</td>
</tr>

<tr>
<td style="border: 1px solid black; padding: 5px 10px">First Draft of Content + First cut of Design</td>
<td style="border: 1px solid black; padding: 5px 10px">30%</td>
</tr>

<tr>
<td style="border: 1px solid black; padding: 5px 10px">Before release of the printable file</td>
<td style="border: 1px solid black; padding: 5px 10px">20%</td>
</tr>

</table>
`;

const scopeOfWork = `<table style="font-family: Arial, Helvetica, sans-serif; borderCollapse: collapse; margin: auto">
<tr>
<th style="border: 1px solid black; padding: 5px 10px">Particulars</th>
<th style="border: 1px solid black; padding: 5px 10px">Scope</th>
</tr>

<tr>
<td style="border: 1px solid black; padding: 5px 10px"> </td>
<td style="border: 1px solid black; padding: 5px 10px"> </td>
</tr>
</table>`;
