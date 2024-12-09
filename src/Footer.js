import React from "react";
import Flag from "react-world-flags";

const Footer = () => {
  return (
    <footer
      style={{
        padding: "10px",
        textAlign: "center",
        borderTop: "1px solid #ddd",
      }}
    >
      <p>
        © 2024 moabmo | All rights reserved |
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
