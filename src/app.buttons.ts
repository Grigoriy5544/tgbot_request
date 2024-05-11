import {Markup} from "telegraf";

export function actionButtons() {

    return Markup.keyboard(
        [
            Markup.button.callback('📃 Оставить заявку', 'request'),
            Markup.button.callback('💻 О нас', 'bio'),
        ],
        {
            columns: 2,
        }
    ).resize()
}

export function requestButtons() {

    return Markup.keyboard(
        [
            Markup.button.callback('✅ Отправить', 'send'),
            Markup.button.callback('✏️ Изменить', 'edit'),
        ],
        {
            columns: 2,
        }
    ).resize()
}