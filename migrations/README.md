# Миграции БД

## Описание

Этот каталог содержит SQL-миграции для изменения структуры базы данных VirtueMart.

## Правила создания миграций

1. Каждая миграция имеет уникальный последовательный номер (001, 002, 003...)
2. Название должно описывать содержание миграции
3. Миграция должна быть пригодна для применения на production
4. Не удалять существующие данные без необходимости
5. Учитывать уже существующие записи

## Порядок применения

### На локальной Docker-БД

```bash
# Подключиться к MySQL
docker exec -i medic-mysql-1 mysql -uroot -proot medikompru_new

# Применить миграцию
mysql -uroot -proot -h localhost -P 3307 medikompru_new < migrations/001_add_category_code.sql
```

### На production

```bash
# 1. Создать бэкап
mysqldump -u[user] -p[password] [database] > backup_$(date +%Y%m%d).sql

# 2. Применить миграцию
mysql -u[user] -p[password] [database] < migrations/[migration_file].sql

# 3. Проверить результат
mysql -u[user] -p[password] [database] -e "SHOW COLUMNS FROM jos_virtuemart_categories LIKE 'category_code';"
```

## Проверка применённых миграций

```sql
-- Проверить наличие колонки category_code
SHOW COLUMNS FROM jos_virtuemart_categories LIKE 'category_code';

-- Проверить индекс
SHOW INDEX FROM jos_virtuemart_categories WHERE Key_name = 'uk_category_code';
```

## Откат миграции

При необходимости отката, выполните обратный SQL:

```sql
ALTER TABLE jos_virtuemart_categories DROP INDEX uk_category_code;
ALTER TABLE jos_virtuemart_categories DROP COLUMN category_code;
```
