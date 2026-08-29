
const display = document.getElementById("display");

const numberButtons =
    document.querySelectorAll(".number");

const operatorButtons =
    document.querySelectorAll(".operator");

const calculateButton =
    document.querySelector('[data-action="calculate"]');

const clearButton =
    document.querySelector('[data-action="clear"]');

const deleteButton =
    document.querySelector('[data-action="delete"]');

const historyList =
    document.getElementById("history-list");

const clearHistoryButton =
    document.getElementById("clear-history");

let currentInput = "0";

let firstNumber = null;

let selectedOperator = null;

let waitingForSecondNumber = false;


// Load previous history from LocalStorage

let calculationHistory =
    JSON.parse(localStorage.getItem("calculatorHistory")) || [];

const updateDisplay = () => {

    display.value = currentInput;
};

const enterNumber = (number) => {

    if (currentInput === "Error") {
        currentInput = "0";
    }


    if (waitingForSecondNumber) {

        currentInput = number;

        waitingForSecondNumber = false;

    } else {

        if (currentInput === "0") {

            currentInput = number;

        } else {

            currentInput += number;
        }
    }


    updateDisplay();
};

const enterDecimal = () => {

    if (currentInput === "Error") {
        currentInput = "0";
    }


    if (waitingForSecondNumber) {

        currentInput = "0.";

        waitingForSecondNumber = false;

        updateDisplay();

        return;
    }


    // Prevent multiple decimal points

    if (!currentInput.includes(".")) {

        currentInput += ".";
    }


    updateDisplay();
};

const performCalculation =
    (first, second, operator) => {

        switch (operator) {

            case "+":
                return first + second;


            case "-":
                return first - second;


            case "*":
                return first * second;


            case "/":

                if (second === 0) {
                    return "Error";
                }

                return first / second;


            case "%":

                if (second === 0) {
                    return "Error";
                }

                return first % second;


            default:
                return second;
        }
    };


const chooseOperator = (operator) => {

    const inputValue =
        parseFloat(currentInput);


    if (currentInput === "Error") {

        clearCalculator();

        return;
    }


    // First operator selection

    if (firstNumber === null) {

        firstNumber = inputValue;

    } else if (
        selectedOperator &&
        !waitingForSecondNumber
    ) {

        const result =
            performCalculation(
                firstNumber,
                inputValue,
                selectedOperator
            );


        if (result === "Error") {

            currentInput = "Error";

            firstNumber = null;
            selectedOperator = null;

            updateDisplay();

            return;
        }


        currentInput = formatNumber(result);

        firstNumber = result;

        updateDisplay();
    }


    selectedOperator = operator;

    waitingForSecondNumber = true;
};


const calculateResult = () => {

    if (
        firstNumber === null ||
        selectedOperator === null ||
        waitingForSecondNumber
    ) {

        return;
    }


    const secondNumber =
        parseFloat(currentInput);


    const firstValue = firstNumber;

    const operatorUsed = selectedOperator;


    const result =
        performCalculation(
            firstValue,
            secondNumber,
            operatorUsed
        );


    if (result === "Error") {

        currentInput = "Error";

        firstNumber = null;
        selectedOperator = null;

        updateDisplay();

        return;
    }


    currentInput = formatNumber(result);


    addToHistory(
        firstValue,
        operatorUsed,
        secondNumber,
        currentInput
    );


    firstNumber = null;

    selectedOperator = null;

    waitingForSecondNumber = false;


    updateDisplay();
};

const formatNumber = (number) => {

    if (!Number.isFinite(number)) {
        return "Error";
    }


    return parseFloat(
        number.toFixed(10)
    ).toString();
};

const clearCalculator = () => {

    currentInput = "0";

    firstNumber = null;

    selectedOperator = null;

    waitingForSecondNumber = false;

    updateDisplay();
};


const deleteLastCharacter = () => {

    if (
        currentInput === "Error" ||
        waitingForSecondNumber
    ) {

        return;
    }


    if (currentInput.length > 1) {

        currentInput =
            currentInput.slice(0, -1);

    } else {

        currentInput = "0";
    }


    updateDisplay();
};


const addToHistory =
    (first, operator, second, result) => {

        const calculation = {
            first,
            operator,
            second,
            result
        };


        calculationHistory.push(calculation);


        // Save to LocalStorage

        localStorage.setItem(
            "calculatorHistory",
            JSON.stringify(calculationHistory)
        );


        displayHistory();
    };


const displayHistory = () => {

    historyList.innerHTML = "";


    if (calculationHistory.length === 0) {

        const message =
            document.createElement("li");

        message.textContent =
            "No calculations yet.";

        message.classList.add(
            "empty-history"
        );

        historyList.appendChild(message);

        return;
    }


    calculationHistory.forEach(
        (calculation) => {

            const {
                first,
                operator,
                second,
                result
            } = calculation;


            const listItem =
                document.createElement("li");


            const operatorSymbol =
                getOperatorSymbol(operator);


            listItem.textContent =
                `${first} ${operatorSymbol} ${second} = ${result}`;


            historyList.appendChild(listItem);
        }
    );
};


const getOperatorSymbol = (operator) => {

    if (operator === "*") {
        return "×";
    }


    if (operator === "/") {
        return "÷";
    }


    return operator;
};

const clearHistory = () => {

    calculationHistory = [];


    localStorage.removeItem(
        "calculatorHistory"
    );


    displayHistory();
};



numberButtons.forEach((button) => {

    button.addEventListener(
        "click",
        () => {

            const number =
                button.dataset.number;


            if (number === ".") {

                enterDecimal();

            } else {

                enterNumber(number);
            }
        }
    );
});


operatorButtons.forEach((button) => {

    button.addEventListener(
        "click",
        () => {

            chooseOperator(
                button.dataset.operator
            );
        }
    );
});



calculateButton.addEventListener(
    "click",
    calculateResult
);


clearButton.addEventListener(
    "click",
    clearCalculator
);


deleteButton.addEventListener(
    "click",
    deleteLastCharacter
);


clearHistoryButton.addEventListener(
    "click",
    clearHistory
);

document.addEventListener(
    "keydown",
    (event) => {

        const key = event.key;


        // Numbers

        if (
            key >= "0" &&
            key <= "9"
        ) {

            enterNumber(key);

            return;
        }


        // Decimal

        if (key === ".") {

            enterDecimal();

            return;
        }


        // Operators

        const validOperators =
            ["+", "-", "*", "/", "%"];


        if (validOperators.includes(key)) {

            chooseOperator(key);

            return;
        }


        // Enter or =

        if (
            key === "Enter" ||
            key === "="
        ) {

            event.preventDefault();

            calculateResult();

            return;
        }


        // Backspace

        if (key === "Backspace") {

            deleteLastCharacter();

            return;
        }


        // Escape

        if (key === "Escape") {

            clearCalculator();
        }
    }
);


updateDisplay();

displayHistory();