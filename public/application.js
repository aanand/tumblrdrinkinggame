function Game() {
  var game = this;

  this.status      = ko.observable('initial');
  this.mustExist   = ko.observable(false);
  this.history     = ko.observableArray();
  this.lastResult  = ko.observable();
  this.shouldDrink = ko.observable();

  this.checkNoun = function(form) {
    var noun = $('#noun').attr('value').toLowerCase().replace(/[^a-z0-9]+/g, '');

    if (noun == '') {
      this.status('noNoun');
      return;
    }

    $('#noun').attr('value', noun).focus();
    this.status('checking');
    $.post('/', { noun: noun }, function(json) { game.handleResult(json) }, 'json');
  },

  this.handleResult = function(result) {
    var shouldDrink = result.exists != this.mustExist();
    result.cssClass = shouldDrink ? "drink" : "no-drink";

    this.lastResult(result);
    this.history.push(result);
    this.shouldDrink(shouldDrink);
    this.status('checked');
  }

  this.newGame = function(mustExist) {
    console.log('hi');

    this.status('initial');
    this.mustExist(mustExist);
    this.history([]);
    this.lastResult(null);
    this.shouldDrink(null);
  }
};

$(function() {
  window.TDG = { game: new Game() };
  ko.applyBindings(TDG.game);
  $('#noun').focus();
});

