'use strict';

// Get a list of items in inventory based on the classification_id
document.addEventListener("DOMContentLoaded", () => {
  const classificationList = document.querySelector("#classificationList");

  if (classificationList) {
    classificationList.addEventListener("change", function () {
      const classification_id = classificationList.value;
      if (!classification_id) {
        console.log("No classification selected.");
        clearInventoryTable(); // Clear the table if no classification is selected
        return;
      }

      const classIdURL = `/inv/getInventory/${classification_id}`;
      fetch(classIdURL)
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Failed to fetch inventory.");
        })
        .then((data) => {
          if (data.length > 0) {
            buildInventoryList(data);
          } else {
            clearInventoryTable("No vehicles found for this classification.");
          }
        })
        .catch((error) => {
          console.error("Error fetching inventory:", error.message);
          clearInventoryTable("An error occurred while fetching inventory data.");
        });
    });
  }
});

// Build inventory items into HTML table components and inject into DOM
function buildInventoryList(data) {
  const inventoryDisplay = document.getElementById("inventoryDisplay");
  if (!inventoryDisplay) {
    console.error("Inventory display element not found.");
    return;
  }

  let dataTable = `
    <thead>
      <tr>
        <th>Vehicle Name</th>
        <th>Modify</th>
        <th>Delete</th>
      </tr>
    </thead>
    <tbody>
  `;

  data.forEach((vehicle) => {
    dataTable += `
      <tr>
        <td>${vehicle.inv_make} ${vehicle.inv_model}</td>
        <td><a href='/inv/edit/${vehicle.inv_id}' title='Modify'>Modify</a></td>
        <td><a href='/inv/delete/${vehicle.inv_id}' title='Delete'>Delete</a></td>
      </tr>
    `;
  });

  dataTable += "</tbody>";
  inventoryDisplay.innerHTML = dataTable;
}

// Clear inventory table and show a message
function clearInventoryTable(message = "") {
  const inventoryDisplay = document.getElementById("inventoryDisplay");
  if (inventoryDisplay) {
    inventoryDisplay.innerHTML = message ? `<p>${message}</p>` : "";
  }
}
