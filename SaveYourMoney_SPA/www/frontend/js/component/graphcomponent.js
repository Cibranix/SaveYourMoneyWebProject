class GraphComponent extends Fronty.ModelComponent {
    constructor(userModel, optionsGraphs, router) {
        super(Handlebars.templates.graphs, userModel, 'maincontent');
        this.userModel = userModel;
        this.router = router;
        this.optionsGraphs = optionsGraphs;
        this.addModel('options', optionsGraphs);
        this.userService = new UserService();
        this.expenseService = new ExpensesService();

        this.addEventListener("change", "#fechaInicio", () => {
            this.optionsGraphs.setInitDate(document.getElementById("fechaInicio").value);
            this.updateGraphs();
        });

        this.addEventListener("change", "#fechaFin", () => {
            this.optionsGraphs.setFinishDate(document.getElementById("fechaFin").value);
            this.updateGraphs();
        });
        this.optionsGraphs.setFilterList(['COMBUSTIBLE', 'ALIMENTACION', 'SUMINISTRO', 'COMUNICACIONES', 'OCIO']);
        this.addFilterListeners();
    }

    onStart() {
        this.userService.loginWithSessionData().then((logged)=>{
            if (this.optionsGraphs.finishDate == null) {
                let todayDate = new Date().toISOString().slice(0, 10);
                this.optionsGraphs.setFinishDate(todayDate);
            }
            if (this.optionsGraphs.initDate == null) {
                let yearAgoDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().slice(0, 10);
                this.optionsGraphs.setInitDate(yearAgoDate);
            }
            document.getElementById('fechaInicio').value = this.optionsGraphs.initDate;
            document.getElementById('fechaFin').value = this.optionsGraphs.finishDate;
            this.expenseService.getOrderedData(this.optionsGraphs.initDate, this.optionsGraphs.finishDate).done((r) => {
                this.expenses = r;
                this.updateGraphs();
            });
        });
        if(this.userModel.isLogged == false){
            this.router.goToPage('portrait');
        }
    }

    updateGraphs() {
        this.createAndAddLineChart();
        this.createAndAddPieChart();
    }

    addFilterListeners() {
        this.addEventListener("change", '#alimentacion', () => {
            let checkbox = document.getElementById('alimentacion');
            if (checkbox.checked == true &&
                !this.optionsGraphs.filterList.includes('ALIMENTACION')) {
                this.optionsGraphs.addToFilterList('ALIMENTACION');
            }
            if (checkbox.checked == false &&
                this.optionsGraphs.filterList.includes('ALIMENTACION')) {
                this.optionsGraphs.removeFromFilterList('ALIMENTACION');
            }
            this.updateGraphs();
        });
        this.addEventListener("change", '#combustible', () => {
            let checkbox = document.getElementById('combustible');
            if (checkbox.checked == true &&
                !this.optionsGraphs.filterList.includes('COMBUSTIBLE')) {
                this.optionsGraphs.addToFilterList('COMBUSTIBLE');
            }
            if (checkbox.checked == false &&
                this.optionsGraphs.filterList.includes('COMBUSTIBLE')) {
                this.optionsGraphs.removeFromFilterList('COMBUSTIBLE');
            }
            this.updateGraphs();
        });
        this.addEventListener("change", '#suministro', () => {
            let checkbox = document.getElementById('suministro');
            if (checkbox.checked == true &&
                !this.optionsGraphs.filterList.includes('SUMINISTRO')) {
                this.optionsGraphs.addToFilterList('SUMINISTRO');
            }
            if (checkbox.checked == false &&
                this.optionsGraphs.filterList.includes('SUMINISTRO')) {
                this.optionsGraphs.removeFromFilterList('SUMINISTRO');
            }
            this.updateGraphs();
        });
        this.addEventListener("change", '#comunicaciones', () => {
            let checkbox = document.getElementById('comunicaciones');
            if (checkbox.checked == true &&
                !this.optionsGraphs.filterList.includes('COMUNICACIONES')) {
                this.optionsGraphs.addToFilterList('COMUNICACIONES');
            }
            if (checkbox.checked == false &&
                this.optionsGraphs.filterList.includes('COMUNICACIONES')) {
                this.optionsGraphs.removeFromFilterList('COMUNICACIONES');
            }
            this.updateGraphs();
        });
        this.addEventListener("change", '#ocio', () => {
            let checkbox = document.getElementById('ocio');
            if (checkbox.checked == true &&
                !this.optionsGraphs.filterList.includes('OCIO')) {
                this.optionsGraphs.addToFilterList('OCIO');
            }
            if (checkbox.checked == false &&
                this.optionsGraphs.filterList.includes('OCIO')) {
                this.optionsGraphs.removeFromFilterList('OCIO');
            }
            this.updateGraphs();
        });
    }

    createAndAddLineChart() {
        const initDate = this.optionsGraphs.initDate;
        const finishDate = this.optionsGraphs.finishDate;
        let meses = new Array("Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre");
        var startMonth = initDate.split("-")[1];
        var finalMonth = finishDate.split("-")[1];
        var startYear = initDate.split("-")[0];
        var finalYear = finishDate.split("-")[0];

        var numMeses = (parseInt(finalYear) * 12 + parseInt(finalMonth)) - (parseInt(startYear) * 12 + parseInt(startMonth));
        var mesesIntervalo = [];
        var variable = parseInt(startMonth) - 1;
        var cont = numMeses;
        while (cont >= 0) {
            mesesIntervalo.push(I18n.translate(meses[variable]));
            variable = (parseInt(variable) + 1);
            if (variable == 12) variable = 0;
            cont = parseInt(cont) - 1;
        }

        let dictMeses = {
            "Enero": "01",
            "Febrero": "02",
            "Marzo": "03",
            "Abril": "04",
            "Mayo": "05",
            "Junio": "06",
            "Julio": "07",
            "Agosto": "08",
            "Septiembre": "09",
            "Octubre": "10",
            "Noviembre": "11",
            "Diciembre": "12",
        };

        var alimentacion = [];
        var combustible = [];
        var comunicacion = [];
        var suministro = [];
        var ocio = [];

        for (const mes of mesesIntervalo) {
            if (startMonth > 12) {
                startMonth = 1;
                startYear = parseInt(startYear) + 1;
            }
            var sumAlimentacion = 0;
            var sumCombustible = 0;
            var sumComunicacion = 0;
            var sumSuministro = 0;
            var sumOcio = 0;
            for (const index of this.expenses) {
                var dateElements = index['date_exp'].split("-");
                if (dateElements[0] == startYear && dateElements[1] == dictMeses[meses[startMonth - 1]]) {
                    if (index['type_exp'] == "ALIMENTACION" && this.optionsGraphs.filterList.includes("ALIMENTACION")) {
                        sumAlimentacion = sumAlimentacion + index['amount'];
                    }
                    if (index['type_exp'] == "COMBUSTIBLE" && this.optionsGraphs.filterList.includes("COMBUSTIBLE")) {
                        sumCombustible = sumCombustible + index['amount'];
                    }
                    if (index['type_exp'] == "COMUNICACIONES" && this.optionsGraphs.filterList.includes("COMUNICACIONES")) {
                        sumComunicacion = sumComunicacion + index['amount'];
                    }
                    if (index['type_exp'] == "SUMINISTRO" && this.optionsGraphs.filterList.includes("SUMINISTRO")) {
                        sumSuministro = sumSuministro + index['amount'];
                    }
                    if (index['type_exp'] == "OCIO" && this.optionsGraphs.filterList.includes("OCIO")) {
                        sumOcio = sumOcio + index['amount'];
                    }
                }
            }
            alimentacion.push(sumAlimentacion);
            combustible.push(sumCombustible);
            comunicacion.push(sumComunicacion);
            suministro.push(sumSuministro);
            ocio.push(sumOcio);
            startMonth = parseInt(startMonth) + 1;
        }
        this.expenseTypes = [alimentacion, combustible, comunicacion, suministro, ocio];

        let datos = [{
            name: I18n.translate('Alimentación'),
            data: alimentacion
        }, {
            name: I18n.translate('Comunicaciones'),
            data: comunicacion
        }, {
            name: I18n.translate('Combustible'),
            data: combustible
        }, {
            name: I18n.translate('Suministros'),
            data: suministro
        }, {
            name: I18n.translate('Ocio'),
            data: ocio
        }];

        // Configure and put the chart in the Html document
        Highcharts.chart('containerLinea', {
            title: {
                text: ''
            },


            yAxis: {
                title: {
                    text: 'Euros'
                }
            },

            xAxis: {
                accessibility: {
                    rangeDescription: 'Range: 2010 to 2020'
                },
                categories: mesesIntervalo

            },

            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle'
            },

            plotOptions: {
                series: {
                    label: {
                        connectorAllowed: false
                    }
                }
            },

            series: datos,

            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom'
                        }
                    }
                }]
            }

        });
    }

    createAndAddPieChart() {

        var totalAlimentacion = 0;
        var totalCombustible = 0;
        var totalSuministro = 0;
        var totalComunicaciones = 0;
        var totalOcio = 0;

        for (const coste of this.expenseTypes[0]) {
            totalAlimentacion = totalAlimentacion + coste;
        }
        for (const coste of this.expenseTypes[1]) {
            totalCombustible = totalCombustible + coste;
        }
        for (const coste of this.expenseTypes[3]) {
            totalSuministro = totalSuministro + coste;
        }
        for (const coste of this.expenseTypes[2]) {
            totalComunicaciones = totalComunicaciones + coste;
        }
        for (const coste of this.expenseTypes[4]) {
            totalOcio = totalOcio + coste;
        }

        var totalGastos = totalAlimentacion + totalCombustible + totalSuministro + totalComunicaciones + totalOcio;
        if (totalGastos == 0) totalGastos = 1;

        Highcharts.chart('containerTarta', {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: ''
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            accessibility: {
                point: {
                    valueSuffix: '%'
                }
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true
                }
            },

            series: [{
                name: 'Brands',
                colorByPoint: true,
                data: [{
                    name: I18n.translate('Alimentación'),
                    y: totalAlimentacion / totalGastos,
                }, {
                    name: I18n.translate('Comunicaciones'),
                    y: totalComunicaciones / totalGastos,
                }, {
                    name: I18n.translate('Combustible'),
                    y: totalCombustible / totalGastos,
                }, {
                    name: I18n.translate('Suministros'),
                    y: totalSuministro / totalGastos,
                }, {
                    name: I18n.translate('Ocio'),
                    y: totalOcio / totalGastos
                }]
            }]
        });
    }

}