class ExpensesModel extends Fronty.Model {

  constructor() {
    super('ExpensesModel'); //call super

    // model attributes
    this.expenses = [];
    this.expensesTodo = [];
    this.actualPage = 0;
    this.rowsPerPage = 5;
    this.newExpense = null;
    this.editExpense = null;

  }

  irPagina(pagina){
    this.set((self) => {
      self.actualPage = pagina;
    });
  }

  setRowsPerPage(newNum){
    this.set((self) => {
      self.rowsPerPage = newNum;
    });
  }

  setSelectedExpenses(expense) {
    this.set((self) => {
      self.selectedExpenses = expense;
    });
  }

  setExpenses(expenses) {
    this.set((self) => {
      self.expenses = expenses;
    });
  }

  setExpensesTodo(expenses) {
    this.set((self) => {
      self.expensesTodo = expenses;
    });
  }

  setNewExpense(expense) {
    this.set((self) => {
      self.newExpense = expense;
    });
  }

  setEditExpense(expense) {
    this.set((self) => {
      self.editExpense = expense;
    });
  }
}
