pretest-uzbekistan.uz
SERVICE_ID:82886
MERCHANT_ID:46111
SECRET_KEY:9TDkmspVHm7LZ
merchant user id:64082







Сайёра Игамкулова, [15/09/25 17:04]
Здравствуйте. Группа открыто для обсуждения вопросов интеграции и эксплуатации

На сайте docs.click.uz вы можете ознакомиться с документацией и инструкциями по интеграции системы Click. 

Просим обратить внимание, что фискализация чеков является обязательной на сегодняшний день и в случае если вы используете более 1 ИКПУ, необходимо интегрировать метод фискализации чеков https://docs.click.uz/fiscalization/

Если у вас имеется система для учёта клиентов и платежей (биллинг-система) и необходимо провести её интеграцию с системой Click, просим следовать нашей инструкции docs.click.uz/click-api-request, и далее проверить корректность интеграции с помощью ПО для тестирования docs.click.uz/click-api-testing 

После успешного прохождения тестов ДО ПОПЫТКИ первого реального платежа просим вас:
1) Авторизироваться в кабинете merchant.click.uz
2) Перейти в категорию "Сервисы" (слева в кабинете)
3) Нажать на иконку карандаша в поле "Действие" (в крайней правой ячейке таблицы)
4) Прописать реализованные адреса проверки и результата (backend/callback URL) и далее уведомить нас, чтобы мы активировали Ваш сервис (по умолчанию сервис отключен).

Также просим учесть, что если IP адрес сервера вашей биллинг-системы не в сети TAS-IX, то вам необходимо заранее предупредить нас об этом ДО ПОПЫТКИ первого реального платежа, предоставив нам ваш домен (при наличии), IP адрес и порт для добавления в белый список файрвола.

ВАЖНО! 
Для обеспечения стабильности проведения платежей, ваш IP адрес должен быть статическим. Прежде чем менять IP адрес или домен, вам необходимо сначала уведомить нас, и после настройки с нашей стороны производить замену.

Для вашего удобства, мы разработали чат-бота с искусственным интеллектом. Сейчас он работает в тестовом режиме и помогает находить ответы на вопросы по официальной документации API. Здесь представлена видео-инструкция по использованию бота. Если у вас возникнут сложности с интеграцией, рекомендуем обратиться к нему. Также вы всегда можете связаться с нашими специалистами.

 Добавлены предложения про ИИ бота на русском и узбекском.
 "Для вашего удобства, мы разработали чат-бота с искусственным интеллектом (https://t.me/ClickUz_IntegrationDeptBot). Сейчас он работает в тестовом режиме и помогает находить ответы на вопросы по официальной документации API. Здесь представлена видео-инструкция (https://www.loom.com/share/ebcd7b3246ab4c23852c00662a397863?sid=e503eb8f-6004-4732-a63e-adc79bb0f267) по использованию бота. Если у вас возникнут сложности с интеграцией, рекомендуем обратиться к нему. Также вы всегда можете связаться с нашими специалистами."

Сайёра Игамкулова, [15/09/25 17:04]
Для проведения интеграции оплат на сайте у нас есть 2 кнопки оплаты:
1 - Оплата через CLICK, через нее могут оплатить пользователи, подключенные к CLICK, путем выставления счета на оплату. На этой же платежной странице есть и оплата без регистрации.    https://docs.click.uz/click-button/

2 - Оплата с любой карты, через нее может оплатить любой пользователь, введя номер карты и срок,даже,если он не подключен ни к какой платежной системе.   https://docs.click.uz/click-pay-by-card/

Для удобства просим установить обе кнопки!

Рекомендация действий для проверки проведения платежей:
1) При наличии биллинг-системы, настроить систему логирования запросов и ответов на своем сервере, в точках доступа Prepare и Complete. Это ускорит поиск и решение проблем при проведении платежей.

2) Установить на телефоне приложение Click Up. 

3) Сформировать и перейти по ссылке:
https://my.click.uz/services/pay?service_id=<SERVICE_ID>&merchant_id=<MERCHANT_ID>&amount=1000&transaction_param=test

4) В появившейся форме ввести номер телефона или параметры пластиковой карты. По указанным значениям (телефон или пластиковая карта) будет выставлен инвойс/счет.

5) Зайти в приложение Click Up, оплатить выставленный инвойс/счет, если имеются ошибки платежа, логи запросов и ответов отправить в группу.

Если по документации возникнут вопросы, обращайтесь, будем рады помочь

Успехов в интеграции!

Сайёра Игамкулова, [15/09/25 17:04]
Предварительные данные

Мерчант: "PRETEST INSIDE" MCHJ
Сервис ID: 82886
Схема интеграции: на сайте мерчанта, метод интеграции SHOP API *

Ответственные:
- от Отдела подключений: Игамкулова Сайёра
- от Отдела продаж: Жумаева Муниса
- от Отдела интеграций: Саттаров Сухроб

Сайёра Игамкулова, [15/09/25 17:05]
Прошу уведомить как будете готовы к интеграции, скинем ключи















⏺ Complete Click Integration Understanding:

  Your Business Details:

  - Company: "PRETEST INSIDE" MCHJ
  - Service ID: 82886 ✅
  - Integration Method: SHOP API
  - Service: IELTS test registration (50,000 UZS per test)

  Payment Options Available:

  1. Click Button Payment - for users with Click accounts
    - Users can pay through Click wallet/account
    - Documentation: docs.click.uz/click-button/
  2. Pay by Any Card - for all users
    - Any bank card (Visa, MasterCard, UzCard, Humo)
    - No Click account needed
    - Documentation: docs.click.uz/click-pay-by-card/

  Technical Implementation Required:

  Backend Endpoints You Need:

  1. Prepare endpoint - validates payment request
  2. Complete endpoint - confirms payment completion
  3. Callback URLs - for payment notifications

  Integration Steps:

  1. Follow: docs.click.uz/click-api-request
  2. Test with: docs.click.uz/click-api-testing
  3. Configure in merchant.click.uz portal
  4. Get approval before first real payment

  Test Payment URL:

  https://my.click.uz/services/pay?service_id=82886&merchant_id=<MERCHANT_ID>&amount=50000&transaction_pa
  ram=test_ielts_registration

  Security & Infrastructure:

  - Static IP required for your server
  - Firewall whitelist - must notify Click of your IP/domain
  - SSL/HTTPS required for callback URLs
  - Request logging recommended for debugging

  What You Need to Provide:

  1. MERCHANT_ID - Click will provide when ready
  2. API Keys/Secrets - for authentication
  3. Server IP address - for firewall whitelist
  4. Domain name (if using domain instead of IP)
  5. Callback URLs - your server endpoints

  Next Steps Process:

  1. You notify Click team you're ready for integration
  2. They provide MERCHANT_ID and API keys
  3. You provide server IP/domain details
  4. I implement the payment integration
  5. We test using their testing tools
  6. Configure URLs in merchant.click.uz portal
  7. Click activates your service for live payments

  Contact Information:

  - Integration Support: Саттаров Сухроб
  - Sales: Жумаева Муниса
  - Connection: Игамкулова Сайёра
  - AI Bot: @ClickUz_IntegrationDeptBot

  Recommendation:

  Since they suggest installing both payment buttons for user convenience, I should implement:
  - Primary: Pay by Any Card (for broader user access)
  - Secondary: Click Button (for Click users)

  Ready to implement as soon as you get the MERCHANT_ID and API keys from the Click team!
  the click team is very good now, and also when you just got .
  