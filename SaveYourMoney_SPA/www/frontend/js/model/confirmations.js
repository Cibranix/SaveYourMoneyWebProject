class ConfirmationsModel extends Fronty.Model {

  constructor() {
    super('confirmations'); //call super

    // model attributes
    this.message = null;
    this.onAccept = null;
  }

  setConfirmation(message, onAccept) {
    this.set((self) => {
      self.message = message;
      self.onAccept = onAccept;
    });
  }
  
}
