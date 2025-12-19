const expenseForm = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const totalExpense = document.getElementById("total-expense");
const themeToggleBtn = document.getElementById("theme-toggle");

let expenses = [];

themeToggleBtn.addEventListener("click", ()=>{
    document.body.classList.toggle("dark-theme");

    const isDark = document.body.classList.contains("dark-theme");
    themeToggleBtn.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("theme" , isDark ? "dark" : "light");
});

if(localStorage.getItem("theme") === "dark"){
    document.body.classList.add("dark-theme");
    themeToggleBtn.textContent = "☀️";
}

expenseForm.addEventListener("submit", function(e){
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const amount = document.getElementById("amount").value.trim();
    const category = document.getElementById("category").value;

    if(title === "" || amount === "" || category === "" || isNaN(amount) || Number(amount) <= 0){
        alert("Please enter valid title and amount.");
        return;
    }

    const expense = {
        id : Date.now(),
        title : title,
        amount :Number(amount),
        category : category,
        date: new Date().toISOString()
    }

    expenses.push(expense);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    addToList(expense);
    updateTotal();
    expenseForm.reset();
});

window.addEventListener("DOMContentLoaded",()=>{
    const savedData = JSON.parse(localStorage.getItem("expenses"));
    if(savedData){
        expenses = savedData;
        renderList();
        updateTotal();
        updateMonthlySummary();
        updateCategorySummary();
    }
});

function addToList(expense , highlight=false){
    const li = document.createElement("li");
    li.classList.add("fade");

    if(highlight){
        li.classList.add("highlight");
    }

    const text = document.createElement("span");
    text.textContent = `${expense.title} (${expense.category}) - ₹${expense.amount}`;

    const dltBtn = document.createElement("button");
    dltBtn.textContent = "Delete";
    dltBtn.classList.add("delete-btn");
    dltBtn.addEventListener("click", ()=> deleteExpense(expense.id));

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.classList.add("edit-btn");
    editBtn.addEventListener("click" ,()=> editExpense(expense.id));
    
    li.appendChild(text);
    li.appendChild(dltBtn);
    li.appendChild(editBtn);

    expenseList.appendChild(li);
    updateMonthlySummary();
    updateCategorySummary();
}

function deleteExpense(id){
    expenses = expenses.filter(expense => expense.id !== id);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    renderList();
    updateTotal();
    updateMonthlySummary();
    updateCategorySummary();
}

function editExpense(id){
    const expense = expenses.find(expense => expense.id === id);
    document.getElementById("title").value = expense.title;
    document.getElementById("amount").value = expense.amount;
    document.getElementById("category").value = expense.category;

    expenses = expenses.filter(expense => expense.id !== id);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    renderList();
    updateTotal();
    updateMonthlySummary();
    updateCategorySummary();
}

const searchBar = document.getElementById("search-bar");
const monthFilters = document.getElementById("month-filter");
const noResultsMsg = document.getElementById("no-results");

function applyFilters(){
    let filtered = expenses;
    const searchExpense =searchBar.value.toLowerCase();
    if(searchExpense !== ""){
        filtered = filtered.filter(exp=>
            exp.title.toLowerCase().includes(searchExpense) ||
            exp.category.toLowerCase().includes(searchExpense)
        );
    }
    const seletedMonth = Number(monthFilters.value);
    if(seletedMonth !== "all"){
        filtered=filtered.filter(exp=>
            new Date(exp.date).getMonth() == seletedMonth
        );
    }

    if(filtered.length === 0){
        expenseList.innerHTML = "";
        noResultsMsg.style.display = "block";
        document.getElementById("total-amount").textContent = 0;
        return;
    }
    else{
        noResultsMsg.style.display = "none";
    }
    renderList(filtered);
    const total = filtered.reduce((sum,expense)=> sum+expense.amount , 0);
    document.getElementById("total-amount").textContent = total;
}

searchBar.addEventListener("input", applyFilters);

// clearSearchBtn.addEventListener("click", ()=>{
//     searchBar.value = "";
//     noResultsMsg.classList.add("hidden");
//     renderList();
// });

monthFilters.addEventListener("change", applyFilters)

const renderList =(list = expenses)=>{
    expenseList.innerHTML = "";
    list.forEach(expense => addToList(expense));
}

function updateTotal(){
    const total = expenses.reduce((sum,expense) => sum + expense.amount , 0);
    document.getElementById("total-amount").textContent = total;
}

function updateMonthlySummary(){
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthly = expenses.filter(exp=>{
        const expDate = new Date(exp.date);
        return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    });

    const monthTotal = monthly.reduce((sum, exp)=> sum+exp.amount , 0);
    document.getElementById("month-total").textContent = monthTotal;

    const categoryTotals ={};

    monthly.forEach(exp=>{
        if(!categoryTotals[exp.category]){
            categoryTotals[exp.category] = 0;
        }
        categoryTotals[exp.category] += exp.amount;
    });

    const monthCategoryList = document.getElementById("month-category");
    monthCategoryList.innerHTML = "";

    for(const category in categoryTotals){
        const li = document.createElement("li");
        li.textContent = `${category}: ₹${categoryTotals[category]}`;
        monthCategoryList.appendChild(li);
    }
}

function updateCategorySummary() {
    const categoryBody = document.getElementById("category-summary-body");
    categoryBody.innerHTML = "";

    const categoryTotals = {};

    expenses.forEach(exp => {
        if (!categoryTotals[exp.category]) {
            categoryTotals[exp.category] = 0;
        }
        categoryTotals[exp.category] += exp.amount;
    });

    for (const category in categoryTotals) {
        const row = document.createElement("tr");

        const categoryCell = document.createElement("td");
        categoryCell.textContent = category;

        const amountCell = document.createElement("td");
        amountCell.textContent = `₹${categoryTotals[category]}`;

        row.appendChild(categoryCell);
        row.appendChild(amountCell);
        categoryBody.appendChild(row);
    }
}

