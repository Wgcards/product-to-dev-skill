import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const rootDir = process.cwd();
const entryPath = path.join(rootDir, 'mock/openapi.yaml');
const visitedRefs = new Set();

/*
 * 读取 JSON/YAML 契约文件，并把解析错误转换成带文件路径的失败信息。
 */
function readDocument(filePath) {
  const rawText = fs.readFileSync(filePath, 'utf-8');

  return YAML.parse(rawText);
}

/*
 * 按 JSON Pointer 片段查找引用目标，确保 $ref 不只指向存在文件，也指向存在节点。
 */
function resolvePointer(document, pointer) {
  if (!pointer || pointer === '#') {
    return document;
  }

  return pointer
    .replace(/^#\//, '')
    .split('/')
    .filter(Boolean)
    .reduce((currentValue, segment) => {
      if (currentValue === undefined || currentValue === null) {
        return undefined;
      }

      const normalizedSegment = segment.replace(/~1/g, '/').replace(/~0/g, '~');
      return currentValue[normalizedSegment];
    }, document);
}

/*
 * 校验单个 $ref 的文件路径和 JSON Pointer 目标，支持相对路径拆分的 components/examples。
 */
function validateRef(refValue, fromFilePath) {
  if (refValue.startsWith('#')) {
    const sourceDocument = readDocument(fromFilePath);
    if (resolvePointer(sourceDocument, refValue) === undefined) {
      throw new Error(`Invalid local ref ${refValue} in ${path.relative(rootDir, fromFilePath)}`);
    }
    return;
  }

  const [fileRef, pointer = '#'] = refValue.split('#');
  const targetPath = path.resolve(path.dirname(fromFilePath), fileRef);
  const refKey = `${targetPath}#${pointer}`;

  if (visitedRefs.has(refKey)) {
    return;
  }

  visitedRefs.add(refKey);

  if (!fs.existsSync(targetPath)) {
    throw new Error(`Missing ref target ${refValue} from ${path.relative(rootDir, fromFilePath)}`);
  }

  const targetDocument = readDocument(targetPath);
  const normalizedPointer = pointer.startsWith('/') ? `#${pointer}` : pointer;

  if (resolvePointer(targetDocument, normalizedPointer) === undefined) {
    throw new Error(`Invalid ref pointer ${refValue} from ${path.relative(rootDir, fromFilePath)}`);
  }

  collectRefs(targetDocument, targetPath);
}

/*
 * 深度遍历契约对象，校验所有拆分文件中的嵌套 $ref。
 */
function collectRefs(value, fromFilePath) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectRefs(item, fromFilePath));
    return;
  }

  if (!value || typeof value !== 'object') {
    return;
  }

  Object.entries(value).forEach(([key, nextValue]) => {
    if (key === '$ref' && typeof nextValue === 'string') {
      validateRef(nextValue, fromFilePath);
      return;
    }

    collectRefs(nextValue, fromFilePath);
  });
}

/*
 * 校验 OpenAPI 入口的基础结构，避免 mock:check 只检查引用而遗漏核心字段。
 */
function validateOpenAPIShape(document) {
  if (typeof document?.openapi !== 'string') {
    throw new Error('mock/openapi.yaml must define openapi version.');
  }

  if (!document.info?.title || !document.info?.version) {
    throw new Error('mock/openapi.yaml must define info.title and info.version.');
  }

  if (!document.paths || Object.keys(document.paths).length === 0) {
    throw new Error('mock/openapi.yaml must define at least one path.');
  }
}

const openapiDocument = readDocument(entryPath);
validateOpenAPIShape(openapiDocument);
collectRefs(openapiDocument, entryPath);
console.log('OpenAPI mock contract validation passed.');
