var mustExist = false;

$(function() {
  var initialMessage = $('#message').text();

  $('#noun').keypress(function(event) {
    if (event.keyCode != 13) return;

    $('#message').clearDrink();

    var noun = $('#noun').attr('value').toLowerCase().replace(/[^a-z0-9]+/g, '');

    if (noun == '') {
      $('#message').text('I need some letters.');
      return;
    }

    $('#noun').attr('value', noun).focus();

    $('#message').text('Checking...');

    $.post(
      '/',

      { noun: noun },

      function(json) {
        var drink = json.exists != mustExist;

        $('#message').text('');

        if (json.exists) {
          $('#message').append($('<a/>').attr('href', 'http://' + json.domain).attr('target', '_blank').text(json.domain));
          $('#message').append(" exists.");
        } else {
          $('#message').append(json.domain);
          $('#message').append(" does not exist.");
        }

        $('#message').append(drink ? " Drink!" : " Do not drink.");
        $('#message').toggleDrink(drink);

        var li = $('<li>').text(json.noun).toggleDrink(drink);

        $('#history').show().find('ul').append(li);
        $('#new-game').show();
      },

      'json'
    );
  }).focus();

  $('#must-exist').click(function(event){
    event.preventDefault();
    mustExist = true;
    newGame();
  });

  $('#must-not-exist').click(function(event){
    event.preventDefault();
    mustExist = false;
    newGame();
  });

  function newGame() {
    $('#history').hide().find('ul').empty();
    $('#message').clearDrink().text(initialMessage);
    $('#new-game').hide();
    $('#noun').attr('value', '').focus();
  }

  $.fn.toggleDrink = function(drink){
    if (drink) {
      return this.removeClass('no-drink').addClass('drink');
    } else {
      return this.removeClass('drink').addClass('no-drink');
    }
  }

  $.fn.clearDrink = function() {
    return this.removeClass('drink').removeClass('no-drink');
  }
});

