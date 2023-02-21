class MainComponent extends Fronty.RouterComponent {
    constructor() {

        super('frontyapp', Handlebars.templates.main, 'maincontent');

        // models instantiation
        // we can instantiate models at any place
        this.userModel = new UserModel();
        this.expensesModel = new ExpensesModel();
        this.userService = new UserService();
        this.confirmationsModel = new ConfirmationsModel();
        this.optionsGraphs = new OptionsGraphsModel();

        super.setRouterConfig({
            expenses: {
                component: new ExpensesComponent(this.expensesModel, this.userModel, this.confirmationsModel, 'maincontent'),
                title: 'Expenses'
            },
            login: {
                component: new LoginComponent(this.userModel, this),
                title: 'Login'
            },
            register: {
                component: new RegisterComponent(this.userModel, this),
                tittle: 'Register'
            },
            analisis: {
                component: new GraphComponent(this.userModel,this.optionsGraphs, this),
                tittle: 'Graphs'
            },
            portrait: {
                component: new PortraitComponent(this.routerModel),
                tittle: 'Portrait'
            },
            
            defaultRoute: 'analisis'
        });
        
        Handlebars.registerHelper('currentPage', () => {
            return super.getCurrentPage();
        });

        this.addChildComponent(this._createLanguageComponent());
        //this.addChildComponent(this._createPortraitComponent());
        this.addChildComponent(this._createStatusBarComponent());

        

        var confirmacionComponent = new Fronty.ModelComponent(Handlebars.templates.mensajeconfirmacion, this.confirmationsModel, 'mensajeconfirmacion');
            
        confirmacionComponent.addEventListener('click', '#confirmacion-aceptar', (event) => {
            this.confirmationsModel.onAccept();
        });

        

        confirmacionComponent.addEventListener('click', '#confirmacion-cancelar', (event) => {
            this.confirmationsModel.setConfirmation(null, null);

        });

        this.addChildComponent(confirmacionComponent);


    }

    start() {
        // override the start() function in order to first check if there is a logged user
        // in sessionStorage, so we try to do a relogin and start the main component
        // only when login is checked
        this.userService.loginWithSessionData()
        .then((logged) => {
            if (logged != null) {
                this.userModel.setLoggeduser(logged);
            }
            super.start(); // now we can call start
        });
    }

    _createLanguageComponent() {
        var languageComponent = new Fronty.ModelComponent(Handlebars.templates.language, this.routerModel, 'languagecontrol');
        // language change links
        languageComponent.addEventListener('click', '#englishlink', () => {
            I18n.changeLanguage('en');
            document.location.reload();
        });

        languageComponent.addEventListener('click', '#spanishlink', () => {
            I18n.changeLanguage('default');
            document.location.reload();
        });

        return languageComponent;
    }

    _createStatusBarComponent() {
        var statusbarComponent = new Fronty.ModelComponent(Handlebars.templates.statusbar, this.userModel, 'statusbar');

        statusbarComponent.addEventListener('click', '#logoutLink', () => {
            this.confirmationsModel.setConfirmation("Deseas cerrar sesion?", () => {
                this.confirmationsModel.setConfirmation(null, null);
                this.userModel.logout();
                this.userService.logout();
                this.goToPage("portrait");
            });
        });

        statusbarComponent.addEventListener('click', '#eliminarPerfilLink', () => {

            this.confirmationsModel.setConfirmation("Deseas eliminar el usuario?", () => {
                
                this.userService.deleteUser(this.userModel.currentUser)
                .then(() => {
                    this.confirmationsModel.setConfirmation(null, null);
                    this.userModel.logout();
                    this.userService.logout();
                    this.goToPage("portrait");
                })
                .catch((error) => {
                    this.userModel.set((model) => {
                        model.deleteUserError = error.responseText;
                    });
                });
            });

        });

        return statusbarComponent;
    }

    _createPortraitComponent() {
        var portraitComponent = new Fronty.ModelComponent(Handlebars.templates.portrait, this.routerModel, 'maincontent');
        return portraitComponent;
    }
}