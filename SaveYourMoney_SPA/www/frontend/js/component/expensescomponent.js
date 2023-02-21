class ExpensesComponent extends Fronty.ModelComponent {
    constructor(expensesModel, userModel, confirmationsModel, router) {
        super(Handlebars.templates.expensestable, expensesModel, confirmationsModel, null, null);


        this.expensesModel = expensesModel;
        this.confirmationsModel = confirmationsModel;
        this.userModel = userModel;
        this.addModel('user', userModel);
        
        this.router = router;

        this.expensesService = new ExpensesService();

        var addEmergente = new Fronty.ModelComponent(Handlebars.templates.expenseadd, this.expensesModel, 'ventana-emergente');
        this.botonesAddForm(addEmergente);
        this.addChildComponent(addEmergente);
        
        this.addEventListener('click', '#anadir-gasto', (event) => {
            this.expensesModel.setNewExpense({});

        });
        
        this.addEventListener('click', '#downloadCSV', (event) => {
            this.createCSV();
        });

        this.addEventListener('change', '#selectRowPerPage', (event) => {
            this.expensesModel.setRowsPerPage($(selectRowPerPage).val());
            this.updateExpenses();
        });
        
    }
    
    onStart() {
        this.updateExpenses();
    }
    
    updateExpenses() {
        this.expensesService.findAllExpenses().then((data) => {            
            this.expensesModel.setExpensesTodo(
                // create a Fronty.Model for each item retrieved from the backend
                data.map(
                    (item) => new ExpenseModel(item.id, item.type_exp, item.date_exp, item.amount, item.description_exp, item.file_exp, item.owner)
                    ));
            this.expensesModel.irPagina(0);
            this.expensesModel.setExpenses(this.paginarExpenses());
            this.actualizarPag();
        });
    }

    actualizarPag(){
        if (this.expensesModel.actualPage > 0) {
            $("#pagAnt").prop('disabled', false);
            this.addEventListener('click', '#pagAnt', (event) => {
                this.expensesModel.irPagina(this.expensesModel.actualPage - 1);
                this.expensesModel.setExpenses(this.paginarExpenses());
                this.actualizarPag();
            });
        } else {
            $("#pagAnt").prop('disabled', true);
        }

        $("#estadoPag").html("Pag " + (this.expensesModel.actualPage + 1) + " / " + Math.ceil(this.expensesModel.expensesTodo.length / this.expensesModel.rowsPerPage));
        
        if (this.expensesModel.actualPage < Math.ceil(this.expensesModel.expensesTodo.length / this.expensesModel.rowsPerPage) - 1) {
            $("#pagSig").prop('disabled', false);
            this.addEventListener('click', '#pagSig', (event) => {
                this.expensesModel.irPagina(this.expensesModel.actualPage + 1);
                this.expensesModel.setExpenses(this.paginarExpenses());
                this.actualizarPag();
            });
        } else {
            $("#pagSig").prop('disabled', true);
        }
    }

    paginarExpenses(){
        var toret = [];
        for (var i = 0; i < this.expensesModel.expensesTodo.length; i += parseInt(this.expensesModel.rowsPerPage)) {
            toret.push(this.expensesModel.expensesTodo.slice(i, i + parseInt(this.expensesModel.rowsPerPage)));
        }
        return toret[this.expensesModel.actualPage];
    }

    createCSV() {
        this.expensesService.findAllExpenses().then((data) => {
            var csvData = [["id", "type_exp", "date_exp", "amount", "description_exp", "file_exp"]];
            if (data.length > 0) {
                data.map((item) => csvData.push([item.id, item.type_exp, this.changeFormatDate(item.date_exp), item.amount, item.description_exp, item.file_exp]));
                csvData.join('\n');
                csvData = csvData.map((row) => row.join(',')).join('\n');
                var csvFile = new Blob([csvData], {type: "text/csv;charset=utf-8"});
                var link = document.createElement('a');
                link.style.display = 'none';
                link.setAttribute('href', window.URL.createObjectURL(csvFile));
                var date = new Date();
                var fecha = date.getDate() + "-" + (date.getMonth()+1) + "-" + date.getFullYear();
                link.setAttribute('download', 'expenses_' + fecha + '.csv');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        });
    }
    
    // Override
    createChildModelComponent(className, element, id, modelItem) {
        return new ExpenseRowComponent(modelItem, this.userModel, this.confirmationsModel, this.expensesModel, this.router, this);
    }

    changeFormatDate(date) {
        var toret = date.split('-');
        return toret.reverse().join('-');
    }

    botonesAddForm(emergente) {
        
        this.addEventListener('click', '#boton-cancelar', (event) => {
            this.expensesModel.type_expError = null;
            this.expensesModel.date_expError = null;
            this.expensesModel.amountError = null;
            this.expensesModel.description_expError = null;
            this.expensesModel.file_expError = null;

            this.expensesModel.setNewExpense(null);
        });

        this.addEventListener('click', '#enviar-anadir', async (event) => {

            var newExpense = {};
            newExpense.tipo = $('#tipo').val();
            newExpense.date = $('#fecha').val();
            newExpense.amount = $('#cantidad').val();
            newExpense.description = $('#descripcion').val();
            newExpense.file = $('#fichero').val();
            newExpense.content = '';

            var fileInput = document.getElementById('fichero');
            var file = fileInput.files[0];
            if (file != null) {
                newExpense.file = file.name;
                var reader = new FileReader();
                reader.readAsArrayBuffer(file);

                await new Promise ((resolve, reject) => {
                    reader.onload = () => {
                        var arrayBuffer = reader.result;
                        var bytes = new Uint8Array(arrayBuffer);
                        var binary = '';
                        for (var i = 0; i < bytes.byteLength; i++) {
                            binary += String.fromCharCode(bytes[i]);
                        }
                        var base64File = btoa(binary);
                        newExpense.content = base64File;
                        resolve();
                    };
                })
            }

            this.expensesService.addExpense(newExpense)
            .then(() => {
                this.expensesModel.setNewExpense(null);

                this.updateExpenses();

                this.expensesModel.type_expError = null;
                this.expensesModel.date_expError = null;
                this.expensesModel.amountError = null;
                this.expensesModel.description_expError = null;
                this.expensesModel.file_expError = null;
                
            })
            .fail((xhr, errorThrown, statusText) => {
                if (xhr.status == 400) {
                    this.expensesModel.set((model) => {
                        var respuestaJSON = xhr.responseJSON;
                        
                        if(respuestaJSON["type_exp"] !=null){
                            model.type_expError = respuestaJSON["type_exp"]
                        }else{
                            model.type_expError = "";
                        }
                        if(respuestaJSON["date_exp"] !=null){
                            model.date_expError = respuestaJSON["date_exp"]
                        }else{
                            model.date_expError = "";
                        }
                        if(respuestaJSON["amount"] !=null){
                            model.amountError = respuestaJSON["amount"]
                        }else{
                            model.amountError = "";
                        }
                        if(respuestaJSON["description_exp"] !=null){
                            model.description_expError = respuestaJSON["description_exp"]
                        }else{
                            model.description_expError = "";
                        }
                        if(respuestaJSON["file_exp"] !=null){
                            model.file_expError = respuestaJSON["file_exp"]
                        }else{
                            model.file_expError = "";
                        }
                    });
                } else {
                    alert('an error has occurred during request: ' + statusText + '.' + xhr.responseText);
                }
            });
        });
    }
}

class ExpenseRowComponent extends Fronty.ModelComponent {
    constructor(expenseModel, userModel, confirmationsModel, expensesModel, router, expensesComponent) {
        super(Handlebars.templates.expensesrow, expenseModel, null, null);

        this.expensesComponent = expensesComponent;
        this.expenseModel = expenseModel;
        this.expensesModel = expensesModel;



        this.userModel = userModel;
        this.addModel('user', userModel); // a secondary model

        this.confirmationsModel = confirmationsModel;
        
        this.router = router;
        this.expensesService = new ExpensesService();

        
        this.addEventListener('click', '.boton-eliminar', (event) =>{

            var id_eliminar = this.getHtmlNodeId().slice(5);

            this.confirmationsModel.setConfirmation("Deseas eliminar el gasto", () => {
                this.expensesService.deleteExpense(id_eliminar)
                .then(() => {
                    this.confirmationsModel.setConfirmation(null, null);
                    this.expensesComponent.updateExpenses();
                })
                .catch((error) => {
                    this.expenseModel.set((model) => {
                        model.deleteError = error.responseText;
                    });
                });
            });
        });


        var editEmergente = new Fronty.ModelComponent(Handlebars.templates.expenseedit, this.expensesModel, 'ventana-emergente-editar');
        this.botonesEditForm(editEmergente, this);
        this.addChildComponent(editEmergente);

        this.addEventListener('click', '.boton-edit', (event) => {
            this.expensesService.findExpense(event.target.getAttribute('item'))
                .then((expense) => {
                    this.expensesModel.setEditExpense(expense);
                    $('#tipo-editar').val(this.expensesModel.editExpense.type_exp);
                    $('#fecha-editar').val(this.expensesModel.editExpense.date_exp);
                    $('#cantidad-editar').val(this.expensesModel.editExpense.amount);
                    $('#descripcion-editar').val(this.expensesModel.editExpense.description_exp);
                    var filename = this.expensesModel.editExpense.file_exp;
                    if (filename.length > 0) {
                        $('#mostrar').val(filename.split("_")[1]);
                    }
                });
        });
    }

    botonesEditForm(emergente, component) {
        emergente.addEventListener('click', '#boton-cancelar-editar', (event) => {
            this.expensesModel.type_expError = null;
            this.expensesModel.date_expError = null;
            this.expensesModel.amountError = null;
            this.expensesModel.description_expError = null;
            this.expensesModel.file_expError = null;

            this.expensesModel.setEditExpense(null);
        });

        emergente.addEventListener('click', '#enviar-editar', async (event) => {
            
            var editExpense = {};
            editExpense.id = this.expensesModel.editExpense.id;

            editExpense.tipo = $('#tipo-editar').val();
            editExpense.date = $('#fecha-editar').val();
            editExpense.amount = $('#cantidad-editar').val();
            editExpense.description = $('#descripcion-editar').val();
            editExpense.file = $('#fichero-editar').val();
            editExpense.content = '';

            var fileInput = document.getElementById('fichero-editar');
            var file = fileInput.files[0];
            if (file != null) {
                editExpense.file = file.name;
                var reader = new FileReader();
                reader.readAsArrayBuffer(file);

                await new Promise ((resolve, reject) => {
                    reader.onload = () => {
                        var arrayBuffer = reader.result;
                        var bytes = new Uint8Array(arrayBuffer);
                        var binary = '';
                        for (var i = 0; i < bytes.byteLength; i++) {
                            binary += String.fromCharCode(bytes[i]);
                        }
                        var base64File = btoa(binary);
                        editExpense.content = base64File;
                        resolve();
                    };
                })
            }
            
            this.expensesService.editExpense(editExpense)
            .then(() => {
                this.expensesModel.setEditExpense(null);

                this.expensesComponent.updateExpenses();

                this.expensesModel.type_expError = null;
                this.expensesModel.date_expError = null;
                this.expensesModel.amountError = null;
                this.expensesModel.description_expError = null;
                this.expensesModel.file_expError = null;
            })
            .fail((xhr, errorThrown, statusText) => {
                if (xhr.status == 400) {
                    this.expensesModel.set((model) => {
                        var respuestaJSON = xhr.responseJSON;
                        
                        if(respuestaJSON["type_exp"] !=null){
                            model.type_expError = respuestaJSON["type_exp"]
                        }
                        if(respuestaJSON["date_exp"] !=null){
                            model.date_expError = respuestaJSON["date_exp"]
                        }
                        if(respuestaJSON["amount"] !=null){
                            model.amountError = respuestaJSON["amount"]
                        }
                        if(respuestaJSON["description_exp"] !=null){
                            model.description_expError = respuestaJSON["description_exp"]
                        }
                        if(respuestaJSON["file_exp"] !=null){
                            model.file_expError = respuestaJSON["file_exp"]
                        }

                    });
                } else {
                    alert('an error has occurred during request: ' + statusText + '.' + xhr.responseText);
                }
            });
            
        });
        
        
    }

}