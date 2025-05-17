const backend_url = 'http://calculatorapp.duckdns.org';
/**
 * Event listener to ensure that the "Calculate" button triggers the calculate function 
 * when the DOM is fully loaded.
 */
document.addEventListener("DOMContentLoaded", () => {
    // Attaches an event listener to the "calculateButton" which triggers the calculate() function on click
    document.getElementById("calculateButton").addEventListener("click", calculate);
    loadCalculations();
})

/**
 * This function performs the arithmetic calculation. It validates the user inputs, 
 * sends a request to the backend API, and updates the UI with the result or any error message.
 */
function calculate(){
     // Retrieve the input values for number1, number2, and the selected operation from the form
    var number1 = document.getElementById("number1").value;
    var number2 = document.getElementById("number2").value;
    var operation = document.getElementById("operation").value;

    // Validates that an operation is selected
    if(operation === ""){
        // Alert the user if no operation is selected
        alert("Please select an operation"); // Exit the function to prevent further processing
        return;
    }

    // Special validation for square root (only number1 is needed)
    if (operation === "square-root") {
        if (number1 === "" || number1 === undefined) {
            alert("Please enter a number for square root");
            return;
        }
        number2 = null; // Ensure number2 is null since it's not needed
    } else {
    // For other operations, both numbers are required
    if(number1 === "" || number1 === undefined || number2 === "" || number2 === undefined){
        // Alert the user if either number is missing
        alert("Please enter both numbers");
        return; // Exit the function to prevent further processing
    }
}

    // Sends a POST request to the backend API to perform the calculation
    fetch(`${backend_url}/${operation}`, {
        method: "POST", // Set the request method to POST
        headers: {"Content-Type": "application/json"}, // Set the content type to JSON for the body data
        body: JSON.stringify({ 
            operation: operation, // Pass the operation (addition, subtraction, etc.)
            number1: parseFloat(number1), // Convert number1 to a float before sending it
            number2: parseFloat(number2) // Convert number2 to a float before sending it
        })
    })

    // Processes the server's response in JSON format
    .then(response => response.json())
    .then(data => {
        // If the response contains an error field, alert the user
        if(data.error){
            alert(data.error);
        }else{
            // If no error, display the result of the operation in the result div
            document.getElementById("result").innerText = `Result: ${data.result}`;
        }
    })
}

// Loads all saved calculations from the backend and displays them on the page
function loadCalculations(){
    fetch(`${backend_url}/calculations`) // Requests all calculations
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById("calculationList");
        container.innerHTML = ""; // Clears existing entries

        data.forEach(calc => {
            const item = document.createElement("div");
            item.className = "calc-item";

            // Creates HTML for each calculation with Edit and Delete buttons
            item.innerHTML = `
            <div class="mb-2">
                <strong class="mr-3">${calc.number1} ${calc.operation} ${calc.number2 ?? ""} = ${calc.result}</strong>
                <button class="btn btn-sm btn-danger mr-2" onclick="deleteCalculation('${calc._id}')">Delete</button>
                <button class="btn btn-sm btn-warning mr-2" onclick="startEdit('${calc._id}', '${calc.operation}', ${calc.number1}, ${calc.number2}, ${calc.result})">Edit</button>
            </div>
            `;
            container.appendChild(item); // Adds to the page
        })
    })
}

// Deletes a calculation by ID and reloads the list
function deleteCalculation(id){
    fetch(`${backend_url}/calculations/${id}`, {
        method: "DELETE"
    })
    .then(() => {
        alert("Calculation deleted");
        loadCalculations(); // Refreshes list after deletion
    });
}

// Loads selected calculation into the form for editing
function startEdit(id, operation, number1, number2, result){
    document.getElementById("number1").value = number1;
    document.getElementById("operation").value = operation;
    document.getElementById("number2").value = number2 || "";
    document.getElementById("result").innerText = `Editing calculation ID: ${id}`;

    const calcBtn = document.getElementById("calculateButton");
    calcBtn.innerText = "Save Update";

    // Replaces existing button to remove old event listeners
    const newBtn = calcBtn.cloneNode(true);
    calcBtn.parentNode.replaceChild(newBtn, calcBtn);

    // Attaches new listener for updating this specific calculation
    newBtn.addEventListener("click", () => {
        updateCalculation(id);
    });
}

// Sends updated calculation data to the server
function updateCalculation(id) {
    const number1 = parseFloat(document.getElementById("number1").value);
    const number2 = parseFloat(document.getElementById("number2").value);
    const operation = document.getElementById("operation").value;

    // Safely computes result based on operation type
    const result = eval(`${number1} ${operation === 'add' ? '+' : 
                                    operation === 'subtract' ? '-' : 
                                    operation === 'multiply' ? '*' : 
                                    operation === 'divide' ? '/' : 
                                    operation === 'modulo' ? '%' :
                                    operation === 'exponentiation' ? '**' : 
                                    ''} ${number2 || 0}`);

    // Sends PUT request to update the calculation
    fetch(`${backend_url}/calculations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation, number1, number2, result })
    })
    .then(() => {
        alert("Calculation updated");

        // Restores original button text and click handler
        document.getElementById("calculateButton").innerText = "Calculate";
        document.getElementById("calculateButton").onclick = calculate;

        loadCalculations(); // Refreshes the list
    });
}