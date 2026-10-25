import { readFileSync } from 'fs';
import { from, toArray } from 'ix/iterable';
import { filter, map, tap } from 'ix/iterable/operators';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { join } from 'path';
import type { Plugin } from 'rollup';
import { ImportDeclaration, Node, Project, SourceFile, ts } from 'ts-morph';

import SyntaxKind = ts.SyntaxKind;

const KEYS_MAPPING = new Map<string, string>();
const KEYS_SCOPE = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$';
const keyUsageCount = new Map<string, number>();
const localesPath = path.resolve(process.cwd(), 'src/lang/locale/');

function generateMinifiedKey(index: number): string {
    const base = KEYS_SCOPE.length;
    let result = '';
    let i = index;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- intentional infinite loop with break
    while (true) {
        result = KEYS_SCOPE[i % base] + result;
        i = Math.floor(i / base);
        if (i === 0) break;
        i--;
    }

    return result;
}
function createMinifyKeysMapping(options: { enLocalePath: string }) {
    KEYS_MAPPING.clear();

    const enLocalePathResolved = path.resolve(
        process.cwd(),
        options.enLocalePath
    );

    if (!existsSync(enLocalePathResolved)) {
        throw new Error(
            `Expected to be en locale json file at path: ${enLocalePathResolved}`
        );
    }

    const enLocaleKeys = Object.keys(
        (JSON.parse(
            readFileSync(enLocalePathResolved, { encoding: 'utf-8' })
        ) as Record<string, unknown> | undefined) ?? {}
    ).sort();

    // We generate unique keys: a, b, c, ..., z, aa, ab, ac, ..., zz, aaa, ...
    for (let i = 0; i < enLocaleKeys.length; i++) {
        const key = enLocaleKeys[i];
        const minified = generateMinifiedKey(i);
        KEYS_MAPPING.set(key, minified);
    }

    const originalLongest = Math.max(...enLocaleKeys.map((k) => k.length));
    const minifiedLongest = Math.max(
        ...Array.from(KEYS_MAPPING.values()).map((v) => v.length)
    );
    const avgOriginal = (
        enLocaleKeys.reduce((sum, k) => sum + k.length, 0) / enLocaleKeys.length
    ).toFixed(1);
    const avgMinified = (
        Array.from(KEYS_MAPPING.values()).reduce(
            (sum, v) => sum + v.length,
            0
        ) / KEYS_MAPPING.size
    ).toFixed(1);

    console.log(`All keys count: ${enLocaleKeys.length}`);
    console.log(
        `Original keys: longest ${originalLongest}, avg ${avgOriginal}`
    );
    console.log(
        `Minified keys: longest ${minifiedLongest}, avg ${avgMinified}`
    );
    console.log(
        `Size reduction: ${((1 - minifiedLongest / originalLongest) * 100).toFixed(1)}% (longest), ${((1 - Number(avgMinified) / Number(avgOriginal)) * 100).toFixed(1)}% (average)`
    );
}

function getTopmostPropertyAccess(node: Node): Node {
    let current: Node | undefined = node;
    while (
        current?.getParent()?.getKind() === SyntaxKind.PropertyAccessExpression
    ) {
        current = current.getParent();
    }
    if (!current) throw new Error('Unexpected null node');
    return current;
}

function replaceTCallExpressions(source: SourceFile) {
    const nodes = toArray(
        from(source.getDescendants()).pipe(
            filter(
                (node) => node.getKind() === SyntaxKind.PropertyAccessExpression
            ),
            filter((node) => node === getTopmostPropertyAccess(node)),
            map((node) => ({
                fullPath: node.getText(false).replace(/\s+/g, ''),
                node,
            })),
            filter((nodeData) => nodeData.fullPath.startsWith('t.')),
            map((nodeData) => ({
                node: nodeData.node,
                path: nodeData.fullPath.slice(2),
            })),
            map((nodeData) => ({
                ...nodeData,
                minifiedKey: KEYS_MAPPING.get(nodeData.path),
            })),
            tap(({ path }) =>
                keyUsageCount.set(path, (keyUsageCount.get(path) ?? 0) + 1)
            )
        )
    );

    for (const nodeData of nodes) {
        nodeData.node.replaceWithText(`t("${nodeData.minifiedKey}")`);
    }
}

function createVariableStatement(importName: string, obj: Record<string, unknown>) {
    const objectLiteral = createObjectLiteral(obj);
    return `const ${importName} = ${objectLiteral};`;
}

function createObjectLiteral(obj: Record<string, unknown>): string {
    const properties = Object.entries(obj).map(([key, value]) => {
        const valueStr = Array.isArray(value)
            ? `[${value.map((v) => JSON.stringify(String(v))).join(', ')}]` // <- используй JSON.stringify
            : JSON.stringify(String(value));
        return `${JSON.stringify(key)}: ${valueStr}`;
    });

    return `{\n  ${properties.join(',\n  ')}\n}`;
}
function createMinifiedLocale(importPath: string) {
    const object =
        (JSON.parse(
            readFileSync(join(localesPath, importPath), {
                encoding: 'utf-8',
            })
        ) as Record<string, unknown> | undefined) ?? {};

    const newObject: Record<string, unknown> = {};
    for (const key of KEYS_MAPPING.keys()) {
        const objVal = object[key];
        newObject[KEYS_MAPPING.get(key) ?? key] = objVal;
    }
    return newObject;
}

function replaceImports(source: SourceFile) {
    const nodes = toArray(
        from(source.getDescendants()).pipe(
            filter(
                (node): node is ImportDeclaration =>
                    node.getKind() === SyntaxKind.ImportDeclaration
            ),
            map((node) => ({
                node,
                moduleSpecifier: node.getModuleSpecifier(),
                importName: node
                    .getImportClause()
                    ?.getDefaultImport()
                    ?.getText(),
            })),
            filter(
                ({ moduleSpecifier, importName }) =>
                    moduleSpecifier.isKind(SyntaxKind.StringLiteral) &&
                    !!importName
            ),
            map((nodeData) => ({
                ...nodeData,
                importPath: nodeData.moduleSpecifier.getLiteralValue(),
            })),
            map((nodeData) => ({
                ...nodeData,
                match: nodeData.importPath.match(/locale\/(.+?)\/flat\.json/),
            })),
            filter(({ match }) => match !== null),
            map((nodeData) => ({
                ...nodeData,
                minifiedLocale: createMinifiedLocale(nodeData.importPath),
            }))
        )
    );

    for (const nodeData of nodes) {
        const statement = createVariableStatement(
            nodeData.importName ?? '',
            nodeData.minifiedLocale
        );

        nodeData.node.replaceWithText(statement);
    }
}

function transformSourceFile(source: SourceFile) {
    replaceTCallExpressions(source);
    replaceImports(source);
}

export default function replaceDevLocaleSystemWithProd(options: {
    enLocalePath: string;
    verbose?: boolean;
}): Plugin {
    createMinifyKeysMapping(options);

    const project = new Project({
        useInMemoryFileSystem: true,
    });

    return {
        name: 'replaceDevLocaleSystemWithProd',
        transform(code: string, id: string) {
            if (!id.match(/\.(ts|tsx)$/)) return null;

            if (process.env.NODE_ENV !== 'production') {
                return null; // skip in dev
            }

            const sourceFile = project.createSourceFile(id, code, {
                overwrite: true,
            });

            transformSourceFile(sourceFile);
            const result = sourceFile.getFullText();

            project.removeSourceFile(sourceFile);

            return {
                code: result,
                map: null,
            };
        },
    };
}
