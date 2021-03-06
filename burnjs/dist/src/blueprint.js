"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./logger");
// import * as  KoaRouter from 'koa-router';
const methods = ['get', 'post', 'patch', 'del', 'options', 'put'];
class Blueprint {
    constructor() {
        this.router = {};
    }
    setRouter(url, blueprint) {
        const _bp = this.router[url];
        if (_bp) {
            //检查http method 是否冲突
            for (const index in _bp) {
                const object = _bp[index];
                if (object.httpMethod === blueprint.httpMethod) {
                    logger_1.default.error(`路由地址 ${object.httpMethod} ${url} 已经存在`);
                    return;
                }
            }
            //不冲突则注册
            this.router[url].push(blueprint);
        }
        else {
            this.router[url] = [];
            this.router[url].push(blueprint);
        }
    }
    /**
     * 给一个控制器添加restful方法
     *
     * Get(); => http GET
     *
     * Post(); => http POST
     *
     * Del(); => http DELETE
     *
     * Put(); => http PUT
     * @param url
     */
    restfulClass(url) {
        return (Class) => {
            ['Get', 'Post', 'Del', 'Put'].forEach((httpMethod) => {
                const lowercase = httpMethod.toLowerCase();
                const handler = Class.prototype[httpMethod];
                if (handler) {
                    this.setRouter(url, {
                        httpMethod: lowercase,
                        constructor: Class,
                        handler: httpMethod
                    });
                }
            });
        };
    }
    getRoute() {
        return this.router;
    }
}
methods.forEach((httpMethod) => {
    Object.defineProperty(Blueprint.prototype, httpMethod, {
        get: function () {
            return (url) => {
                return (target, propertyKey) => {
                    this.setRouter(url, {
                        httpMethod: httpMethod,
                        constructor: target.constructor,
                        handler: propertyKey
                    });
                };
            };
        }
    });
});
exports.bp = new Blueprint;
