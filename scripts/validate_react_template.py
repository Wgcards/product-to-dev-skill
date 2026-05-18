#!/usr/bin/env python3
"""校验内置 React 模板是否满足当前 skill 基线。"""

from __future__ import annotations

import json
import re
from pathlib import Path


REQUIRED_FILES = [
    ".commitlintrc.cjs",
    ".editorconfig",
    ".env.dev",
    ".env.mock",
    ".env.prod",
    ".env.test",
    ".gitignore",
    ".husky/commit-msg",
    ".husky/pre-commit",
    ".prettierignore",
    ".prettierrc.cjs",
    "eslint.config.mjs",
    "mock/openapi.yaml",
    "mock/components/schemas/sample.yaml",
    "mock/examples/sample-dashboard.json",
    "scripts/validate-openapi.mjs",
    "src/app/App.tsx",
    "src/app/components/AppShell.tsx",
    "src/app/AppProviders.tsx",
    "src/app/theme.ts",
    "src/features/sample/index.tsx",
    "src/features/sample/components/ItemActionDialog.tsx",
    "src/features/sample/components/ItemList.tsx",
    "src/features/sample/constants/sampleContent.ts",
    "src/features/sample/hooks/useItems.ts",
    "src/features/sample/hooks/useSampleDashboard.ts",
    "src/features/sample/service/sampleService.ts",
    "src/features/sample/store/useSampleStore.ts",
    "src/locale/en-US.json",
    "src/locale/i18n.ts",
    "src/locale/zh-CN.json",
    "src/shared/feedback/FeedbackContext.ts",
    "src/shared/feedback/FeedbackProvider.tsx",
    "src/shared/store/useAppStore.ts",
    "src/shared/tools/APIClient.ts",
    "src/types/dto/api.ts",
    "src/types/dto/sample.ts",
]

REQUIRED_DEPENDENCIES = [
    "@emotion/react",
    "@emotion/styled",
    "@mui/material",
    "i18next",
    "react-i18next",
    "zustand",
]

REQUIRED_DEV_DEPENDENCIES = [
    "@eslint/js",
    "@stoplight/prism-cli",
    "concurrently",
    "eslint",
    "eslint-config-prettier",
    "eslint-plugin-react-hooks",
    "eslint-plugin-react-refresh",
    "husky",
    "lint-staged",
    "prettier",
    "typescript-eslint",
    "yaml",
]

REQUIRED_SCRIPTS = [
    "build:prod",
    "check",
    "commitlint",
    "dev:dev",
    "dev:mock",
    "dev:test",
    "format",
    "format:check",
    "lint",
    "lint-staged",
    "mock:check",
    "mock:serve",
    "prepare",
    "typecheck",
]

IMPORT_SOURCE_RE = re.compile(
    r"(?:from\s+|import\s*\(|import\s+)['\"]([^'\"]+)['\"]",
)

FORBIDDEN_FILES = [
    "src/App.tsx",
    "src/businessContent.ts",
    "src/components/BusinessDashboard.tsx",
    "src/components/CustomerList.tsx",
    "src/components/MetricRail.tsx",
    "src/components/WorkflowBoard.tsx",
    "src/lib/formatters.ts",
    "src/mocks/mock-data.ts",
    "src/services/api-client.ts",
    "src/services/workspace-service.ts",
    "src/types/api.ts",
    "src/types/workspace.ts",
    "src/features/workspace",
    "mock/components/schemas/workspace.yaml",
    "mock/examples/workspace-dashboard.json",
    "node_modules",
    "dist",
    "coverage",
    ".vite",
    ".cache",
]

FORBIDDEN_TEMPLATE_TERMS = [
    "Customer",
    "customer",
    "客户",
    "Workspace",
    "workspace",
    "工作台",
]


def load_package(template_dir: Path) -> dict[str, object]:
    """读取模板 package.json 并返回 JSON 对象。"""
    package_path = template_dir / "package.json"
    return json.loads(package_path.read_text(encoding="utf-8"))


def require_keys(group: str, actual: dict[str, object], keys: list[str], failures: list[str]) -> None:
    """检查指定对象是否包含所需键。"""
    missing = [key for key in keys if key not in actual]
    if missing:
        failures.append(f"{group} missing: {', '.join(missing)}")


def validate_files(template_dir: Path, failures: list[str]) -> None:
    """确认模板必须包含的关键文件都存在。"""
    missing = [file_path for file_path in REQUIRED_FILES if not (template_dir / file_path).exists()]
    if missing:
        failures.append(f"files missing: {', '.join(missing)}")

    forbidden = [file_path for file_path in FORBIDDEN_FILES if (template_dir / file_path).exists()]
    if forbidden:
        failures.append(f"legacy files still exist: {', '.join(forbidden)}")


def validate_neutral_terms(template_dir: Path, failures: list[str]) -> None:
    """扫描模板源码和 mock 契约，避免默认模板继续携带具体业务域语义。"""
    checked_suffixes = {".json", ".mjs", ".ts", ".tsx", ".yaml", ".yml"}
    ignored_parts = {"node_modules", "dist", "coverage", ".vite", ".cache"}
    offenders: list[str] = []

    for path in template_dir.rglob("*"):
        if not path.is_file() or path.suffix not in checked_suffixes:
            continue
        if path.name == "package-lock.json":
            continue
        if any(part in ignored_parts for part in path.parts):
            continue

        text = path.read_text(encoding="utf-8")
        found_terms = [term for term in FORBIDDEN_TEMPLATE_TERMS if term in text]
        if found_terms:
            relative_path = path.relative_to(template_dir)
            offenders.append(f"{relative_path}({', '.join(found_terms)})")

    if offenders:
        failures.append(f"business-specific template terms remain: {', '.join(offenders[:12])}")


def validate_content(template_dir: Path, failures: list[str]) -> None:
    """检查关键接线文件是否包含当前规范要求的能力。"""
    main_path = template_dir / "src/main.tsx"
    app_path = template_dir / "src/app/App.tsx"
    sample_path = template_dir / "src/features/sample/index.tsx"
    openapi_path = template_dir / "mock/openapi.yaml"

    main_text = main_path.read_text(encoding="utf-8") if main_path.exists() else ""
    app_text = app_path.read_text(encoding="utf-8") if app_path.exists() else ""
    sample_text = sample_path.read_text(encoding="utf-8") if sample_path.exists() else ""
    openapi_text = openapi_path.read_text(encoding="utf-8") if openapi_path.exists() else ""

    if "AppProviders" not in main_text:
        failures.append("src/main.tsx must render AppProviders")
    if "SamplePage" not in app_text:
        failures.append("src/app/App.tsx must keep the neutral sample domain entry")
    if "ItemActionDialog" not in sample_text or "useSampleStore" not in sample_text:
        failures.append("src/features/sample/index.tsx must wire Dialog and domain store")
    if "window.confirm" in sample_text:
        failures.append("sample feature must not use window.confirm")
    if "$ref:" not in openapi_text:
        failures.append("mock/openapi.yaml must reference split components/examples")


def validate_package_manager(package_json: dict[str, object], failures: list[str]) -> None:
    """确认新项目模板默认使用 pnpm，避免脚手架继续输出 npm 习惯。"""
    package_manager = package_json.get("packageManager")
    scripts = package_json.get("scripts", {})

    if not isinstance(package_manager, str) or not package_manager.startswith("pnpm@"):
        failures.append("package.json packageManager must use pnpm")

    if isinstance(scripts, dict):
        npm_scripts = [
            script_name
            for script_name, script_value in scripts.items()
            if isinstance(script_value, str) and ("npm run" in script_value or "npm:" in script_value)
        ]
        if npm_scripts:
            failures.append(f"scripts still use npm syntax: {', '.join(npm_scripts)}")


def validate_import_paths(template_dir: Path, failures: list[str]) -> None:
    """禁止模板源码出现跨目录相对 import，保留同级文件的 ./ 引用。"""
    offenders: list[str] = []

    for path in (template_dir / "src").rglob("*"):
        if not path.is_file() or path.suffix not in {".ts", ".tsx"}:
            continue

        text = path.read_text(encoding="utf-8")
        for import_source in IMPORT_SOURCE_RE.findall(text):
            is_parent_relative = import_source.startswith("..")
            is_src_absolute = import_source.startswith("src/")
            is_nested_same_prefix = import_source.startswith("./") and "/" in import_source[2:]
            if is_parent_relative or is_src_absolute or is_nested_same_prefix:
                offenders.append(f"{path.relative_to(template_dir)} -> {import_source}")

    if offenders:
        failures.append(f"cross-directory relative imports remain: {', '.join(offenders[:12])}")


def main() -> None:
    """执行模板基线校验，失败时输出所有缺口并返回非零退出码。"""
    skill_root = Path(__file__).resolve().parents[1]
    template_dir = skill_root / "assets" / "react-tailwind-template"
    package_json = load_package(template_dir)
    failures: list[str] = []

    require_keys("dependencies", package_json.get("dependencies", {}), REQUIRED_DEPENDENCIES, failures)  # type: ignore[arg-type]
    require_keys("devDependencies", package_json.get("devDependencies", {}), REQUIRED_DEV_DEPENDENCIES, failures)  # type: ignore[arg-type]
    require_keys("scripts", package_json.get("scripts", {}), REQUIRED_SCRIPTS, failures)  # type: ignore[arg-type]
    validate_files(template_dir, failures)
    validate_neutral_terms(template_dir, failures)
    validate_content(template_dir, failures)
    validate_package_manager(package_json, failures)
    validate_import_paths(template_dir, failures)

    if failures:
        for failure in failures:
            print(f"- {failure}")
        raise SystemExit(1)

    print("React template baseline validation passed.")


if __name__ == "__main__":
    main()
