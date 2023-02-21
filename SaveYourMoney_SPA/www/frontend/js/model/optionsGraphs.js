class OptionsGraphsModel extends Fronty.Model {

  constructor() {
    super('optionsGraphs'); //call super

    // model attributes
    this.initDate = null;
    this.finishDate = null;
    this.filterList = null;
  }

  setInitDate(initDate) {
    this.set((self) => {
      self.initDate = initDate;
    });
  }

  setFinishDate(finishDate) {
    this.set((self) => {
      self.finishDate = finishDate;
    });
  }


  removeFromFilterList(element){
    let index = this.filterList.indexOf(element);
    if(index != -1){
      this.filterList.splice(index,1);
    }
    var newList = this.filterList;
    this.set((self)=> {
      self.filterList = newList;
    })
  }

  addToFilterList(element){
    this.filterList.push(element);
    var newList = this.filterList;
    this.set((self)=> {
      self.filterList = newList;
    })
  }
  
  setFilterList(filterList){
    this.set((self) => {
      self.filterList = filterList;
    });
  }
  
}
