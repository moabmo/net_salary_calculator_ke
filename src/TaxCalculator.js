import React, { Component } from 'react';
import './TaxCalculator.css';

class TaxCalculator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      income: '',
      helbDeduction: 4000,
      nssfDeduction: 0,
      nhifDeduction: 0,
      incomeTax: 0,
      totalDeductions: 0,
      netSalary: 0,
      personalRelief: 2400,
      nhifRelief: 0,
    };
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;

    // Remove commas and parse the input as a number
    const numericValue = parseFloat(value.replace(/,/g, ''));

    this.setState({
      [name]: numericValue,
    });
  };

  calculateTax = () => {
    const { income, personalRelief } = this.state;

    // Ensure that taxable income is at least 24,001
    let taxableIncome = Math.max(income - personalRelief, 24001);

    // Calculate NSSF deduction (6% of the salary)
    const nssfRate = 0.06;
    const nssfDeduction = income * nssfRate;

    // Calculate NHIF deduction (2.75% of the salary)
    const nhifRate = 0.0275;
    const nhifDeduction = income * nhifRate;

    // Calculate additional NHIF relief (15% of NHIF deduction)
    const nhifRelief = nhifDeduction * 0.15;

    // Define tax bands and rates
    const taxBands = [24000, 8333, 467667, 300000, 800000];
    const taxRates = [0.1, 0.25, 0.3, 0.325, 0.35];

    let incomeTax = 0;

    for (let i = 0; i < taxBands.length; i++) {
      if (taxableIncome <= 0) {
        break;
      }

      const bandIncome = Math.min(taxableIncome, taxBands[i]);
      incomeTax += bandIncome * taxRates[i];
      taxableIncome -= bandIncome;
    }

    // Ensure income tax is not negative
    incomeTax = Math.max(0, incomeTax);

    // Calculate total deductions
    const totalDeductions = this.state.helbDeduction + nssfDeduction + nhifDeduction + incomeTax;

    // Calculate net salary
    const netSalary = income - totalDeductions;

    this.setState({
      nssfDeduction,
      nhifDeduction,
      nhifRelief,
      incomeTax,
      totalDeductions,
      netSalary,
    });
  };

  render() {
    const { income, helbDeduction, nssfDeduction, nhifDeduction, incomeTax, totalDeductions, netSalary, personalRelief, nhifRelief } = this.state;

    return (
      <div className="tax-calculator">
        <h1 className="calculator-header">Kenya Income Tax Calculator (Monthly)</h1>
        <div className="input-container">
          <label>Monthly Income (KES):</label>
          <input
            type="text" // Use 'text' type to allow commas and custom formatting
            name="income"
            value={income.toLocaleString()} // Format the displayed value with commas
            onChange={this.handleInputChange}
            onKeyUp={(e) => {
              // Remove non-numeric characters and format with commas
              e.target.value = e.target.value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }}
            className="income-input"
          />
          <button onClick={this.calculateTax}>Calculate Tax</button>
        </div>
        <div className="result-container">
          <h2>Breakdown of Deductions:</h2>
          <p>HELB Deduction (KES): {helbDeduction.toLocaleString()}</p>
          <p>NSSF Deduction (KES): {nssfDeduction.toLocaleString()}</p>
          <p>NHIF Deduction (KES): {nhifDeduction.toLocaleString()}</p>
          <p>NHIF Relief (KES): {nhifRelief.toLocaleString()}</p>
          <p>Income Tax (KES): {incomeTax.toLocaleString()}</p>
          <p>Total Deductions (KES): {totalDeductions.toLocaleString()}</p>
          <h2 className="net-salary">Net Salary (KES): {netSalary.toLocaleString()}</h2>
        </div>
      </div>
    );
  }
}

export default TaxCalculator;
