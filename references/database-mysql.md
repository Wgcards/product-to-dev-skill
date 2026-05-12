# Database MySQL

## Output Rules

- Generate SQL files for all table creation or structure changes; do not leave DDL only in chat.
- If the user provides an existing table model, preserve its core business meaning.
- Use the logical deletion field from the user-provided or existing project data model. Keep the same field name across SQL, backend docs, API docs, frontend types, and mock data.
- You may add necessary unique constraints, status fields, audit fields, indexes, and comments, but explain important additions in the handoff.
- Keep DDL for the same module in one SQL file unless the target repo has a stronger migration convention.
- Do not generate `DROP TABLE`, destructive reset SQL, or data deletion SQL unless the user explicitly requests a destructive reset. For existing tables, prefer `ALTER TABLE`; for new tables, generate `CREATE TABLE`.
- Check the full rule list below before delivering SQL.

## Naming And Engine

1. Use InnoDB.
2. Use `utf8mb4`; use the project's existing collation when known, otherwise prefer `utf8mb4_0900_ai_ci` for MySQL 8 projects.
3. Use snake_case for tables and fields: lowercase letters, numbers, and underscores only.
4. Do not start names with numbers.
5. Do not use plural table names.
6. Prefer `business_noun_table_role` style table names.
7. Do not use MySQL reserved words as table or field names, such as `desc`, `range`, `match`, or `delayed`.
8. Do not use database foreign keys or cascading constraints; maintain relationships in application code.
9. Do not use triggers or stored procedures for business logic.

## Required Fields

Every business table must include:

- `id bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID'`
- `create_time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'`
- `create_person varchar(64) NOT NULL COMMENT '创建人'`
- `update_time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'`
- `update_person varchar(64) NOT NULL COMMENT '更新人'`
- Logical deletion field from the data model, such as `is_delete tinyint unsigned NOT NULL DEFAULT '0' COMMENT '删除标记：0-未删除，1-已删除'` or `is_deleted tinyint unsigned NOT NULL DEFAULT '0' COMMENT '删除标记：0-未删除，1-已删除'`

If the data model uses `is_delete`, keep `is_delete`. If it uses `is_deleted`, keep `is_deleted`. If no user-provided model or existing project convention defines the field, use `is_delete` as the GX default. Never mix `is_delete` and `is_deleted` in one project.

Primary key format:

```sql
PRIMARY KEY (`id`) USING BTREE
```

## Field Types

- Use `unsigned` for non-negative numeric fields such as ids, quantities, statuses, types, and counters.
- Do not use `enum`.
- Use `decimal`, not `float` or `double`.
- Money, balance, and fee fields commonly use `decimal(16,4)`.
- Rate and ratio fields commonly use `decimal(10,4)` or `decimal(16,4)`.
- Set string lengths by meaning, not by defaulting to `varchar(255)`.
- Common lengths: code/no `varchar(32/64)`, name `varchar(64/100)`, remark `varchar(255/500)`.
- Use `text` when `varchar` would exceed 5000 characters.
- Consider extension tables for large text fields so main-table queries and indexes stay efficient.
- Use `char` for fixed-length codes or fixed-length status codes.
- Required fields use `NOT NULL`.
- Optional fields use `DEFAULT NULL`; do not use empty strings to avoid nullable design.
- Boolean meaning fields must be named `is_xxx`, use `tinyint unsigned`, and treat `1` as yes and `0` as no.
- Status comments must list enum values and meanings in Chinese.

## Index Rules

- Business-unique fields must have unique indexes even when the application validates uniqueness.
- Index names: primary key `pk_字段名` when explicitly named by project convention, unique `uk_字段名`, normal `idx_字段名`.
- Keep a single table's index count within 5 when possible.
- Keep a combined index within 5 fields when possible.
- Index high-frequency query fields, business numbers, external serial numbers, status+time, and relation ids.
- Combined indexes should follow the leftmost-prefix principle: equality filters first, then range and sorting fields.
- Use prefix lengths for indexes on long `varchar` fields when appropriate.
- Avoid duplicate indexes. If `(a,b,c)` exists, usually do not add `(a)` or `(a,b)`.
- Do not create standalone indexes for low-selectivity fields such as gender, delete flag, or simple status unless they are part of a useful combined index.

## Design Rules

- Do not physically delete business data; use the unified logical deletion field.
- Related fields must use exactly the same type, such as all `bigint unsigned` or all `varchar(32)`.
- Avoid complex joins across more than three tables; use redundancy, wide tables, async summary tables, or application assembly when needed.
- Redundant fields may improve query performance, but they should not be frequently modified or long text fields.
- Consider sharding only when a single table is expected to exceed 5 million rows or 2GB; do not over-design.
- `ALTER TABLE` additions must include type, default/nullability, Chinese comment, and `AFTER` position when useful.

## SQL Self-Check

Before delivery, verify:

- Primary key exists and uses BTREE.
- Required public fields exist.
- Table and fields have Chinese comments.
- Engine, charset, collation, and row format match the project.
- Index count and index names are reasonable.
- Business unique constraints are present.
- Money and rate precision are appropriate.
- Logical delete field naming follows the data model and is consistent across all generated artifacts.
- No foreign keys, triggers, stored procedures, enum, float, or double.
- State fields document value meanings in Chinese.

## Reference Style

This example assumes no existing data model provides a logical deletion field, so it uses the GX default `is_delete`.

```sql
CREATE TABLE `config_dict_item` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `label` varchar(64) DEFAULT NULL COMMENT '字典项名称',
  `dict_type` varchar(64) DEFAULT NULL COMMENT '字典类型',
  `sort_order` int unsigned NOT NULL DEFAULT '0' COMMENT '排序',
  `is_effect` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '生效标记：0-失效，1-生效',
  `remarks` varchar(255) DEFAULT NULL COMMENT '备注信息',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `create_person` varchar(64) NOT NULL COMMENT '创建人',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `update_person` varchar(64) NOT NULL COMMENT '更新人',
  `is_delete` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '删除标记：0-未删除，1-已删除',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_update_time` (`update_time`) USING BTREE,
  KEY `idx_label_sort` (`label`,`sort_order`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='通用配置项表';

ALTER TABLE `config_item_text`
  ADD `ext1` varchar(20) DEFAULT NULL COMMENT '扩展字段1';
```
