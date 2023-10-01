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
      housingFundLevy: 0,
      totalRelief: 0,
      netTax: 0,
      showResults: false,
      showError: false,
    };

    // Create a ref for the income input field
    this.incomeInputRef = React.createRef();
  }

  handleInputBlur = (event) => {
    const { name, value } = event.target;
    const cleanedValue = value.replace(/,/g, '').trim();

    if (cleanedValue === '') {
      // Display a message if the input is empty
      this.setState({ showError: true });
      this.incomeInputRef.current.focus(); // Focus on the input field
    } else {
      const numericValue = parseFloat(cleanedValue);

      if (!isNaN(numericValue) && numericValue >= 15120) {
        this.setState({
          [name]: numericValue.toFixed(2),
          showResults: false,
          showError: false, // Reset error state
        });

        // Automatically calculate tax when the input is valid
        this.calculateTax();
      } else {
        // Display a message if the input is not a valid number or below 15120
        this.setState({ showError: true });
        this.incomeInputRef.current.focus(); // Focus on the input field
      }
    }
  };

  formatMoney = (value) => {
    return value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  calculateTax = () => {
    const { income, personalRelief } = this.state;

    if (income >= 15120) {
      let taxableIncome = Math.max(income - personalRelief, 24001);

      const nssfRate = 0.06;
      const nssfDeduction = income * nssfRate;

      const nhifRate = 0.0275;
      const nhifDeduction = income * nhifRate;

      const nhifRelief = nhifDeduction * 0.15;
      let totalRelief = parseFloat(nhifRelief) + personalRelief;

      const housingFundLevy = income * 0.015;

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

      incomeTax = Math.max(0, parseFloat(incomeTax));

      let netTax = parseFloat(incomeTax) - parseFloat(totalRelief);

      const totalDeductions =
        parseFloat(this.state.helbDeduction) +
        parseFloat(nssfDeduction) +
        parseFloat(nhifDeduction) +
        parseFloat(netTax) +
        parseFloat(housingFundLevy);

      const netSalary = parseFloat(income) - parseFloat(totalDeductions);

      this.setState({
        nssfDeduction,
        nhifDeduction,
        nhifRelief,
        housingFundLevy,
        incomeTax,
        totalDeductions,
        netSalary,
        showResults: true,
        showError: false,
      });
    }
  };

  render() {
    const {
      income,
      helbDeduction,
      nssfDeduction,
      nhifDeduction,
      incomeTax,
      totalDeductions,
      netSalary,
      personalRelief,
      nhifRelief,
      housingFundLevy,
      showResults,
      showError,
    } = this.state;

    return (
      <div className="tax-calculator">
        <h1 className="calculator-header">
          Net Salary Calculator Ke.
        </h1>
        <div className="input-container">
          <label>Monthly Income (KES):</label>
          <input
            type="text"
            name="income"
            value={income}
            onBlur={this.handleInputBlur}
            onChange={(e) =>
              this.setState({ income: e.target.value, showResults: false })
            }
            onKeyUp={(e) => {
              e.target.value = e.target.value
                .replace(/\D/g, '')
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }}
            className="income-input"
            ref={this.incomeInputRef}
          />
          <button onClick={this.calculateTax} disabled={!income}>
            Calculate Tax
          </button>
        </div>
        {showError && (
          <p className="error-message">
            Please enter a valid income amount above 15120/- which is the
            minimum wage.
          </p>
        )}
        {showResults && (
          <div className="result-container">
            <h2>Breakdown of Deductions:</h2>
            <table className="dotted-border-table">
              <tbody>
                <tr>
                  <th>Item</th>
                  <th>Amount (KES)</th>
                </tr>
                <tr>
                  <td>HELB Deduction</td>
                  <td>
                    <b>{this.formatMoney(helbDeduction)}</b>
                  </td>
                </tr>
                <tr>
                  <td>NSSF Deduction</td>
                  <td>
                    <b>{this.formatMoney(nssfDeduction)}</b>
                  </td>
                </tr>
                <tr>
                  <td>NHIF Deduction</td>
                  <td>
                    <b>{this.formatMoney(nhifDeduction)}</b>
                  </td>
                </tr>
                <tr>
                  <td>MPR</td>
                  <td>
                    <b>{this.formatMoney(personalRelief)}</b>
                  </td>
                </tr>
                <tr>
                  <td>NHIF Relief</td>
                  <td>
                    <b>{this.formatMoney(nhifRelief)}</b>
                  </td>
                </tr>
                <tr>
                  <td>Housing Fund Levy</td>
                  <td>
                    <b>{this.formatMoney(housingFundLevy)}</b>
                  </td>
                </tr>
                <tr>
                  <td>Income Tax</td>
                  <td>
                    <b>{this.formatMoney(incomeTax)}</b>
                  </td>
                </tr>
                <tr>
                  <td>Total Deductions</td>
                  <td>
                    <b>{this.formatMoney(totalDeductions)}</b>
                  </td>
                </tr>
              </tbody>
            </table>
            <h3 className="net-salary">
              Net Salary (KES):{' '}
              <span style={{ color: 'green' }}>
                <b>{this.formatMoney(netSalary)}</b>
              </span>{' '}
            </h3>
          </div>
        )}
      </div>
    );
  }
}

export default TaxCalculator;
