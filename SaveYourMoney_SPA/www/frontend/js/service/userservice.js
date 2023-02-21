class UserService {
  constructor() {

  }

  loginWithSessionData() {
    var self = this;
    return new Promise((resolve, reject) => {
      var lastLoginDate = new Date(window.localStorage.getItem("loginDate"));
      var currentDate = new Date();
      var threshold = 1000 * 60 * 60 * 24 * 30; //Un mes en millisegundos
      if (window.sessionStorage.getItem('login') &&
        window.sessionStorage.getItem('pass')) {
        self.login(window.sessionStorage.getItem('login'), window.sessionStorage.getItem('pass'),false)
          .then(() => {
            resolve(window.sessionStorage.getItem('login'));
          })
          .catch(() => {
            reject();
          });
      } else if(window.localStorage.getItem('login') &&
        window.localStorage.getItem('pass') && (currentDate - lastLoginDate < threshold)){
          self.login(window.localStorage.getItem('login'), window.localStorage.getItem('pass'),true)
          .then(() => {
            resolve(window.localStorage.getItem('login'));
          })
          .catch(() => {
            reject();
          });
      } 
      else {
        window.localStorage.removeItem('login');
        window.localStorage.removeItem('pass');
        window.localStorage.removeItem('loginDate');
        resolve(null);
      }
    });
  }

  loginMantenerSesion(login, pass){
    window.localStorage.setItem('login', login);
    window.localStorage.setItem('pass', pass);
    var date = new Date();
    window.localStorage.setItem('loginDate', date.toString());
  }
  
  login(login, pass, mantener) {
    return new Promise((resolve, reject) => {
      
      $.get({
        url: AppConfig.backendServer+'/rest/user/' + login,
        beforeSend: function(xhr) {
          xhr.setRequestHeader("Authorization", "Basic " + btoa(login + ":" + pass));
        }
      })
      .then(() => {
        //keep this authentication forever
          if(mantener == true){
            this.loginMantenerSesion(login,pass);
          }
          window.sessionStorage.setItem('login', login);
          window.sessionStorage.setItem('pass', pass);
          $.ajaxSetup({
            beforeSend: (xhr) => {
              xhr.setRequestHeader("Authorization", "Basic " + btoa(login + ":" + pass));
            }
          });
          resolve();
        })
        .fail((error) => {
          window.sessionStorage.removeItem('login');
          window.sessionStorage.removeItem('pass');
          window.localStorage.removeItem('login');
          window.localStorage.removeItem('pass');
          window.localStorage.removeItem('loginDate');
          $.ajaxSetup({
            beforeSend: (xhr) => {}
          });
          reject(error);
        });
    });
  }

  logout() {
    window.sessionStorage.removeItem('login');
    window.sessionStorage.removeItem('pass');
    window.localStorage.removeItem('login');
    window.localStorage.removeItem('pass');
    window.localStorage.removeItem('loginDate');
    $.ajaxSetup({
      beforeSend: (xhr) => {}
    });
  }

  register(user) {
    return $.ajax({
      url: AppConfig.backendServer+'/rest/user',
      method: 'POST',
      data: JSON.stringify(user),
      contentType: 'application/json'
    });
  }

  deleteUser(user) {
    return $.ajax({
        url: AppConfig.backendServer + '/rest/user/' + user,
        method: 'DELETE'
    });
  }
}