import React, { useEffect, useState } from "react";
import TableCell from "./TableCell";

const TableRow = ({ cellCount }) => {
  const [cells, setCells] = useState([]);
  useEffect(() => {
    for (let i = 0; i < cellCount; i++) {
      setCells((cells) => [...cells, <TableCell key={i} />]);
    }
  }, []);
  return <tr>{cells}</tr>;
};

export default TableRow;
