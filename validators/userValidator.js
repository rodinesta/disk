const { body } = require('express-validator');

exports.signUpValidator = [
    body('name')
        .notEmpty().withMessage('Имя не может быть пустым')
        .isLength({ min: 2 }).withMessage('Имя должно содержать не менее 2 символов'),
    body('surname')
        .notEmpty().withMessage('Фамилия не может быть пустой')
        .isLength({ min: 2 }).withMessage('Фамилия должна содержать не менее 2 символов'),
    body('middlename')
        .optional()
        .isLength({ min: 2 }).withMessage('Отчество должно содержать не менее 2 символов'),
    body('email')
        .isEmail().withMessage('Некорректный email'),
    body('username')
        .notEmpty().withMessage('Логин не может быть пустым')
        .isLength({ min: 2 }).withMessage('Логин должен содержать не менее 2 символов'),
    body('password')
        .matches(/(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&*]{8,}/)
        .withMessage('Пароль должен содержать латинские символы (ОБЯЗАТЕЛЬНО ОДНИ СИМВОЛ ЗАГЛАВНЫЙ), цифры и один спецсимвол'),
]
