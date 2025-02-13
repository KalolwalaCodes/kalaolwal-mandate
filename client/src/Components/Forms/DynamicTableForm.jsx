import React, { useRef, useState } from "react";
import TableRow from "./TableRow";

const DynamicTableForm = () => {
  const tableRef = useRef();

  const [rows, setRows] = useState([]);

  const inputColumns = () => {
    return parseInt(prompt("Enter te number of cells.", "3"));
  };

  const appendRow = (cellCount) => {
    setRows((rows) => [
      ...rows,
      <TableRow key={rows.length + 1} cellCount={cellCount} />,
    ]);
  };

  return (
    <section className="fixed top-0 left-0 backdrop-blur-sm bg-[#0000002d] h-screen w-screen flex justify-center items-center">
      <div className="h-[80%] w-[90%] max-w-[800px] bg-white rounded-lg flex flex-col p-4 gap-2">
        {/* Button container */}
        <div className="w-full flex flex-col">
          <div className="self-end">
            <button
              className="rounded-md px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black"
              onClick={() => appendRow(inputColumns())}
            >
              Insert Row
            </button>
          </div>
        </div>
        <table className="block overflow-auto w-[800px]" ref={tableRef}>
          {rows}
        </table>
      </div>
    </section>
  );
};

export default DynamicTableForm;
