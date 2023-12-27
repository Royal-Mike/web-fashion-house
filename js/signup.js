const setError = (element, message) => {
    const inputControl = element.parent().parent();
    const errorDisplay = inputControl.find('.error');

    errorDisplay.text(message);
}

const setSuccess = (element) => {
    const inputControl = element.parent().parent();
    const errorDisplay = inputControl.find('.error');

    errorDisplay.text('');
}

$(document).ready(function () {
    const passwordInput = $('#floatingPassword');
    const rePasswordInput = $('#floatingRePassword');
    const form = $('form');

    form.submit(function (event) {
        if (!validatePassword(passwordInput.val(), rePasswordInput.val())) {
            event.preventDefault();
            setError(passwordInput, 'Mật khẩu phải giống nhau!');
        } else {
            setSuccess(passwordInput);
        }
    });

    function validatePassword(password, rePassword) {
        return password === rePassword;
    }
});
