class LoginComponent extends Fronty.ModelComponent {
    constructor(userModel, router) {
        super(Handlebars.templates.login, userModel);
        this.userModel = userModel;
        this.userService = new UserService();
        this.router = router;

        this.addEventListener('click', '#boton-inicio', (event) => {
            var mantener = document.getElementById("mantener-sesion").checked;
            this.userService.login($('#username').val(), $('#password').val(), mantener)
                .then(() => {
                    this.router.goToPage('analisis');
                    this.userModel.setLoggeduser($('#username').val());
                })
                .catch((error) => {
                    this.userModel.set((model) => {
                        model.loginError = error.responseText;
                    });
                    this.userModel.logout();
                });
        });
    }
    onStart() {
        this.userModel.set((model)=>{
            model.loginError = "";
        });
    }
}