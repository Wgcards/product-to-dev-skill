import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import path from 'node:path';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

/*
 * 将相对 import 和 src 根路径 import 统一转成 src 内部路径，供架构边界规则判断。
 */
function normalizeImportPath(importerFileName, importSource) {
  if (importSource.startsWith('.')) {
    const absoluteImportPath = path.resolve(path.dirname(importerFileName), importSource);
    const srcIndex = absoluteImportPath.split(path.sep).lastIndexOf('src');

    return srcIndex >= 0 ? absoluteImportPath.split(path.sep).slice(srcIndex).join('/') : null;
  }

  if (importSource.startsWith('src/')) {
    return importSource;
  }

  if (importSource.startsWith('@/')) {
    return `src/${importSource.slice(2)}`;
  }

  return null;
}

/*
 * 模板内置架构边界规则，避免新项目从生成阶段就出现 shared 反向依赖或业务域横向耦合。
 */
const architectureBoundariesPlugin = {
  rules: {
    'enforce-template-boundaries': {
      meta: {
        type: 'problem',
        messages: {
          sharedDependsOnBusiness: 'shared 层不得依赖 app、pages 或 features 中的业务实现。',
          crossFeatureImport:
            '业务域之间不得横向 import；复用能力应抽到 shared 或显式记录模块依赖。',
          pageDependsOnBootstrap: '页面层不得反向依赖 AppProviders、theme、main 等应用装配细节。',
          parentRelativeImport: '跨目录 import 必须使用 @/ alias，同级文件才允许使用 ./。',
        },
      },
      create(context) {
        /*
         * 检查单条 import，按 importer 与 imported 的 src 层级关系报告违规依赖。
         */
        function checkImport(node) {
          if (!node.source || typeof node.source.value !== 'string') {
            return;
          }

          if (
            node.source.value.startsWith('..') ||
            node.source.value.startsWith('src/') ||
            (node.source.value.startsWith('./') && node.source.value.slice(2).includes('/'))
          ) {
            context.report({ node, messageId: 'parentRelativeImport' });
          }

          const importerPath = context.filename.split(path.sep).join('/');
          const importedPath = normalizeImportPath(context.filename, node.source.value);

          if (!importedPath) {
            return;
          }

          const importerSrcPath = importerPath.slice(importerPath.lastIndexOf('/src/') + 1);
          const importerSegments = importerSrcPath.split('/');
          const importedSegments = importedPath.split('/');

          if (
            importerSrcPath.startsWith('src/shared/') &&
            ['app', 'pages', 'features'].includes(importedSegments[1])
          ) {
            context.report({ node, messageId: 'sharedDependsOnBusiness' });
          }

          if (
            importerSrcPath.startsWith('src/features/') &&
            importedPath.startsWith('src/features/') &&
            importerSegments[2] !== importedSegments[2]
          ) {
            context.report({ node, messageId: 'crossFeatureImport' });
          }

          if (
            importerSrcPath.startsWith('src/pages/') &&
            ['src/app/AppProviders', 'src/app/theme', 'src/main'].some((blockedPath) =>
              importedPath.startsWith(blockedPath),
            )
          ) {
            context.report({ node, messageId: 'pageDependsOnBootstrap' });
          }
        }

        return {
          ImportDeclaration: checkImport,
          ExportAllDeclaration: checkImport,
          ExportNamedDeclaration: checkImport,
        };
      },
    },
  },
};

export default tseslint.config(
  {
    ignores: ['dist', 'node_modules', 'coverage', '.husky/_', 'src/types/generated'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        console: 'readonly',
        module: 'readonly',
        process: 'readonly',
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'architecture-boundaries': architectureBoundariesPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      globals: {
        console: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        setTimeout: 'readonly',
        window: 'readonly',
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'architecture-boundaries/enforce-template-boundaries': 'error',
    },
  },
  prettier,
);
