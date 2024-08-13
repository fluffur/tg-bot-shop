# Telegram Bot: Shop Notifier

Бот, который периодически может публиковать в ваших каналах товары из https://fakestoreapi.com

## Настройка
Требуется создать `.env` файл на основе данных из `.env.example` и заполнить их:
```text
BOT_TOKEN=

DB_HOST=db
DB_DATABASE=shop
DB_PASSWORD=root
DB_USER=root

```

## Запуск
Требуются Docker и Docker Compose
```shell
docker compose up --build
```

## Использование

![Пример применения 1](usage-1.jpg)


![Пример применения 2](usage-2.jpg)