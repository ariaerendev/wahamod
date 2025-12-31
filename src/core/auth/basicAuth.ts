import * as basicAuth from 'express-basic-auth';

export function BasicAuthFunction(username, password, exclude: string[] = []) {
  function authFunction(req, res, next) {
    const ignore = exclude.filter((url) => req.url.startsWith(url)).length > 0;
    if (ignore) {
      next();
      return;
    }

    const auth = basicAuth({
      challenge: true,
      users: {
        [String(username)]: String(password),
      },
    });
    auth(req, res, next);
  }

  return authFunction;
}
