/**
 * @license
 * Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import module from 'module';
import {window} from '../../lib/dom-shim.js';
import {importModule} from '../../lib/import-module.js';
import * as koalib from 'koa';
import {PassThrough} from 'stream';
import { URL } from 'url';
import * as path from 'path';

const { createRequire } = module as any;
const require = createRequire(import.meta.url);

const moduleUrl = new URL(import.meta.url);
console.log(moduleUrl.pathname);
const packageRoot = path.resolve(moduleUrl.pathname, '../../..');
console.log({packageRoot});

type Koa = typeof koalib
const Koa = require('koa') as Koa;
const staticFiles = require('koa-static');
const { nodeResolve } = require('koa-node-resolve');

const appModule = importModule('./app-server.js', import.meta.url, window);

const port = 8080;
new Koa()
  .use(async (ctx: koalib.Context, next: Function) => {
    if (ctx.URL.pathname !== '/') {
      await next();
      return;
    }
    const stream = new PassThrough();
    ctx.type = 'text/html';
    ctx.body = stream;
    const render = (await appModule).namespace.render;
    render({name: 'SSR', message: 'This is a test.'}, stream);
    stream.end();
  })
  .use(nodeResolve())
  .use(staticFiles(packageRoot))
  .listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });