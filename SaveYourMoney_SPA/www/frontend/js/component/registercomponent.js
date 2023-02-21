class RegisterComponent extends Fronty.ModelComponent {
    constructor(userModel, router) {
        super(Handlebars.templates.register, userModel);
        this.userModel = userModel;
        this.router = router;

        this.userService = new UserService();

        

        this.addEventListener('click', '#boton-registro', (event)=>{
            var usuario = Array();
            usuario['username'] = $('#username').val();
            usuario['email'] = $('#email').val();
            usuario['password'] = $('#password').val();

            var jObject={};
            var i;
            for(i in usuario)
            {
                jObject[i] = usuario[i];
            }
            
            

            this.userService.register(jObject)
            .then(()=>{
                
                this.router.goToPage('login');
            })
            .catch((error) =>{
                this.userModel.set((model)=>{
                    var respuestaJSON = error.responseJSON;
                    
                    if(respuestaJSON["username"] !=null){
                        model.usernameError = respuestaJSON["username"]
                    }else{
                        model.usernameError = "";
                    }
                    if(respuestaJSON["email"] !=null){
                        model.emailError = respuestaJSON["email"]
                    }else{
                        model.emailError = ""
                    }
                    if(respuestaJSON["passwd"] !=null){
                        model.passError = respuestaJSON["passwd"]
                    }else{
                        model.passError = ""
                    }

                    if (respuestaJSON["username"]===null && respuestaJSON["email"]===null && respuestaJSON["passwd"]===null) {
                        model.registerError = respuestaJSON
                    }
                    
                });

            })

        });

    }

    onStart() {
        this.userModel.set((model)=>{
            model.usernameError = "";
            model.emailError = "";
            model.passError = "";
        });
    }




}