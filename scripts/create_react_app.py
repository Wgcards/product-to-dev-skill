#!/usr/bin/env python3
"""复制内置 GX React 模板并替换项目占位符。"""

from __future__ import annotations

import argparse
import re
import shutil
from pathlib import Path


TEXT_SUFFIXES = {
    ".css",
    ".cjs",
    ".html",
    ".json",
    ".md",
    ".mjs",
    ".ts",
    ".tsx",
    ".yaml",
    ".yml",
}

IGNORED_TEMPLATE_NAMES = {
    "node_modules",
    "dist",
    "coverage",
    ".cache",
    ".vite",
    "tsconfig.tsbuildinfo",
    "tsconfig.node.tsbuildinfo",
    "vite.config.js",
    "vite.config.d.ts",
}


def parse_args() -> argparse.Namespace:
    """解析脚手架命令参数并返回标准 argparse 命名空间。"""
    parser = argparse.ArgumentParser(
        description="Create a Vite React Tailwind project from the bundled GX business template.",
    )
    parser.add_argument("target_dir", help="Directory to create the new React project in.")
    parser.add_argument(
        "--name",
        default="Business Sample",
        help="Display name used in the generated app.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Allow writing into an existing empty directory.",
    )
    return parser.parse_args()


def to_package_name(display_name: str, fallback_name: str) -> str:
    """把业务展示名转换成包管理器可接受的包名，中文名无法转换时使用目录名兜底。"""
    source_name = display_name.strip() or fallback_name
    normalized = re.sub(r"[^a-zA-Z0-9]+", "-", source_name.lower())
    package_name = normalized.strip("-")
    if package_name:
        return package_name

    fallback_normalized = re.sub(r"[^a-zA-Z0-9]+", "-", fallback_name.lower()).strip("-")
    return fallback_normalized or "business-sample"


def assert_target_available(target_dir: Path, force: bool) -> None:
    """确认目标目录可以安全写入，避免覆盖已有项目。"""
    if not target_dir.exists():
        return

    if not target_dir.is_dir():
        raise SystemExit(f"Target exists and is not a directory: {target_dir}")

    has_files = any(target_dir.iterdir())
    if has_files or not force:
        raise SystemExit(
            "Target directory already exists. Use a new path, or pass --force only for an empty directory.",
        )


def replace_placeholders(target_dir: Path, app_name: str, package_name: str) -> None:
    """替换模板中的展示名和包名占位符。"""
    replacements = {
        "__APP_NAME__": app_name,
        "__PACKAGE_NAME__": package_name,
    }

    for path in target_dir.rglob("*"):
        if not path.is_file() or path.suffix not in TEXT_SUFFIXES:
            continue

        text = path.read_text(encoding="utf-8")
        for token, value in replacements.items():
            text = text.replace(token, value)
        path.write_text(text, encoding="utf-8")


def ignore_template_artifacts(_directory: str, names: list[str]) -> set[str]:
    """跳过模板验证生成物，避免脚手架把依赖目录和构建缓存复制到新项目。"""
    return {name for name in names if name in IGNORED_TEMPLATE_NAMES}


def main() -> None:
    """执行模板复制、占位符替换和结果提示。"""
    args = parse_args()
    skill_root = Path(__file__).resolve().parents[1]
    template_dir = skill_root / "assets" / "react-tailwind-template"
    target_dir = Path(args.target_dir).expanduser().resolve()
    package_name = to_package_name(args.name, target_dir.name)

    if not template_dir.exists():
        raise SystemExit(f"Template not found: {template_dir}")

    assert_target_available(target_dir, args.force)
    shutil.copytree(template_dir, target_dir, dirs_exist_ok=args.force, ignore=ignore_template_artifacts)
    replace_placeholders(target_dir, args.name, package_name)

    print(f"Created React project: {target_dir}")
    print("Next steps:")
    print(f"  cd {target_dir}")
    print("  pnpm install")
    print("  pnpm dev:mock")
    print("  pnpm check")
    print("  pnpm build:prod")


if __name__ == "__main__":
    main()
