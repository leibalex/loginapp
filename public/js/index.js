$.when($.ready).then(() => {
  $('input[name=password]').keyup(function () {
    const passLength = $(this).val().length;
    if (passLength >= 0 && passLength < 5) {
      $('#progress-bar').removeClass().addClass('progress-bar bg-danger');
    }
    if (passLength >= 5 && passLength < 10) {
      $('#progress-bar').removeClass().addClass('progress-bar bg-warning');
    }
    if (passLength >= 10 && passLength < 15) {
      $('#progress-bar').removeClass().addClass('progress-bar bg-info');
    }
    if (passLength >= 15) {
      $('#progress-bar').removeClass().addClass('progress-bar bg-success');
    }
    const step = $('.progress').width() / 20;
    const text = passLength <= 20 ? `${passLength * 5}%` : '100%';
    $('#progress-bar').width(step * (passLength)).text(text);
  });
});
