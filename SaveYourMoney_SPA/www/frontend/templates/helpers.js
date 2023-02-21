Handlebars.registerHelper('if_eq', function(a, b, opts) {
  if (a == b)
    return opts.fn(this);
  else
    return opts.inverse(this);
});

Handlebars.registerHelper('splitFile', function(file) {
  var toret = "";
  if (file != "") {
    toret = file.split("_")[1];
  }
  return toret;
});

Handlebars.registerHelper('invDate', function(date) {
  var toret = date.split('-');
  return toret.reverse().join('-');
});
