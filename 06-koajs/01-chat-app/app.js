const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

const resolveFunctionList = new Map();

router.get('/subscribe', async (ctx, next) => {
  const {r} = ctx.request.query;

  const promise = new Promise((resolve, reject) => {
    resolveFunctionList.set(r, resolve);

    ctx.req.on('close', () => {
      if (resolveFunctionList.has(r)) {
        resolveFunctionList.delete(r);
      }
    });
  });

  await promise;

  promise.then((data) => {
    ctx.body = data;
  });

  return next();
});

router.post('/publish', async (ctx, next) => {
  const {message} = ctx.request.body;

  resolveFunctionList.forEach((value, valueAgain, set) => {
    value(message);
  });

  resolveFunctionList.clear();

  ctx.status = 200;

  return next();
});

app.use(router.routes());

module.exports = app;
