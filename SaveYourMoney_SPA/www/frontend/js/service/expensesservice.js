class ExpensesService {
    constructor() {

    }

    findAllExpenses() {
        return $.get(AppConfig.backendServer + '/rest/expense');
    }

    findExpense(id) {
        return $.get(AppConfig.backendServer + '/rest/expense/' + id);
    }

    deleteExpense(id) {
        return $.ajax({
            url: AppConfig.backendServer + '/rest/expense/' + id,
            method: 'DELETE'
        });
    }

    editExpense(expense) {
        return $.ajax({
            url: AppConfig.backendServer + '/rest/expense/' + expense.id,
            method: 'PUT',
            data: JSON.stringify(expense),
            contentType: 'application/json'
        });
    }
    
    addExpense(expense) {
        return $.ajax({
            url: AppConfig.backendServer + '/rest/expense',
            method: 'POST',
            data: JSON.stringify(expense),
            contentType: 'application/json'
        });
    }


    getOrderedData(fechaInicio,fechaFin){
        return $.get(AppConfig.backendServer + '/rest/expense/' + fechaInicio + '/' + fechaFin);
    }

}