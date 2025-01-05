



import React from "react";
import Flag from "react-world-flags";

const Footer = () => {
  //Define the current year
  const currentYear = new Date().getFullYear();
  return (
    <footer
      style={{
        padding: "10px",
        textAlign: "center",
        borderTop: "1px solid #ddd",
      }}
    >
      <p>
        © {currentYear} moabmo | All rights reserved |
        TaxCalculatorKe<Flag
          code="KE"
          style={{
            width: "25px",
            height: "18px",
            borderRadius: "5px",
          }}
        />
      </p>
    </footer>
  );
};

export default Footer;
