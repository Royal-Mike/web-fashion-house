$(() => {
    $('form').submit(function (event) {
        const password = $('#floatingPassword').val();
        const rePassword = $('#floatingRePassword').val();

        if (password !== rePassword) {
            event.preventDefault();
            
        }
    });
});