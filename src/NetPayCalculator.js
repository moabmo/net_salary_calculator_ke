import React, { useState } from "react";
import jsPDF from 'jspdf';
import { FaFilePdf, FaCalculator } from 'react-icons/fa';
import './TaxCalculator.css';

const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const NetPayCalculator = () => {
  const [basicSalary, setBasicSalary] = useState("");
  const [allowances, setAllowances] = useState("");
  const [grossSalary, setGrossSalary] = useState("");
  const [hasLoan, setHasLoan] = useState(false);
  const [loanDeduction, setLoanDeduction] = useState("");
  const [hasPension, setHasPension] = useState(false);
  const [pensionType, setPensionType] = useState("none");
  const [pensionAmount, setPensionAmount] = useState("");
  const [pensionPercentage, setPensionPercentage] = useState("");
  const [detailedDeductions, setDetailedDeductions] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const handleDarkModeToggle = () => setDarkMode(!darkMode);

  const handleCalculate = () => {
    let basic = parseFloat(basicSalary) || 0;
    let allowance = parseFloat(allowances) || 0;
    let gross = parseFloat(grossSalary);

    if (gross) {
      basic = gross;
      allowance = 0;
    } else {
      gross = basic + allowance;
    }

    const NSSF_TIER_1 = 420;
    const NSSF_TIER_2 = 1740;
    const SHIF_RATE = 0.0275;
    const HOUSING_LEVY_RATE = 0.015;
    const TAX_RELIEF = 2400;

    let pension = 0;
    if (hasPension) {
      if (pensionType === "fixed") {
        pension = parseFloat(pensionAmount) || 0;
      } else if (pensionType === "percentage") {
        pension = basic * (parseFloat(pensionPercentage) / 100) || 0;
      }
    }

    const nssfContribution = NSSF_TIER_1 + NSSF_TIER_2;
    const shifContribution = gross * SHIF_RATE;
    const housingLevy = gross * HOUSING_LEVY_RATE;

    let taxableIncome = gross - nssfContribution - pension;
    let paye = 0;

    if (taxableIncome <= 24000) {
      paye = taxableIncome * 0.1;
    } else if (taxableIncome <= 32333) {
      paye = 24000 * 0.1 + (taxableIncome - 24000) * 0.25;
    } else if (taxableIncome <= 500000) {
      paye = 24000 * 0.1 + (32333 - 24000) * 0.25 + (taxableIncome - 32333) * 0.3;
    } else if (taxableIncome <= 800000) {
      paye = 24000 * 0.1 + (32333 - 24000) * 0.25 + (500000 - 32333) * 0.3 + (taxableIncome - 500000) * 0.325;
    } else {
      paye = 24000 * 0.1 + (32333 - 24000) * 0.25 + (500000 - 32333) * 0.3 + (800000 - 500000) * 0.325 + (taxableIncome - 800000) * 0.35;
    }

    const relief = 0.15 * (housingLevy + shifContribution) + TAX_RELIEF;
    const finalPAYE = Math.max(paye - relief, 0);

    const loanDeduct = hasLoan ? parseFloat(loanDeduction) || 0 : 0;
    const totalDeductions = nssfContribution + pension + shifContribution + housingLevy + finalPAYE + loanDeduct;
    const finalNetPay = gross - totalDeductions;

    setDetailedDeductions({
      grossSalary: formatNumber(gross.toFixed(2)),
      basicSalary: formatNumber(basic.toFixed(2)),
      allowances: formatNumber(allowance.toFixed(2)),
      nssfContribution: formatNumber((-nssfContribution).toFixed(2)),
      pension: formatNumber((-pension).toFixed(2)),
      shifContribution: formatNumber((-shifContribution).toFixed(2)),
      housingLevy: formatNumber((-housingLevy).toFixed(2)),
      taxableIncome: formatNumber(taxableIncome.toFixed(2)),
      payeBeforeRelief: formatNumber(paye.toFixed(2)),
      taxRelief: formatNumber(relief.toFixed(2)),
      payeAfterRelief: formatNumber(finalPAYE.toFixed(2)),
      loanDeduct: formatNumber((-loanDeduct).toFixed(2)),
      totalDeductions: formatNumber((-totalDeductions).toFixed(2)),
      netPay: formatNumber(finalNetPay.toFixed(2)),
    });
  };

  const downloadPDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;

    const imgPath = `${process.env.PUBLIC_URL}/slip.png`;

    pdf.setFont('Comfortaa', 'normal');

    pdf.addImage(
      imgPath,
      'PNG',
      10,
      10,
      pageWidth - 20,
      100
    );

    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(255, 255, 255);
    pdf.setGState(new pdf.GState({ opacity: 0.8 }));
    pdf.rect(10, 10, pageWidth - 20, 100, 'F');
    pdf.setGState(new pdf.GState({ opacity: 1 }));

    pdf.setFontSize(16);
    pdf.setTextColor('#3498db');
    pdf.text('Payslip', pageWidth / 2, 30, { align: 'center' });

    pdf.setFontSize(11);
    pdf.setTextColor('#2c3e50');
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 14, 40);

    pdf.setFontSize(13);
    pdf.setTextColor('#2ecc71');
    pdf.text('EARNINGS:', 14, 50);
    pdf.setFontSize(11);
    pdf.setTextColor('#2c3e50');
    pdf.text('Basic Salary:', 14, 56);
    pdf.text('Allowances:', 14, 62);
    pdf.setFont(undefined, 'bold');
    pdf.text('Gross Salary:', 14, 68);

    pdf.setFont(undefined, 'normal');
    pdf.text(`Ksh ${detailedDeductions.basicSalary}`, pageWidth - 14, 56, { align: 'right' });
    pdf.text(`Ksh ${detailedDeductions.allowances}`, pageWidth - 14, 62, { align: 'right' });
    pdf.setFont(undefined, 'bold');
    pdf.text(`Ksh ${detailedDeductions.grossSalary}`, pageWidth - 14, 68, { align: 'right' });
    pdf.line(14, 72, pageWidth - 14, 72);

    pdf.setFontSize(13);
    pdf.setTextColor('#e74c3c');
    pdf.text('DEDUCTIONS:', 14, 80);
    pdf.setFontSize(11);
    pdf.setTextColor('#2c3e50');
    pdf.text('NSSF:', 14, 86);
    pdf.text('SHIF/NHIF:', 14, 92);
    pdf.text('Housing Levy:', 14, 98);
    pdf.text('PAYE:', 14, 104);
    if (hasLoan) {
      pdf.text('Loan Deduction:', 14, 110);
    }
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor('#e74c3c');
    pdf.text('Total Deductions:', 14, hasLoan ? 116 : 110);

    pdf.setFont(undefined, 'normal');
    pdf.setTextColor('#2c3e50');
    pdf.text(`Ksh ${detailedDeductions.nssfContribution}`, pageWidth - 14, 86, { align: 'right' });
    pdf.text(`Ksh ${detailedDeductions.shifContribution}`, pageWidth - 14, 92, { align: 'right' });
    pdf.text(`Ksh ${detailedDeductions.housingLevy}`, pageWidth - 14, 98, { align: 'right' });
    pdf.text(`Ksh ${detailedDeductions.payeAfterRelief}`, pageWidth - 14, 104, { align: 'right' });
    if (hasLoan) {
      pdf.text(`Ksh ${detailedDeductions.loanDeduct}`, pageWidth - 14, 110, { align: 'right' });
    }
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor('#e74c3c');
    pdf.text(`Ksh ${detailedDeductions.totalDeductions}`, pageWidth - 14, hasLoan ? 116 : 110, { align: 'right' });
    pdf.line(14, hasLoan ? 120 : 114, pageWidth - 14, hasLoan ? 120 : 114);

    pdf.setFontSize(13);
    pdf.setTextColor('#2ecc71');
    pdf.text('NET PAY:', 14, hasLoan ? 126 : 120);
    pdf.setFontSize(15);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor('#27ae60');
    pdf.text(`Ksh ${detailedDeductions.netPay}`, pageWidth - 14, hasLoan ? 126 : 120, { align: 'right' });
    pdf.line(14, hasLoan ? 130 : 124, pageWidth - 14, hasLoan ? 130 : 124);

    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor('#7f8c8d');
    pdf.text('© 2024 moabmo. All rights reserved.', pageWidth / 2, hasLoan ? 136 : 130, { align: 'center' });

    pdf.save('net_pay_report.pdf');
  };

  return (
    <div className={`container ${darkMode ? "dark" : ""}`}>
      <div className={`toggle-dark-mode ${darkMode ? "active" : ""}`} onClick={handleDarkModeToggle}>
        <div className="toggle-circle"></div>
      </div>

      <div className={`tax-calculator ${darkMode ? "dark" : ""}`}>
        <h1 className="calculator-header">
          <FaCalculator style={{ marginRight: '10px' }} />
          Net Pay Calculator
        </h1>

        <div className="input-container">
          <label>Basic Salary:</label>
          <input
            type="number"
            value={basicSalary}
            onChange={(e) => setBasicSalary(e.target.value)}
            placeholder="Enter basic salary"
          />

          <label>Allowances:</label>
          <input
            type="number"
            value={allowances}
            onChange={(e) => setAllowances(e.target.value)}
            placeholder="Enter allowances"
          />

          <label>Gross Salary (optional):</label>
          <input
            type="number"
            value={grossSalary}
            onChange={(e) => setGrossSalary(e.target.value)}
            placeholder="Enter gross salary"
          />

          <label>
            <input
              type="checkbox"
              checked={hasLoan}
              onChange={(e) => setHasLoan(e.target.checked)}
            />
            Loan Deduction
          </label>
          {hasLoan && (
            <input
              type="number"
              value={loanDeduction}
              onChange={(e) => setLoanDeduction(e.target.value)}
              placeholder="Enter loan deduction amount"
            />
          )}

          <label>
            <input
              type="checkbox"
              checked={hasPension}
              onChange={(e) => setHasPension(e.target.checked)}
            />
            Pension Deduction
          </label>
          {hasPension && (
            <div className="pension-container">
              <label>
                <input
                  type="radio"
                  value="fixed"
                  checked={pensionType === "fixed"}
                  onChange={() => setPensionType("fixed")}
                />
                Fixed Amount
              </label>
              {pensionType === "fixed" && (
                <input
                  type="number"
                  value={pensionAmount}
                  onChange={(e) => setPensionAmount(e.target.value)}
                  placeholder="Enter pension amount"
                />
              )}

              <label>
                <input
                  type="radio"
                  value="percentage"
                  checked={pensionType === "percentage"}
                  onChange={() => setPensionType("percentage")}
                />
                Percentage of Basic Salary
              </label>
              {pensionType === "percentage" && (
                <input
                  type="number"
                  value={pensionPercentage}
                  onChange={(e) => setPensionPercentage(e.target.value)}
                  placeholder="Enter pension percentage"
                />
              )}
            </div>
          )}
        </div>

        <button onClick={handleCalculate}>
          <FaCalculator style={{ marginRight: '5px' }} />
          Calculate Net Pay
        </button>
      </div>

      {detailedDeductions && (
        <div className={`result-card ${darkMode ? "dark" : ""}`} id="report-card">
          <h2>Calculation Details</h2>

          <div className="result-section">
            <p className="result-title">Earnings</p>
            <p>Basic Salary: <span>Ksh {detailedDeductions.basicSalary}</span></p>
            <p>Allowances: <span>Ksh {detailedDeductions.allowances}</span></p>
            <p>Total Earnings: <span>Ksh {detailedDeductions.grossSalary}</span></p>
          </div>

          <div className="result-section">
            <p className="result-title">Deductions</p>
            <p>NSSF Contribution: <span className="negative">Ksh {detailedDeductions.nssfContribution}</span></p>
            {hasPension && (
              <p>Pension Contribution: <span className="negative">Ksh {detailedDeductions.pension}</span></p>
            )}
            <p>SHIF/NHIF Contribution: <span className="negative">Ksh {detailedDeductions.shifContribution}</span></p>
            <p>Housing Levy: <span className="negative">Ksh {detailedDeductions.housingLevy}</span></p>
            {hasLoan && (
              <p>Loan Deduction: <span className="negative">Ksh {detailedDeductions.loanDeduct}</span></p>
            )}
            <p>Total Deductions: <span className="negative">Ksh {detailedDeductions.totalDeductions}</span></p>
            <p>PAYE: <span className="negative">Ksh {detailedDeductions.payeAfterRelief} </span></p>
          </div>

          <div className="result-section">
            <p className="result-title">Tax Relief</p>
            <p>PAYE Before Relief: <span>Ksh {detailedDeductions.payeBeforeRelief}</span></p>
            <p>Tax Relief: <span>Ksh {detailedDeductions.taxRelief}</span></p>
            <p>PAYE After Relief: <span>Ksh {detailedDeductions.payeAfterRelief}</span></p>
          </div>

          <h2 className="net-salary">Net Pay: Ksh {detailedDeductions.netPay}</h2>

          <button onClick={downloadPDF}>
            <FaFilePdf style={{ marginRight: '5px' }} />
            Download PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default NetPayCalculator;
