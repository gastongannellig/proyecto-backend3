import { Router as expressRouter } from 'express';

export default class Router {
  constructor() {
    this.router = expressRouter();
    this.init();
  }

  getRouter() {
    return this.router;
  }

  init() {} 

  applyCallbacks(callbacks) {
    return callbacks.map(callback => async (...params) => {
      try {
        // params => [req, res, next]
        await callback.apply(this, params);
      } catch (error) {
        console.error('Error in router callback:', error);
        params[1].status(500).json({ 
          status: 'error', 
          error: error.message 
        });
      }
    });
  }

  generateCustomResponse(req, res, next) {
    res.sendSuccess = payload => res.json({ status: 'success', payload });
    res.sendServerError = error => res.status(500).json({ status: 'error', error });
    res.sendUserError = error => res.status(400).json({ status: 'error', error });
    next();
  }

  handlePolicies = policies => (req, res, next) => {
    if (policies[0] === 'PUBLIC') return next();
    
    const user = req.user;
    
    if (!policies.includes(user?.role?.toUpperCase())) {
      return res.status(403).json({ 
        status: 'error', 
        error: 'No permissions' 
      });
    }
    
    next();
  }

  get(path, ...callbacks) {
    this.router.get(
      path, 
      this.generateCustomResponse, 
      this.applyCallbacks(callbacks)
    );
  }

  post(path, ...callbacks) {
    this.router.post(
      path, 
      this.generateCustomResponse, 
      this.applyCallbacks(callbacks)
    );
  }

  put(path, ...callbacks) {
    this.router.put(
      path, 
      this.generateCustomResponse, 
      this.applyCallbacks(callbacks)
    );
  }

  delete(path, ...callbacks) {
    this.router.delete(
      path, 
      this.generateCustomResponse, 
      this.applyCallbacks(callbacks)
    );
  }
}