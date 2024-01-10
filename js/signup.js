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
    const form = $('form');
    const passwordInput = $('#floatingPassword');
    const rePasswordInput = $('#floatingRePassword');

    form.submit(function (event) {
        let regx = /[!@#$%^&*(),.?":{}|<>]/;

        if (!validatePassword(passwordInput.val(), rePasswordInput.val())) {
            event.preventDefault();
            setError(passwordInput, 'Mật khẩu phải giống nhau!');
            passwordInput.val('');
            rePasswordInput.val('');
        } else if(passwordInput.val().length < 8 || rePasswordInput.val().length < 8) {
            event.preventDefault();
            setError(passwordInput, 'Mật khẩu ít nhất 8 kí tự');
            setError(rePasswordInput, 'Mật khẩu ít nhất 8 kí tự');
            passwordInput.val('');
            rePasswordInput.val('');
        } else if(specialChars.test(passwordInput.val()) || specialChars.test(rePasswordInput.val())){
            event.preventDefault();
            setError(passwordInput, 'Mật khẩu không chứa các kí tự đặc biệt');
            setError(rePasswordInput, 'Mật khẩu không chứa các kí tự đặc biệt');
            passwordInput.val('');
            rePasswordInput.val('');
        } else {
            setSuccess(passwordInput);
        }
    });

    function validatePassword(password, rePassword) {
        return password === rePassword;
    }
});
