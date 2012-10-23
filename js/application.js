function Tumblr(options) {
  this.getBlogInfo = function(domain, callback) {
    this.request('blog/' + domain + '/info', callback);
  }

  this.request = function(subPath, callback) {
    $.getJSON(
      this.buildURL(subPath),
      { 'api_key': options.apiKey },
      this.handleResponse(callback)
    );
  }

  this.buildURL = function(subPath) {
    return 'http://api.tumblr.com/v2/' + subPath + '?callback=?';
  }

  this.handleResponse = function(callback) {
    return function(json) {
      if (json.meta.status < 200 || json.meta.status >= 300) {
        return callback(json.meta);
      } else {
        return callback(null, json);
      }
    }
  }
}

function Game(tumblr) {
  var game = this;

  this.status      = ko.observable('initial');
  this.mustExist   = ko.observable(false);
  this.history     = ko.observableArray();

  this.checkNoun = function(noun) {
    if (noun == '') {
      this.status('noNoun');
      return;
    }

    this.status('checking');

    var result = {noun: noun, domain: 'fuckyeah'+noun+'.tumblr.com'};

    tumblr.getBlogInfo(result.domain, function(err, _) {
      if (!err) {
        result.exists = true;
        game.handleResult(result);
      } else if (err.status === 404) {
        result.exists = false;
        game.handleResult(result);
      } else {
        game.handleError(err);
      }
    });
  }

  this.handleResult = function(result) {
    result.shouldDrink = (result.exists != this.mustExist());
    this.history.unshift(result);
    this.status('checked');
  }

  this.handleError = function(err) {
    window.console && console.log('HTTP error %s: %s', err.status, err.msg);
    this.status('error');
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

  this.init = function() {
    ko.applyBindings(this);
    $('#noun').focus();
  }

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

  this.error = ko.computed(function() {
    return game.status() === "error";
  });

  this.hasChecked = ko.computed(function() {
    return game.status() === "checked";
  });

  this.messageClass = ko.computed(function() {
    return view.hasChecked() && view.lastResult().cssClass;
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
    $('#noun').attr('value', '').focus();
  }
}

window.TDG = {};

TDG.tumblr = new Tumblr({apiKey: 'xPUCfnbvVOt7F7fevsMROBXTQGOv0lOPdV0ZJNjIbkbdyg8yQp'});
TDG.game   = new Game(TDG.tumblr);
TDG.view   = new GameView(TDG.game);
