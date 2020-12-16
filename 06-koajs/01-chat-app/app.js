const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

const resolveFunctionList = new Map();

router.get('/subscribe', async (ctx, next) => {
  const idMessage = Math.random();

  const promise = new Promise((resolve, reject) => {
    resolveFunctionList.set(idMessage, resolve);

    ctx.req.on('close', () => {
      if (resolveFunctionList.has(idMessage)) {
        resolveFunctionList.delete(idMessage);
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

  if (!message) {
    return;
  }

  for (const item of resolveFunctionList.values()) {
    item(message);
  }

  resolveFunctionList.clear();

  ctx.status = 200;

  return next();
});

app.use(router.routes());

module.exports = app;
