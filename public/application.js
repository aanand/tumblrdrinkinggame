function Game() {
  var game = this;

  this.status      = ko.observable('initial');
  this.mustExist   = ko.observable(false);
  this.history     = ko.observableArray();
  this.lastResult  = ko.observable();
  this.shouldDrink = ko.observable();

  this.checkNoun = function(noun) {
    if (noun == '') {
      this.status('noNoun');
      return;
    }

    this.status('checking');
    $.post('/', { noun: noun }, function(json) { game.handleResult(json) }, 'json');
  },

  this.handleResult = function(result) {
    result.shouldDrink = (result.exists != this.mustExist());
    this.history.unshift(result);
    this.status('checked');
  }

  this.newGame = function(mustExist) {
    this.status('initial');
    this.mustExist(mustExist);
    this.history([]);
  }
};

function GameView(game) {
  var view = this;
  this.game = game;

  this.checkNoun = function() {
    var field = $('#noun');
    var noun = field.attr('value').toLowerCase().replace(/[^a-z0-9]+/g, '');

    field.attr('value', noun);

    if (Modernizr.touch) {
      field.blur();
    } else {
      field.focus();
    }

    this.game.checkNoun(noun);
  }

  this.history = ko.computed(function() {
    return game.history().map(function(result) {
      result.cssClass = result.shouldDrink ? "drink" : "no-drink";

      result.wrapInLink = function(text) {
        var element = result.exists ? $("<a/>").text(text).attr({href: "http://" + result.domain, target: '_blank'})
                                    : $("<span/>").text(text);

        return $("<div/>").append(element).html();
      }

      result.existsLabel = result.exists ? 'Exists' : 'Does not exist';

      return result;
    })
  });

  this.lastResult = ko.computed(function() {
    return view.history()[0];
  });

  this.showMessage = ko.computed(function() {
    return game.status() !== "initial";
  });

  this.isChecking = ko.computed(function() {
    return game.status() === "checking";
  });

  this.hasChecked = ko.computed(function() {
    return game.status() === "checked";
  });

  this.messageClass = ko.computed(function() {
    return view.lastResult() && view.lastResult().cssClass;
  });

  this.shouldDrinkNow = ko.computed(function() {
    var lastResult = view.lastResult();
    return lastResult && lastResult.shouldDrink;
  });

  this.showHistory = ko.computed(function() {
    return view.history().length > 0;
  });

  this.showNewGame = this.showHistory;
  this.showCredits = this.showHistory;

  this.newGame = function(mustExist) {
    game.newGame(mustExist);

    var field = $('#noun');
    field.attr('value', '');
    if (!Modernizr.touch) field.focus();
  }
}

$(function() {
  window.TDG = { view: new GameView(new Game()) };
  ko.applyBindings(TDG.view);
  $('#noun').focus();
});

