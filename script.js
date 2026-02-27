// --- DATABASE (LocalStorage) ---
// This acts as your database.

let inventory = JSON.parse(localStorage.getItem('inventory')) || [
    { id: 1, name: "Sardines", price: 50, qty: 20 },
    { id: 2, name: "Noodles", price: 15, qty: 50 },
    { id: 3, name: "Coffee 3-in-1", price: 8, qty: 5 },
    { id: 4, name: "Shampoo Sachet", price: 12, qty: 100 }
];

let sales = JSON.parse(localStorage.getItem('sales')) || [];
let utang = JSON.parse(localStorage.getItem('utang')) || [];

// --- INITIALIZATION ---
window.onload = function() {
    updateDashboard();
    renderInventory();
    renderSales();
    renderUtang();
    updateProductDropdown();
};

// --- NAVIGATION ---
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active-section'));
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    
    document.getElementById(sectionId).classList.add('active-section');
    
    const navItems = document.querySelectorAll('.nav-links li');
    if(sectionId === 'dashboard') navItems[0].classList.add('active');
    if(sectionId === 'inventory') navItems[1].classList.add('active');
    if(sectionId === 'sales') navItems[2].classList.add('active');
    if(sectionId === 'utang') navItems[3].classList.add('active');

    updateDashboard();
    renderInventory();
    renderSales();
    renderUtang();
    updateProductDropdown();
}

// --- DASHBOARD LOGIC ---
function updateDashboard() {
    document.getElementById('dash-total-products').innerText = inventory.length;

    const today = new Date().toLocaleDateString();
    const todaySales = sales.filter(s => s.date === today);
    const totalSalesAmount = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    document.getElementById('dash-today-sales').innerText = '₱' + totalSalesAmount.toFixed(2);

    document.getElementById('dash-customers-utang').innerText = utang.length;

    const lowStockItems = inventory.filter(item => item.qty < 10);
    document.getElementById('dash-low-stock').innerText = lowStockItems.length;

    const tableBody = document.getElementById('dash-low-stock-table');
    tableBody.innerHTML = '';
    lowStockItems.forEach(item => {
        const row = `<tr>
            <td>${item.name}</td>
            <td>${item.qty}</td>
            <td style="color: red; font-weight: bold;">Restock Needed</td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

// --- INVENTORY LOGIC ---
function addProduct() {
    const name = document.getElementById('prod-name').value;
    const price = parseFloat(document.getElementById('prod-price').value);
    const qty = parseInt(document.getElementById('prod-qty').value);

    if (name && price && qty) {
        const newProduct = {
            id: inventory.length + 1,
            name: name,
            price: price,
            qty: qty
        };
        inventory.push(newProduct);
        saveData();
        renderInventory();
        updateDashboard();
        updateProductDropdown();
        
        document.getElementById('prod-name').value = '';
        document.getElementById('prod-price').value = '';
        document.getElementById('prod-qty').value = '';
    } else {
        alert("Please fill in all fields");
    }
}

// NEW FEATURE: RESTOCK
function restockProduct(id) {
    const product = inventory.find(p => p.id === id);
    if (product) {
        const addQty = prompt(`How many stocks to add for ${product.name}?`, "0");
        const qtyToAdd = parseInt(addQty);
        
        if (!isNaN(qtyToAdd) && qtyToAdd > 0) {
            product.qty += qtyToAdd;
            saveData();
            renderInventory();
            updateDashboard();
            updateProductDropdown(); // Update dropdown in case it was 0
            alert("Stock added successfully!");
        }
    }
}

function deleteProduct(id) {
    if(confirm("Are you sure you want to delete this product?")) {
        inventory = inventory.filter(item => item.id !== id);
        saveData();
        renderInventory();
        updateDashboard();
        updateProductDropdown();
    }
}

function renderInventory() {
    const tableBody = document.getElementById('inventory-table');
    tableBody.innerHTML = '';
    inventory.forEach(item => {
        const row = `<tr>
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>₱${item.price}</td>
            <td>${item.qty}</td>
            <td>
                <button class="btn-restock" onclick="restockProduct(${item.id})">+ Stock</button>
                <button class="btn-delete" onclick="deleteProduct(${item.id})">Delete</button>
            </td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

// --- SALES LOGIC ---
function updateProductDropdown() {
    const select = document.getElementById('sale-product-select');
    select.innerHTML = '<option value="">Select Product</option>';
    inventory.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.text = `${item.name} (Stock: ${item.qty}) - ₱${item.price}`;
        select.appendChild(option);
    });
}

function addSale() {
    const productId = parseInt(document.getElementById('sale-product-select').value);
    const qtySold = parseInt(document.getElementById('sale-qty').value);

    if (productId && qtySold) {
        const product = inventory.find(p => p.id === productId);
        
        if (product && product.qty >= qtySold) {
            product.qty -= qtySold;
            const total = product.price * qtySold;
            const newSale = {
                date: new Date().toLocaleDateString(),
                productName: product.name,
                qty: qtySold,
                total: total
            };
            sales.push(newSale);
            
            saveData();
            renderSales();
            updateDashboard();
            updateProductDropdown();
            
            document.getElementById('sale-qty').value = '';
            alert("Sale recorded successfully!");
        } else {
            alert("Not enough stock or invalid product.");
        }
    } else {
        alert("Please select a product and quantity.");
    }
}

function renderSales() {
    const tableBody = document.getElementById('sales-table');
    tableBody.innerHTML = '';
    sales.slice().reverse().forEach(sale => {
        const row = `<tr>
            <td>${sale.date}</td>
            <td>${sale.productName}</td>
            <td>${sale.qty}</td>
            <td>₱${sale.total.toFixed(2)}</td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

// --- UTANG LOGIC ---
function addUtang() {
    const customer = document.getElementById('utang-customer').value;
    const amount = parseFloat(document.getElementById('utang-amount').value);

    if (customer && amount) {
        const newUtang = {
            customer: customer,
            amount: amount,
            date: new Date().toLocaleDateString()
        };
        utang.push(newUtang);
        saveData();
        renderUtang();
        updateDashboard();
        
        document.getElementById('utang-customer').value = '';
        document.getElementById('utang-amount').value = '';
    } else {
        alert("Please enter customer name and amount.");
    }
}

function payUtang(index) {
    if(confirm("Mark this debt as paid?")) {
        utang.splice(index, 1);
        saveData();
        renderUtang();
        updateDashboard();
    }
}

function renderUtang() {
    const tableBody = document.getElementById('utang-table');
    tableBody.innerHTML = '';
    utang.forEach((debt, index) => {
        const row = `<tr>
            <td>${debt.customer}</td>
            <td>₱${debt.amount.toFixed(2)}</td>
            <td>${debt.date}</td>
            <td><button class="btn-pay" onclick="payUtang(${index})">Paid</button></td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

function saveData() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
    localStorage.setItem('sales', JSON.stringify(sales));
    localStorage.setItem('utang', JSON.stringify(utang));
}
